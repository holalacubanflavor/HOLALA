import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { Phone, Mail, Heart, Star, Users, Leaf } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
    description:
      locale === 'es'
        ? 'Conoce la historia de HOLALA Cuban Flavor, food truck cubano en San Antonio TX.'
        : 'Learn the story of HOLALA Cuban Flavor, Cuban food truck in San Antonio TX.',
  };
}

// Icons mapped to values array below

export default function AboutPage() {
  const t = useTranslations('about');

  // Get values array from messages — inline for now
  const values = [
    {
      icon: Heart,
      title: 'Autenticidad',
      desc: 'Recetas familiares cubanas que no transigimos por conveniencia.',
    },
    {
      icon: Star,
      title: 'Frescura',
      desc: 'Ingredientes frescos, cocinados al momento, cada día.',
    },
    {
      icon: Users,
      title: 'Comunidad',
      desc: 'Somos parte de San Antonio, nos importa cada barrio que visitamos.',
    },
    {
      icon: Leaf,
      title: 'Calidad',
      desc: 'Cada plato debe superar tus expectativas — esa es nuestra promesa.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-espresso py-20 px-4 text-center">
        <span className="inline-block bg-orange text-espresso text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {t('badge')}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-cream max-w-2xl mx-auto leading-tight">
          {t('hero_text')}
        </h1>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-espresso mb-6 text-center">
          {t('story.title')}
        </h2>
        <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
          <p>{t('story.p1')}</p>
          <p>{t('story.p2')}</p>
          <p>{t('story.p3')}</p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-dark py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-espresso text-center mb-10">
            {t('values.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-shadow text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-teal" />
                </div>
                <h3 className="font-display font-semibold text-espresso text-lg mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-espresso mb-8">
          {t('contact.title')}
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="tel:2109750176"
            className="flex items-center gap-2 text-espresso hover:text-teal transition-colors font-medium"
          >
            <Phone size={18} className="text-teal" />
            {t('contact.phone')}
          </a>
          <a
            href="mailto:holalacubanflavor@gmail.com"
            className="flex items-center gap-2 text-espresso hover:text-teal transition-colors font-medium"
          >
            <Mail size={18} className="text-teal" />
            {t('contact.email')}
          </a>
          <a
            href="https://instagram.com/holalacubanflavor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-espresso hover:text-orange transition-colors font-medium"
          >
            <InstagramIcon size={18} className="text-orange" />
            {t('contact.instagram')}
          </a>
        </div>

        <div className="mt-10">
          <Link
            href="/catering"
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-cream font-semibold px-8 py-3.5 rounded-full transition-colors"
          >
            Solicitar Catering
          </Link>
        </div>
      </section>
    </div>
  );
}
