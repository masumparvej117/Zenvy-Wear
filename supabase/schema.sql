-- ==============================================================================
-- ZENVY WEAR — PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- PostgreSQL / Supabase Compatible Migration Script
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'Pending',
        'Confirmed',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'customer',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role_enum NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival BOOLEAN NOT NULL DEFAULT TRUE,
    sizes JSONB NOT NULL DEFAULT '["M", "L", "XL"]'::jsonb,
    colors JSONB NOT NULL DEFAULT '[{"name": "Onyx Black", "hex": "#111111"}]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_name);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);

-- 5. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    city_zone TEXT NOT NULL CHECK (city_zone IN ('inside_dhaka', 'outside_dhaka')),
    order_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL DEFAULT 'cod',
    status order_status_enum NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    image_url TEXT,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 8. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    brand_name TEXT NOT NULL DEFAULT 'ZENVY WEAR',
    tagline TEXT NOT NULL DEFAULT 'Wear Your Style. Modern Fashion for Everyone.',
    banner_announcement TEXT NOT NULL DEFAULT 'Free delivery across Bangladesh on orders over ৳2,000 · Cash on Delivery Available',
    whatsapp_number TEXT NOT NULL DEFAULT '+8801757391262',
    facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/zenvywear1',
    business_email TEXT NOT NULL DEFAULT 'zenvywear75@gmail.com',
    free_shipping_threshold NUMERIC(10, 2) NOT NULL DEFAULT 2000,
    delivery_fee_dhaka NUMERIC(10, 2) NOT NULL DEFAULT 70,
    delivery_fee_outside NUMERIC(10, 2) NOT NULL DEFAULT 130,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current requester is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------
-- A. PROFILES POLICIES
-- ----------------------------------------------------
-- Public visitors cannot browse user profiles
-- Authenticated users can read only their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Authenticated users can update only their non-privileged profile columns
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = 'customer');

-- Administrators have full profile access
CREATE POLICY "Admins full profile access"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------
-- B. CATEGORIES POLICIES
-- ----------------------------------------------------
-- Anyone can view active categories
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

-- Only admins can insert, update, or delete categories
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------
-- C. PRODUCTS & PRODUCT IMAGES POLICIES
-- ----------------------------------------------------
-- Anyone can read active products
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (status = 'active' OR public.is_admin());

-- Only admins can create, modify, or delete products
CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- Product Images
CREATE POLICY "Public can view product images"
    ON public.product_images FOR SELECT
    USING (TRUE);

CREATE POLICY "Admins can manage product images"
    ON public.product_images FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------
-- D. ORDERS & ORDER ITEMS POLICIES
-- ----------------------------------------------------
-- Any customer can insert a new order (public checkout support)
CREATE POLICY "Anyone can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Anyone can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (TRUE);

-- Authenticated customers can read ONLY their own orders
CREATE POLICY "Customers view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customers view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Only admins can update order status or manage orders
CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

-- ----------------------------------------------------
-- E. SITE SETTINGS POLICIES
-- ----------------------------------------------------
-- Anyone can read site settings (banner, WhatsApp, etc.)
CREATE POLICY "Public can read site settings"
    ON public.site_settings FOR SELECT
    USING (TRUE);

-- Only admins can update site settings
CREATE POLICY "Admins can update site settings"
    ON public.site_settings FOR UPDATE
    USING (public.is_admin());

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO public.categories (name, slug, description)
VALUES 
    ('Men''s T-Shirt', 'mens-t-shirt', 'Heavyweight organic cotton, drop-shoulder silhouettes, and modern minimal cuts.'),
    ('Women''s T-Shirt', 'womens-t-shirt', 'Relaxed premium cotton essentials with effortless modern tailoring.'),
    ('Women''s Three-Piece', 'womens-three-piece', 'Luxury monochrome kameez, tailored trousers, and sheer dupatta ensembles.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.site_settings (id, brand_name, tagline, banner_announcement, whatsapp_number, facebook_url, business_email, free_shipping_threshold, delivery_fee_dhaka, delivery_fee_outside)
VALUES (1, 'ZENVY WEAR', 'Wear Your Style. Modern Fashion for Everyone.', 'Free delivery across Bangladesh on orders over ৳2,000 · Cash on Delivery Available', '+8801757391262', 'https://www.facebook.com/zenvywear1', 'zenvywear75@gmail.com', 2000, 70, 130)
ON CONFLICT (id) DO NOTHING;
