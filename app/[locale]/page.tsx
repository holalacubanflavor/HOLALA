import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { popularItems } from '@/lib/data/menu';
import { ArrowRight, Clock, MapPin, Star, ChevronRight } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import JsonLd from '@/components/seo/JsonLd';
import { restaurantSchema } from '@/lib/seo/schemas';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { locale } = await params;
  return {
    title: 'HOLALA Cuban Flavor | Comida Cubana San Antonio TX',
  };
}

// ─── Hero Section ──────────────────────────────────────────────────────────────
function Hero() {
  const t = useTranslations('home.hero');
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-espresso">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #F97316 0, #F97316 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo/holala-logo.svg"
            alt="HOLALA Cuban Flavor"
            width={220}
            height={74}
            className="h-16 sm:h-20 w-auto"
            priority
          />
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center gap-2 bg-teal/20 border border-teal/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-teal text-sm font-medium tracking-wide uppercase">
            {t('tagline')}
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-cream leading-tight mb-4">
          Cuban roots,<br />
          <span className="text-orange">modern flavor.</span>
        </h1>

        <p className="text-cream/70 text-lg sm:text-xl mb-8 max-w-xl mx-auto">
          Food truck en San Antonio, TX · Miér–Dom 4pm–10pm
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark text-espresso font-semibold text-base px-8 py-3.5 rounded-full transition-colors"
          >
            {t('cta_menu')}
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/catering"
            className="inline-flex items-center justify-center gap-2 border border-cream/30 hover:border-cream/60 text-cream font-semibold text-base px-8 py-3.5 rounded-full transition-colors"
          >
            {t('cta_catering')}
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 mt-10 text-cream/40 text-sm">
          <span className="flex items-center gap-1">
            <Star size={14} className="fill-orange text-orange" />
            <Star size={14} className="fill-orange text-orange" />
            <Star size={14} className="fill-orange text-orange" />
            <Star size={14} className="fill-orange text-orange" />
            <Star size={14} className="fill-orange text-orange" />
            <span className="ml-1">5.0</span>
          </span>
          <span>·</span>
          <span>San Antonio, TX</span>
        </div>
      </div>
    </section>
  );
}

// ─── Hours Strip ───────────────────────────────────────────────────────────────
function HoursStrip() {
  const t = useTranslations('home.hours_section');
  return (
    <section className="bg-teal py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-cream text-sm sm:text-base text-center">
          <span className="flex items-center gap-2 font-semibold">
            <Clock size={16} className="text-orange" />
            {t('days')} · {t('hours')}
          </span>
          <span className="hidden sm:block opacity-40">|</span>
          <span className="flex items-center gap-2 text-cream/80">
            <MapPin size={16} className="text-orange" />
            {t('areas')}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Menu Preview ──────────────────────────────────────────────────────────────
function MenuPreview({ locale }: { locale: string }) {
  const t = useTranslations('home.menu_preview');
  const featured = popularItems.slice(0, 4);

  return (
    <section className="py-16 sm:py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-2">
          {t('subtitle')}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
          {t('title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featured.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            {/* Emoji placeholder until we have real images */}
            <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-2xl mb-3">
              🍽️
            </div>
            <h3 className="font-display font-semibold text-espresso text-lg leading-tight mb-1">
              {locale === 'es' ? item.name_es : item.name_en}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {locale === 'es' ? item.description_es : item.description_en}
            </p>
            <span className="text-teal font-bold text-lg">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-espresso hover:bg-espresso-light text-cream font-semibold px-8 py-3 rounded-full transition-colors"
        >
          {t('cta')}
          <ChevronRight size={18} />
        </Link>
      </div>
    </section>
  );
}

// ─── Catering CTA ─────────────────────────────────────────────────────────────
function CateringCTA() {
  const t = useTranslations('home.catering_section');
  return (
    <section className="bg-cream-dark py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <span className="inline-block bg-orange/15 text-orange text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {t('badge')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-espresso mb-4">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <Link
          href="/catering"
          className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-cream font-semibold text-base px-8 py-3.5 rounded-full transition-colors"
        >
          {t('cta')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

// ─── About Teaser ─────────────────────────────────────────────────────────────
function AboutTeaser() {
  const t = useTranslations('home.about_section');
  return (
    <section className="py-16 sm:py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block bg-teal/10 text-teal text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {t('badge')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-espresso mb-4">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          {t('body')}
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-teal font-semibold hover:gap-3 transition-all"
        >
          {t('cta')}
          <ChevronRight size={18} />
        </Link>
      </div>
    </section>
  );
}

// ─── Instagram CTA ────────────────────────────────────────────────────────────
function SocialCTA() {
  const t = useTranslations('home.social_section');
  return (
    <section className="bg-espresso py-14 text-center px-4">
      <InstagramIcon size={36} className="text-orange mx-auto mb-4" />
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-2">
        {t('title')}
      </h2>
      <p className="text-cream/60 text-lg mb-6">{t('handle')}</p>
      <a
        href="https://instagram.com/holalacubanflavor"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border border-orange text-orange hover:bg-orange hover:text-espresso font-semibold px-7 py-3 rounded-full transition-colors"
      >
        {t('cta')}
        <ArrowRight size={16} />
      </a>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <>
      <JsonLd data={restaurantSchema} />
      <Hero />
      <HoursStrip />
      <MenuPreview locale={locale} />
      <CateringCTA />
      <AboutTeaser />
      <SocialCTA />
    </>
  );
}
