import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './config';
import type { Product, Category, Order, User, SiteSettings } from '../types';
import { initialProducts, initialCategories, defaultSettings } from '../utils/initialData';

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';

// Helper to determine if an email or uid qualifies as admin
export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === 'masumparvej117@gmail.com' || clean === 'zenvywear75@gmail.com';
}

// 1. Initialize / Seed Firestore if empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (productsSnap.empty) {
      console.log('[Firebase] Seeding initial products...');
      for (const prod of initialProducts) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
      }
    }

    const categoriesSnap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (categoriesSnap.empty) {
      console.log('[Firebase] Seeding initial categories...');
      for (const cat of initialCategories) {
        await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), cat);
      }
    }

    const settingsRef = doc(db, SETTINGS_COLLECTION, 'general');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      console.log('[Firebase] Seeding store settings...');
      await setDoc(settingsRef, defaultSettings);
    }

    // Seed admin record for masumparvej117@gmail.com and zenvywear75@gmail.com
    const adminRef1 = doc(db, ADMINS_COLLECTION, 'masum_admin');
    await setDoc(
      adminRef1,
      {
        email: 'masumparvej117@gmail.com',
        role: 'admin',
        addedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Firebase] Database seeding check finished:', err);
  }
}

// 2. Products APIs
export function subscribeProducts(
  onData: (products: Product[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Product), id: d.id });
      });
      // Newest posts first at the very top
      items.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, PRODUCTS_COLLECTION);
    }
  );
}

export async function addProductToFirestore(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const id = product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const cleanProduct: Record<string, any> = {
    id,
    sku: String(product.sku || '').trim().toUpperCase(),
    name: String(product.name || '').trim(),
    category: String(product.category || '').trim(),
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    status: product.status === 'inactive' ? 'inactive' : 'active',
    isFeatured: Boolean(product.isFeatured),
    isNewArrival: Boolean(product.isNewArrival),
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/src/assets/images/category_men_tshirt_1792926459237.jpg'],
    sizes: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['M', 'L', 'XL'],
    colors: Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : [{ name: 'Black', hex: '#111111' }],
    createdAt: product.createdAt || now,
    updatedAt: now,
  };

  if (product.description) cleanProduct.description = product.description;
  if (typeof product.discountPrice === 'number' && product.discountPrice > 0) {
    cleanProduct.discountPrice = product.discountPrice;
  }

  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, id), cleanProduct);
    return cleanProduct as Product;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

export async function updateProductInFirestore(id: string, updates: Partial<Product>): Promise<void> {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

export async function deleteProductFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

// 3. Categories APIs
export function subscribeCategories(
  onData: (categories: Category[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, CATEGORIES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Category[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Category), id: d.id });
      });
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, CATEGORIES_COLLECTION);
    }
  );
}

export async function addCategoryToFirestore(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
  const id = category.id || `cat_${Date.now()}`;
  const newCat: Category = { ...category, id };
  try {
    await setDoc(doc(db, CATEGORIES_COLLECTION, id), newCat);
    return newCat;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

export async function deleteCategoryFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

// 4. Site Settings APIs
export function subscribeSettings(
  onData: (settings: SiteSettings) => void,
  onError?: (err: any) => void
) {
  const ref = doc(db, SETTINGS_COLLECTION, 'general');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as SiteSettings);
      }
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, `${SETTINGS_COLLECTION}/general`);
    }
  );
}

export async function updateSettingsInFirestore(updates: Partial<SiteSettings>): Promise<void> {
  const ref = doc(db, SETTINGS_COLLECTION, 'general');
  try {
    await setDoc(ref, updates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${SETTINGS_COLLECTION}/general`);
  }
}

// 5. Orders APIs
export async function createOrderInFirestore(orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order> {
  const id = orderData.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const validMethods = ['bkash', 'nagad', 'rocket', 'cod', 'online'];
  const pMethod = validMethods.includes(orderData.paymentMethod) ? orderData.paymentMethod : 'bkash';

  const cleanOrder: Record<string, any> = {
    id,
    orderRef: String(orderData.orderRef || '').trim(),
    customerName: String(orderData.customerName || '').trim(),
    customerPhone: String(orderData.customerPhone || '').trim(),
    deliveryAddress: String(orderData.deliveryAddress || '').trim(),
    cityZone: orderData.cityZone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka',
    total: Math.max(0, Number(orderData.total) || 0),
    status: orderData.status || 'Pending',
    paymentMethod: pMethod,
    createdAt: orderData.createdAt || new Date().toISOString(),
    subtotal: Math.max(0, Number(orderData.subtotal) || 0),
    deliveryFee: Math.max(0, Number(orderData.deliveryFee) || 0),
    items: Array.isArray(orderData.items) ? orderData.items : [],
  };

  if (orderData.customerEmail && String(orderData.customerEmail).trim()) {
    cleanOrder.customerEmail = String(orderData.customerEmail).trim();
  }
  if (orderData.orderNotes && String(orderData.orderNotes).trim()) {
    cleanOrder.orderNotes = String(orderData.orderNotes).trim();
  }
  if (orderData.userId && String(orderData.userId).trim()) {
    cleanOrder.userId = String(orderData.userId).trim();
  }
  if (orderData.paymentSenderNumber && String(orderData.paymentSenderNumber).trim()) {
    cleanOrder.paymentSenderNumber = String(orderData.paymentSenderNumber).trim();
  }
  if (orderData.paymentTrxId && String(orderData.paymentTrxId).trim()) {
    cleanOrder.paymentTrxId = String(orderData.paymentTrxId).trim();
  }
  if (typeof orderData.deliveryFeeAdvance === 'number') {
    cleanOrder.deliveryFeeAdvance = orderData.deliveryFeeAdvance;
  }

  try {
    await setDoc(doc(db, ORDERS_COLLECTION, id), cleanOrder);
    return cleanOrder as Order;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${ORDERS_COLLECTION}/${id}`);
  }
}

export function subscribeUserOrders(
  userId: string,
  onData: (orders: Order[]) => void,
  onError?: (err: any) => void
) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((d) => list.push(d.data() as Order));
      onData(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, ORDERS_COLLECTION);
    }
  );
}

export function subscribeAllOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((d) => list.push(d.data() as Order));
      onData(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, ORDERS_COLLECTION);
    }
  );
}

export async function updateOrderStatusInFirestore(orderId: string, status: string): Promise<void> {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// 6. User Profile & Auth
export async function syncFirebaseUserProfile(
  uid: string,
  profile: { name: string; email: string; phone?: string; role?: 'admin' | 'customer' }
): Promise<User> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);

  const determinedRole = isEmailAdmin(profile.email)
    ? 'admin'
    : profile.role || 'customer';

  if (!userSnap.exists()) {
    const newUser: User = {
      id: uid,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: determinedRole,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(userRef, newUser);
      return newUser;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${USERS_COLLECTION}/${uid}`);
    }
  } else {
    const existing = userSnap.data() as User;
    const updated: User = {
      ...existing,
      name: profile.name || existing.name,
      phone: profile.phone || existing.phone,
      role: isEmailAdmin(existing.email) ? 'admin' : existing.role,
    };
    try {
      await setDoc(userRef, updated, { merge: true });
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
    }
  }
}

// Google Sign In
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  const user = await syncFirebaseUserProfile(fbUser.uid, {
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
    email: fbUser.email || '',
    phone: fbUser.phoneNumber || undefined,
  });
  return user;
}

// Email Sign In
export async function signInWithEmailPassword(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;
  const userRef = doc(db, USERS_COLLECTION, fbUser.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as User;
  }
  return syncFirebaseUserProfile(fbUser.uid, {
    name: fbUser.displayName || email.split('@')[0],
    email,
  });
}

// Email Register
export async function registerWithEmailPassword(
  name: string,
  email: string,
  pass: string,
  phone?: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;
  await updateProfile(fbUser, { displayName: name });
  return syncFirebaseUserProfile(fbUser.uid, {
    name,
    email,
    phone,
    role: 'customer',
  });
}

// Firebase Sign Out
export async function logOutFromFirebase(): Promise<void> {
  await signOut(auth);
}
