// ============================================
// Flutterwave Server Utility
// ============================================

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

interface FlutterwaveHeaders {
  Authorization: string;
  'Content-Type': string;
}

function getHeaders(): FlutterwaveHeaders {
  return {
    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

export interface FlutterwavePaymentPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name?: string;
  };
  customizations?: {
    title?: string;
    logo?: string;
    description?: string;
  };
  meta?: Record<string, any>;
}

export async function createPaymentLink(payload: FlutterwavePaymentPayload) {
  const res = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (data.status !== 'success') {
    throw new Error(data.message || 'Failed to create payment link');
  }

  return data.data; // { link: "https://checkout.flutterwave.com/..." }
}

export async function verifyTransaction(transactionId: string) {
  const res = await fetch(
    `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
    { headers: getHeaders() }
  );

  const data = await res.json();

  if (data.status !== 'success') {
    throw new Error(data.message || 'Verification failed');
  }

  return data.data;
}
