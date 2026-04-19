import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Simple admin auth check via header (replace with proper auth in production)
function isAdmin(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key');
  return adminKey === process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  // Fetch order items for each order
  const orderIds = data?.map((o) => o.id) || [];
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  const ordersWithItems = data?.map((order) => ({
    ...order,
    items: items?.filter((i) => i.order_id === order.id) || [],
  }));

  return NextResponse.json({
    orders: ordersWithItems,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// Update order status
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, status } = await req.json();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
