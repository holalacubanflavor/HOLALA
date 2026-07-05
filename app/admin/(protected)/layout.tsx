import { signOut } from '../actions';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-espresso border-b border-espresso/80 px-6 py-3 flex items-center justify-between">
        <span className="font-display font-bold text-cream text-lg">HOLALA Admin</span>
        <nav className="flex items-center gap-5 text-sm">
          <a href="/admin/dashboard" className="text-cream/70 hover:text-cream transition-colors">
            Dashboard
          </a>
          <a href="/admin/catering" className="text-cream/70 hover:text-cream transition-colors">
            Catering
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="text-cream/50 hover:text-cream transition-colors text-xs border border-cream/20 rounded-full px-3 py-1 hover:border-cream/50"
            >
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
