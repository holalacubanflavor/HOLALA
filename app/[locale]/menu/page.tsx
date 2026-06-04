import { getTranslations } from 'next-intl/server';
import { getSanityClient } from '@/lib/sanity/client';
import { MENU_ITEMS_QUERY } from '@/lib/sanity/queries';
import { menuItems as staticMenuItems } from '@/lib/data/menu';
import MenuGrid, { type MenuItemData, type MenuCategory } from '@/components/menu/MenuGrid';

// Revalidate every 30 min as fallback if the Sanity webhook fails to trigger a deploy
export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'menu' });
  return { title: t('title') };
}

async function fetchMenuItems(): Promise<MenuItemData[]> {
  const client = getSanityClient();
  if (client) {
    try {
      const items = await client.fetch<MenuItemData[]>(MENU_ITEMS_QUERY);
      if (items && items.length > 0) return items;
    } catch {
      // Sanity unavailable — fall through to static data
    }
  }

  return staticMenuItems.map((item) => ({
    _id: item.id,
    name_es: item.name_es,
    name_en: item.name_en,
    description_es: item.description_es,
    description_en: item.description_en,
    price: item.price,
    category: item.category as MenuCategory,
    isPopular: item.isPopular ?? false,
    isVegetarian: item.isVegetarian ?? false,
    imageUrl: null,
  }));
}

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'menu' });
  const items = await fetchMenuItems();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-teal text-sm font-semibold uppercase tracking-widest mb-2">
          HOLALA Cuban Flavor
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-espresso mb-3">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
      </div>

      <MenuGrid items={items} />

      {/* Order note */}
      <div className="mt-12 text-center bg-teal/5 border border-teal/20 rounded-2xl p-6">
        <p className="text-espresso font-medium mb-1">
          ¿Quieres ordenar para tu evento?
        </p>
        <p className="text-muted-foreground text-sm">
          Contáctanos en Instagram{' '}
          <a
            href="https://instagram.com/holalacubanflavor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal font-medium hover:underline"
          >
            @holalacubanflavor
          </a>{' '}
          o llámanos al{' '}
          <a href="tel:2109750176" className="text-teal font-medium hover:underline">
            210 975 0176
          </a>
        </p>
      </div>
    </div>
  );
}
