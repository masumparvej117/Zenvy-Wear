import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, Category, CartItem, Order, User, SiteSettings } from '../types';
import { api, authStorage } from '../utils/api';
import { calculateCartTotals } from '../utils/shopRules';
import { auth, testConnection } from '../firebase/config';
import {
  seedFirestoreIfEmpty,
  subscribeProducts,
  subscribeCategories,
  subscribeSettings,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmailPassword,
  registerWithEmailPassword,
  logOutFromFirebase,
  syncFirebaseUserProfile,
  isEmailAdmin,
} from '../firebase/firestoreService';
import { initialProducts, initialCategories, defaultSettings } from '../utils/initialData';
import { onAuthStateChanged } from 'firebase/auth';

interface ShopContextType {
  user: User | null;
  isAdmin: boolean;
  isLoadingUser: boolean;
  isFirebaseConnected: boolean;
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;
  isFreeDelivery: boolean;
  freeDeliveryThresholdRemaining: number;
  cityZone: 'inside_dhaka' | 'outside_dhaka';
  setCityZone: (zone: 'inside_dhaka' | 'outside_dhaka') => void;
  // Modals & Navigation
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  orderSuccess: Order | null;
  setOrderSuccess: (o: Order | null) => void;
  authModal: 'closed' | 'login' | 'register';
  setAuthModal: (m: 'closed' | 'login' | 'register') => void;
  isMyOrdersOpen: boolean;
  setIsMyOrdersOpen: (open: boolean) => void;
  activeInfoModal: 'about' | 'contact' | 'shipping' | 'returns' | 'privacy' | null;
  setActiveInfoModal: (m: 'about' | 'contact' | 'shipping' | 'returns' | 'privacy' | null) => void;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentRoute: 'store' | 'admin' | 'admin-login';
  setCurrentRoute: (r: 'store' | 'admin' | 'admin-login') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // Cart Actions
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  // Wishlist Actions
  wishlist: string[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  // User Actions
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zenvy_cart_items';

export function ShopProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [cityZone, setCityZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');

  // Navigation & Modals
  const [currentRoute, setCurrentRoute] = useState<'store' | 'admin' | 'admin-login'>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [authModal, setAuthModal] = useState<'closed' | 'login' | 'register'>('closed');
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<'about' | 'contact' | 'shipping' | 'returns' | 'privacy' | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zenvy_wishlist_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('zenvy_wishlist_ids', JSON.stringify(next));
      } catch {}
      showToast(exists ? 'Removed from wishlist' : 'Added to wishlist', 'info');
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Sync route from URL on mount & handle browser hash/path
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentRoute('admin');
      } else if (path === '/admin/login' || hash === '#admin/login') {
        setCurrentRoute('admin-login');
      } else {
        setCurrentRoute('store');
      }
    };
    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Update URL history when route changes
  const updateRoute = (route: 'store' | 'admin' | 'admin-login') => {
    setCurrentRoute(route);
    const targetPath = route === 'admin' ? '/admin' : route === 'admin-login' ? '/admin/login' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Connect Firebase & subscribe to live Firestore collections
  useEffect(() => {
    let unsubProducts: (() => void) | undefined;
    let unsubCategories: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    async function initFirebaseAndData() {
      try {
        await testConnection();
        setIsFirebaseConnected(true);
        // Seed default collections if empty in Firestore
        await seedFirestoreIfEmpty();
      } catch (err) {
        console.warn('Firebase initial test/seed notice:', err);
      }

      // Attach Firestore real-time listeners
      try {
        unsubProducts = subscribeProducts((prods) => {
          if (prods && prods.length > 0) {
            setProducts(prods);
          }
        });

        unsubCategories = subscribeCategories((cats) => {
          if (cats && cats.length > 0) {
            setCategories(cats);
          }
        });

        unsubSettings = subscribeSettings((sets) => {
          if (sets) {
            setSettings(sets);
          }
        });
      } catch (err) {
        console.warn('Real-time listener setup fallback to API:', err);
      }
    }

    initFirebaseAndData();

    // Firebase Auth State Listener
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const u = await syncFirebaseUserProfile(fbUser.uid, {
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || undefined,
            role: isEmailAdmin(fbUser.email) ? 'admin' : 'customer',
          });
          setUser(u);
        } catch (err) {
          console.warn('Error syncing Firebase user profile:', err);
        }
      } else {
        // Fallback check local JWT storage if user signed in via server API
        const token = authStorage.getToken();
        if (token) {
          api
            .getCurrentUser()
            .then((u) => setUser(u))
            .catch(() => {
              authStorage.clearToken();
              setUser(null);
            });
        } else {
          setUser(null);
        }
      }
      setIsLoadingUser(false);
    });

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubCategories) unsubCategories();
      if (unsubSettings) unsubSettings();
      unsubAuth();
    };
  }, []);

  const refreshData = async () => {
    try {
      const [prodsData, catsData, setsData] = await Promise.all([
        api.getProducts().catch(() => initialProducts),
        api.getCategories().catch(() => initialCategories),
        api.getSettings().catch(() => defaultSettings),
      ]);
      if (prodsData && prodsData.length > 0) setProducts(prodsData);
      if (catsData && catsData.length > 0) setCategories(catsData);
      if (setsData) setSettings(setsData);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Cart calculations
  const cartTotals = calculateCartTotals(
    cart.map((item) => ({
      price: item.product.price,
      discountPrice: item.product.discountPrice,
      quantity: item.quantity,
    })),
    cityZone,
    settings.freeShippingThreshold,
    settings.deliveryFeeDhaka,
    settings.deliveryFeeOutside
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    const unitPrice =
      typeof product.discountPrice === 'number' && product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    const itemId = `${product.id}-${size}-${color}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          showToast(`Maximum available stock is ${product.stock}`, 'error');
          return prev;
        }
        showToast(`Updated cart: ${product.name} (Qty: ${nextQty})`, 'success');
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: nextQty } : item
        );
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} available in stock`, 'error');
          return prev;
        }
        showToast(`Added ${product.name} to shopping bag`, 'success');
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            product,
            size,
            color,
            quantity,
            unitPrice,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) {
              showToast(`Only ${item.product.stock} units available in stock`, 'error');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Auth actions (Firebase Auth + backend fallback)
  const login = async (email: string, pass: string) => {
    try {
      // First attempt Firebase Auth
      try {
        const fbUser = await signInWithEmailPassword(email, pass);
        setUser(fbUser);
        setAuthModal('closed');
        showToast(`Welcome back, ${fbUser.name}!`, 'success');
        return { success: true };
      } catch (fbErr: any) {
        // Fallback to Express backend credentials (e.g. for default Admin credentials)
        const res = await api.login({ email, password: pass });
        authStorage.setToken(res.token);
        setUser(res.user);
        setAuthModal('closed');
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return { success: true };
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      try {
        const fbUser = await registerWithEmailPassword(name, email, pass, phone);
        setUser(fbUser);
        setAuthModal('closed');
        showToast(`Account created! Welcome to ZENVY WEAR, ${name}.`, 'success');
        return { success: true };
      } catch (fbErr: any) {
        const res = await api.register({ name, email, password: pass, phone });
        authStorage.setToken(res.token);
        setUser(res.user);
        setAuthModal('closed');
        showToast(`Account created! Welcome to ZENVY WEAR, ${res.user.name}.`, 'success');
        return { success: true };
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const fbUser = await fbSignInWithGoogle();
      setUser(fbUser);
      setAuthModal('closed');
      showToast(`Welcome to ZENVY WEAR, ${fbUser.name}!`, 'success');
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Google sign in failed';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    logOutFromFirebase().catch(() => {});
    authStorage.clearToken();
    setUser(null);
    if (currentRoute === 'admin') {
      updateRoute('store');
    }
    showToast('You have been logged out', 'info');
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin' || isEmailAdmin(user?.email),
        isLoadingUser,
        isFirebaseConnected,
        products,
        categories,
        settings,
        cart,
        cartCount,
        cartSubtotal: cartTotals.subtotal,
        cartDeliveryFee: cartTotals.deliveryFee,
        cartTotal: cartTotals.total,
        isFreeDelivery: cartTotals.isFreeDelivery,
        freeDeliveryThresholdRemaining: cartTotals.qualifiesForFreeThresholdRemaining,
        cityZone,
        setCityZone,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orderSuccess,
        setOrderSuccess,
        authModal,
        setAuthModal,
        isMyOrdersOpen,
        setIsMyOrdersOpen,
        activeInfoModal,
        setActiveInfoModal,
        activeCategoryFilter,
        setActiveCategoryFilter,
        searchQuery,
        setSearchQuery,
        currentRoute,
        setCurrentRoute: updateRoute,
        toast,
        showToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isWishlisted,
        login,
        register,
        signInWithGoogle,
        logout,
        refreshData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
