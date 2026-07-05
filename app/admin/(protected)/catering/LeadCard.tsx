'use client';

import { useTransition, useState } from 'react';

const EVENT_LABELS: Record<string, string> = {
  birthday: 'Cumpleaños',
  corporate: 'Corporativo',
  wedding: 'Boda',
  quinces: 'Quinceañera',
  graduation: 'Graduación',
  other: 'Otro',
};

const BUDGET_LABELS: Record<string, string> = {
  under_500: '< $500',
  '500_1000': '$500–$1k',
  '1000_2500': '$1k–$2.5k',
  '2500_5000': '$2.5k–$5k',
  over_5000: '> $5k',
};

const ALL_STATUSES = [
  { key: 'new', label: 'Nuevo' },
  { key: 'contacted', label: 'Contactado' },
  { key: 'quoted', label: 'Cotizado' },
  { key: 'confirmed', label: 'Confirmado' },
  { key: 'completed', label: 'Completado' },
  { key: 'lost', label: 'Perdido' },
];

export type Lead = {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  budget_range: string;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  quoted_amount: number | null;
  created_at: string;
};

type Props = {
  lead: Lead;
  updateStatus: (status: string) => Promise<void>;
  saveNotes: (notes: string) => Promise<void>;
};

function formatEventDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
}

export default function LeadCard({ lead, updateStatus, saveNotes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [adminNotes, setAdminNotes] = useState(lead.admin_notes ?? '');
  const [notesSaved, setNotesSaved] = useState(false);

  const daysSince = Math.floor(
    (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus !== lead.status) {
      startTransition(() => updateStatus(newStatus));
    }
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      await saveNotes(adminNotes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    });
  };

  return (
    <div className={`bg-white rounded-xl border border-border p-3 text-xs shadow-sm transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <p className="font-semibold text-espresso text-sm leading-tight">{lead.contact_name}</p>
        <span className="text-muted-foreground whitespace-nowrap shrink-0">
          {daysSince === 0 ? 'hoy' : `${daysSince}d`}
        </span>
      </div>

      {/* Event chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="bg-espresso/5 text-espresso rounded px-1.5 py-0.5">
          {EVENT_LABELS[lead.event_type] ?? lead.event_type}
        </span>
        <span className="bg-espresso/5 text-espresso rounded px-1.5 py-0.5">
          {formatEventDate(lead.event_date)}
        </span>
        <span className="bg-espresso/5 text-espresso rounded px-1.5 py-0.5">
          {lead.guest_count} pers.
        </span>
        <span className="bg-espresso/5 text-espresso rounded px-1.5 py-0.5">
          {BUDGET_LABELS[lead.budget_range] ?? lead.budget_range}
        </span>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-0.5 mb-2 text-muted-foreground">
        <a href={`tel:${lead.contact_phone}`} className="hover:text-teal transition-colors">
          📞 {lead.contact_phone}
        </a>
        <a href={`mailto:${lead.contact_email}`} className="hover:text-teal transition-colors truncate">
          ✉️ {lead.contact_email}
        </a>
      </div>

      {/* Customer notes */}
      {lead.notes && (
        <p className="bg-cream rounded p-2 mb-2 italic text-muted-foreground leading-relaxed">
          &ldquo;{lead.notes}&rdquo;
        </p>
      )}

      {/* Admin notes */}
      <div className="mb-2">
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Notas internas..."
          className="w-full text-xs rounded border border-border px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-teal/40 bg-white text-espresso placeholder:text-muted-foreground"
          rows={2}
        />
        <button
          onClick={handleSaveNotes}
          disabled={isPending}
          className="text-xs text-teal hover:text-teal-dark transition-colors disabled:opacity-50"
        >
          {notesSaved ? '✓ Guardado' : 'Guardar nota'}
        </button>
      </div>

      {/* Status change */}
      <select
        value={lead.status}
        onChange={handleStatusChange}
        disabled={isPending}
        aria-label="Cambiar estado del lead"
        className="w-full text-xs rounded border border-border px-2 py-1.5 bg-white text-espresso focus:outline-none focus:ring-1 focus:ring-teal/40 disabled:opacity-50 cursor-pointer"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
