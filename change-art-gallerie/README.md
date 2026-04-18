# Change Art Gallerie — Book Collection Website

A production-ready e-commerce website for **Change Art Gallerie's** educational book collection, featuring Flutterwave payments, a waitlist CRM, and an admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL) |
| Payments | Flutterwave |
| State | Zustand |
| Hosting | Vercel |

---

## Project Structure

```
change-art-gallerie/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with fonts
│   ├── globals.css                 # Global styles + design tokens
│   ├── cart/
│   │   ├── page.tsx                # Shopping cart + Flutterwave checkout
│   │   └── verify/page.tsx         # Payment verification after redirect
│   ├── admin/
│   │   ├── layout.tsx              # Admin shell with auth
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── orders/page.tsx         # Order management
│   │   ├── waitlist/page.tsx       # Waitlist CRM with CSV export
│   │   └── products/page.tsx       # Product viewer
│   └── api/
│       ├── checkout/route.ts       # Create Flutterwave payment link
│       ├── verify-payment/route.ts # Verify transaction after redirect
│       ├── products/route.ts       # GET active products
│       ├── waitlist/route.ts       # POST join waitlist
│       ├── orders/route.ts         # GET/PATCH orders (admin)
│       ├── admin/waitlist/route.ts # GET/DELETE waitlist (admin)
│       └── webhooks/
│           └── flutterwave/route.ts # Payment webhook handler
├── components/
│   ├── Navbar.tsx                  # Fixed nav with logo + cart + waitlist
│   ├── Footer.tsx                  # Site footer
│   ├── WaitlistModal.tsx           # Waitlist signup modal
│   ├── ProductCard.tsx             # Reusable product card
│   └── sections/
│       ├── HeroSection.tsx
│       ├── BenefitsSection.tsx
│       ├── CollectionSection.tsx
│       ├── HowItWorksSection.tsx
│       ├── TestimonialSection.tsx
│       └── CTASection.tsx
├── lib/
│   ├── supabase.ts                 # Browser + server Supabase clients
│   ├── flutterwave.ts             # Flutterwave REST API wrapper
│   └── cart-store.ts              # Zustand cart with persistence
├── types/
│   └── index.ts                    # All TypeScript interfaces
├── public/
│   ├── logo.png                    # CAG logo (background removed)
│   └── logo-original.png
├── supabase-schema.sql            # Full database schema + seed data
├── .env.example                   # Environment variable template
└── README.md                      # This file
```

---

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/change-art-gallerie.git
cd change-art-gallerie
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the entire contents of `supabase-schema.sql` → click **Run**
3. This creates all 5 tables, RLS policies, indexes, seed data, and your admin user
4. Go to **Settings → API** → copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Flutterwave Setup

1. Sign up at [flutterwave.com](https://flutterwave.com)
2. Go to **Settings → API Keys** → copy:
   - Secret Key (starts with `FLWSECK_`)
   - Public Key (starts with `FLWPUBK_`)
3. Go to **Settings → Webhooks**:
   - Set URL to: `https://your-domain.com/api/webhooks/flutterwave`
   - Copy the **Secret Hash**
4. Under **Payment methods**, enable the methods you want (cards, bank transfer, USSD, etc.)

### 4. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxx
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxx
FLUTTERWAVE_WEBHOOK_HASH=your-hash

NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_EMAIL=victor@changeartgallerie.com
```

### 5. Run Locally

```bash
npm run dev
```

Visit:
- Website: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Admin login uses your `SUPABASE_SERVICE_ROLE_KEY` as the password.

---

## Deploy to Vercel

### Quick Deploy

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Vercel auto-detects Next.js — no build config needed
4. Add **all environment variables** from `.env.local`
5. Click **Deploy**

### Post-Deploy Checklist

- [ ] Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL (e.g., `https://change-art-gallerie.vercel.app`)
- [ ] Update Flutterwave webhook URL to production domain
- [ ] Switch Flutterwave keys from **test** to **live** when ready
- [ ] Add custom domain in Vercel (e.g., `books.changeartgallerie.com`)
- [ ] Test a real payment end-to-end
- [ ] Verify webhook delivers to `/api/webhooks/flutterwave`

---

## Payment Flow

```
Customer adds items to cart
    ↓
Enters name + email → clicks "Pay with Flutterwave"
    ↓
Server creates payment link via Flutterwave API
    ↓
Customer redirected to Flutterwave checkout
(cards, bank transfer, USSD, mobile money)
    ↓
After payment → redirected to /cart/verify
    ↓
Server verifies transaction with Flutterwave
    ↓
Order created in Supabase
    ↓
Flutterwave webhook ALSO fires → creates order if not already exists
(double-safety: redirect verification + webhook)
```

---

## Admin Dashboard

Access at `/admin`. Features:

- **Dashboard**: Revenue, orders, waitlist count at a glance
- **Orders**: Filter by status, mark orders as fulfilled
- **Waitlist CRM**: View all signups, filter by role, export CSV
- **Products**: View current catalog (edit directly in Supabase Table Editor)

### Upgrading Admin Auth

The current auth uses the service role key for simplicity. For production, upgrade to Supabase Auth:

1. Enable Email auth in Supabase → Authentication
2. Create admin user accounts
3. Replace the `sessionStorage` auth in `app/admin/layout.tsx` with Supabase Auth
4. Replace `x-admin-key` header checks with JWT verification

---

## Adding New Products

Option A — **Supabase Dashboard**: Go to Table Editor → `products` → Insert Row

Option B — **SQL**:
```sql
INSERT INTO products (name, slug, description, short_description, price, currency, image_url, category, age_range, is_featured)
VALUES (
  'Texture Explorer',
  'texture-explorer',
  'Full description here...',
  'Discover textures through creative collage.',
  300000,  -- ₦3,000 in kobo
  'NGN',
  '/images/texture-explorer.jpg',
  'workbook',
  '5-10',
  true
);
```

Note: `price` is stored in kobo (₦1 = 100 kobo). So ₦3,500 = 350000.

---

## Product Images

Store product images in Supabase Storage:
1. Go to Storage → Create bucket `product-images` (public)
2. Upload images
3. Use the public URL as `image_url` in the products table

Or use any CDN / Cloudinary / direct URLs.

---

## Testing Flutterwave Payments

Use Flutterwave test cards:
- **Card**: 5531 8866 5214 2950
- **CVV**: 564
- **Expiry**: 09/32
- **PIN**: 3310
- **OTP**: 12345

See [Flutterwave test docs](https://developer.flutterwave.com/docs/integration-guides/testing-helpers/) for more test scenarios.

---

## License

© 2024–2026 Change Art Gallerie / TechDuce Africa. All rights reserved.
