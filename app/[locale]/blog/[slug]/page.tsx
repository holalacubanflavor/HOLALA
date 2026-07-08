import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { getSanityClient } from '@/lib/sanity/client';
import { getBlogPostQuery } from '@/lib/sanity/queries';

export const revalidate = 1800;

type Props = { params: Promise<{ locale: string; slug: string }> };

// ─── Types ────────────────────────────────────────────────────────────────────

type SanityPost = {
  _id: string;
  title_es: string;
  title_en: string;
  excerpt_es: string | null;
  excerpt_en: string | null;
  body_es: PortableTextBlock[] | null;
  body_en: PortableTextBlock[] | null;
  publishedAt: string;
  category: string | null;
  coverImageUrl: string | null;
  seo_title_es: string | null;
  seo_title_en: string | null;
};

// ─── Static fallback content ──────────────────────────────────────────────────

const staticPosts: Record<string, {
  title_es: string; title_en: string;
  excerpt_es: string; excerpt_en: string;
  content_es: string; content_en: string;
  publishedAt: string; readTime_es: string; readTime_en: string;
  category: string; emoji: string;
}> = {
  'historia-del-sandwich-cubano': {
    title_es: 'La Historia del Sándwich Cubano: Un ícono que une culturas',
    title_en: 'The History of the Cuban Sandwich: An icon that unites cultures',
    excerpt_es: 'El famoso sándwich cubano tiene raíces más profundas de lo que imaginas.',
    excerpt_en: 'The famous Cuban sandwich has deeper roots than you might think.',
    content_es: `El sándwich cubano — o *Cuban Sandwich* — es probablemente el plato cubano más conocido fuera de la isla. Pero su historia es más compleja, interesante y americana de lo que muchos creen.

## Tampa, no La Habana

Contrario a la creencia popular, el sándwich cubano tal como lo conocemos hoy no nació en Cuba sino en **Tampa, Florida**, a finales del siglo XIX. La industria del tabaco en Tampa atrajo a miles de trabajadores cubanos, españoles e italianos. El sándwich fue la solución perfecta para el almuerzo rápido y sustancioso de estos trabajadores.

## Los ingredientes originales

El cubano clásico lleva cinco ingredientes esenciales:
- **Pan cubano** (masa ligera y crujiente)
- **Jamón** (dulce, de pierna)
- **Cerdo asado** (lechón marinado en mojo)
- **Queso suizo** (que se derrite perfectamente al prensarse)
- **Pepinillos** (el toque ácido que equilibra todo)
- **Mostaza** (amarilla, nunca Dijon)

## El prensado es todo

La magia del cubano está en la prensa. El sándwich se presiona a calor alto hasta que el pan queda crujiente y dorado, el queso derretido, y todos los sabores se fusionan en cada mordida.

## Por qué lo hacemos en HOLALA

Para nosotros, el cubano no es solo un sándwich — es una declaración. Es decir: *aquí fusionamos culturas, respetamos las raíces, y nunca comprometemos el sabor*. ¿Nunca has probado el nuestro? Encuéntranos miércoles a domingo de 4pm a 10pm.`,
    content_en: `The Cuban sandwich is probably the most well-known Cuban dish outside the island. But its history is more complex, interesting, and American than many believe.

## Tampa, not Havana

Contrary to popular belief, the Cuban sandwich as we know it today was not born in Cuba but in **Tampa, Florida**, in the late 19th century. The tobacco industry in Tampa attracted thousands of Cuban, Spanish, and Italian workers. The sandwich was the perfect solution for a quick, hearty lunch.

## The original ingredients

The classic cubano has five essential ingredients:
- **Cuban bread** (light, crispy crust)
- **Ham** (sweet, leg ham)
- **Roasted pork** (mojo-marinated lechón)
- **Swiss cheese** (melts perfectly when pressed)
- **Pickles** (the acidic touch that balances everything)
- **Mustard** (yellow, never Dijon)

## The press makes all the difference

The magic of the cubano is in the press. The sandwich is pressed at high heat until the bread is crispy and golden, the cheese melted, and all the flavors fuse in every bite.

## Why we make it at HOLALA

For us, the cubano is not just a sandwich — it's a statement. Never tried ours? Find us Wednesday through Sunday from 4pm to 10pm.`,
    publishedAt: '2026-01-15',
    readTime_es: '5 min de lectura', readTime_en: '5 min read',
    category: 'historia', emoji: '🥪',
  },
  'mojo-cubano-la-salsa-universal': {
    title_es: 'Mojo Cubano: La salsa que lo hace todo mejor',
    title_en: 'Cuban Mojo: The sauce that makes everything better',
    excerpt_es: 'El mojo cubano es mucho más que una salsa — es el alma de la cocina cubana.',
    excerpt_en: "Cuban mojo is much more than a sauce — it's the soul of Cuban cuisine.",
    content_es: `Si hay un ingrediente que define la cocina cubana por encima de todo, ese es el **mojo**. No el mojo canario, ni el mojo de California — el mojo cubano: ajo, naranja agria, comino y aceite de oliva.

## ¿Qué es el mojo cubano?

El mojo cubano es una marinada y salsa a base de ajo crudo machacado, jugo de naranja agria, comino molido, sal y aceite de oliva. A diferencia de otras salsas latinoamericanas, no lleva tomate ni chile — su sabor viene del ajo y la acidez cítrica.

## Receta básica de mojo

**Ingredientes:**
- 8-10 dientes de ajo, machacados
- ½ taza de jugo de naranja agria
- 1 cucharadita de comino molido
- 1 cucharadita de sal
- ¼ taza de aceite de oliva extra virgen

**Preparación:**
1. Machaca el ajo con la sal en un mortero hasta hacer una pasta.
2. Mezcla con el jugo de naranja y el comino.
3. Calienta el aceite en una cacerola pequeña hasta que humee ligeramente.
4. Vierte el aceite caliente sobre la mezcla de ajo — cuidado, va a chisporrotear.
5. Mezcla bien y deja reposar 10 minutos antes de usar.

## En HOLALA lo usamos para...

En nuestro menú el mojo aparece en casi todo: bañando la yuca, marinando el lechón, como dip de los tostones. Es el hilo conductor de nuestra cocina.`,
    content_en: `If there's one ingredient that defines Cuban cuisine above all else, it's **mojo**. Not Canarian mojo, not California mojo — Cuban mojo: garlic, sour orange, cumin, and olive oil.

## What is Cuban mojo?

Cuban mojo is a marinade and sauce made from crushed raw garlic, sour orange juice, ground cumin, salt, and olive oil. Unlike other Latin American sauces, it has no tomato or chile — its flavor comes from garlic and citrus acidity.

## Basic mojo recipe

**Ingredients:**
- 8-10 garlic cloves, crushed
- ½ cup sour orange juice
- 1 teaspoon ground cumin
- 1 teaspoon salt
- ¼ cup extra virgin olive oil

**Preparation:**
1. Crush garlic with salt in a mortar until you have a paste.
2. Mix with orange juice and cumin.
3. Heat oil in a small saucepan until lightly smoking.
4. Pour hot oil over garlic mixture — careful, it will sizzle.
5. Mix well and let rest 10 minutes before using.

## At HOLALA we use it for...

In our menu, mojo appears in almost everything: drizzled over yuca, marinating the lechón, as a dipping sauce for tostones.`,
    publishedAt: '2026-02-03',
    readTime_es: '7 min de lectura', readTime_en: '7 min read',
    category: 'recetas', emoji: '🧄',
  },
  'comida-cubana-en-san-antonio': {
    title_es: 'Por qué San Antonio y la comida cubana son perfectos juntos',
    title_en: 'Why San Antonio and Cuban food are a perfect match',
    excerpt_es: 'San Antonio es una ciudad construida sobre la mezcla de culturas.',
    excerpt_en: 'San Antonio is a city built on the blending of cultures.',
    content_es: `San Antonio no es una ciudad cualquiera. Es un lugar donde el Tex-Mex, el barbecue texano, la comida cajún y decenas de otras tradiciones culinarias conviven y se fusionan todos los días.

## El ADN compartido

La comida cubana y la texano-mexicana comparten más de lo que aparenta. Ambas tienen raíces en la cocina española colonial, ambas usan especias aromáticas (comino, ajo, laurel), y ambas valoran las proteínas cocidas lentamente. Un sanantoniense que prueba ropa vieja por primera vez, frecuentemente dice: *"esto me recuerda a algo que mi abuela hacía"*.

## La comunidad latina en SA

Con más del 60% de la población siendo latina/hispana, San Antonio es el mercado perfecto para una cocina caribeña que honra las raíces.

## Por qué abrimos aquí

HOLALA no es solo un negocio — es una apuesta por San Antonio. Creemos que esta ciudad está lista para abrazar la comida cubana no como algo exótico, sino como algo que se siente parte de casa.

## Lo que viene

Estamos aquí para quedarnos. Abrimos con la visión de crecer — de un truck a múltiples ubicaciones, de San Antonio al resto de Texas. Pero siempre con los mismos valores: ingredientes frescos, recetas auténticas, y la actitud de quien cocina para su comunidad.`,
    content_en: `San Antonio is not just any city. It's a place where Tex-Mex, Texas barbecue, Cajun food, and dozens of other culinary traditions coexist and fuse every single day.

## The shared DNA

Cuban food and Tex-Mex share more than it seems. Both have roots in Spanish colonial cuisine, both use aromatic spices (cumin, garlic, bay leaf), and both value slowly cooked proteins. A San Antonian who tries ropa vieja for the first time often says: *"this reminds me of something my grandmother used to make."*

## The Latino community in SA

With over 60% of the population being Latino/Hispanic, San Antonio is the perfect market for a Caribbean cuisine that honors its roots.

## Why we opened here

HOLALA is not just a business — it's a bet on San Antonio. We believe this city is ready to embrace Cuban food not as something exotic, but as something that feels like home.

## What's coming

We're here to stay. We opened with the vision to grow — from one truck to multiple locations, from San Antonio to the rest of Texas. Always with the same values: fresh ingredients, authentic recipes, and the attitude of someone cooking for their community.`,
    publishedAt: '2026-02-20',
    readTime_es: '6 min de lectura', readTime_en: '6 min read',
    category: 'cultura', emoji: '🌴',
  },
};

// ─── Portable Text components ─────────────────────────────────────────────────

const ptComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-display text-2xl font-bold text-espresso mt-8 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl font-semibold text-espresso mt-6 mb-2">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-espresso">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 mb-4 text-muted-foreground">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  types: {
    image: ({ value }: { value: { asset?: { url?: string }; alt?: string } }) =>
      value?.asset?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value.asset.url}
          alt={value.alt ?? ''}
          className="rounded-2xl w-full my-6 object-cover"
        />
      ) : null,
  },
};

// ─── Static content renderer (fallback) ───────────────────────────────────────

function StaticContent({ content }: { content: string }) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="font-display text-2xl font-bold text-espresso mt-8 mb-3">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="ml-4 list-disc text-muted-foreground leading-relaxed">
          {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
        </li>,
      );
    } else if (/^\d+\. /.test(line)) {
      elements.push(
        <li key={key++} className="ml-4 list-decimal text-muted-foreground leading-relaxed">
          {line.replace(/^\d+\. /, '')}
        </li>,
      );
    } else if (line.trim() === '') {
      // skip
    } else {
      elements.push(
        <p key={key++} className="text-muted-foreground leading-relaxed mb-4">
          {line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
        </p>,
      );
    }
  }

  return <>{elements}</>;
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function fetchPost(locale: string, slug: string): Promise<SanityPost | null> {
  const client = getSanityClient();
  if (client) {
    try {
      const post = await client.fetch<SanityPost | null>(
        getBlogPostQuery(locale),
        { slug },
      );
      if (post) return post;
    } catch {
      // fall through to static
    }
  }
  return null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const sanityPost = await fetchPost(locale, slug);
  if (sanityPost) {
    const title =
      locale === 'es'
        ? sanityPost.seo_title_es ?? sanityPost.title_es
        : sanityPost.seo_title_en ?? sanityPost.title_en;
    const description =
      locale === 'es' ? sanityPost.excerpt_es ?? '' : sanityPost.excerpt_en ?? '';
    return { title, description, openGraph: { type: 'article', publishedTime: sanityPost.publishedAt } };
  }

  const staticPost = staticPosts[slug];
  if (!staticPost) return { title: 'Not Found' };
  return {
    title: locale === 'es' ? staticPost.title_es : staticPost.title_en,
    description: locale === 'es' ? staticPost.excerpt_es : staticPost.excerpt_en,
    openGraph: { type: 'article', publishedTime: staticPost.publishedAt },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  const sanityPost = await fetchPost(locale, slug);
  const staticPost = staticPosts[slug];

  if (!sanityPost && !staticPost) notFound();

  // Sanity post path
  if (sanityPost) {
    const title = locale === 'es' ? sanityPost.title_es : sanityPost.title_en;
    const body = locale === 'es' ? sanityPost.body_es : sanityPost.body_en;

    return (
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          {t('back')}
        </Link>

        {sanityPost.category && (
          <span className="inline-block bg-teal/10 text-teal-dark text-xs font-semibold px-2.5 py-1 rounded-full mb-4 uppercase tracking-wide">
            {sanityPost.category}
          </span>
        )}

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso leading-tight mb-4">
          {title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(sanityPost.publishedAt).toLocaleDateString(
              locale === 'es' ? 'es-US' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' },
            )}
          </span>
        </div>

        {sanityPost.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sanityPost.coverImageUrl}
            alt={title}
            className="rounded-2xl w-full mb-8 object-cover max-h-72"
          />
        )}

        <div className="prose-holala space-y-2">
          {body ? (
            <PortableText value={body} components={ptComponents} />
          ) : (
            <p className="text-muted-foreground">Contenido no disponible.</p>
          )}
        </div>

        <BlogCTA locale={locale} />
      </article>
    );
  }

  // Static fallback path
  const post = staticPost!;
  const title = locale === 'es' ? post.title_es : post.title_en;
  const content = locale === 'es' ? post.content_es : post.content_en;
  const readTime = locale === 'es' ? post.readTime_es : post.readTime_en;

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        {t('back')}
      </Link>

      <span className="inline-block bg-teal/10 text-teal-dark text-xs font-semibold px-2.5 py-1 rounded-full mb-4 uppercase tracking-wide">
        {post.category}
      </span>

      <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso leading-tight mb-4">
        {title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {new Date(post.publishedAt).toLocaleDateString(
            locale === 'es' ? 'es-US' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' },
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {readTime}
        </span>
        <span className="text-2xl">{post.emoji}</span>
      </div>

      <div className="prose-holala space-y-2">
        <StaticContent content={content} />
      </div>

      <BlogCTA locale={locale} />
    </article>
  );
}

function BlogCTA({ locale }: { locale: string }) {
  return (
    <div className="mt-12 bg-espresso rounded-2xl p-6 text-center">
      <p className="font-display text-xl font-bold text-cream mb-2">
        {locale === 'es' ? '¿Te dio hambre?' : 'Feeling hungry?'}
      </p>
      <p className="text-cream/70 text-sm mb-4">
        {locale === 'es'
          ? 'Encuéntranos miércoles a domingo · 4pm–10pm · San Antonio TX'
          : 'Find us Wednesday–Sunday · 4pm–10pm · San Antonio TX'}
      </p>
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-espresso font-semibold px-6 py-2.5 rounded-full transition-colors text-sm"
      >
        {locale === 'es' ? 'Ver Menú Completo' : 'See Full Menu'}
      </Link>
    </div>
  );
}
