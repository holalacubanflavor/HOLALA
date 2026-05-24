'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { menuItems, type MenuCategory } from '@/lib/data/menu';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';

type CategoryFilter = MenuCategory | 'all';

export default function MenuPage() {
  const t = useTranslations('menu');
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: t('categories.all') },
    { key: 'mains', label: t('categories.mains') },
    { key: 'sides', label: t('categories.sides') },
    { key: 'drinks', label: t('categories.drinks') },
    { key: 'desserts', label: t('categories.desserts') },
  ];

  const filtered =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const categoryEmojis: Record<CategoryFilter, string> = {
    all: '🍽️',
    mains: '🥘',
    sides: '🍟',
    drinks: '🥤',
    desserts: '🍮',
  };

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
            <span>{categoryEmojis[key]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-border hover:shadow-md transition-shadow flex flex-col"
          >
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
        ))}
      </div>

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
