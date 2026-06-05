import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/store/access/[orderId]
// Returns file_url only if the order is paid and the product supports digital access.
// The orderId acts as the access token — it is a UUID known only after payment.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const supabase = createServerClient();

    // Verify the order is paid
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'paid' && order.status !== 'fulfilled') {
      return NextResponse.json({ error: 'Order not yet paid' }, { status: 403 });
    }

    // Get the first order item and its product
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, products(name, delivery_type, file_url)')
      .eq('order_id', orderId)
      .limit(1);

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json({ error: 'No items found for this order' }, { status: 404 });
    }

    const item = items[0] as any;
    const product = item.products;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!['download', 'read_online'].includes(product.delivery_type)) {
      return NextResponse.json({ error: 'This product is not a digital product' }, { status: 400 });
    }

    if (!product.file_url) {
      return NextResponse.json({ error: 'File not yet available. Contact support.' }, { status: 404 });
    }

    return NextResponse.json({
      name: product.name,
      delivery_type: product.delivery_type,
      file_url: product.file_url,
    });
  } catch (err) {
    console.error('Access API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
