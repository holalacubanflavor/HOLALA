import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Catering form submission → Supabase catering_leads table
// After a successful insert, sends an admin notification email via Resend.

const EVENT_LABELS: Record<string, string> = {
  birthday: 'Cumpleaños',
  corporate: 'Corporativo',
  wedding: 'Boda',
  quinces: 'Quinceañera',
  graduation: 'Graduación',
  other: 'Otro',
};

const BUDGET_LABELS: Record<string, string> = {
  under_500: 'Menos de $500',
  '500_1000': '$500 – $1,000',
  '1000_2500': '$1,000 – $2,500',
  '2500_5000': '$2,500 – $5,000',
  over_5000: 'Más de $5,000',
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
        ${row('Contacto', data.name)}
        ${row('Email', `<a href="mailto:${data.email}" style="color:#0E7C86;">${data.email}</a>`)}
        ${row('Teléfono', `<a href="tel:${data.phone}" style="color:#0E7C86;">${data.phone}</a>`)}
        ${row('Tipo de evento', EVENT_LABELS[data.eventType] ?? data.eventType)}
        ${row('Fecha del evento', data.eventDate)}
        ${row('Invitados', data.guestCount)}
        ${row('Presupuesto', BUDGET_LABELS[data.budget] ?? data.budget)}
      </table>
      ${data.message ? `
      <div style="margin-top:20px;background:#FFF4E6;border-left:3px solid #0E7C86;padding:12px 16px;border-radius:4px;">
        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Mensaje</p>
        <p style="margin:0;color:#2A1A12;font-size:14px;line-height:1.6;">${data.message}</p>
      </div>` : ''}
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      eventType,
      eventDate,
      guestCount,
      name,
      email,
      phone,
      budget,
      message,
      locale,
      website, // honeypot — bots fill this in
    } = body;

    // Server-side honeypot check — silently succeed so bots think they got through
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Basic validation
    if (!eventType || !eventDate || !guestCount || !name || !email || !phone || !budget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check Supabase env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Dev fallback — log and return success for testing
      console.log('[Catering form] Supabase not configured. Lead data:', {
        eventType, eventDate, guestCount, name, email, phone, budget, message, locale,
      });
      return NextResponse.json({ success: true, dev: true });
    }

    // Dynamic import with webpackIgnore to prevent webpack static analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseModule = await import(/* webpackIgnore: true */ '@supabase/supabase-js').catch(() => null) as any;
    if (!supabaseModule) {
      console.error('[Catering] @supabase/supabase-js not installed');
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }
    const supabase = supabaseModule.createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('catering_leads').insert({
      event_type: eventType,
      event_date: eventDate,
      guest_count: parseInt(guestCount, 10),
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
      budget_range: budget,
      notes: message || null,
      locale,
      status: 'new',
    });

    if (error) {
      console.error('[Catering form] Supabase insert error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Admin notification email — best-effort, never fails the request
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (resendKey && fromEmail) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: `HOLALA Admin <${fromEmail}>`,
          to: ['holalacubanflavor@gmail.com'],
          subject: `🎉 Nuevo lead: ${name} — ${EVENT_LABELS[eventType] ?? eventType}`,
          html: buildNotificationEmail({ name, email, phone, eventType, eventDate, guestCount, budget, message }),
        });
      } catch (emailErr) {
        console.error('[Catering] Email notification failed (lead was saved):', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Catering form] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
