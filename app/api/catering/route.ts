import { NextRequest, NextResponse } from 'next/server';

// Catering form submission → Supabase catering_leads table
// Note: Supabase client is imported dynamically to avoid build errors
// when env vars are not yet configured.

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Catering form] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
