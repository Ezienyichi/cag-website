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

// Create a new order (used by WhatsApp checkout on product page)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, customer_email, customer_phone, location, total_amount, currency, product_id, product_name, quantity, notes } = body;

    if (!customer_name || !customer_email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        location: location || null,
        total_amount: total_amount || 0,
        currency: currency || 'NGN',
        status: 'pending',
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    if (product_id && order) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id,
        product_name: product_name || '',
        quantity: quantity || 1,
        unit_price: total_amount || 0,
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    console.error('Orders POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
