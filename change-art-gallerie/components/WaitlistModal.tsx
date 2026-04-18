'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, role }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("You're on the list! We'll be in touch soon.");
        setEmail('');
        setFullName('');
        onClose();
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-xl p-8 md:p-10 max-w-md w-full ambient-shadow-lg animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-surface-container-low rounded-full"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Join the Waitlist
          </div>
          <h3 className="text-2xl font-bold font-headline">
            Be the first to know
          </h3>
          <p className="text-on-surface-variant mt-2">
            Get early access to new collections and exclusive educator resources.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amaka Johnson"
              required
              className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-on-surface placeholder:text-outline-variant ghost-border-focus transition-all font-body"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-on-surface placeholder:text-outline-variant ghost-border-focus transition-all font-body"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-on-surface ghost-border-focus transition-all font-body appearance-none"
            >
              <option value="parent">Parent / Guardian</option>
              <option value="teacher">Teacher / Educator</option>
              <option value="school">School Administrator</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-headline"
          >
            {loading ? 'Joining...' : 'Join the Waitlist'}
          </button>
        </form>
      </div>
    </div>
  );
}
