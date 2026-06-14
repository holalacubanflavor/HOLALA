'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';

export default function Footer() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const navLinks = [
    { href: '/menu', label: tNav('menu') },
    { href: '/catering', label: tNav('catering') },
    { href: '/about', label: tNav('about') },
    { href: '/location', label: tNav('location') },
    { href: '/faq', label: tNav('faq') },
    { href: '/blog', label: tNav('blog') },
  ];

  return (
    <footer className="bg-espresso text-cream/80">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/logo/holala-logo.svg"
              alt="HOLALA Cuban Flavor"
              width={130}
              height={44}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="text-sm text-cream/60 leading-relaxed max-w-xs">
              Latin tropical street food experience — Cuban roots, modern flavor.
              San Antonio, TX.
            </p>
            <a
              href="https://instagram.com/holalacubanflavor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-orange hover:text-orange/80 transition-colors text-sm font-medium"
            >
              <InstagramIcon size={16} />
              {tCommon('instagram')}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-cream font-display font-semibold text-base mb-4">
              Navegación
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 hover:text-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-cream font-display font-semibold text-base mb-4">
              Contacto & Horario
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-cream/60">
                <Clock size={15} className="mt-0.5 shrink-0 text-teal" />
                <span>
                  Miér – Dom<br />
                  4:00 PM – 10:00 PM
                </span>
              </li>
              <li className="flex items-center gap-2 text-cream/60">
                <MapPin size={15} className="shrink-0 text-teal" />
                <span>San Antonio, TX</span>
              </li>
              <li>
                <a
                  href="tel:2109750176"
                  className="flex items-center gap-2 text-cream/60 hover:text-orange transition-colors"
                >
                  <Phone size={15} className="shrink-0 text-teal" />
                  <span>210 975 0176</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:holalacubanflavor@gmail.com"
                  className="flex items-center gap-2 text-cream/60 hover:text-orange transition-colors"
                >
                  <Mail size={15} className="shrink-0 text-teal" />
                  <span>holalacubanflavor@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-espresso-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/60">
          <span>© {new Date().getFullYear()} HOLALA Cuban Flavor LLC. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" locale="es" className="hover:text-cream transition-colors">Español</Link>
            <Link href="/" locale="en" className="hover:text-cream transition-colors">English</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
