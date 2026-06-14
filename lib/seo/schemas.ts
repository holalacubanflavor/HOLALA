// JSON-LD structured data schemas for HOLALA Cuban Flavor
// https://schema.org

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.holalacubanflavor.com';

export const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'FoodEstablishment',
  '@id': `${BASE_URL}/#restaurant`,
  name: 'HOLALA Cuban Flavor',
  description:
    'Latin tropical street food experience — Cuban roots, modern flavor. Food truck in San Antonio, TX.',
  url: BASE_URL,
  telephone: '+12109750176',
  email: 'holalacubanflavor@gmail.com',
  servesCuisine: ['Cuban', 'Latin American', 'Caribbean'],
  priceRange: '$$',
  image: `${BASE_URL}/og-image.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Antonio',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 29.4241,
    longitude: -98.4936,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '16:00',
      closes: '22:00',
    },
  ],
  sameAs: [
    'https://instagram.com/holalacubanflavor',
  ],
  hasMenu: `${BASE_URL}/en/menu`,
  acceptsReservations: false,
};

export function blogPostSchema({
  title,
  description,
  publishedAt,
  author,
  url,
  imageUrl,
}: {
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  url: string;
  imageUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: publishedAt,
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'HOLALA Cuban Flavor',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo/holala-logo.svg`,
      },
    },
    url,
    image: imageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export const menuPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: 'HOLALA Cuban Flavor Menu',
  url: `${BASE_URL}/en/menu`,
  inLanguage: ['es', 'en'],
  hasMenuSection: [
    {
      '@type': 'MenuSection',
      name: 'Main Dishes',
    },
    {
      '@type': 'MenuSection',
      name: 'Sides',
    },
    {
      '@type': 'MenuSection',
      name: 'Drinks',
    },
    {
      '@type': 'MenuSection',
      name: 'Desserts',
    },
  ],
};
