// Square → Supabase webhook receiver (Deno runtime, NOT Node.js).
//
// Listens for `payment.updated` notifications, and for completed payments
// fetches the related order from Square's Orders API and syncs it into
// the `sales` / `sale_items` tables. Idempotent on `sales.square_order_id`.
// Also best-effort syncs `customers` (visits/spend) when the order carries
// a Square customer_id, and stamps `sales.location_label` from LOCATION_LABELS.
//
// Required secrets (set with `supabase secrets set ...`):
//   SQUARE_ACCESS_TOKEN              - Square API access token
//   SQUARE_ENVIRONMENT               - "sandbox" | "production"
//   SQUARE_WEBHOOK_SIG_KEY           - Signature key from the webhook subscription
//   SQUARE_WEBHOOK_NOTIFICATION_URL  - Exact URL registered with Square (used in HMAC)
//
// Provided automatically by Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SQUARE_ACCESS_TOKEN = Deno.env.get("SQUARE_ACCESS_TOKEN") ?? "";
const SQUARE_ENVIRONMENT = Deno.env.get("SQUARE_ENVIRONMENT") ?? "sandbox";
const SQUARE_WEBHOOK_SIG_KEY = Deno.env.get("SQUARE_WEBHOOK_SIG_KEY") ?? "";
const SQUARE_WEBHOOK_NOTIFICATION_URL = Deno.env.get("SQUARE_WEBHOOK_NOTIFICATION_URL") ?? "";
const SQUARE_API_VERSION = "2024-12-18";

const SQUARE_API_BASE = SQUARE_ENVIRONMENT === "production"
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";

// Square location ID -> human-readable label. Add entries here as HOLALA
// opens new locations (see CLAUDE.md "Pendiente" for tracking).
const LOCATION_LABELS: Record<string, string> = {
  LHDV14TEF3QMK: "Food Truck",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function isValidSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature || !SQUARE_WEBHOOK_SIG_KEY || !SQUARE_WEBHOOK_NOTIFICATION_URL) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SQUARE_WEBHOOK_SIG_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(SQUARE_WEBHOOK_NOTIFICATION_URL + rawBody),
    ),
  );

  let received: Uint8Array;
  try {
    received = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
  } catch {
    return false;
  }

  // Constant-time comparison to avoid leaking byte-match info via response timing.
  return timingSafeEqual(digest, received);
}

async function fetchOrder(orderId: string) {
  const res = await fetch(`${SQUARE_API_BASE}/v2/orders/${orderId}`, {
    headers: {
      "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_API_VERSION,
    },
  });
  if (!res.ok) {
    throw new Error(`Square order fetch failed: ${res.status} ${await res.text()}`);
  }
  const { order } = await res.json();
  return order;
}

async function fetchCustomer(customerId: string) {
  const res = await fetch(`${SQUARE_API_BASE}/v2/customers/${customerId}`, {
    headers: {
      "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_API_VERSION,
    },
  });
  if (!res.ok) {
    throw new Error(`Square customer fetch failed: ${res.status} ${await res.text()}`);
  }
  const { customer } = await res.json();
  return customer;
}

// Upserts customers.total_visits / total_spent for a completed order. Only
// called for newly-inserted sales (see `upserted` guard at the call site) so
// a webhook retry never double-counts a visit.
async function syncCustomer(customerId: string, orderCreatedAt: string, saleAmount: number) {
  const customer = await fetchCustomer(customerId);
  const name = [customer.given_name, customer.family_name].filter(Boolean).join(" ") || null;

  const { data: existing, error: fetchError } = await supabase
    .from("customers")
    .select("id, total_visits, total_spent")
    .eq("square_customer_id", customerId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing) {
    const { error } = await supabase
      .from("customers")
      .update({
        name: name ?? undefined,
        email: customer.email_address ?? undefined,
        phone: customer.phone_number ?? undefined,
        total_visits: (existing.total_visits ?? 0) + 1,
        total_spent: Number(existing.total_spent ?? 0) + saleAmount,
        last_visit_at: orderCreatedAt,
      })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("customers").insert({
      square_customer_id: customerId,
      name,
      email: customer.email_address ?? null,
      phone: customer.phone_number ?? null,
      total_visits: 1,
      total_spent: saleAmount,
      first_visit_at: orderCreatedAt,
      last_visit_at: orderCreatedAt,
    });
    if (error) throw error;
  }
}

function money(amountMoney?: { amount?: number }): number {
  return (amountMoney?.amount ?? 0) / 100;
}

// sale_items.quantity is INT CHECK > 0. Square sends quantity as a decimal
// string (e.g. weighted items use "1.5"), so round to the nearest valid int
// instead of truncating, and fall back to 1 for non-positive/invalid values.
function parseQuantity(raw?: string): number {
  const parsed = Math.round(parseFloat(raw ?? "1"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");

  if (!(await isValidSignature(rawBody, signature))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.type !== "payment.updated") {
    return new Response("ok", { status: 200 });
  }

  const payment = event.data?.object?.payment;
  if (!payment || payment.status !== "COMPLETED" || !payment.order_id) {
    return new Response("ok", { status: 200 });
  }

  try {
    const order = await fetchOrder(payment.order_id);
    const locationId = payment.location_id ?? order.location_id ?? null;
    const totalAmount = money(payment.amount_money);

    const { data: upserted, error: saleError } = await supabase
      .from("sales")
      .upsert(
        {
          square_order_id: order.id,
          square_payment_id: payment.id,
          total_amount: totalAmount,
          tax_amount: money(order.total_tax_money),
          tip_amount: money(payment.tip_money),
          payment_method: payment.source_type?.toLowerCase() ?? null,
          square_location_id: locationId,
          location_label: locationId ? LOCATION_LABELS[locationId] ?? null : null,
          created_at: order.created_at,
        },
        { onConflict: "square_order_id", ignoreDuplicates: true },
      )
      .select("id")
      .maybeSingle();

    if (saleError) throw saleError;

    if (Array.isArray(order.line_items)) {
      // `upserted` is null when the sale row already existed (ignoreDuplicates
      // skip). Fetch its id so a retry can still repair missing line items
      // from a previous attempt that failed after the sales upsert.
      let saleId: string;
      if (upserted) {
        saleId = upserted.id;
      } else {
        const { data: existing, error: existingError } = await supabase
          .from("sales")
          .select("id")
          .eq("square_order_id", order.id)
          .single();
        if (existingError) throw existingError;
        saleId = existing.id;
      }

      const { count: existingItemCount, error: countError } = await supabase
        .from("sale_items")
        .select("id", { count: "exact", head: true })
        .eq("sale_id", saleId);
      if (countError) throw countError;

      // Skip if items were already synced — keeps retries idempotent.
      if (!existingItemCount) {
        const catalogIds = order.line_items
          .map((item: { catalog_object_id?: string }) => item.catalog_object_id)
          .filter((id: string | undefined): id is string => Boolean(id));

        // NOTE: line_items[].catalog_object_id is a CatalogItemVariation id.
        // products.square_catalog_id must store variation ids (not parent
        // CatalogItem ids) for this lookup to match — see /admin/menu sync.
        const { data: products, error: productsError } = catalogIds.length
          ? await supabase
            .from("products")
            .select("id, square_catalog_id")
            .in("square_catalog_id", catalogIds)
          : { data: [] as { id: string; square_catalog_id: string }[], error: null };

        if (productsError) throw productsError;

        const productByCatalogId = new Map(
          (products ?? []).map((p) => [p.square_catalog_id, p.id]),
        );

        const saleItems = order.line_items.map((item: {
          catalog_object_id?: string;
          name?: string;
          quantity?: string;
          base_price_money?: { amount?: number };
          total_money?: { amount?: number };
        }) => ({
          sale_id: saleId,
          product_id: item.catalog_object_id
            ? productByCatalogId.get(item.catalog_object_id) ?? null
            : null,
          square_item_id: item.catalog_object_id ?? null,
          item_name: item.name ?? "Unknown item",
          quantity: parseQuantity(item.quantity),
          unit_price: money(item.base_price_money),
          total_price: money(item.total_money),
        }));

        const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);
        if (itemsError) throw itemsError;
      }
    }

    // Best-effort: a customer sync failure shouldn't turn a successful sale
    // sync into a 500 (which would make Square retry and re-process items).
    if (upserted && order.customer_id) {
      try {
        await syncCustomer(order.customer_id, order.created_at, totalAmount);
      } catch (customerErr) {
        console.error("square-webhook customer sync error:", customerErr);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("square-webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
