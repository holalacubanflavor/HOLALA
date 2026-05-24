import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Clock, MapPin, Phone } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'location' });
  return {
    title: t('title'),
    description:
      'HOLALA Cuban Flavor food truck — San Antonio TX. Miércoles–Domingo 4pm–10pm. Stone Oak, Alamo Heights, Downtown, Southtown.',
  };
}

// Schedule data (sourced from messages for i18n in a real implementation)
const schedule = [
  { day: 'Lunes', dayEn: 'Monday', hours: 'Cerrado', hoursEn: 'Closed', closed: true },
  { day: 'Martes', dayEn: 'Tuesday', hours: 'Cerrado', hoursEn: 'Closed', closed: true },
  { day: 'Miércoles', dayEn: 'Wednesday', hours: '4:00 PM – 10:00 PM', hoursEn: '4:00 PM – 10:00 PM', closed: false },
  { day: 'Jueves', dayEn: 'Thursday', hours: '4:00 PM – 10:00 PM', hoursEn: '4:00 PM – 10:00 PM', closed: false },
  { day: 'Viernes', dayEn: 'Friday', hours: '4:00 PM – 10:00 PM', hoursEn: '4:00 PM – 10:00 PM', closed: false },
  { day: 'Sábado', dayEn: 'Saturday', hours: '4:00 PM – 10:00 PM', hoursEn: '4:00 PM – 10:00 PM', closed: false },
  { day: 'Domingo', dayEn: 'Sunday', hours: '4:00 PM – 10:00 PM', hoursEn: '4:00 PM – 10:00 PM', closed: false },
];

const areas = [
  'Stone Oak',
  'Alamo Heights',
  'Downtown San Antonio',
  'Southtown',
  'Converse',
  'Universal City',
  'Leon Valley',
];

export default function LocationPage() {
  const t = useTranslations('location');

  return (
    <div>
      {/* Header */}
      <section className="bg-espresso py-16 px-4 text-center">
        <span className="inline-block bg-teal/20 text-teal text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {t('badge')}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream">
          {t('title')}
        </h1>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Hours */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-teal" />
            <h2 className="font-display text-xl font-bold text-espresso">
              {t('hours.title')}
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {schedule.map((row, i) => (
              <div
                key={row.day}
                className={`flex justify-between items-center px-5 py-3.5 text-sm ${
                  i < schedule.length - 1 ? 'border-b border-border/50' : ''
                } ${row.closed ? 'opacity-40' : ''}`}
              >
                <span className="font-medium text-espresso">{row.day}</span>
                <span
                  className={`${
                    row.closed ? 'text-muted-foreground' : 'text-teal font-semibold'
                  }`}
                >
                  {row.hours}
                </span>
              </div>
            ))}
          </div>

          {/* Areas */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-teal" />
              <h2 className="font-display text-xl font-bold text-espresso">
                {t('areas.title')}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <span
                  key={area}
                  className="bg-teal/10 text-teal text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Map + social */}
        <div className="space-y-6">
          {/* Google Maps embed — static iframe, no API key needed */}
          <div className="rounded-2xl overflow-hidden border border-border aspect-video">
            <iframe
              title="San Antonio, TX — HOLALA Cuban Flavor territory"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d229117.3745566296!2d-98.7237490!3d29.4241219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865c58af04a2ba03%3A0x1eb6e2e71b35c47f!2sSan%20Antonio%2C%20TX!5e0!3m2!1ses!2sus!4v1716500000000!5m2!1ses!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Instagram notice */}
          <div className="bg-orange/5 border border-orange/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <InstagramIcon size={22} className="text-orange mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-espresso mb-1">
                  Ubicación exacta del día
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('follow_ig')}
                </p>
                <a
                  href="https://instagram.com/holalacubanflavor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange font-semibold text-sm hover:underline"
                >
                  @holalacubanflavor →
                </a>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-semibold text-espresso mb-4">
              {t('contact_cta')}
            </h3>
            <div className="space-y-3">
              <a
                href="tel:2109750176"
                className="flex items-center gap-3 text-espresso hover:text-teal transition-colors"
              >
                <Phone size={17} className="text-teal" />
                <span className="font-medium">210 975 0176</span>
              </a>
              <a
                href="https://instagram.com/holalacubanflavor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-espresso hover:text-orange transition-colors"
              >
                <InstagramIcon size={17} className="text-orange" />
                <span className="font-medium">@holalacubanflavor</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
