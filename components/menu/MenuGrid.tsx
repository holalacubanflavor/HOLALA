'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';
import Image from 'next/image';

export type MenuCategory =
  | 'specials'
  | 'appetizers'
  | 'tacos'
  | 'sandwiches'
  | 'mains'
  | 'seafood'
  | 'sides'
  | 'desserts'
  | 'drinks';
type CategoryFilter = MenuCategory | 'all';

const CATEGORY_ORDER: MenuCategory[] = [
  'specials',
  'appetizers',
  'tacos',
  'sandwiches',
  'mains',
  'seafood',
  'sides',
  'desserts',
  'drinks',
];

export interface MenuItemData {
  _id: string;
  name_es: string;
  name_en: string;
  description_es?: string | null;
  description_en?: string | null;
  price: number;
  category: MenuCategory;
  isPopular?: boolean | null;
  isVegetarian?: boolean | null;
  imageUrl?: string | null;
}

const CATEGORY_EMOJIS: Record<CategoryFilter, string> = {
  all: '🍽️',
  specials: '⭐',
  appetizers: '🥟',
  tacos: '🌮',
  sandwiches: '🥪',
  mains: '🥘',
  seafood: '🦐',
  sides: '🍟',
  desserts: '🍮',
  drinks: '🥤',
};

export default function MenuGrid({ items }: { items: MenuItemData[] }) {
  const t = useTranslations('menu');
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const presentCategories = CATEGORY_ORDER.filter((cat) =>
    items.some((item) => item.category === cat)
  );

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: t('categories.all') },
    ...presentCategories.map((key) => ({ key, label: t(`categories.${key}`) })),
  ];

  const filtered =
    activeCategory === 'all'
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all',
              activeCategory === key
                ? 'bg-espresso text-cream shadow-sm'
                : 'bg-white border border-border text-espresso hover:border-teal hover:text-teal'
            )}
          >
            <span>{CATEGORY_EMOJIS[key]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl border border-border hover:shadow-md transition-shadow flex flex-col overflow-hidden"
          >
            {item.imageUrl && (
              <div className="relative h-44 w-full">
                <Image
                  src={item.imageUrl}
                  alt={locale === 'es' ? item.name_es : item.name_en}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}

            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display font-semibold text-espresso text-lg leading-tight">
                      {locale === 'es' ? item.name_es : item.name_en}
                    </h3>
                    {item.isVegetarian && (
                      <span className="inline-flex items-center gap-1 text-green text-xs font-medium">
                        <Leaf size={12} />V
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {locale === 'es' ? item.description_es : item.description_en}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-teal font-bold text-xl">
                  ${item.price.toFixed(2)}
                </span>
                {item.isPopular && (
                  <span className="bg-orange/10 text-orange text-xs font-semibold px-2.5 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-16">
          {locale === 'es' ? 'No hay platos en esta categoría.' : 'No items in this category.'}
        </p>
      )}
    </>
  );
}
