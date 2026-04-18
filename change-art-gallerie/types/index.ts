// ============================================
// Database / Domain Types
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number; // in kobo/cents
  currency: 'NGN' | 'GBP' | 'USD';
  image_url: string;
  images: string[];
  category: 'workbook' | 'sketchbook' | 'kit' | 'digital';
  age_range: string;
  is_featured: boolean;
  is_editors_choice: boolean;
  is_active: boolean;
  stock_count: number;
  digital_download_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WaitlistSignup {
  id: string;
  email: string;
  full_name: string;
  role: 'parent' | 'teacher' | 'school' | 'other';
  source: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  flutterwave_tx_ref: string;
  flutterwave_transaction_id: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  shipping_address?: ShippingAddress;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

// ============================================
// Cart Types (client-side state)
// ============================================

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// ============================================
// Admin Dashboard Types
// ============================================

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalWaitlist: number;
  recentOrders: Order[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
}
