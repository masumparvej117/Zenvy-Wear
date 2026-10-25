import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Settings,
  LogOut,
  Store,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Save,
  X,
  Phone,
  MapPin,
  TrendingUp,
  DollarSign,
  Users,
  RefreshCw,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { api } from '../../utils/api';
import type { Product, Category, Order, SiteSettings } from '../../types';

export function AdminDashboard() {
  const { user, isAdmin, setCurrentRoute, logout, showToast, refreshData } = useShop();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'categories' | 'settings'
  >('overview');

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    pendingOrdersCount: 0,
  });

  // State collections
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals & Actions
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state for product add/edit
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formDiscountPrice, setFormDiscountPrice] = useState<number | ''>('');
  const [formStock, setFormStock] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formSizes, setFormSizes] = useState('');
  const [formColors, setFormColors] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(false);

  // Guard: require admin
  useEffect(() => {
    if (!isAdmin) {
      setCurrentRoute('admin-login');
    }
  }, [isAdmin, setCurrentRoute]);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, prodsRes, ordsRes, catsRes, setsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getProducts(),
        api.admin.getOrders(),
        api.getCategories(),
        api.getSettings(),
      ]);
      setStats(statsRes);
      setAdminProducts(prodsRes);
      setAdminOrders(ordsRes);
      setAdminCategories(catsRes);
      setSiteSettings(setsRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
        <Shield className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-neutral-400 mt-1 max-w-sm">
          You must be authenticated as an authorized administrator to view this console.
        </p>
        <button
          onClick={() => setCurrentRoute('admin-login')}
          className="mt-5 px-6 py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  // Handle open add product modal
  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`ZW-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setFormCategory(adminCategories[0]?.name || "Men's T-Shirt");
    setFormPrice(850);
    setFormDiscountPrice('');
    setFormStock(25);
    setFormDescription('');
    setFormImages('/src/assets/images/category_men_tshirt_1792926459237.jpg');
    setFormSizes('M, L, XL, XXL');
    setFormColors('Onyx Black:#111111, Pure White:#FFFFFF');
    setFormStatus('active');
    setFormFeatured(false);
    setFormNewArrival(true);
    setIsProductModalOpen(true);
  };

  // Handle open edit product modal
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormDiscountPrice(product.discountPrice || '');
    setFormStock(product.stock);
    setFormDescription(product.description);
    setFormImages(product.images.join(', '));
    setFormSizes(product.sizes.join(', '));
    setFormColors(product.colors.map((c) => `${c.name}:${c.hex}`).join(', '));
    setFormStatus(product.status);
    setFormFeatured(product.isFeatured);
    setFormNewArrival(product.isNewArrival);
    setIsProductModalOpen(true);
  };

  // Handle Save Product (create or edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim() || formPrice === '') {
      showToast('Name, SKU, and Price are required', 'error');
      return;
    }

    const imagesArray = formImages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const sizesArray = formSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colorsArray = formColors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [name, hex] = pair.split(':');
        return { name: name.trim(), hex: (hex || '#111111').trim() };
      });

    const payload = {
      name: formName.trim(),
      sku: formSku.trim().toUpperCase(),
      category: formCategory.trim(),
      price: Number(formPrice),
      discountPrice: formDiscountPrice !== '' && Number(formDiscountPrice) > 0 ? Number(formDiscountPrice) : undefined,
      stock: Number(formStock) || 0,
      description: formDescription.trim(),
      images: imagesArray.length > 0 ? imagesArray : ['/src/assets/images/category_men_tshirt_1792926459237.jpg'],
      sizes: sizesArray.length > 0 ? sizesArray : ['M', 'L', 'XL'],
      colors: colorsArray.length > 0 ? colorsArray : [{ name: 'Black', hex: '#111111' }],
      status: formStatus,
      isFeatured: formFeatured,
      isNewArrival: formNewArrival,
    };

    try {
      if (editingProduct && editingProduct.id) {
        await api.admin.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.admin.createProduct(payload);
        showToast('New product added to catalog', 'success');
      }
      setIsProductModalOpen(false);
      loadAllAdminData();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await api.admin.deleteProduct(deleteProductId);
      showToast('Product removed from catalog', 'success');
      setDeleteProductId(null);
      loadAllAdminData();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Handle Update Order Status
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.admin.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      });
      showToast(`Category "${newCategoryName}" added`, 'success');
      setNewCategoryName('');
      setNewCategoryDesc('');
      setIsAddCategoryOpen(false);
      loadAllAdminData();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await api.admin.deleteCategory(catId);
      showToast(`Category deleted`, 'success');
      loadAllAdminData();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    try {
      await api.admin.updateSettings(siteSettings);
      showToast('Site settings and contact details updated', 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    }
  };

  // Filtered Products
  const filteredProducts = adminProducts.filter((p) => {
    const matchCat =
      productCategoryFilter === 'all' ||
      p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const matchSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Orders
  const filteredOrders = adminOrders.filter((o) => {
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchSearch =
      !orderSearch ||
      o.orderRef.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white uppercase font-display">
              ZENVY WEAR · Admin
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentRoute('store')}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-700"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <button
            onClick={logout}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-red-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({adminProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({adminOrders.length})</span>
            {stats.pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {stats.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({adminCategories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site & Contact Settings</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>Total Sales</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
                  <span className="font-bengali">৳</span>{stats.totalRevenue.toLocaleString('en-US')}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Across all fulfilled orders</div>
              </div>

              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
                  {stats.totalOrders}
                </div>
                <div className="text-[11px] text-amber-400 mt-1">
                  {stats.pendingOrdersCount} pending confirmation
                </div>
              </div>

              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>Catalog Products</span>
                  <Package className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tabular-nums">
                  {stats.totalProducts}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Active e-commerce styles</div>
              </div>

              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                <div className="text-neutral-400 text-xs uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>Low Stock Items</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2 tabular-nums">
                  {stats.lowStockCount}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Items below 10 units</div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-8 bg-neutral-950 rounded-2xl border border-neutral-800 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Recent Customer Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    View All Orders →
                  </button>
                </div>

                {adminOrders.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-8 text-center">
                    No orders placed yet. As customers shop, they will appear here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {adminOrders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-mono font-bold text-white">{ord.orderRef}</div>
                          <div className="text-neutral-400 mt-0.5">
                            {ord.customerName} · {ord.customerPhone}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white tabular-nums">
                            <span className="font-bengali">৳</span>{ord.total.toLocaleString('en-US')}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-800 text-neutral-200">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Admin Actions */}
              <div className="lg:col-span-4 bg-neutral-950 rounded-2xl border border-neutral-800 p-5 sm:p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Quick Actions
                </h3>

                <button
                  onClick={openAddProductModal}
                  className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>

                <button
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Add Product Category</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-neutral-800"
                >
                  <Settings className="w-4 h-4" />
                  <span>Update Contact & Banners</span>
                </button>

                <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                  <div className="font-bold text-white">ZENVY WEAR Info:</div>
                  <div>WhatsApp: +8801757391262</div>
                  <div>Email: zenvywear75@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none focus:border-white"
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {adminCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={openAddProductModal}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (BDT)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0] || '/src/assets/images/category_men_tshirt_1792926459237.jpg'}
                              alt={prod.name}
                              className="w-10 h-12 object-cover rounded bg-neutral-800 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-white">{prod.name}</div>
                              <div className="text-[11px] font-mono text-neutral-500">
                                SKU: {prod.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-300">{prod.category}</td>
                        <td className="py-3 px-4 tabular-nums">
                          <div className="font-bold text-white">৳{prod.price.toLocaleString('en-US')}</div>
                          {prod.discountPrice && (
                            <div className="text-[11px] text-amber-400">
                              Discount: ৳{prod.discountPrice.toLocaleString('en-US')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 tabular-nums">
                          <span
                            className={`font-semibold ${
                              prod.stock < 10 ? 'text-amber-400 font-bold' : 'text-neutral-300'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              prod.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {prod.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteProductId(prod.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 bg-neutral-900 hover:bg-red-950/50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ORDERS MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by ref, customer, phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="py-1.5 px-3 text-xs bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-neutral-400">
                Showing <strong>{filteredOrders.length}</strong> orders
              </div>
            </div>

            {/* Orders List Cards */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-neutral-950 p-12 text-center rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
                  No orders match the selected criteria.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4"
                  >
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-white">
                          {ord.orderRef}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Status:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                          className="py-1 px-3 text-xs font-semibold rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer Details */}
                      <div className="space-y-1.5 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>{ord.customerName}</span>
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${ord.customerName}, this is ZENVY WEAR regarding your order ${ord.orderRef}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        <div className="text-neutral-400 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>{ord.customerPhone}</span>
                        </div>
                        {ord.customerEmail && (
                          <div className="text-neutral-400">{ord.customerEmail}</div>
                        )}
                        <div className="text-neutral-400 flex items-start gap-1.5 pt-1">
                          <MapPin className="w-3 h-3 text-neutral-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{ord.deliveryAddress}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 pt-0.5">
                          Zone: {ord.cityZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80 md:col-span-2">
                        <div className="font-bold text-white mb-1">Ordered Items:</div>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {ord.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-neutral-300 text-xs"
                            >
                              <span>
                                {it.productName} ({it.size}, {it.color}) × {it.quantity}
                              </span>
                              <span className="font-semibold text-white tabular-nums">
                                <span className="font-bengali">৳</span>{it.totalPrice.toLocaleString('en-US')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-white text-xs">
                          <span>
                            Total (Subtotal: Tk. {ord.subtotal} + Delivery: Tk. {ord.deliveryFee})
                          </span>
                          <span className="text-emerald-400 text-sm tabular-nums">
                            <span className="font-bengali">৳</span>{ord.total.toLocaleString('en-US')} (COD)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: CATEGORIES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Product Categories
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage Men's, Women's, and Three-Piece collections
                </p>
              </div>
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {adminCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-base font-bold text-white">{cat.name}</h4>
                    <p className="text-xs text-neutral-400 mt-1">{cat.description}</p>
                    <div className="text-[11px] font-mono text-neutral-500 mt-2">
                      Slug: {cat.slug}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: SITE SETTINGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'settings' && siteSettings && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 space-y-6 max-w-2xl"
          >
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Storefront & Contact Configuration
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage your public WhatsApp link, Facebook page, email, and banner
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Homepage Announcement Banner Text
                </label>
                <input
                  type="text"
                  value={siteSettings.bannerAnnouncement}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, bannerAnnouncement: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  WhatsApp Ordering Number (With Country Code)
                </label>
                <input
                  type="text"
                  value={siteSettings.whatsappNumber}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={siteSettings.facebookUrl}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  value={siteSettings.businessEmail}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, businessEmail: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Free Delivery Threshold (৳)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        freeShippingThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Dhaka Delivery Fee (৳)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.deliveryFeeDhaka}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        deliveryFeeDhaka: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </form>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* PRODUCT ADD / EDIT MODAL */}
      {/* ---------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-neutral-950 text-neutral-100 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-neutral-800 shadow-2xl">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-display mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Men's Oversized Cotton Tee"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Unique SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="ZW-MTS-01"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                  >
                    {adminCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Price in BDT (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) =>
                      setFormPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="850"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Discount Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={(e) =>
                      setFormDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="750"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) =>
                      setFormStock(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="30"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Fabric GSM, material details, fit description..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  value={formImages}
                  onChange={(e) => setFormImages(e.target.value)}
                  placeholder="/src/assets/images/category_men_tshirt_1792926459237.jpg"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Available Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formSizes}
                    onChange={(e) => setFormSizes(e.target.value)}
                    placeholder="M, L, XL, XXL"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Colors (Name:Hex, comma separated)
                  </label>
                  <input
                    type="text"
                    value={formColors}
                    onChange={(e) => setFormColors(e.target.value)}
                    placeholder="Black:#111111, White:#FFFFFF"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded bg-neutral-900 border-neutral-700"
                  />
                  <span>Mark as Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNewArrival}
                    onChange={(e) => setFormNewArrival(e.target.checked)}
                    className="rounded bg-neutral-900 border-neutral-700"
                  />
                  <span>Mark as New Arrival</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-bold rounded-lg shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 text-white rounded-2xl max-w-sm w-full p-6 border border-neutral-800 space-y-4">
            <h4 className="text-base font-bold font-display">Confirm Deletion</h4>
            <p className="text-xs text-neutral-400">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteProductId(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADD CATEGORY MODAL */}
      {/* ---------------------------------------------------- */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 text-white rounded-2xl max-w-md w-full p-6 border border-neutral-800 space-y-4">
            <h4 className="text-base font-bold font-display">Add Category</h4>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Denim Jackets"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Short tagline for category"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 bg-neutral-900 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-bold rounded-lg"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
