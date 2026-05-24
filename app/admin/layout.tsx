// Admin layout — protected by middleware.ts (Supabase Auth)
// Sprint 2: implement full auth check with @supabase/ssr

import type { Metadata } from 'next';
import { Poppins, Baloo_2 } from 'next/font/google';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Admin — HOLALA',
    template: '%s — HOLALA Admin',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${baloo.variable}`}>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="min-h-screen bg-cream">
          {/* Admin nav */}
          <header className="bg-espresso border-b border-espresso-light px-6 py-3 flex items-center justify-between">
            <span className="font-display font-bold text-cream text-lg">
              HOLALA Admin
            </span>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/admin/dashboard" className="text-cream/70 hover:text-cream transition-colors">
                Dashboard
              </a>
              <a href="/admin/catering" className="text-cream/70 hover:text-cream transition-colors">
                Catering
              </a>
              <a href="/admin/menu" className="text-cream/70 hover:text-cream transition-colors">
                Menú
              </a>
            </nav>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
