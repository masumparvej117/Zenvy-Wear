import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, Category, CartItem, Order, User, SiteSettings } from '../types';
import { api, authStorage } from '../utils/api';
import { calculateCartTotals } from '../utils/shopRules';

interface ShopContextType {
  user: User | null;
  isAdmin: boolean;
  isLoadingUser: boolean;
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
  logout: () => void;
  refreshData: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  brandName: 'ZENVY WEAR',
  tagline: 'Wear Your Style. Modern Fashion for Everyone.',
  bannerAnnouncement: 'Free delivery across Bangladesh on orders over Tk. 2,000 · Cash on Delivery Available',
  whatsappNumber: '+8801757391262',
  facebookUrl: 'https://www.facebook.com/zenvywear1',
  businessEmail: 'zenvywear75@gmail.com',
  freeShippingThreshold: 2000,
  deliveryFeeDhaka: 70,
  deliveryFeeOutside: 130,
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zenvy_cart_items';

export function ShopProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  // Load User & Catalog
  const refreshData = async () => {
    try {
      const [prodsData, catsData, setsData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSettings().catch(() => defaultSettings),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
      if (setsData) setSettings(setsData);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  };

  useEffect(() => {
    refreshData();

    // Check user auth token
    const token = authStorage.getToken();
    if (token) {
      api
        .getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => {
          authStorage.clearToken();
          setUser(null);
        })
        .finally(() => setIsLoadingUser(false));
    } else {
      setIsLoadingUser(false);
    }
  }, []);

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

  // Auth actions
  const login = async (email: string, pass: string) => {
    try {
      const res = await api.login({ email, password: pass });
      authStorage.setToken(res.token);
      setUser(res.user);
      setAuthModal('closed');
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const res = await api.register({ name, email, password: pass, phone });
      authStorage.setToken(res.token);
      setUser(res.user);
      setAuthModal('closed');
      showToast(`Account created! Welcome to ZENVY WEAR, ${res.user.name}.`, 'success');
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
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
        isAdmin: user?.role === 'admin',
        isLoadingUser,
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
