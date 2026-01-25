# Edukkit - Complete E-Commerce Store Specification

A comprehensive prompt/specification to build an electronics and robotics e-commerce store with WhatsApp checkout, admin dashboard, and course management.

---

## 🎯 Project Overview

**Name:** Edukkit  
**Industry:** Electronics, Robotics, IoT Components & Educational Kits  
**Target Audience:** Students, Makers, Hobbyists, DIY Enthusiasts  
**Region:** India (primary), with international shipping support

### Core Concept
An e-commerce platform for selling electronics components, robotics kits, sensors, microcontrollers, and offering educational courses. Unique selling point: **WhatsApp-based checkout** (no payment gateway integration) - orders are created in database, then customers complete payment via WhatsApp conversation with admin.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with shadcn/ui components
- **State Management:** TanStack React Query for server state, React Context for cart
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Notifications:** Sonner toast

### Backend (Supabase / Lovable Cloud)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (email/password with auto-confirm)
- **Storage:** Supabase Storage for product images
- **Real-time:** Supabase Realtime (optional for order updates)

---

## 🎨 Design System

### Color Palette
```css
/* Electric Cyan Primary - Tech-forward */
--primary: 190 85% 45%;
--primary-glow: 190 85% 65%;

/* Warm Orange Secondary - CTAs */
--secondary: 25 95% 55%;

/* Dark mode support included */
```

### Design Direction
- **Aesthetic:** Electric cyan/blue primary with orange accents
- **Patterns:** Circuit board-inspired geometric patterns
- **Typography:** Modern sans-serif, clean product grids
- **Inspiration:** Adafruit, SparkFun, Indian maker community feel
- **Features:** Gradient backgrounds, glow effects, smooth transitions

---

## 📁 Database Schema

### 1. Categories Table
```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Products Table
```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  mrp NUMERIC,                          -- Maximum Retail Price (for showing discounts)
  sku TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',           -- Array of image URLs
  difficulty TEXT,                      -- 'beginner', 'intermediate', 'advanced'
  tags TEXT[] DEFAULT '{}',
  bom JSONB DEFAULT '[]',               -- Bill of Materials for kits
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Courses Table
```sql
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  mrp NUMERIC,
  duration TEXT NOT NULL,               -- e.g., "4 weeks", "2 hours"
  category TEXT NOT NULL,
  image_url TEXT,
  syllabus JSONB DEFAULT '[]',          -- Array of syllabus items
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Orders Table
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,    -- Format: ORD{timestamp}
  user_id UUID,                         -- NULL for guest checkout
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  items JSONB NOT NULL,                 -- Array of {productId, name, quantity, price}
  total NUMERIC NOT NULL,               -- Including shipping
  status TEXT DEFAULT 'pending',        -- pending, confirmed, dispatched, delivered, cancelled
  admin_notes TEXT,
  whatsapp_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. User Roles Table (CRITICAL for Security)
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'customer', 'staff');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
```

### 6. User Addresses Table
```sql
CREATE TABLE public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,                  -- e.g., "Home", "Office"
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. Settings Table
```sql
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initial settings data
INSERT INTO settings (key, value) VALUES
  ('store_name', 'Edukkit'),
  ('store_email', 'edukkitofficial@gmail.com'),
  ('whatsapp_number', '918075100930'),
  ('company_address', 'Your address here'),
  ('company_website', 'edukkit.com');
```

---

## 🔐 Security Implementation

### Security Definer Function (Prevents RLS Recursion)
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### RLS Policies Pattern
```sql
-- Example for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

-- Admin/Staff can modify
CREATE POLICY "Admins can insert products" ON products FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Staff can insert products" ON products FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'staff'));
```

### Auto Admin Assignment Trigger
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'edukkitofficial@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_role();
```

---

## 📄 Pages & Routes

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, featured products, categories grid |
| `/products` | All products listing with grid layout |
| `/products/:slug` | Product detail page with images, BOM, add to cart |
| `/categories` | All categories listing |
| `/categories/:slug` | Category detail with filtered products |
| `/courses` | All courses listing |
| `/courses/:slug` | Course detail with syllabus, enroll via WhatsApp |
| `/kits` | Products tagged as "kits" |
| `/checkout` | WhatsApp checkout flow |
| `/track-order` | Order tracking by order number |
| `/auth` | Login/Register page |

### Admin Pages (Protected)
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with stats (products, orders, revenue) |
| `/admin/products` | CRUD for products with search |
| `/admin/categories` | CRUD for categories |
| `/admin/courses` | CRUD for courses with syllabus editor |
| `/admin/orders` | Order list with status updates, invoice modal |
| `/admin/staff` | Staff role management (admin only) |
| `/admin/settings` | Store settings (name, WhatsApp, email, address) |

---

## 🛒 Cart & Checkout Flow

### Cart Context (Client-Side, localStorage)
```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Features:
// - Add/remove/update quantity
// - Persist to localStorage
// - Calculate total
```

### Checkout Flow
1. User fills shipping details (or selects saved address)
2. Shipping calculated: ₹70 (Kerala) / ₹100 (other states)
3. Order created in database with status "pending"
4. WhatsApp opens with pre-filled message containing:
   - Order ID
   - Items list with prices
   - Subtotal, shipping, total
   - Customer details
   - Delivery address
5. Admin confirms order via WhatsApp, provides payment details
6. Admin updates order status in dashboard

### WhatsApp Message Template
```
🛒 *New Order*
Order ID: #ORD1234567890

*Items:*
Product Name x2 - ₹1,998.00

*Subtotal:* ₹1,998.00
*Shipping (Kerala):* ₹70
*Total:* ₹2,068.00

*Customer Details:*
Name: John Doe
Phone: +91 98XXXXXXXX

*Delivery Address:*
123 Main Street
Kochi, Kerala 682001

Please confirm this order and provide payment instructions.
```

---

## 👤 Admin Dashboard Features

### Dashboard Overview
- Total products count
- Total orders count
- Total revenue

### Products Management
- Add/Edit/Delete products
- Fields: name, slug, SKU, price, MRP, stock, description, category, images, difficulty, tags, BOM, featured toggle
- Search functionality

### Categories Management
- Add/Edit/Delete categories
- Fields: name, slug, description, image, order index
- Search functionality

### Courses Management
- Add/Edit/Delete courses
- Fields: name, slug, price, MRP, duration, category, description, image, syllabus (JSON editor), featured toggle
- Search functionality

### Orders Management
- View all orders in table
- Update order status (pending → confirmed → dispatched → delivered / cancelled)
- View/Print invoice modal
- Invoice includes: company details, customer info, itemized list, totals

### Staff Management (Admin Only)
- View current staff/admin users
- Remove staff roles
- Search staff list

### Settings (Admin Only)
- Store name
- Store email
- WhatsApp number (for checkout)
- Company address
- Company website

---

## 🔧 Key Components

### Header
- Logo with link to home
- Navigation: Products, Categories, Courses, Kits
- Search command (Cmd+K)
- Cart button with item count
- User menu (login/logout)

### Footer
- Company info and address
- Quick links
- Social links
- WhatsApp contact
- Copyright

### ProductCard
- Product image
- Name, price (with discount badge if MRP > price)
- Add to cart button
- Link to detail page

### CartSheet
- Slide-out cart drawer
- List items with quantity controls
- Total calculation
- Checkout button

### SearchCommand
- Command palette (Cmd+K)
- Search products by name
- Quick navigation

---

## 🚀 Build Prompt

Use this prompt to recreate the store:

```
Build an e-commerce store for electronics and robotics components called "Edukkit" with the following features:

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Supabase

**Design:**
- Electric cyan (#00A8B5) primary color with orange (#F97316) accents
- Circuit board pattern backgrounds
- Dark mode support
- Clean, modern maker/tech aesthetic

**Database Tables:**
1. categories (id, name, slug, description, image_url, order_index)
2. products (id, name, slug, description, price, mrp, sku, stock, category_id, images[], difficulty, tags[], bom[], is_featured)
3. courses (id, name, slug, description, price, mrp, duration, category, image_url, syllabus[], is_featured)
4. orders (id, order_number, user_id, customer_name, customer_phone, customer_email, shipping_address, items[], total, status)
5. user_roles (id, user_id, role) - roles: admin, staff, customer
6. user_addresses (id, user_id, label, address, pincode, phone, is_default)
7. settings (key, value) - store_name, whatsapp_number, store_email, company_address

**Public Pages:**
- Homepage: Hero section, category grid, featured products
- Products listing page with product cards
- Product detail page with image gallery, description, BOM, add to cart
- Categories listing and category detail
- Courses listing and course detail with syllabus
- Kits page (products tagged as kits)
- Order tracking page (search by order number)
- Auth page (login/register)

**Checkout Flow:**
- Cart stored in localStorage
- Checkout form: name, phone, email, address, city, state, pincode
- Shipping: ₹70 for Kerala, ₹100 for other states
- On submit: Create order in database, open WhatsApp with order details
- WhatsApp number from settings table

**Admin Panel (protected by role-based access):**
- Dashboard: product count, order count, total revenue
- Products CRUD with search
- Categories CRUD with search
- Courses CRUD with syllabus JSON editor
- Orders list with status dropdown (pending/confirmed/dispatched/delivered/cancelled)
- Invoice modal with print functionality
- Staff management (add/remove staff roles)
- Settings page (store info, WhatsApp number)

**Security:**
- RLS on all tables
- has_role() security definer function to check roles
- Auto-assign admin to specific email on registration
- Staff can access products/categories/courses/orders
- Only admin can access settings and staff management

**Key Features:**
- Cart context with localStorage persistence
- Saved addresses for logged-in users
- Search command palette (Cmd+K)
- Responsive design
- Toast notifications with Sonner
```

---

## 📋 Example Data

### Categories
- Sensors & Modules
- Microcontrollers (Arduino, ESP32, Raspberry Pi)
- Motors & Actuators
- IoT Modules
- Robotics Kits
- 3D Prints
- Automation Kits
- Tools & Accessories
- Power & Battery
- Electronic Components

### Sample Products
- ESP32 Development Board - ₹750
- Arduino Uno R3 - ₹450
- DHT22 Temperature Sensor - ₹250
- SG90 Servo Motor - ₹150
- Line Follower Robot Kit - ₹899
- Obstacle Avoiding Robot Kit - ₹1,199

### Sample Courses
- Arduino Programming for Beginners - ₹999
- IoT with ESP32 - ₹1,499
- Robotics Fundamentals - ₹1,299
- Electronics 101 - ₹799

---

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## ✅ Checklist for Complete Implementation

- [ ] Set up Supabase/Cloud project
- [ ] Create all database tables with RLS
- [ ] Create has_role() function
- [ ] Create auto-admin trigger
- [ ] Configure auth (auto-confirm email)
- [ ] Build public pages (Home, Products, Categories, Courses, Checkout, Track Order)
- [ ] Build admin pages (Dashboard, Products, Categories, Courses, Orders, Staff, Settings)
- [ ] Implement cart context with localStorage
- [ ] Implement WhatsApp checkout flow
- [ ] Implement search command palette
- [ ] Add product/category/course CRUD dialogs
- [ ] Add order invoice modal with print
- [ ] Add saved addresses feature
- [ ] Implement role-based access control
- [ ] Add example data
- [ ] Test all flows end-to-end

---

*Generated from Edukkit e-commerce store project. This specification captures all features, database schema, security implementation, and design patterns.*
