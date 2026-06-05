import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/flutterwave';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { transaction_id, tx_ref } = await req.json();

    if (!transaction_id) {
      return NextResponse.json({ success: false, error: 'Missing transaction ID' }, { status: 400 });
    }

    const transaction = await verifyTransaction(transaction_id);

    if (transaction.status !== 'successful') {
      return NextResponse.json({ success: false, error: 'Payment not successful' });
    }

    const supabase = createServerClient();

    // Check if order already exists (webhook may have processed it)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('flutterwave_tx_ref', transaction.tx_ref)
      .single();

    let orderId: string | undefined;

    if (existingOrder) {
      orderId = existingOrder.id;
    } else {
      // Create the order
      let orderItems: any[] = [];
      try { orderItems = JSON.parse(transaction.meta?.order_items || '[]'); } catch {}

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_email: transaction.customer?.email || '',
          customer_name: transaction.meta?.customer_name || transaction.customer?.name || '',
          flutterwave_tx_ref: transaction.tx_ref,
          flutterwave_transaction_id: transaction.id.toString(),
          status: 'paid',
          total_amount: Math.round(transaction.amount * 100),
          currency: transaction.currency || 'NGN',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return NextResponse.json({ success: true });
        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, error: 'Order creation failed' }, { status: 500 });
      }

      orderId = order?.id;

      if (order && orderItems.length > 0) {
        await supabase.from('order_items').insert(
          orderItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        );
      }
    }

    // Fetch order items with product delivery_type to determine post-payment redirect
    let deliveryType: string = 'physical';
    if (orderId) {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, products(delivery_type)')
        .eq('order_id', orderId)
        .limit(1);

      if (items && items.length > 0) {
        const firstItem = items[0] as any;
        deliveryType = firstItem?.products?.delivery_type || 'physical';
      }
    }

    return NextResponse.json({ success: true, orderId, deliveryType });
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
