import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import CateringForm from '@/components/marketing/CateringForm';
import { CheckCircle } from 'lucide-react';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catering' });
  return {
    title: t('title'),
    description:
      locale === 'es'
        ? 'Solicita catering cubano para tu evento en San Antonio TX. Bodas, corporativos, quinceañeras y más.'
        : 'Request Cuban catering for your event in San Antonio TX. Weddings, corporate events, quinceañeras and more.',
  };
}

const WHY_HOLALA = [
  'Menú personalizable a tu gusto',
  'Ingredientes frescos y auténticos',
  'Servicio profesional y puntual',
  'Precios transparentes, sin sorpresas',
];

export default async function CateringPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-espresso py-14 px-4 text-center">
        <span className="inline-block bg-orange text-espresso text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          Solicitar Cotización
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream mb-3">
          Catering & Eventos
        </h1>
        <p className="text-cream/70 text-lg max-w-xl mx-auto">
          Hacemos de tu evento algo memorable
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form — 3/5 cols */}
        <div className="lg:col-span-3">
          <CateringForm locale={locale} />
        </div>

        {/* Sidebar — 2/5 cols */}
        <aside className="lg:col-span-2 space-y-5">
          {/* Why HOLALA */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-semibold text-espresso text-lg mb-4">
              ¿Por qué elegir HOLALA?
            </h3>
            <ul className="space-y-3">
              {WHY_HOLALA.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-teal shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact direct */}
          <div className="bg-teal/5 border border-teal/20 rounded-2xl p-5">
            <p className="font-medium text-espresso mb-1">¿Prefieres llamarnos?</p>
            <p className="text-sm text-muted-foreground mb-3">
              Hablamos directamente para eventos grandes o urgentes.
            </p>
            <a
              href="tel:2109750176"
              className="inline-flex items-center gap-2 bg-teal text-cream font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-teal-dark transition-colors"
            >
              210 975 0176
            </a>
          </div>

          {/* Event types supported */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-semibold text-espresso text-base mb-3">
              Tipos de eventos
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { emoji: '🎂', label: 'Cumpleaños' },
                { emoji: '💼', label: 'Corporativo' },
                { emoji: '💍', label: 'Boda' },
                { emoji: '👑', label: 'XV Años' },
                { emoji: '🎓', label: 'Graduación' },
                { emoji: '🎉', label: 'Otro evento' },
              ].map(({ emoji, label }) => (
                <span
                  key={label}
                  className="bg-cream border border-border rounded-full px-3 py-1.5 font-medium text-espresso"
                >
                  {emoji} {label}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
