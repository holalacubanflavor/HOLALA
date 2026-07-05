// Catering form submission endpoint. Deno runtime — no timeout limit.
//
// Required secrets (supabase secrets set --project-ref rqpfqxmohdttghscoknh):
//   RESEND_API_KEY      - Resend API key
//   RESEND_FROM_EMAIL   - Verified sending address (noreply@holalacubanflavor.com)
// Provided automatically by Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

const EVENT_LABELS: Record<string, string> = {
  birthday: "Cumpleaños",
  corporate: "Corporativo",
  wedding: "Boda",
  quinces: "Quinceañera",
  graduation: "Graduación",
  other: "Otro",
};

const BUDGET_LABELS: Record<string, string> = {
  under_500: "Menos de $500",
  "500_1000": "$500 – $1,000",
  "1000_2500": "$1,000 – $2,500",
  "2500_5000": "$2,500 – $5,000",
  over_5000: "Más de $5,000",
};

function buildNotificationEmail(data: {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  budget: string;
  message?: string;
}): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 12px;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;color:#2A1A12;font-size:14px;font-weight:600;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#FFF4E6;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#2A1A12;padding:20px 28px;">
      <p style="margin:0;color:#FFF4E6;font-size:20px;font-weight:bold;letter-spacing:0.5px;">HOLALA Cuban Flavor</p>
      <p style="margin:4px 0 0;color:rgba(255,244,230,0.65);font-size:13px;">Nuevo lead de catering</p>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 20px;color:#2A1A12;font-size:18px;">
        🎉 ${data.name} solicita cotización
      </h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        ${row("Contacto", data.name)}
        ${row("Email", `<a href="mailto:${data.email}" style="color:#0E7C86;">${data.email}</a>`)}
        ${row("Teléfono", `<a href="tel:${data.phone}" style="color:#0E7C86;">${data.phone}</a>`)}
        ${row("Tipo de evento", EVENT_LABELS[data.eventType] ?? data.eventType)}
        ${row("Fecha del evento", data.eventDate)}
        ${row("Invitados", data.guestCount)}
        ${row("Presupuesto", BUDGET_LABELS[data.budget] ?? data.budget)}
      </table>
      ${data.message ? `
      <div style="margin-top:20px;background:#FFF4E6;border-left:3px solid #0E7C86;padding:12px 16px;border-radius:4px;">
        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Mensaje</p>
        <p style="margin:0;color:#2A1A12;font-size:14px;line-height:1.6;">${data.message}</p>
      </div>` : ""}
      <div style="margin-top:28px;text-align:center;">
        <a href="https://www.holalacubanflavor.com/admin/catering"
           style="background:#0E7C86;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;display:inline-block;">
          Ver en Admin Panel →
        </a>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:14px 28px;text-align:center;">
      <p style="margin:0;color:#aaa;font-size:11px;">HOLALA Cuban Flavor · San Antonio, TX</p>
    </div>
  </div>
</body>
</html>`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { eventType, eventDate, guestCount, name, email, phone, budget, message, locale, website } = body;

    // Honeypot — silently succeed so bots think they got through
    if (website) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validation
    if (!eventType || !eventDate || !guestCount || !name || !email || !phone || !budget) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert into catering_leads
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("catering_leads").insert({
      event_type: eventType,
      event_date: eventDate,
      guest_count: parseInt(guestCount, 10),
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
      budget_range: budget,
      notes: message || null,
      locale,
      status: "new",
    });

    if (dbError) {
      console.error("[catering-submit] DB error:", dbError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin notification — best-effort, never fails the request
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    if (resendKey && fromEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `HOLALA Admin <${fromEmail}>`,
            to: ["holalacubanflavor@gmail.com"],
            subject: `🎉 Nuevo lead: ${name} — ${EVENT_LABELS[eventType] ?? eventType}`,
            html: buildNotificationEmail({ name, email, phone, eventType, eventDate, guestCount, budget, message }),
          }),
        });
      } catch (emailErr) {
        console.error("[catering-submit] Email failed (lead was saved):", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[catering-submit] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
