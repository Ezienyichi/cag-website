'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  status: string;
  total_amount: number;
  currency: string;
  items: any[];
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    const key = sessionStorage.getItem('admin_key') || '';
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await fetch(`/api/orders?${params}`, {
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    const key = sessionStorage.getItem('admin_key') || '';

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      fetchOrders();
    } catch {
      console.error('Failed to update order');
    }
  }

  const formatPrice = (amount: number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);

  const statusColors: Record<string, string> = {
    pending: 'bg-primary-container/30 text-primary',
    paid: 'bg-secondary-container/30 text-secondary',
    fulfilled: 'bg-tertiary-container/30 text-tertiary',
    cancelled: 'bg-surface-container-high text-on-surface-variant',
    refunded: 'bg-error-container/20 text-error',
  };

  const statuses = ['', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold font-headline mb-8">Orders</h1>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${
              statusFilter === s
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Customer</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Email</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Items</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Total</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Status</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Date</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}>
                    <td className="px-6 py-4 font-medium">{order.customer_name || '—'}</td>
                    <td className="px-6 py-4 text-primary">{order.customer_email}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {order.items?.map((item: any) => `${item.product_name} ×${item.quantity}`).join(', ') || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold">{formatPrice(order.total_amount, order.currency)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'paid' && (
                        <button
                          onClick={() => updateStatus(order.id, 'fulfilled')}
                          className="text-xs bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full font-bold hover:scale-105 transition-all"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
