'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalWaitlist: number;
  paidOrders: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const key = sessionStorage.getItem('admin_key') || '';

    try {
      const [ordersRes, waitlistRes] = await Promise.all([
        fetch('/api/orders', { headers: { 'x-admin-key': key } }),
        fetch('/api/admin/waitlist', { headers: { 'x-admin-key': key } }),
      ]);

      const ordersData = await ordersRes.json();
      const waitlistData = await waitlistRes.json();

      const orders = ordersData.orders || [];
      const totalRevenue = orders
        .filter((o: any) => o.status === 'paid' || o.status === 'fulfilled')
        .reduce((sum: number, o: any) => sum + o.total_amount, 0);

      setStats({
        totalOrders: ordersData.total || 0,
        totalRevenue,
        totalWaitlist: waitlistData.total || 0,
        paidOrders: orders.filter((o: any) => o.status === 'paid').length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount / 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-on-surface-variant">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatNaira(stats?.totalRevenue || 0),
      icon: 'payments',
      color: 'bg-primary-container/20 text-primary',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: 'shopping_bag',
      color: 'bg-secondary-container/20 text-secondary',
    },
    {
      label: 'Waitlist Signups',
      value: stats?.totalWaitlist || 0,
      icon: 'group',
      color: 'bg-tertiary-container/20 text-tertiary',
    },
    {
      label: 'Pending Fulfillment',
      value: stats?.paidOrders || 0,
      icon: 'local_shipping',
      color: 'bg-error-container/20 text-error',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold font-headline mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined text-2xl">{card.icon}</span>
            </div>
            <p className="text-on-surface-variant text-sm mb-1">{card.label}</p>
            <p className="text-2xl font-bold font-headline">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 ambient-shadow">
        <h2 className="text-xl font-bold font-headline mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <a
            href="/admin/orders"
            className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container-high transition-colors text-center"
          >
            <span className="material-symbols-outlined text-2xl text-primary mb-2">receipt_long</span>
            <p className="font-bold text-sm font-headline">Manage Orders</p>
          </a>
          <a
            href="/admin/waitlist"
            className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container-high transition-colors text-center"
          >
            <span className="material-symbols-outlined text-2xl text-secondary mb-2">people</span>
            <p className="font-bold text-sm font-headline">View Waitlist</p>
          </a>
          <a
            href="/admin/products"
            className="bg-surface-container-low rounded-xl p-4 hover:bg-surface-container-high transition-colors text-center"
          >
            <span className="material-symbols-outlined text-2xl text-tertiary mb-2">inventory_2</span>
            <p className="font-bold text-sm font-headline">Edit Products</p>
          </a>
        </div>
      </div>
    </div>
  );
}
