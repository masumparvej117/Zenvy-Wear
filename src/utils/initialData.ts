import type { Product, Category, SiteSettings } from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat_mens_tshirt',
    name: "Men's T-Shirt",
    slug: 'mens-t-shirt',
    description: 'Heavyweight organic cotton, drop-shoulder silhouettes, and modern minimal cuts.',
    image: '/src/assets/images/model_men_tshirt_1792927704671.jpg',
  },
  {
    id: 'cat_womens_tshirt',
    name: "Women's T-Shirt",
    slug: 'womens-t-shirt',
    description: 'Relaxed premium cotton essentials with effortless modern tailoring.',
    image: '/src/assets/images/model_women_tshirt_1792927722947.jpg',
  },
  {
    id: 'cat_womens_threepiece',
    name: "Women's Three-Piece",
    slug: 'womens-three-piece',
    description: 'Luxury monochrome kameez, tailored trousers, and sheer dupatta ensembles.',
    image: '/src/assets/images/model_women_threepiece_suit_1792927746547.jpg',
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod_m_01',
    sku: 'ZW-MTS-01',
    name: "Men's Heavyweight Oversized Cotton T-Shirt",
    description:
      'Crafted from 240 GSM 100% combed ringspun cotton with a relaxed drop-shoulder cut, durable ribbed collar, and double-stitched hems. Minimalist ZENVY WEAR aesthetic designed for everyday versatility.',
    category: "Men's T-Shirt",
    price: 850,
    discountPrice: 750,
    images: [
      '/src/assets/images/model_men_tshirt_1792927704671.jpg',
      '/src/assets/images/category_men_tshirt_1792926459237.jpg',
      '/src/assets/images/hero_fashion_zenvy_1792926441073.jpg',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Charcoal Grey', hex: '#374151' },
      { name: 'Chalk White', hex: '#F3F4F6' },
    ],
    stock: 45,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_w_01',
    sku: 'ZW-WTS-01',
    name: "Women's Minimalist Tailored Organic Tee",
    description:
      'Ultra-soft 210 GSM bio-washed organic cotton with a refined drape and relaxed contemporary silhouette. Finished with clean tonal stitching and a smooth crew neckline.',
    category: "Women's T-Shirt",
    price: 790,
    discountPrice: 690,
    images: [
      '/src/assets/images/model_women_tshirt_1792927722947.jpg',
      '/src/assets/images/category_women_tshirt_1792926479580.jpg',
      '/src/assets/images/hero_fashion_zenvy_1792926441073.jpg',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pure Ivory', hex: '#FAFAF9' },
      { name: 'Midnight Black', hex: '#09090B' },
      { name: 'Sand Grey', hex: '#D6D3D1' },
    ],
    stock: 38,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_w_02',
    sku: 'ZW-WTP-01',
    name: "Women's Luxury Monochrome Three-Piece Ensemble",
    description:
      'A sophisticated modern interpretation of the classic three-piece dress: includes a straight-cut woven kameez with delicate geometric monochrome borders, matching tailored trousers, and an ethereal sheer dupatta with fine edge detailing.',
    category: "Women's Three-Piece",
    price: 3200,
    discountPrice: 2850,
    images: [
      '/src/assets/images/model_women_threepiece_suit_1792927746547.jpg',
      '/src/assets/images/category_women_threepiece_1792926494757.jpg',
    ],
    sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    colors: [
      { name: 'Ivory & Obsidian', hex: '#F5F5F4' },
      { name: 'Noir Monolith', hex: '#18181B' },
    ],
    stock: 24,
    status: 'active',
    isFeatured: true,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_m_02',
    sku: 'ZW-MTS-02',
    name: "Men's Urban Monochrome Graphic Tee",
    description:
      'Subtle high-density micro print on heavyweight matte cotton. Cut for a relaxed streetwear silhouette that maintains shape through repeated wears.',
    category: "Men's T-Shirt",
    price: 890,
    discountPrice: 790,
    images: [
      '/src/assets/images/hero_fashion_zenvy_1792926441073.jpg',
      '/src/assets/images/category_men_tshirt_1792926459237.jpg',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Pitch Black', hex: '#0A0A0A' }],
    stock: 19,
    status: 'active',
    isFeatured: false,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const defaultSettings: SiteSettings = {
  brandName: 'ZENVY WEAR',
  tagline: 'Wear Your Style. Modern Fashion for Everyone.',
  bannerAnnouncement:
    'Free delivery across Bangladesh on orders over Tk. 2,000 · Cash on Delivery Available',
  whatsappNumber: '+8801757391262',
  facebookUrl: 'https://www.facebook.com/zenvywear1',
  businessEmail: 'zenvywear75@gmail.com',
  freeShippingThreshold: 2000,
  deliveryFeeDhaka: 70,
  deliveryFeeOutside: 130,
};
