'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'completed', 'lost'] as const;

export async function updateLeadStatus(leadId: string, status: string) {
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) return;
  const supabase = await createClient();
  await supabase.from('catering_leads').update({ status }).eq('id', leadId);
  revalidatePath('/admin/catering');
}

export async function saveAdminNotes(leadId: string, notes: string) {
  const supabase = await createClient();
  await supabase.from('catering_leads').update({ admin_notes: notes }).eq('id', leadId);
  revalidatePath('/admin/catering');
}

export async function signIn(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
  }

  revalidatePath('/admin', 'layout');
  redirect('/admin/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}
