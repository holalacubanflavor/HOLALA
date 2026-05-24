// Admin Dashboard — Sprint 3: connect to Supabase sales data
// Currently: skeleton UI with placeholder data

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-espresso mb-2">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Sprint 3: ventas en tiempo real. Por ahora muestra datos placeholder.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Ventas Hoy', value: '$0.00', note: 'Square webhook en Sprint 3' },
          { label: 'Esta Semana', value: '$0.00', note: 'Square webhook en Sprint 3' },
          { label: 'Leads Catering', value: '—', note: 'Ver en /admin/catering' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-border p-5">
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="font-display text-3xl font-bold text-espresso mb-1">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-teal/5 border border-teal/20 rounded-2xl p-5">
        <p className="font-medium text-teal mb-2">🚀 Sprint 3: Square Integration</p>
        <p className="text-sm text-muted-foreground">
          Una vez configurado el webhook de Square, este dashboard mostrará ventas en tiempo real,
          top productos, y margen bruto por ítem.
        </p>
      </div>
    </div>
  );
}
