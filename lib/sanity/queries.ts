// GROQ queries for Sanity CMS
// Reference: https://www.sanity.io/docs/groq

// Menu items — all active, ordered by category
export const MENU_ITEMS_QUERY = `
  *[_type == "menuItem" && isActive == true] | order(category asc, name_es asc) {
    _id,
    name_es,
    name_en,
    description_es,
    description_en,
    price,
    category,
    isPopular,
    isVegetarian,
    "imageUrl": image.asset->url,
    squareCatalogId
  }
`;

// Popular items for home page
export const POPULAR_ITEMS_QUERY = `
  *[_type == "menuItem" && isActive == true && isPopular == true] | order(name_es asc) [0...6] {
    _id,
    name_es,
    name_en,
    description_es,
    description_en,
    price,
    category,
    "imageUrl": image.asset->url
  }
`;

// Blog posts — all published, newest first
export const BLOG_POSTS_QUERY = `
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title_es,
    title_en,
    "slug_es": slug_es.current,
    "slug_en": slug_en.current,
    excerpt_es,
    excerpt_en,
    publishedAt,
    category,
    "coverImageUrl": coverImage.asset->url
  }
`;

// Single blog post by slug (locale-aware)
export function getBlogPostQuery(locale: string) {
  const slugField = locale === 'es' ? 'slug_es' : 'slug_en';
  return `
    *[_type == "blogPost" && ${slugField}.current == $slug][0] {
      _id,
      title_es,
      title_en,
      body_es,
      body_en,
      excerpt_es,
      excerpt_en,
      publishedAt,
      category,
      "coverImageUrl": coverImage.asset->url,
      seo_title_es,
      seo_title_en
    }
  `;
}
