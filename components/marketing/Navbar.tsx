'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/menu', key: 'menu' },
  { href: '/catering', key: 'catering' },
  { href: '/about', key: 'about' },
  { href: '/location', key: 'location' },
  { href: '/faq', key: 'faq' },
  { href: '/blog', key: 'blog' },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const otherLocale = locale === 'es' ? 'en' : 'es';

  return (
    <header className="sticky top-0 z-50 bg-espresso/95 backdrop-blur-sm border-b border-espresso-light">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo/holala-logo.svg"
              alt="HOLALA Cuban Flavor"
              width={120}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium text-cream/80 hover:text-orange transition-colors',
                  pathname === link.href && 'text-orange'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* CTA + language toggle */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={pathname}
              locale={otherLocale}
              className="text-xs text-cream/60 hover:text-cream transition-colors uppercase tracking-wide"
            >
              {t('language')}
            </Link>
            <Link
              href="/catering"
              className="bg-orange hover:bg-orange-dark text-espresso text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              {t('order')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-cream/80 hover:text-orange transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-espresso-light py-4 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-2 py-2.5 text-base font-medium text-cream/80 hover:text-orange transition-colors',
                  pathname === link.href && 'text-orange'
                )}
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="pt-4 flex items-center gap-4 px-2">
              <Link
                href={pathname}
                locale={otherLocale}
                className="text-sm text-cream/60 hover:text-cream transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t('language')}
              </Link>
              <Link
                href="/catering"
                onClick={() => setIsOpen(false)}
                className="bg-orange hover:bg-orange-dark text-espresso text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                {t('order')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
