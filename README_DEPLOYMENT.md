# ZENVY WEAR — Production Deployment & Admin Setup Guide

Brand: **ZENVY WEAR**  
Tagline: *Wear Your Style. Modern Fashion for Everyone.*  
Country: **Bangladesh**  
Currency: **BDT (৳)**  
Official WhatsApp: **+8801757391262**  
Facebook Page: **https://www.facebook.com/zenvywear1**  
Business Email: **zenvywear75@gmail.com**

---

## 1. System Architecture

ZENVY WEAR is architected as a high-performance full-stack TypeScript e-commerce platform:
- **Frontend**: React 19, TypeScript, Tailwind CSS, Three.js 3D Fashion Studio, Lucide Icons.
- **Backend**: Node.js + Express with native cryptographic password hashing (`crypto.scrypt`), HMAC-SHA256 JWT sessions, and server-side stock validation.
- **Database**:
  - **Embedded / AI Studio Mode**: Zero-external-dependency atomic JSON persistent store in `./data/zenvy_db.json`.
  - **Supabase / PostgreSQL Cloud Mode**: Full relational schema, triggers, and Row Level Security (RLS) located in `supabase/schema.sql`.

---

## 2. Administrator Access Credentials

The Admin Panel is private and protected by server-side Role-Based Access Control (RBAC).

- **Admin Login Route**: `/admin/login`
- **Admin Dashboard Route**: `/admin`
- **Default Email**: `zenvywear75@gmail.com`
- **Default Initial Password**: `Admin@Zenvy2026!`

*(Note: Change this password immediately after your first production deployment via environment variables or the admin settings)*.

### Security Highlights:
1. Customers **cannot** access the admin dashboard or execute `/api/admin/*` endpoints simply by knowing the URL. The backend rejects all unauthorized API calls with HTTP 401/403.
2. Passwords are never stored in plaintext; they are hashed with cryptographic salt + scrypt.
3. Order totals and stock availability are always checked and decremented on the server before an order is confirmed.

---

## 3. Local Development

1. Clone or open the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the full-stack development server:
   ```bash
   npm run dev
   ```
   The site will be live at `http://localhost:3000`.

5. Run automated unit tests:
   ```bash
   npm test
   ```

---

## 4. Supabase Setup (Optional Cloud Database)

To deploy with Supabase as your cloud PostgreSQL database:

1. Create a free account at [Supabase.com](https://supabase.com).
2. Click **New Project** and choose a region (e.g. Singapore `ap-southeast-1` for fast Bangladesh latency).
3. Open the **SQL Editor** in the Supabase dashboard.
4. Copy the entire contents of `supabase/schema.sql` and click **Run**.
5. This automatically provisions:
   - `profiles`, `categories`, `products`, `product_images`, `orders`, `order_items`, `site_settings`
   - Complete Row Level Security (RLS) policies protecting customer data and restricting product creation to administrators only.
6. Create the first admin in Supabase:
   - Go to **Authentication > Users** and invite or add `zenvywear75@gmail.com`.
   - In the **Table Editor > profiles**, set the `role` column for this user to `admin`.

---

## 5. Deployment on Free-Tier Hosting

### Option A: Render / Railway / Fly.io (Full-Stack All-in-One)
1. Push your repository to GitHub.
2. Connect your repository on [Render.com](https://render.com) as a **Web Service**.
3. Configure:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `JWT_SECRET=your_long_random_secret_string`
   - `ADMIN_DEFAULT_PASSWORD=your_custom_admin_password`

### Option B: Vercel / Netlify (Frontend) + Render (Backend API)
1. Deploy the backend Express server on Render or Fly.io.
2. Deploy the Vite React app to Vercel/Netlify with output directory `dist`.

---

## 6. How to Manage Products & Orders

### Adding a New Product:
1. Log in at `/admin/login` using your administrator credentials.
2. Go to the **Products** tab.
3. Click **Add New Product**.
4. Enter the product name, unique SKU (e.g. `ZW-MTS-03`), category, price in BDT (৳), discount price, stock quantity, sizes, and colors.
5. Click **Save Product**. It will immediately appear on the storefront.

### Updating Order Status:
1. In the Admin Dashboard, click the **Orders** tab.
2. You will see customer contact details, delivery address, ordered items, and payment method (Cash on Delivery).
3. Use the status dropdown to mark orders as **Confirmed**, **Processing**, **Shipped**, or **Delivered**.
4. Click the **WhatsApp** button next to any customer's name to open a direct chat with them regarding their order reference.

---

## 7. Database Backup

### For the Default JSON Store:
- The persistent database is located at `./data/zenvy_db.json`.
- Simply download or backup this file periodically.

### For Supabase / PostgreSQL:
- Navigate to **Database > Backups** in the Supabase Dashboard to download automated daily snapshots.
- Or run: `pg_dump -h db.[project-ref].supabase.co -U postgres -d postgres > backup.sql`
