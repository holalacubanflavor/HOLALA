// Catering leads pipeline — Sprint 2 full implementation
// Currently: skeleton showing the pipeline status columns

const STATUS_COLUMNS = [
  { key: 'new', label: 'Nuevo', color: 'bg-blue-50 border-blue-200' },
  { key: 'contacted', label: 'Contactado', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'quoted', label: 'Cotizado', color: 'bg-orange-50 border-orange-200' },
  { key: 'confirmed', label: 'Confirmado', color: 'bg-teal/5 border-teal/20' },
  { key: 'completed', label: 'Completado', color: 'bg-green-50 border-green-200' },
];

export default function AdminCateringPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-espresso mb-2">
        Catering Pipeline
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Sprint 2: pipeline completo con drag-and-drop. Por ahora skeleton.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STATUS_COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`rounded-xl border p-4 min-h-[200px] ${col.color}`}
          >
            <p className="font-semibold text-espresso text-sm mb-3">{col.label}</p>
            <p className="text-xs text-muted-foreground italic">
              Sin leads en este estado
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-orange/5 border border-orange/20 rounded-2xl p-5">
        <p className="font-medium text-orange mb-2">📋 Sprint 2: Admin completo</p>
        <p className="text-sm text-muted-foreground">
          Sprint 2 implementa: vista de leads con status, edición de cotización,
          notificaciones por email (Resend), y pipeline de arrastrar-y-soltar.
        </p>
      </div>
    </div>
  );
}
