import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '../actions';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-espresso border-b border-espresso/80 px-6 py-3 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3 shrink-0">
          <span className="bg-cream rounded-full p-1.5 flex items-center justify-center shrink-0">
            <Image
              src="/logo/holala-logo.svg"
              alt="HOLALA Cuban Flavor"
              width={120}
              height={120}
              className="h-11 w-11"
            />
          </span>
          <span className="font-display font-bold text-cream text-lg">Admin</span>
        </Link>
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
