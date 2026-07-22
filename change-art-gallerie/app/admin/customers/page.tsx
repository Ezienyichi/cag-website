'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';

type Tab = 'orders' | 'registrations' | 'waitlist' | 'downloads';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  product_id?: string;
}
interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  location?: string;
  total_amount: number;
  currency: string;
  status: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}
interface EventReg {
  id: string;
  full_name: string;
  phone: string;
  location?: string;
  email?: string;
  registered_at: string;
  events?: { title: string; event_date: string | null };
}
interface WaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  role: string;
  created_at: string;
}
interface ResourceLead {
  id: string;
  full_name: string;
  email: string;
  location?: string;
  created_at: string;
  resources?: { title: string };
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function naira(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG');
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => '"' + String(row[h] ?? '').replace(/"/g, '""') + '"').join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_CLS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  fulfilled: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const TH = 'text-left px-4 py-3 text-xs uppercase tracking-wider font-bold text-on-surface-variant whitespace-nowrap';
const TD = 'px-4 py-3 text-sm align-top';

function Loading() {
  return (
    <div className="p-12 text-center text-on-surface-variant">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Loading…
    </div>
  );
}
function Empty({ msg }: { msg: string }) {
  return (
    <div className="p-12 text-center">
      <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">inbox</span>
      <p className="text-on-surface-variant text-sm">{msg}</p>
    </div>
  );
}

export default function CustomersPage() {
  const [tab, setTab] = useState<Tab>('orders');
  const [search, setSearch] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [regs, setRegs] = useState<EventReg[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [downloads, setDownloads] = useState<ResourceLead[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [loadingWaitlist, setLoadingWaitlist] = useState(true);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const adminKey = () => sessionStorage.getItem('admin_key') || '';

  useEffect(() => {
    const k = adminKey();

    Promise.all([
      fetch('/api/orders?limit=500', { headers: { 'x-admin-key': k } })
        .then(r => r.json())
        .then(d => { setOrders(d.orders || []); setLoadingOrders(false); })
        .catch(() => setLoadingOrders(false)),

      fetch('/api/admin/event-registrations', { headers: { 'x-admin-key': k } })
        .then(r => r.json())
        .then(d => { setRegs(d.registrations || []); setLoadingRegs(false); })
        .catch(() => setLoadingRegs(false)),

      fetch('/api/admin/waitlist', { headers: { 'x-admin-key': k } })
        .then(r => r.json())
        .then(d => { setWaitlist(d.signups || []); setLoadingWaitlist(false); })
        .catch(() => setLoadingWaitlist(false)),

      fetch('/api/admin/resource-leads', { headers: { 'x-admin-key': k } })
        .then(r => r.json())
        .then(d => { setDownloads(d.leads || []); setLoadingDownloads(false); })
        .catch(() => setLoadingDownloads(false)),
    ]);
  }, []);

  async function markFulfilled(id: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey() },
      body: JSON.stringify({ status: 'fulfilled' }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'fulfilled' } : o));
  }

  const filteredOrders = useMemo(() => {
    let d = orders;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(o =>
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q)
      );
    }
    if (statusFilter) d = d.filter(o => o.status === statusFilter);
    return d;
  }, [orders, search, statusFilter]);

  const filteredRegs = useMemo(() => {
    let d = regs;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(r =>
        r.full_name?.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        r.email?.toLowerCase().includes(q)
      );
    }
    if (eventFilter) d = d.filter(r => r.events?.title === eventFilter);
    return d;
  }, [regs, search, eventFilter]);

  const filteredWaitlist = useMemo(() => {
    if (!search) return waitlist;
    const q = search.toLowerCase();
    return waitlist.filter(w =>
      w.full_name?.toLowerCase().includes(q) ||
      w.email?.toLowerCase().includes(q) ||
      w.phone?.includes(q)
    );
  }, [waitlist, search]);

  const filteredDownloads = useMemo(() => {
    if (!search) return downloads;
    const q = search.toLowerCase();
    return downloads.filter(d =>
      d.full_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q)
    );
  }, [downloads, search]);

  const uniqueEvents = useMemo(
    () => [...new Set(regs.map(r => r.events?.title).filter(Boolean))] as string[],
    [regs]
  );

  const TABS: { key: Tab; label: string; count: number; loading: boolean }[] = [
    { key: 'orders', label: 'All Orders', count: orders.length, loading: loadingOrders },
    { key: 'registrations', label: 'Event Registrations', count: regs.length, loading: loadingRegs },
    { key: 'waitlist', label: 'Waitlist Signups', count: waitlist.length, loading: loadingWaitlist },
    { key: 'downloads', label: 'Resource Downloads', count: downloads.length, loading: loadingDownloads },
  ];

  function handleExport() {
    if (tab === 'orders') {
      exportCSV(
        filteredOrders.map(o => ({
          date: fmt(o.created_at),
          name: o.customer_name || '',
          email: o.customer_email,
          phone: o.customer_phone || '',
          location: o.location || '',
          product: o.items?.[0]?.product_name || '',
          amount_naira: (o.total_amount / 100).toFixed(2),
          status: o.status,
          notes: o.notes || '',
        })),
        'orders'
      );
    } else if (tab === 'registrations') {
      exportCSV(
        filteredRegs.map(r => ({
          date: fmt(r.registered_at),
          name: r.full_name,
          phone: r.phone,
          location: r.location || '',
          email: r.email || '',
          event: r.events?.title || '',
          event_date: r.events?.event_date ? fmt(r.events.event_date) : '',
        })),
        'event-registrations'
      );
    } else if (tab === 'waitlist') {
      exportCSV(
        filteredWaitlist.map(w => ({
          date: fmt(w.created_at),
          name: w.full_name,
          email: w.email,
          phone: w.phone || '',
          location: w.location || '',
          role: w.role,
        })),
        'waitlist'
      );
    } else {
      exportCSV(
        filteredDownloads.map(d => ({
          date: fmt(d.created_at),
          name: d.full_name,
          email: d.email,
          location: d.location || '',
          resource: d.resources?.title || '',
        })),
        'resource-downloads'
      );
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold font-headline mb-6">Customers &amp; Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); setStatusFilter(''); setEventFilter(''); }}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all font-headline ${
              tab === t.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {t.label} ({t.loading ? '…' : t.count})
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center flex-1 min-w-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full md:w-80 px-4 py-2.5 bg-surface-container-high rounded-lg text-sm ghost-border-focus transition-all"
          />
          {tab === 'orders' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-surface-container-high rounded-lg text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          {tab === 'registrations' && uniqueEvents.length > 0 && (
            <select
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
              className="px-3 py-2.5 bg-surface-container-high rounded-lg text-sm"
            >
              <option value="">All Events</option>
              {uniqueEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          )}
        </div>
        <button
          onClick={handleExport}
          className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-surface-container transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Export CSV
        </button>
      </div>

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        loadingOrders ? <Loading /> : (
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
            {filteredOrders.length === 0 ? <Empty msg="No orders found" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={TH}>Date</th>
                      <th className={TH}>Name</th>
                      <th className={TH}>Email</th>
                      <th className={TH}>Phone</th>
                      <th className={TH}>Location</th>
                      <th className={TH}>Product</th>
                      <th className={TH}>Amount</th>
                      <th className={TH}>Status</th>
                      <th className={TH}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <Fragment key={o.id}>
                        <tr
                          onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                          className="border-b border-surface-container-high hover:bg-surface-container-low cursor-pointer transition-colors"
                        >
                          <td className={TD + ' whitespace-nowrap'}>{fmt(o.created_at)}</td>
                          <td className={TD + ' font-medium whitespace-nowrap'}>{o.customer_name || '—'}</td>
                          <td className={TD + ' text-primary'}>{o.customer_email}</td>
                          <td className={TD + ' whitespace-nowrap'}>{o.customer_phone || '—'}</td>
                          <td className={TD}>{o.location || '—'}</td>
                          <td className={TD}>{o.items?.[0]?.product_name || o.notes || '—'}</td>
                          <td className={TD + ' font-bold whitespace-nowrap'}>{naira(o.total_amount)}</td>
                          <td className={TD}>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_CLS[o.status] || 'bg-gray-100 text-gray-700'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className={TD} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              {(o.status === 'pending' || o.status === 'paid') && (
                                <button
                                  onClick={() => markFulfilled(o.id)}
                                  className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold hover:bg-green-200 transition-colors whitespace-nowrap"
                                >
                                  Mark Fulfilled
                                </button>
                              )}
                              <span className={`material-symbols-outlined text-base text-on-surface-variant transition-transform ${expandedId === o.id ? 'rotate-180' : ''}`}>
                                expand_more
                              </span>
                            </div>
                          </td>
                        </tr>
                        {expandedId === o.id && (
                          <tr className="bg-surface-container-low/60">
                            <td colSpan={9} className="px-6 py-5">
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
                                <div>
                                  <p className="text-xs text-on-surface-variant mb-1 font-bold uppercase tracking-wider">Order ID</p>
                                  <p className="font-mono text-xs break-all">{o.id}</p>
                                </div>
                                {o.notes && (
                                  <div>
                                    <p className="text-xs text-on-surface-variant mb-1 font-bold uppercase tracking-wider">Notes</p>
                                    <p>{o.notes}</p>
                                  </div>
                                )}
                                {o.items && o.items.length > 0 && (
                                  <div>
                                    <p className="text-xs text-on-surface-variant mb-1 font-bold uppercase tracking-wider">Items</p>
                                    {o.items.map((it, idx) => (
                                      <p key={idx}>{it.product_name} × {it.quantity} — {naira(it.unit_price)}</p>
                                    ))}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-on-surface-variant mb-1 font-bold uppercase tracking-wider">Currency</p>
                                  <p>{o.currency || 'NGN'}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* ── EVENT REGISTRATIONS ── */}
      {tab === 'registrations' && (
        loadingRegs ? <Loading /> : (
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
            {filteredRegs.length === 0 ? <Empty msg="No event registrations found" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={TH}>Date Registered</th>
                      <th className={TH}>Full Name</th>
                      <th className={TH}>Phone</th>
                      <th className={TH}>Location</th>
                      <th className={TH}>Email</th>
                      <th className={TH}>Event</th>
                      <th className={TH}>Event Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map(r => (
                      <tr key={r.id} className="border-b border-surface-container-high hover:bg-surface-container-low transition-colors">
                        <td className={TD + ' whitespace-nowrap'}>{fmt(r.registered_at)}</td>
                        <td className={TD + ' font-medium'}>{r.full_name}</td>
                        <td className={TD}>{r.phone}</td>
                        <td className={TD}>{r.location || '—'}</td>
                        <td className={TD + ' text-primary'}>{r.email || '—'}</td>
                        <td className={TD + ' font-medium'}>{r.events?.title || '—'}</td>
                        <td className={TD + ' whitespace-nowrap'}>{r.events?.event_date ? fmt(r.events.event_date) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* ── WAITLIST ── */}
      {tab === 'waitlist' && (
        loadingWaitlist ? <Loading /> : (
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
            {filteredWaitlist.length === 0 ? <Empty msg="No waitlist signups found" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={TH}>Date</th>
                      <th className={TH}>Full Name</th>
                      <th className={TH}>Email</th>
                      <th className={TH}>Phone</th>
                      <th className={TH}>Location</th>
                      <th className={TH}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlist.map(w => (
                      <tr key={w.id} className="border-b border-surface-container-high hover:bg-surface-container-low transition-colors">
                        <td className={TD + ' whitespace-nowrap'}>{fmt(w.created_at)}</td>
                        <td className={TD + ' font-medium'}>{w.full_name}</td>
                        <td className={TD + ' text-primary'}>{w.email}</td>
                        <td className={TD}>{w.phone || '—'}</td>
                        <td className={TD}>{w.location || '—'}</td>
                        <td className={TD}>
                          <span className="px-2.5 py-1 bg-surface-container-high rounded-full text-xs font-bold capitalize">{w.role}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* ── RESOURCE DOWNLOADS ── */}
      {tab === 'downloads' && (
        loadingDownloads ? <Loading /> : (
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
            {filteredDownloads.length === 0 ? <Empty msg="No resource downloads found" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={TH}>Date</th>
                      <th className={TH}>Full Name</th>
                      <th className={TH}>Email</th>
                      <th className={TH}>Location</th>
                      <th className={TH}>Resource Downloaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDownloads.map(d => (
                      <tr key={d.id} className="border-b border-surface-container-high hover:bg-surface-container-low transition-colors">
                        <td className={TD + ' whitespace-nowrap'}>{fmt(d.created_at)}</td>
                        <td className={TD + ' font-medium'}>{d.full_name}</td>
                        <td className={TD + ' text-primary'}>{d.email}</td>
                        <td className={TD}>{d.location || '—'}</td>
                        <td className={TD}>{d.resources?.title || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
