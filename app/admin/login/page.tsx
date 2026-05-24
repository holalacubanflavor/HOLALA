'use client';

// Admin login — Sprint 2 will implement full Supabase Auth UI
// For now: placeholder that explains how to log in via Supabase Dashboard

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
        <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-espresso mb-2">
          Admin HOLALA
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          El acceso de administrador se configura en Sprint 2 con Supabase Auth.
          Por ahora, accede directamente desde el dashboard de Supabase.
        </p>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-espresso text-cream font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-espresso-light transition-colors"
        >
          Ir a Supabase Dashboard →
        </a>
      </div>
    </div>
  );
}
