import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/flutterwave';
import type { CartItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, customerName } = (await req.json()) as {
      items: CartItem[];
      customerEmail: string;
      customerName?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Calculate total in Naira (price is stored in kobo)
    const totalKobo = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const totalNaira = totalKobo / 100;

    const tx_ref = `CAG-${uuidv4()}`;

    const paymentData = await createPaymentLink({
      tx_ref,
      amount: totalNaira,
      currency: items[0]?.product.currency || 'NGN',
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart/verify?tx_ref=${tx_ref}`,
      customer: {
        email: customerEmail,
        name: customerName || '',
      },
      customizations: {
        title: 'Change Art Gallerie',
        logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
        description: `Order: ${items.map((i) => `${i.product.name} ×${i.quantity}`).join(', ')}`,
      },
      meta: {
        order_items: JSON.stringify(
          items.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            unit_price: i.product.price,
          }))
        ),
        customer_name: customerName || '',
      },
    });

    return NextResponse.json({
      paymentLink: paymentData.link,
      tx_ref,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
