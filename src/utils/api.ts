import type { Product, Category, Order, User, SiteSettings } from '../types';

const TOKEN_KEY = 'zenvy_auth_token';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },
  clearToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = authStorage.getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg =
      (typeof data === 'object' && data && (data.error || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Public
  getSettings: () => request<SiteSettings>('/api/settings'),
  getCategories: () => request<Category[]>('/api/categories'),
  getProducts: (params?: { category?: string; search?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    const qs = query.toString();
    return request<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id: string) => request<Product>(`/api/products/${id}`),

  // Auth
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCurrentUser: () => request<User>('/api/auth/me'),

  // Orders
  createOrder: (payload: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    deliveryAddress: string;
    cityZone: 'inside_dhaka' | 'outside_dhaka';
    orderNotes?: string;
    paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'cod' | 'online';
    paymentSenderNumber: string;
    paymentTrxId?: string;
    items: Array<{ productId: string; size: string; color: string; quantity: number }>;
  }) =>
    request<{ message: string; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMyOrders: () => request<Order[]>('/api/orders/my'),
  getOrderByRef: (ref: string) => request<Order>(`/api/orders/ref/${ref}`),

  // Admin APIs
  admin: {
    getStats: () =>
      request<{
        totalProducts: number;
        totalOrders: number;
        totalCustomers: number;
        lowStockCount: number;
        totalRevenue: number;
        pendingOrdersCount: number;
      }>('/api/admin/stats'),
    getProducts: (params?: { search?: string; category?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.category) query.set('category', params.category);
      if (params?.status) query.set('status', params.status);
      const qs = query.toString();
      return request<Product[]>(`/api/admin/products${qs ? `?${qs}` : ''}`);
    },
    createProduct: (data: Partial<Product>) =>
      request<Product>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateProduct: (id: string, data: Partial<Product>) =>
      request<Product>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteProduct: (id: string) =>
      request<{ message: string }>(`/api/admin/products/${id}`, {
        method: 'DELETE',
      }),
    createCategory: (data: { name: string; description?: string; image?: string }) =>
      request<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteCategory: (id: string) =>
      request<{ message: string }>(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      }),
    getOrders: (params?: { status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      const qs = query.toString();
      return request<Order[]>(`/api/admin/orders${qs ? `?${qs}` : ''}`);
    },
    updateOrderStatus: (id: string, status: string) =>
      request<Order>(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    updateSettings: (data: Partial<SiteSettings>) =>
      request<SiteSettings>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
