'use client';

import { useState, useEffect } from 'react';

interface Signup {
  id: string;
  email: string;
  full_name: string;
  role: string;
  source: string;
  created_at: string;
}

export default function AdminWaitlistPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWaitlist();
  }, [filter]);

  async function fetchWaitlist() {
    setLoading(true);
    const key = sessionStorage.getItem('admin_key') || '';

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('role', filter);

      const res = await fetch(`/api/admin/waitlist?${params}`, {
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      setSignups(data.signups || []);
      setTotal(data.total || 0);
    } catch {
      console.error('Failed to fetch waitlist');
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Role', 'Source', 'Date Joined'];
    const rows = signups.map((s) => [
      s.full_name,
      s.email,
      s.role,
      s.source,
      new Date(s.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const roles = ['all', 'parent', 'teacher', 'school', 'other'];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Waitlist CRM</h1>
          <p className="text-on-surface-variant">{total} total signups</p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${
              filter === r
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading...</div>
        ) : signups.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">No signups yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Name</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Email</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Role</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Source</th>
                  <th className="text-left px-6 py-4 font-bold font-headline text-on-surface-variant">Joined</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((s, i) => (
                  <tr
                    key={s.id}
                    className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}
                  >
                    <td className="px-6 py-4 font-medium">{s.full_name || '—'}</td>
                    <td className="px-6 py-4 text-primary">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-tertiary-container/30 text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold capitalize">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{s.source}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(s.created_at).toLocaleDateString('en-GB')}
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
