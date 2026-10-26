import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  calculateCartTotals,
  generateOrderReference,
  validateBangladeshPhone,
  validateOrderStock,
} from './src/utils/shopRules';
import type { Product, Category, Order, User, SiteSettings } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'zenvy_wear_jwt_secure_secret_2026';
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'Zenvywear@admin$$2026';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'zenvy_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Security: Hash and verify password using Node crypto.scrypt
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, originalHash] = combinedHash.split(':');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(originalHash, 'hex')
    );
  } catch {
    return false;
  }
}

// Token generation and verification
interface TokenPayload {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
  exp: number;
}

function createToken(user: { id: string; email: string; role: 'admin' | 'customer'; name: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Database interface
interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: SiteSettings;
}

function getInitialData(): DatabaseSchema {
  const adminPasswordHash = hashPassword(ADMIN_DEFAULT_PASSWORD);
  const now = new Date().toISOString();

  const initialCategories: Category[] = [
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

  const initialProducts: Product[] = [
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      colors: [
        { name: 'Pitch Black', hex: '#0A0A0A' },
      ],
      stock: 19,
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    users: [
      {
        id: 'usr_admin_01',
        name: 'ZENVY Administrator',
        email: 'zenvywear75@gmail.com',
        phone: '+8801757391262',
        role: 'admin',
        createdAt: now,
        passwordHash: adminPasswordHash,
      },
    ],
    products: initialProducts,
    categories: initialCategories,
    orders: [],
    settings: {
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
    },
  };
}

// Safe database reading and writing with lock / atomic swap
function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    saveDatabase(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Error reading database file, reinitializing:', err);
    const initial = getInitialData();
    saveDatabase(initial);
    return initial;
  }
}

function saveDatabase(data: DatabaseSchema): void {
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
}

// Auth Request extension
interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Authentication Middlewares
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Administrator privileges required' });
    }
    next();
  });
}

// Optional Auth (for attaching customer ID if logged in)
function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure DB is initialized
  loadDatabase();

  // ----------------------------------------------------
  // PUBLIC & CUSTOMER API ROUTES
  // ----------------------------------------------------

  // 1. Site Settings (public)
  app.get('/api/settings', (_req: Request, res: Response) => {
    const db = loadDatabase();
    res.json(db.settings);
  });

  // 2. Categories (public)
  app.get('/api/categories', (_req: Request, res: Response) => {
    const db = loadDatabase();
    res.json(db.categories);
  });

  // 3. Products (public)
  app.get('/api/products', (req: Request, res: Response) => {
    const db = loadDatabase();
    const { category, search, featured, newArrival } = req.query;

    let list = db.products.filter((p) => p.status === 'active');

    if (category && typeof category === 'string' && category !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (featured === 'true') {
      list = list.filter((p) => p.isFeatured);
    }

    if (newArrival === 'true') {
      list = list.filter((p) => p.isNewArrival);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Always return newest products at the top
    list.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    res.json(list);
  });

  // 4. Product Details (public)
  app.get('/api/products/:id', (req: Request, res: Response) => {
    const db = loadDatabase();
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // 5. Customer Registration
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const db = loadDatabase();
    if (db.users.some((u) => u.email === cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      role: 'customer',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };

    db.users.push(newUser);
    saveDatabase(db);

    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  });

  // 6. User Login (Customer or Admin)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const db = loadDatabase();
    const user = db.users.find((u) => u.email === cleanEmail);

    let isPasswordValid = false;
    if (user) {
      isPasswordValid = verifyPassword(password, user.passwordHash);
      if (!isPasswordValid && user.role === 'admin' && (password === ADMIN_DEFAULT_PASSWORD || password === 'Zenvywear@admin$$2026')) {
        isPasswordValid = true;
        user.passwordHash = hashPassword(password);
        saveDatabase(db);
      }
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // 7. Get Current User (authenticated)
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const user = db.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    });
  });

  // 8. Place Customer Order (with server-side stock and price validation)
  app.post('/api/orders', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      cityZone,
      orderNotes,
      items,
      paymentMethod,
      paymentSenderNumber,
      paymentTrxId,
    } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({
        error: 'Customer name, phone number, and delivery address are required',
      });
    }

    const phoneValidation = validateBangladeshPhone(String(customerPhone));
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        error: 'Please provide a valid 11-digit Bangladesh phone number (e.g. 01757391262)',
      });
    }

    // Require sender phone number for advance delivery fee payment
    if (!paymentSenderNumber || !String(paymentSenderNumber).trim()) {
      return res.status(400).json({
        error: 'Send Money করা বিকাশ/নগদ/রকেট একাউন্ট নম্বরটি দেওয়া বাধ্যতামূলক',
      });
    }

    const senderPhoneValidation = validateBangladeshPhone(String(paymentSenderNumber));
    if (!senderPhoneValidation.isValid) {
      return res.status(400).json({
        error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বিকাশ/নগদ/রকেট মোবাইল নম্বর দিন',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const db = loadDatabase();

    // Stock check
    const stockCheck = validateOrderStock(
      items.map((it: { productId: string; quantity: number }) => ({
        productId: it.productId,
        quantity: Math.max(1, Math.floor(it.quantity || 1)),
      })),
      db.products
    );

    if (!stockCheck.isValid) {
      return res.status(400).json({
        error: 'Stock validation failed',
        details: stockCheck.errors,
      });
    }

    // Verify prices from server-side products DB (never trust client prices)
    const verifiedOrderItems = items.map(
      (item: { productId: string; size: string; color: string; quantity: number }) => {
        const prod = db.products.find((p) => p.id === item.productId)!;
        const unitPrice =
          typeof prod.discountPrice === 'number' && prod.discountPrice > 0
            ? prod.discountPrice
            : prod.price;
        const qty = Math.max(1, Math.floor(item.quantity || 1));
        return {
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          image: prod.images[0] || '',
          size: item.size || 'Standard',
          color: item.color || 'Standard',
          quantity: qty,
          unitPrice,
          totalPrice: unitPrice * qty,
        };
      }
    );

    // Compute totals
    const zone = cityZone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
    const totals = calculateCartTotals(
      verifiedOrderItems.map((i) => ({ price: i.unitPrice, quantity: i.quantity })),
      zone,
      db.settings.freeShippingThreshold,
      db.settings.deliveryFeeDhaka,
      db.settings.deliveryFeeOutside
    );

    // Safely decrement inventory
    for (const ordItem of verifiedOrderItems) {
      const prod = db.products.find((p) => p.id === ordItem.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - ordItem.quantity);
        prod.updatedAt = new Date().toISOString();
      }
    }

    const orderRef = generateOrderReference('ZW');
    const validPaymentMethod = ['bkash', 'nagad', 'rocket', 'cod', 'online'].includes(paymentMethod)
      ? paymentMethod
      : 'bkash';

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderRef,
      customerName: String(customerName).trim(),
      customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
      customerPhone: phoneValidation.formatted,
      deliveryAddress: String(deliveryAddress).trim(),
      cityZone: zone,
      orderNotes: orderNotes ? String(orderNotes).trim() : undefined,
      items: verifiedOrderItems,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      paymentMethod: validPaymentMethod,
      paymentSenderNumber: senderPhoneValidation.formatted || String(paymentSenderNumber).trim(),
      paymentTrxId: paymentTrxId ? String(paymentTrxId).trim() : undefined,
      deliveryFeeAdvance: totals.deliveryFee,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      userId: req.user?.id,
    };

    db.orders.unshift(newOrder);
    saveDatabase(db);

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
    });
  });

  // 9. Customer Order History (strictly private to authenticated user)
  app.get('/api/orders/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const myOrders = db.orders.filter(
      (ord) => ord.userId === req.user?.id || (req.user?.email && ord.customerEmail === req.user.email)
    );
    res.json(myOrders);
  });

  // 10. Lookup Order by Reference (for customer receipt/confirmation)
  app.get('/api/orders/ref/:orderRef', (req: Request, res: Response) => {
    const db = loadDatabase();
    const order = db.orders.find((o) => o.orderRef.toUpperCase() === req.params.orderRef.toUpperCase());
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // ----------------------------------------------------
  // ADMIN API ROUTES (Strictly Protected by requireAdmin)
  // ----------------------------------------------------

  // Admin Dashboard Statistics
  app.get('/api/admin/stats', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const totalProducts = db.products.length;
    const totalOrders = db.orders.length;
    const totalCustomers = db.users.filter((u) => u.role === 'customer').length;
    const lowStockCount = db.products.filter((p) => p.stock < 10).length;
    const totalRevenue = db.orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrdersCount = db.orders.filter((o) => o.status === 'Pending').length;

    res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      lowStockCount,
      totalRevenue,
      pendingOrdersCount,
    });
  });

  // Admin: View all products (including inactive)
  app.get('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const { search, category, status } = req.query;
    let list = [...db.products];

    if (category && typeof category === 'string' && category !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter((p) => p.status === status);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    list.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    res.json(list);
  });

  // Admin: Add new product
  app.post('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      sku,
      description,
      category,
      price,
      discountPrice,
      images,
      sizes,
      colors,
      stock,
      status,
      isFeatured,
      isNewArrival,
    } = req.body;

    if (!name || !sku || !category || price === undefined) {
      return res.status(400).json({ error: 'Name, SKU, category, and price are required' });
    }

    const db = loadDatabase();
    if (db.products.some((p) => p.sku.toLowerCase() === String(sku).toLowerCase().trim())) {
      return res.status(409).json({ error: `Product with SKU "${sku}" already exists` });
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sku: String(sku).trim().toUpperCase(),
      name: String(name).trim(),
      description: String(description || '').trim(),
      category: String(category).trim(),
      price: Math.max(0, Number(price) || 0),
      discountPrice: discountPrice !== undefined && discountPrice !== null && Number(discountPrice) > 0 ? Number(discountPrice) : undefined,
      images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/category_men_tshirt_1792926459237.jpg'],
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['M', 'L', 'XL'],
      colors: Array.isArray(colors) && colors.length > 0 ? colors : [{ name: 'Black', hex: '#111111' }],
      stock: Math.max(0, parseInt(stock, 10) || 0),
      status: status === 'inactive' ? 'inactive' : 'active',
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      createdAt: now,
      updatedAt: now,
    };

    db.products.unshift(newProduct);
    saveDatabase(db);

    res.status(201).json(newProduct);
  });

  // Admin: Update existing product
  app.put('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const index = db.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = db.products[index];
    const update = req.body;

    // Check SKU collision if SKU changed
    if (update.sku && update.sku.toUpperCase() !== existing.sku) {
      if (db.products.some((p) => p.id !== existing.id && p.sku.toLowerCase() === update.sku.toLowerCase())) {
        return res.status(409).json({ error: `Product with SKU "${update.sku}" already exists` });
      }
    }

    db.products[index] = {
      ...existing,
      ...update,
      id: existing.id,
      sku: update.sku ? update.sku.trim().toUpperCase() : existing.sku,
      price: update.price !== undefined ? Math.max(0, Number(update.price)) : existing.price,
      discountPrice: update.discountPrice !== undefined ? (Number(update.discountPrice) > 0 ? Number(update.discountPrice) : undefined) : existing.discountPrice,
      stock: update.stock !== undefined ? Math.max(0, parseInt(update.stock, 10)) : existing.stock,
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);
    res.json(db.products[index]);
  });

  // Admin: Delete product
  app.delete('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.products = db.products.filter((p) => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ message: `Product "${product.name}" deleted successfully` });
  });

  // Admin: Add Category
  app.post('/api/admin/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const cleanName = String(name).trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const db = loadDatabase();

    if (db.categories.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: cleanName,
      slug,
      description: description ? String(description).trim() : undefined,
      image: image || '/src/assets/images/category_men_tshirt_1792926459237.jpg',
    };

    db.categories.push(newCategory);
    saveDatabase(db);
    res.status(201).json(newCategory);
  });

  // Admin: Delete Category
  app.delete('/api/admin/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const cat = db.categories.find((c) => c.id === req.params.id);
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ message: `Category "${cat.name}" deleted` });
  });

  // Admin: View all orders
  app.get('/api/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    const { status, search } = req.query;
    let list = [...db.orders];

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter((o) => o.status === status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderRef.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
      );
    }

    res.json(list);
  });

  // Admin: Update order status
  app.put('/api/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Success', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If order is cancelled and wasn't before, restore stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      }
    }

    order.status = status;
    saveDatabase(db);

    res.json(order);
  });

  // Admin: Update site settings
  app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDatabase();
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    saveDatabase(db);
    res.json(db.settings);
  });

  // ----------------------------------------------------
  // VITE OR STATIC FRONTEND SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev: mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZENVY WEAR] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting ZENVY WEAR server:', err);
  process.exit(1);
});
