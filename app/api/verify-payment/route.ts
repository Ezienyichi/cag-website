import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/flutterwave';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { transaction_id, tx_ref } = await req.json();

    if (!transaction_id) {
      return NextResponse.json({ success: false, error: 'Missing transaction ID' }, { status: 400 });
    }

    // Verify with Flutterwave
    const transaction = await verifyTransaction(transaction_id);

    if (transaction.status !== 'successful') {
      return NextResponse.json({ success: false, error: 'Payment not successful' });
    }

    // Check if order already exists (webhook may have already processed it)
    const supabase = createServerClient();
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('flutterwave_tx_ref', transaction.tx_ref)
      .single();

    if (existingOrder) {
      return NextResponse.json({ success: true, orderId: existingOrder.id });
    }

    // Create order if webhook hasn't processed it yet
    let orderItems: any[] = [];
    try {
      orderItems = JSON.parse(transaction.meta?.order_items || '[]');
    } catch {}

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
      // Might be a duplicate from webhook — that's fine
      if (error.code === '23505') {
        return NextResponse.json({ success: true });
      }
      console.error('Order creation error:', error);
      return NextResponse.json({ success: false, error: 'Order creation failed' }, { status: 500 });
    }

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

    return NextResponse.json({ success: true, orderId: order?.id });
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
