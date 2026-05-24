// Static menu data — will be replaced by Sanity CMS in Sprint 2
// All prices in USD

export type MenuCategory = 'mains' | 'sides' | 'drinks' | 'desserts';

export interface MenuItem {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  price: number;
  category: MenuCategory;
  isPopular?: boolean;
  isVegetarian?: boolean;
  image?: string; // Sanity image asset ID — null until connected
}

export const menuItems: MenuItem[] = [
  // === PLATOS PRINCIPALES ===
  {
    id: '1',
    slug: 'ropa-vieja',
    name_es: 'Ropa Vieja',
    name_en: 'Ropa Vieja',
    description_es: 'Carne de res desmenuzada en salsa criolla con pimientos, cebolla y aceitunas. Servida con arroz blanco y tostones.',
    description_en: 'Shredded beef in creole sauce with peppers, onions and olives. Served with white rice and tostones.',
    price: 14.00,
    category: 'mains',
    isPopular: true,
  },
  {
    id: '2',
    slug: 'lechon-asado',
    name_es: 'Lechón Asado',
    name_en: 'Roasted Pork',
    description_es: 'Cerdo marinado en mojo cubano y asado lentamente. Con moros y cristianos y tostones.',
    description_en: 'Pork marinated in Cuban mojo and slow roasted. With moros y cristianos and tostones.',
    price: 15.00,
    category: 'mains',
    isPopular: true,
  },
  {
    id: '3',
    slug: 'cubano-sandwich',
    name_es: 'Cubano Sandwich',
    name_en: 'Cuban Sandwich',
    description_es: 'El clásico prensado: jamón, cerdo asado, queso suizo, pepinillos y mostaza en pan cubano.',
    description_en: 'The classic pressed: ham, roasted pork, Swiss cheese, pickles and mustard on Cuban bread.',
    price: 12.00,
    category: 'mains',
    isPopular: true,
  },
  {
    id: '4',
    slug: 'frita-cubana',
    name_es: 'Frita Cubana',
    name_en: 'Cuban Smash Burger',
    description_es: 'Hamburguesa smash estilo cubano con carne de res + chorizo, papas fritas pajilla y salsa especial.',
    description_en: 'Cuban-style smash burger with beef + chorizo, shoestring fries and special sauce.',
    price: 11.00,
    category: 'mains',
  },
  {
    id: '5',
    slug: 'picadillo',
    name_es: 'Picadillo Criollo',
    name_en: 'Picadillo Criollo',
    description_es: 'Carne molida con tomate, aceitunas y pasas. Servido con arroz blanco y frijoles negros.',
    description_en: 'Ground beef with tomato, olives and raisins. Served with white rice and black beans.',
    price: 13.00,
    category: 'mains',
  },
  // === CONTORNOS ===
  {
    id: '6',
    slug: 'moros-y-cristianos',
    name_es: 'Moros y Cristianos',
    name_en: 'Rice & Black Beans',
    description_es: 'Arroz blanco cocido con frijoles negros al estilo cubano.',
    description_en: 'White rice cooked with black beans, Cuban style.',
    price: 4.00,
    category: 'sides',
    isVegetarian: true,
  },
  {
    id: '7',
    slug: 'tostones',
    name_es: 'Tostones',
    name_en: 'Tostones',
    description_es: 'Plátano verde frito y aplastado dos veces. Crujientes por fuera, suaves por dentro. Con mojo de ajo.',
    description_en: 'Twice-fried green plantain. Crispy outside, soft inside. With garlic mojo.',
    price: 4.00,
    category: 'sides',
    isVegetarian: true,
    isPopular: true,
  },
  {
    id: '8',
    slug: 'yuca-con-mojo',
    name_es: 'Yuca con Mojo',
    name_en: 'Yuca with Mojo',
    description_es: 'Yuca hervida y bañada en mojo cubano de ajo, naranja agria y aceite de oliva.',
    description_en: 'Boiled yuca drizzled in Cuban mojo of garlic, sour orange and olive oil.',
    price: 4.00,
    category: 'sides',
    isVegetarian: true,
  },
  {
    id: '9',
    slug: 'arroz-blanco',
    name_es: 'Arroz Blanco',
    name_en: 'White Rice',
    description_es: 'Arroz blanco esponjoso al estilo cubano.',
    description_en: 'Fluffy white rice, Cuban style.',
    price: 3.00,
    category: 'sides',
    isVegetarian: true,
  },
  // === BEBIDAS ===
  {
    id: '10',
    slug: 'agua-de-coco',
    name_es: 'Agua de Coco Natural',
    name_en: 'Fresh Coconut Water',
    description_es: 'Agua de coco natural, refrescante y tropical.',
    description_en: 'Natural coconut water, refreshing and tropical.',
    price: 5.00,
    category: 'drinks',
    isPopular: true,
  },
  {
    id: '11',
    slug: 'limonada-tropical',
    name_es: 'Limonada Tropical',
    name_en: 'Tropical Lemonade',
    description_es: 'Limonada fresca con un toque de maracuyá y menta.',
    description_en: 'Fresh lemonade with a hint of passion fruit and mint.',
    price: 5.00,
    category: 'drinks',
  },
  {
    id: '12',
    slug: 'malta-hatuey',
    name_es: 'Malta Hatuey',
    name_en: 'Malta Hatuey',
    description_es: 'Malta premium cubana, dulce y con sabor inconfundible.',
    description_en: 'Premium Cuban malt beverage, sweet with unmistakable flavor.',
    price: 4.00,
    category: 'drinks',
  },
  {
    id: '13',
    slug: 'cafe-cubano',
    name_es: 'Café Cubano',
    name_en: 'Cuban Coffee',
    description_es: 'Espresso bien concentrado con azúcar demerara batida. La energía de La Habana.',
    description_en: 'Strong espresso with beaten demerara sugar. The energy of Havana.',
    price: 3.00,
    category: 'drinks',
  },
  // === POSTRES ===
  {
    id: '14',
    slug: 'flan-cubano',
    name_es: 'Flan Casero',
    name_en: 'Homemade Flan',
    description_es: 'Flan de vainilla con caramelo casero, receta de abuela cubana.',
    description_en: 'Vanilla flan with homemade caramel, Cuban grandmother\'s recipe.',
    price: 6.00,
    category: 'desserts',
    isPopular: true,
  },
  {
    id: '15',
    slug: 'pastelito-guayaba',
    name_es: 'Pastelito de Guayaba',
    name_en: 'Guava Pastry',
    description_es: 'Hojaldre dorado relleno de pasta de guayaba y queso crema.',
    description_en: 'Golden puff pastry filled with guava paste and cream cheese.',
    price: 4.00,
    category: 'desserts',
    isPopular: true,
  },
  {
    id: '16',
    slug: 'churros-dulce-de-leche',
    name_es: 'Churros con Dulce de Leche',
    name_en: 'Churros with Dulce de Leche',
    description_es: 'Churros crujientes con canela, servidos con dip de dulce de leche.',
    description_en: 'Crispy cinnamon churros served with dulce de leche dipping sauce.',
    price: 5.00,
    category: 'desserts',
  },
];

export const popularItems = menuItems.filter((item) => item.isPopular);

export const getByCategory = (category: MenuCategory) =>
  menuItems.filter((item) => item.category === category);
