import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { Calendar } from 'lucide-react';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

// Static blog posts — will be replaced by Sanity CMS
// Content is ready per design doc — 3 articles in ES + EN
const staticPosts = [
  {
    slug: 'historia-del-sandwich-cubano',
    title_es: 'La Historia del Sándwich Cubano: Un ícono que une culturas',
    title_en: 'The History of the Cuban Sandwich: An icon that unites cultures',
    excerpt_es:
      'El famoso sándwich cubano tiene raíces más profundas de lo que imaginas. Descubre cómo este clásico nació en Tampa, FL, y llegó a convertirse en un símbolo de la identidad cubana en Estados Unidos.',
    excerpt_en:
      'The famous Cuban sandwich has deeper roots than you might think. Discover how this classic was born in Tampa, FL, and became a symbol of Cuban identity in the United States.',
    publishedAt: '2026-01-15',
    readTime_es: '5 min de lectura',
    readTime_en: '5 min read',
    category: 'historia',
    emoji: '🥪',
  },
  {
    slug: 'mojo-cubano-la-salsa-universal',
    title_es: 'Mojo Cubano: La salsa que lo hace todo mejor',
    title_en: 'Cuban Mojo: The sauce that makes everything better',
    excerpt_es:
      'El mojo cubano es mucho más que una salsa — es el alma de la cocina cubana. Aprende a prepararlo en casa con ingredientes que encuentras en cualquier supermercado de San Antonio.',
    excerpt_en:
      'Cuban mojo is much more than a sauce — it\'s the soul of Cuban cuisine. Learn how to make it at home with ingredients you can find at any San Antonio supermarket.',
    publishedAt: '2026-02-03',
    readTime_es: '7 min de lectura',
    readTime_en: '7 min read',
    category: 'recetas',
    emoji: '🧄',
  },
  {
    slug: 'comida-cubana-en-san-antonio',
    title_es: 'Por qué San Antonio y la comida cubana son perfectos juntos',
    title_en: 'Why San Antonio and Cuban food are a perfect match',
    excerpt_es:
      'San Antonio es una ciudad construida sobre la mezcla de culturas. La comida cubana, con sus raíces caribeñas y sabores vibrantes, encaja perfectamente con el paladar tejano que ya conoce y ama lo latino.',
    excerpt_en:
      'San Antonio is a city built on the blending of cultures. Cuban food, with its Caribbean roots and vibrant flavors, fits perfectly with the Texan palate that already knows and loves Latin food.',
    publishedAt: '2026-02-20',
    readTime_es: '6 min de lectura',
    readTime_en: '6 min read',
    category: 'cultura',
    emoji: '🌴',
  },
];

const categoryColors: Record<string, string> = {
  historia: 'bg-teal/10 text-teal',
  recetas: 'bg-orange/10 text-orange',
  cultura: 'bg-green/10 text-green',
};

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block bg-orange/10 text-orange text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          {t('badge')}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-espresso mb-3">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staticPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl border border-border hover:shadow-md transition-shadow overflow-hidden flex flex-col"
          >
            {/* Emoji hero placeholder */}
            <div className="bg-espresso/5 h-36 flex items-center justify-center text-6xl">
              {post.emoji}
            </div>

            <div className="p-5 flex flex-col flex-1">
              {/* Category */}
              <span
                className={`inline-block self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                  categoryColors[post.category] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                {post.category}
              </span>

              <h2 className="font-display font-semibold text-espresso text-lg leading-snug mb-2 group-hover:text-teal transition-colors">
                {locale === 'es' ? post.title_es : post.title_en}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                {locale === 'es' ? post.excerpt_es : post.excerpt_en}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(post.publishedAt).toLocaleDateString(
                    locale === 'es' ? 'es-US' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
                <span>{locale === 'es' ? post.readTime_es : post.readTime_en}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Note about Sanity */}
      <p className="text-center text-xs text-muted-foreground mt-12">
        Próximamente más artículos · Powered by Sanity CMS
      </p>
    </div>
  );
}
