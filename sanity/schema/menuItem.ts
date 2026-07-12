import { defineField, defineType } from 'sanity';

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    // --- Spanish ---
    defineField({
      name: 'name_es',
      title: 'Nombre (Español)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description_es',
      title: 'Descripción (Español)',
      type: 'text',
      rows: 3,
    }),
    // --- English ---
    defineField({
      name: 'name_en',
      title: 'Name (English)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description_en',
      title: 'Description (English)',
      type: 'text',
      rows: 3,
    }),
    // --- Pricing & Category ---
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Especiales / Specials', value: 'specials' },
          { title: 'Antojitos / Appetizers', value: 'appetizers' },
          { title: 'Tacos / Tacos', value: 'tacos' },
          { title: 'Sándwiches / Sandwiches', value: 'sandwiches' },
          { title: 'Platos Principales / Mains', value: 'mains' },
          { title: 'Del Mar / Seafood', value: 'seafood' },
          { title: 'Contornos / Sides', value: 'sides' },
          { title: 'Postres / Desserts', value: 'desserts' },
          { title: 'Bebidas / Drinks', value: 'drinks' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    // --- Flags ---
    defineField({
      name: 'isActive',
      title: 'Active (visible in menu)',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isPopular',
      title: 'Popular item (show on home page)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isVegetarian',
      title: 'Vegetarian',
      type: 'boolean',
      initialValue: false,
    }),
    // --- Media ---
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    // --- Square sync ---
    defineField({
      name: 'squareCatalogId',
      title: 'Square Catalog ID (sync)',
      type: 'string',
      description: 'Square catalog item ID for syncing prices and availability.',
    }),
  ],
  preview: {
    select: {
      title: 'name_es',
      subtitle: 'category',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Category, then Name',
      name: 'categoryName',
      by: [{ field: 'category', direction: 'asc' }, { field: 'name_es', direction: 'asc' }],
    },
  ],
});
