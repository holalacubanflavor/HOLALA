import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { faqSchema } from '@/lib/seo/schemas';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  // Get FAQ items
  const faqItems = [
    {
      q: locale === 'es'
        ? '¿Cuándo y dónde puedo encontrar el food truck?'
        : 'When and where can I find the food truck?',
      a: locale === 'es'
        ? 'Operamos miércoles a domingo de 4pm a 10pm por San Antonio. Seguimos nuestra ruta por Stone Oak, Alamo Heights, Downtown y otras zonas. Para la ubicación exacta del día, síguenos en Instagram @holalacubanflavor.'
        : 'We operate Wednesday through Sunday from 4pm to 10pm around San Antonio. We rotate through Stone Oak, Alamo Heights, Downtown and other areas. For today\'s exact location, follow us on Instagram @holalacubanflavor.',
    },
    {
      q: locale === 'es' ? '¿Puedo hacer pedidos en línea?' : 'Can I order online?',
      a: locale === 'es'
        ? 'Sí, próximamente habilitaremos pedidos en línea. Por ahora puedes ordenar directamente en el truck o contactarnos para eventos de catering.'
        : 'Yes, we\'ll be enabling online ordering soon. For now you can order directly at the truck or contact us for catering events.',
    },
    {
      q: locale === 'es' ? '¿Qué métodos de pago aceptan?' : 'What payment methods do you accept?',
      a: locale === 'es'
        ? 'Aceptamos efectivo, tarjetas de débito y crédito (Visa, Mastercard, Amex), Apple Pay y Google Pay. Procesamos pagos a través de Square.'
        : 'We accept cash, debit and credit cards (Visa, Mastercard, Amex), Apple Pay and Google Pay. We process payments through Square.',
    },
    {
      q: locale === 'es' ? '¿Tienen opciones vegetarianas?' : 'Do you have vegetarian options?',
      a: locale === 'es'
        ? 'Sí, tenemos varias opciones vegetarianas como yuca con mojo, moros y cristianos, y tostones. Consulta nuestro menú para ver todas las opciones.'
        : 'Yes, we have several vegetarian options like yuca with mojo sauce, moros y cristianos (rice & beans), and tostones. Check our menu for all options.',
    },
    {
      q: locale === 'es' ? '¿Manejan alergenos?' : 'How do you handle allergens?',
      a: locale === 'es'
        ? 'Si tienes alergias alimentarias, por favor infórmanos al momento de ordenar. Nuestro personal está entrenado para ayudarte. Los platos pueden contener gluten, lácteos y frutos secos.'
        : 'If you have food allergies, please let us know when ordering. Our staff is trained to help you. Dishes may contain gluten, dairy and tree nuts.',
    },
    {
      q: locale === 'es'
        ? '¿Hacen catering para eventos privados?'
        : 'Do you do private event catering?',
      a: locale === 'es'
        ? '¡Absolutamente! Ofrecemos catering para cumpleaños, bodas, eventos corporativos, quinceañeras y más. Usa nuestro formulario de catering o llámanos al 210 975 0176 para una cotización.'
        : 'Absolutely! We offer catering for birthdays, weddings, corporate events, quinceañeras and more. Use our catering form or call us at 210 975 0176 for a quote.',
    },
    {
      q: locale === 'es'
        ? '¿Con cuánta anticipación debo solicitar catering?'
        : 'How far in advance should I book catering?',
      a: locale === 'es'
        ? 'Recomendamos contactarnos con al menos 2 semanas de anticipación para eventos pequeños y 4+ semanas para eventos grandes. Para fechas muy solicitadas (fin de año, verano), entre más antes, mejor.'
        : 'We recommend reaching out at least 2 weeks ahead for small events and 4+ weeks for large events. For peak dates (year-end, summer), the earlier the better.',
    },
    {
      q: locale === 'es'
        ? '¿Tienen un menú fijo o rota?'
        : 'Do you have a fixed menu or does it rotate?',
      a: locale === 'es'
        ? 'Tenemos un menú base de clásicos cubanos disponible todos los días, más algunos especiales del día que rotamos según la temporada. Síguenos en redes para ver los especiales.'
        : 'We have a core menu of Cuban classics available every day, plus daily specials that rotate by season. Follow us on social media to see the specials.',
    },
  ];

  return (
    <>
      <JsonLd data={faqSchema(faqItems)} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-teal/10 text-teal-dark text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            {t('badge')}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-espresso mb-3">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </div>

        {/* FAQ accordion (native HTML <details>) */}
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group bg-white border border-border rounded-2xl overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-medium text-espresso hover:text-teal transition-colors">
                <span>{item.q}</span>
                <span className="shrink-0 text-xl text-teal group-open:rotate-45 transition-transform duration-200">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-teal/5 border border-teal/20 rounded-2xl p-8">
          <p className="font-display font-semibold text-espresso text-xl mb-2">
            ¿Tienes otra pregunta?
          </p>
          <p className="text-muted-foreground mb-5">
            Escríbenos directamente, estamos para ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:2109750176"
              className="inline-flex items-center justify-center gap-2 bg-espresso hover:bg-espresso-light text-cream font-semibold px-6 py-3 rounded-full transition-colors"
            >
              210 975 0176
            </a>
            <Link
              href="/catering"
              className="inline-flex items-center justify-center gap-2 border border-teal text-teal hover:bg-teal hover:text-cream font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Solicitar Catering
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
