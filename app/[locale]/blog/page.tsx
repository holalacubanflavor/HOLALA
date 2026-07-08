import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { Calendar } from 'lucide-react';
import { getSanityClient } from '@/lib/sanity/client';
import { BLOG_POSTS_QUERY } from '@/lib/sanity/queries';

export const revalidate = 1800;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('title'), description: t('subtitle') };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SanityPost = {
  _id: string;
  title_es: string;
  title_en: string;
  slug_es: string | null;
  slug_en: string | null;
  excerpt_es: string | null;
  excerpt_en: string | null;
  publishedAt: string;
  category: string | null;
  coverImageUrl: string | null;
};

// ─── Static fallback ──────────────────────────────────────────────────────────

const staticPosts: SanityPost[] = [
  {
    _id: 'static-1',
    title_es: 'La Historia del Sándwich Cubano: Un ícono que une culturas',
    title_en: 'The History of the Cuban Sandwich: An icon that unites cultures',
    slug_es: 'historia-del-sandwich-cubano',
    slug_en: 'historia-del-sandwich-cubano',
    excerpt_es:
      'El famoso sándwich cubano tiene raíces más profundas de lo que imaginas. Descubre cómo este clásico nació en Tampa, FL.',
    excerpt_en:
      'The famous Cuban sandwich has deeper roots than you might think. Discover how this classic was born in Tampa, FL.',
    publishedAt: '2026-01-15',
    category: 'historia',
    coverImageUrl: null,
  },
  {
    _id: 'static-2',
    title_es: 'Mojo Cubano: La salsa que lo hace todo mejor',
    title_en: 'Cuban Mojo: The sauce that makes everything better',
    slug_es: 'mojo-cubano-la-salsa-universal',
    slug_en: 'mojo-cubano-la-salsa-universal',
    excerpt_es:
      'El mojo cubano es mucho más que una salsa — es el alma de la cocina cubana.',
    excerpt_en:
      "Cuban mojo is much more than a sauce — it's the soul of Cuban cuisine.",
    publishedAt: '2026-02-03',
    category: 'recetas',
    coverImageUrl: null,
  },
  {
    _id: 'static-3',
    title_es: 'Por qué San Antonio y la comida cubana son perfectos juntos',
    title_en: 'Why San Antonio and Cuban food are a perfect match',
    slug_es: 'comida-cubana-en-san-antonio',
    slug_en: 'comida-cubana-en-san-antonio',
    excerpt_es: 'San Antonio es una ciudad construida sobre la mezcla de culturas.',
    excerpt_en: 'San Antonio is a city built on the blending of cultures.',
    publishedAt: '2026-02-20',
    category: 'cultura',
    coverImageUrl: null,
  },
];

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function fetchBlogPosts(): Promise<SanityPost[]> {
  const client = getSanityClient();
  if (client) {
    try {
      const posts = await client.fetch<SanityPost[]>(BLOG_POSTS_QUERY);
      if (posts && posts.length > 0) return posts;
    } catch {
      // Sanity unavailable — fall through
    }
  }
  return staticPosts;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryEmoji: Record<string, string> = {
  historia: '🥪',
  recetas: '🧄',
  cultura: '🌴',
  news: '📰',
};

const categoryColors: Record<string, string> = {
  historia: 'bg-teal/10 text-teal-dark',
  recetas: 'bg-orange/10 text-espresso',
  cultura: 'bg-green/10 text-green-dark',
  news: 'bg-espresso/10 text-espresso',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const posts = await fetchBlogPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block bg-espresso text-orange text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
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
        {posts.map((post) => {
          const title = locale === 'es' ? post.title_es : post.title_en;
          const excerpt = locale === 'es' ? post.excerpt_es : post.excerpt_en;
          const slug = locale === 'es' ? post.slug_es : post.slug_en;
          const emoji = categoryEmoji[post.category ?? ''] ?? '📝';

          if (!slug) return null;

          return (
            <Link
              key={post._id}
              href={`/blog/${slug}`}
              className="group bg-white rounded-2xl border border-border hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Cover image or emoji placeholder */}
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt={title}
                  className="h-36 w-full object-cover"
                />
              ) : (
                <div className="bg-espresso/5 h-36 flex items-center justify-center text-6xl">
                  {emoji}
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                {post.category && (
                  <span
                    className={`inline-block self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                      categoryColors[post.category] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {post.category}
                  </span>
                )}

                <h2 className="font-display font-semibold text-espresso text-lg leading-snug mb-2 group-hover:text-teal transition-colors">
                  {title}
                </h2>

                {excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                    {excerpt}
                  </p>
                )}

                <div className="flex items-center text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(post.publishedAt).toLocaleDateString(
                      locale === 'es' ? 'es-US' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' },
                    )}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-12">
        Próximamente más artículos · Powered by Sanity CMS
      </p>
    </div>
  );
}
