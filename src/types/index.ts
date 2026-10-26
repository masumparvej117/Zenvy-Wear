export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number; // In BDT (৳)
  discountPrice?: number; // Optional discount price in BDT
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface CartItem {
  id: string; // unique item id: productId-size-color
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Success'
  | 'Cancelled';

export interface Order {
  id: string;
  orderRef: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;
  cityZone: 'inside_dhaka' | 'outside_dhaka';
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'cod' | 'online';
  paymentSenderNumber?: string;
  paymentTrxId?: string;
  deliveryFeeAdvance?: number;
  status: OrderStatus;
  createdAt: string;
  userId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  bannerAnnouncement: string;
  whatsappNumber: string;
  facebookUrl: string;
  businessEmail: string;
  freeShippingThreshold: number;
  deliveryFeeDhaka: number;
  deliveryFeeOutside: number;
}
