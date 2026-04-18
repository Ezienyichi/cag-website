import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/flutterwave';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook hash
    const hash = req.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

    if (!hash || hash !== secretHash) {
      console.error('Invalid webhook hash');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { event, data } = payload;

    if (event !== 'charge.completed') {
      return NextResponse.json({ received: true });
    }

    // Verify the transaction with Flutterwave
    const transaction = await verifyTransaction(data.id.toString());

    if (transaction.status !== 'successful') {
      console.error('Transaction not successful:', transaction.status);
      return NextResponse.json({ received: true });
    }

    const supabase = createServerClient();

    // Parse order items from meta
    let orderItems: any[] = [];
    try {
      orderItems = JSON.parse(transaction.meta?.order_items || '[]');
    } catch {}

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: transaction.customer?.email || '',
        customer_name: transaction.meta?.customer_name || transaction.customer?.name || '',
        flutterwave_tx_ref: transaction.tx_ref,
        flutterwave_transaction_id: transaction.id.toString(),
        status: 'paid',
        total_amount: Math.round(transaction.amount * 100), // convert back to kobo
        currency: transaction.currency || 'NGN',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }

    // Insert order items
    if (order && orderItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        );

      if (itemsError) {
        console.error('Order items error:', itemsError);
      }
    }

    console.log(`✅ Order created: ${order?.id} via Flutterwave`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
