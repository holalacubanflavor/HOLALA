// Square catalog -> Supabase `products` sync (Deno runtime, NOT Node.js).
//
// Pulls the full Square catalog (ITEM + variations + categories) and upserts
// into `products`, matching on `square_catalog_id` = ITEM_VARIATION id.
// This id, not the parent ITEM id, is what square-webhook's line_items
// lookup joins against (see supabase/functions/square-webhook/index.ts).
//
// Manually triggered (button in /admin), not a Square webhook. Square's
// catalog has no bilingual fields, so EN copy comes from a static map below
// keyed by the Spanish item name — extend it when adding new menu items.
//
// Curatorial fields (food_cost, is_popular, image_url, is_vegetarian) are
// intentionally left out of the upsert payload so re-running this sync never
// clobbers values the owner enters by hand elsewhere.
//
// Required secrets (already set for square-webhook, reused here):
//   SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT
// Provided automatically by Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SQUARE_ACCESS_TOKEN = Deno.env.get("SQUARE_ACCESS_TOKEN") ?? "";
const SQUARE_ENVIRONMENT = Deno.env.get("SQUARE_ENVIRONMENT") ?? "sandbox";
const SQUARE_API_VERSION = "2024-12-18";

const SQUARE_API_BASE = SQUARE_ENVIRONMENT === "production"
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Square category name -> our category slug (matches the CHECK constraint on
// products.category and the Sanity/site taxonomy). Unrecognized category
// names fall back to "mains" rather than failing the whole sync.
const CATEGORY_SLUGS: Record<string, string> = {
  "Sugerencia de la Casa": "specials",
  "Antojitos": "appetizers",
  "Tacos": "tacos",
  "Sándwiches": "sandwiches",
  "Especialidades de la Casa": "mains",
  "Del Mar": "seafood",
  "Postres": "desserts",
  "Bebidas": "drinks",
  "Contornos": "sides",
};

// Spanish item name -> English copy. Square has no bilingual fields, so this
// is the only source of name_en/description_en. Extend when adding items.
const EN_COPY: Record<string, { name_en: string; description_en: string }> = {
  "Pollo Holalá": { name_en: "Holalá Chicken", description_en: "House special: crispy chicken with a cheesy finish." },
  "Chicharrón de Pollo": { name_en: "Crispy Chicken Bites", description_en: "Crispy bite-sized fried chicken pieces." },
  "Croquetas de Jamón": { name_en: "Ham Croquettes", description_en: "Breaded croquettes filled with ham." },
  "Croquetas de Pollo": { name_en: "Chicken Croquettes", description_en: "Breaded croquettes filled with chicken." },
  "Tostones Rellenos": { name_en: "Stuffed Fried Plantains", description_en: "Stuffed green plantain tostones, available with tuna or shrimp." },
  "Taco de Cerdo Asado (3)": { name_en: "Roasted Pork Tacos (3)", description_en: "Three roasted pork tacos." },
  "Taco de Carnitas Fritas": { name_en: "Crispy Carnitas Tacos", description_en: "Crispy fried carnitas tacos." },
  "Taco de Res": { name_en: "Beef Tacos", description_en: "Beef tacos." },
  "Pan con Lechón Asado": { name_en: "Roasted Pork Sandwich", description_en: "Roasted pork sandwich." },
  "Frita Cubana": { name_en: "Cuban Frita Burger", description_en: "Cuban-style frita burger." },
  "Pan con Bistec": { name_en: "Cuban Steak Sandwich", description_en: "Cuban steak sandwich." },
  "Lonjas de Cerdo Asadas": { name_en: "Roasted Pork Slices", description_en: "Roasted pork slices." },
  "Bistec de Pollo Gratinado": { name_en: "Chicken Steak au Gratin", description_en: "Chicken steak au gratin, topped with melted cheese." },
  "Masa de Cerdo Frita": { name_en: "Fried Pork Chunks", description_en: "Fried pork chunks." },
  "Bistec de Cerdo": { name_en: "Pork Steak", description_en: "Pork steak." },
  "Bistec de Res": { name_en: "Beef Steak", description_en: "Beef steak." },
  "Camarón al Ajillo": { name_en: "Garlic Shrimp", description_en: "Shrimp sautéed in garlic sauce." },
  "Camarón Enchilado": { name_en: "Creole Shrimp", description_en: "Shrimp in Creole-style sauce." },
  "Brocheta de Camarón con Tocino": { name_en: "Bacon-Wrapped Shrimp Skewer", description_en: "Skewer of bacon-wrapped shrimp." },
  "Flan de Leche": { name_en: "Cuban Flan", description_en: "Cuban milk flan." },
};

// Spanish variation name -> English suffix, appended as "(Suffix)". "Regular"
// (the default single-variation name) gets no suffix.
const VARIATION_EN: Record<string, string> = {
  "Atún": "Tuna",
  "Camarón": "Shrimp",
};

interface SquareItemVariation {
  type: string;
  id: string;
  item_variation_data?: {
    name?: string;
    price_money?: { amount?: number };
  };
}

interface SquareItem {
  type: string;
  id: string;
  is_deleted?: boolean;
  item_data?: {
    name?: string;
    description?: string;
    is_archived?: boolean;
    categories?: { id: string }[];
    variations?: SquareItemVariation[];
  };
}

interface SquareCategory {
  type: string;
  id: string;
  category_data?: { name?: string };
}

async function searchCatalog(): Promise<{ items: SquareItem[]; categories: SquareCategory[] }> {
  const res = await fetch(`${SQUARE_API_BASE}/v2/catalog/search`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      object_types: ["ITEM"],
      include_related_objects: true,
    }),
  });
  if (!res.ok) {
    throw new Error(`Square catalog search failed: ${res.status} ${await res.text()}`);
  }
  const body = await res.json();
  return {
    items: (body.objects ?? []) as SquareItem[],
    categories: (body.related_objects ?? []).filter((o: { type: string }) => o.type === "CATEGORY") as SquareCategory[],
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { items, categories } = await searchCatalog();

    const categoryNameById = new Map(
      categories.map((c) => [c.id, c.category_data?.name ?? ""]),
    );

    const rows: {
      square_catalog_id: string;
      name_es: string;
      name_en: string;
      description_es: string | null;
      description_en: string | null;
      category: string;
      price: number;
      is_active: boolean;
    }[] = [];

    for (const item of items) {
      if (item.is_deleted || !item.item_data) continue;

      const itemName = item.item_data.name ?? "Untitled";
      const description = item.item_data.description ?? null;
      const isActive = !item.item_data.is_archived;

      const categoryId = item.item_data.categories?.[0]?.id;
      const categoryName = categoryId ? categoryNameById.get(categoryId) ?? "" : "";
      const categorySlug = CATEGORY_SLUGS[categoryName] ?? "mains";

      const enCopy = EN_COPY[itemName];

      for (const variation of item.item_data.variations ?? []) {
        if (!variation.item_variation_data) continue;

        const variationName = variation.item_variation_data.name ?? "Regular";
        const enSuffix = VARIATION_EN[variationName];
        const nameEs = variationName === "Regular" ? itemName : `${itemName} (${variationName})`;
        const nameEn = enCopy
          ? (enSuffix ? `${enCopy.name_en} (${enSuffix})` : enCopy.name_en)
          : nameEs; // no translation on file — fall back to Spanish name

        rows.push({
          square_catalog_id: variation.id,
          name_es: nameEs,
          name_en: nameEn,
          description_es: description,
          description_en: enCopy?.description_en ?? description,
          category: categorySlug,
          price: (variation.item_variation_data.price_money?.amount ?? 0) / 100,
          is_active: isActive,
        });
      }
    }

    if (rows.length === 0) {
      return new Response(JSON.stringify({ synced: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase
      .from("products")
      .upsert(rows, { onConflict: "square_catalog_id" });

    if (error) throw error;

    return new Response(JSON.stringify({ synced: rows.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("square-catalog-sync error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
