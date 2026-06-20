import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { popularItems } from '@/lib/data/menu';
import {
  ArrowRight,
  ChevronRight,
  Clock,
  MapPin,
  Zap,
  Check,
  Users,
  Briefcase,
  PartyPopper,
  Cake,
  UtensilsCrossed,
} from 'lucide-react';
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

  const badges = [
    { icon: Clock, label: t('badge_hours') },
    { icon: MapPin, label: t('badge_areas') },
    { icon: Zap, label: t('badge_quote') },
  ];

  return (
    <section className="relative overflow-hidden bg-espresso py-16 sm:py-24">
      {/* Tropical glow */}
      <div className="absolute inset-0 bg-tropical-glow" />

      {/* Subtle diagonal texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #F97316 0, #F97316 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Tagline chip */}
        <div className="inline-flex items-center gap-2 bg-teal/15 border border-teal/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-teal text-sm font-semibold tracking-wide uppercase">
            {t('tagline')}
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-cream leading-tight mb-5 text-balance">
          {t('headline')}
        </h1>

        <p className="text-cream/75 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-8 text-balance">
          {t('subheadline')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
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

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {badges.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-cream/5 border border-cream/15 rounded-full px-3.5 py-1.5 text-cream/80 text-xs sm:text-sm font-medium"
            >
              <Icon size={14} className="text-orange" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Framed brand cover */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 mt-12 sm:mt-16">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden ring-1 ring-cream/10 shadow-2xl shadow-black/40">
          <Image
            src="/brand/hero-cover.png"
            alt="HOLALA Cuban Flavor — food truck cubano-latino en San Antonio, TX"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Hours Strip ───────────────────────────────────────────────────────────────
function HoursStrip() {
  const t = useTranslations('home.hours_section');
  return (
    <section className="bg-teal border-t-2 border-orange">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-cream text-sm sm:text-base text-center">
          <span className="flex items-center gap-2 font-semibold">
            <Clock size={16} className="text-orange" />
            {t('days')} · {t('hours')}
          </span>
          <span className="hidden sm:block w-px h-4 bg-cream/25" />
          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-orange" />
            {t('areas')}
          </span>
          <span className="hidden sm:block w-px h-4 bg-cream/25" />
          <a
            href="https://instagram.com/holalacubanflavor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-semibold hover:text-orange transition-colors"
          >
            <InstagramIcon size={16} className="text-orange" />
            {t('follow_ig')}
          </a>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Visual block — tropical gradient, reserved for future photo */}
            <div className="relative h-32 bg-gradient-to-br from-teal via-teal-dark to-espresso flex items-center justify-center">
              <UtensilsCrossed size={28} className="text-cream/25" />
              {item.isPopular && (
                <span className="absolute top-3 left-3 bg-orange text-espresso text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                  {t('badge_popular')}
                </span>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-display font-semibold text-espresso text-lg leading-tight mb-1">
                {locale === 'es' ? item.name_es : item.name_en}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {locale === 'es' ? item.description_es : item.description_en}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-teal font-bold text-lg">
                  ${item.price.toFixed(2)}
                </span>
                <Link
                  href="/menu"
                  className="flex items-center gap-1 text-xs font-semibold text-espresso/60 group-hover:text-orange transition-colors"
                >
                  {t('item_cta')}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
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

  const eventTypes = [
    { icon: Users, label: t('ev_families') },
    { icon: PartyPopper, label: t('ev_private') },
    { icon: Briefcase, label: t('ev_corporate') },
    { icon: Cake, label: t('ev_celebrations') },
  ];

  return (
    <section className="bg-cream-dark py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <span className="inline-block bg-espresso text-orange text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {t('badge')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-espresso mb-4">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>

        {/* Event type mini-grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {eventTypes.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-border py-5 px-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-teal/10 text-teal">
                <Icon size={20} />
              </span>
              <span className="text-sm font-semibold text-espresso">{label}</span>
            </div>
          ))}
        </div>

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

  const bullets = [t('bullet_recipes'), t('bullet_flavor'), t('bullet_fresh')];

  return (
    <section className="py-16 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Text column */}
        <div className="text-center md:text-left">
          <span className="inline-block bg-teal/10 text-teal-dark text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            {t('badge')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-espresso mb-4">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            {t('body')}
          </p>
          <p className="font-display text-xl text-teal-dark font-semibold mb-6 text-balance">
            &ldquo;{t('quote')}&rdquo;
          </p>

          <ul className="space-y-3 mb-8 inline-block text-left">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3 text-espresso font-medium">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange text-espresso shrink-0">
                  <Check size={15} />
                </span>
                {bullet}
              </li>
            ))}
          </ul>

          <div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-teal font-semibold hover:gap-3 transition-all"
            >
              {t('cta')}
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        {/* Visual column */}
        <div className="relative rounded-3xl bg-gradient-to-br from-teal via-teal-dark to-espresso p-10 sm:p-16 flex items-center justify-center shadow-warm overflow-hidden min-h-[260px]">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #FFF4E6 0, #FFF4E6 1px, transparent 0, transparent 50%)',
              backgroundSize: '24px 24px',
            }}
          />
          <Image
            src="/logo/holala-logo.svg"
            alt="HOLALA Cuban Flavor"
            width={220}
            height={74}
            className="relative z-10 h-20 sm:h-24 w-auto"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Instagram CTA ────────────────────────────────────────────────────────────
function SocialCTA() {
  const t = useTranslations('home.social_section');
  return (
    <section className="relative overflow-hidden bg-espresso py-16 sm:py-20 text-center px-4">
      {/* Decorative crop of the brand cover */}
      <Image
        src="/brand/hero-cover.png"
        alt=""
        fill
        aria-hidden="true"
        className="object-cover object-[80%_35%] opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/90 to-espresso/70" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <InstagramIcon size={36} className="text-orange mx-auto mb-4" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-2">
          {t('title')}
        </h2>
        <p className="text-cream/70 text-base sm:text-lg mb-2">{t('handle')}</p>
        <p className="text-cream/60 text-sm sm:text-base mb-6 max-w-md mx-auto">
          {t('body')}
        </p>
        <a
          href="https://instagram.com/holalacubanflavor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-orange text-orange hover:bg-orange hover:text-espresso font-semibold px-7 py-3 rounded-full transition-colors"
        >
          {t('cta')}
          <ArrowRight size={16} />
        </a>
      </div>
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
