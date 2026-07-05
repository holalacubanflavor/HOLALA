import { createClient } from '@/lib/supabase/server';
import { updateLeadStatus, saveAdminNotes } from '../../actions';
import LeadCard, { type Lead } from './LeadCard';

const STATUS_COLUMNS = [
  { key: 'new',       label: 'Nuevo',       color: 'bg-blue-50 border-blue-200' },
  { key: 'contacted', label: 'Contactado',  color: 'bg-yellow-50 border-yellow-200' },
  { key: 'quoted',    label: 'Cotizado',    color: 'bg-orange-50 border-orange-200' },
  { key: 'confirmed', label: 'Confirmado',  color: 'bg-teal/5 border-teal/20' },
  { key: 'completed', label: 'Completado',  color: 'bg-green-50 border-green-200' },
];

export default async function AdminCateringPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from('catering_leads')
    .select('id,contact_name,contact_email,contact_phone,event_type,event_date,guest_count,budget_range,notes,status,admin_notes,quoted_amount,created_at')
    .order('event_date', { ascending: true });

  const allLeads = (leads ?? []) as Lead[];
  const byStatus = (status: string) => allLeads.filter((l) => l.status === status);
  const lostLeads = allLeads.filter((l) => l.status === 'lost');
  const activeCount = allLeads.length - lostLeads.length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso">Catering Pipeline</h1>
        <p className="text-muted-foreground text-sm">
          {activeCount} lead{activeCount !== 1 ? 's' : ''} activo{activeCount !== 1 ? 's' : ''}
          {lostLeads.length > 0 ? ` · ${lostLeads.length} perdido${lostLeads.length !== 1 ? 's' : ''}` : ''}
        </p>
      </div>

      {allLeads.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Aún no hay leads de catering.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cuando alguien llene el formulario, aparecerá aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STATUS_COLUMNS.map((col) => {
              const colLeads = byStatus(col.key);
              return (
                <div key={col.key} className={`rounded-xl border p-4 min-h-[200px] ${col.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-espresso text-sm">{col.label}</p>
                    <span className="text-xs text-muted-foreground bg-white/70 rounded-full px-2 py-0.5">
                      {colLeads.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {colLeads.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Sin leads</p>
                    ) : (
                      colLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          updateStatus={updateLeadStatus.bind(null, lead.id)}
                          saveNotes={saveAdminNotes.bind(null, lead.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {lostLeads.length > 0 && (
            <details className="mt-8 group">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-espresso transition-colors list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                Perdidos ({lostLeads.length})
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lostLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    updateStatus={updateLeadStatus.bind(null, lead.id)}
                    saveNotes={saveAdminNotes.bind(null, lead.id)}
                  />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
