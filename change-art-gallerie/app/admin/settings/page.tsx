'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface Settings {
  whatsapp_number: string;
  youtube_video_id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_banner_url: string;
}

function key() { return typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') || '' : ''; }

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Settings>({
    whatsapp_number: '',
    youtube_video_id: '',
    hero_title: '',
    hero_subtitle: '',
    hero_banner_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await fetch('/api/admin/settings', { headers: { 'x-admin-key': key() } });
      const d = await r.json();
      if (d.settings) setSettings({
        whatsapp_number: d.settings.whatsapp_number || '',
        youtube_video_id: d.settings.youtube_video_id || '',
        hero_title: d.settings.hero_title || '',
        hero_subtitle: d.settings.hero_subtitle || '',
        hero_banner_url: d.settings.hero_banner_url || '',
      });
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key() },
        body: JSON.stringify(settings),
      });
      if (!r.ok) throw new Error();
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="p-12 text-center text-on-surface-variant">Loading settings…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold font-headline mb-2">Site Settings</h1>
      <p className="text-on-surface-variant text-sm mb-8">Changes take effect across the whole site immediately after saving.</p>

      <form onSubmit={save} style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Hero Banner Image — first, above all text fields */}
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6">
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Hero Banner Image</h2>
          <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>
            The large photo shown on the right side of the homepage hero section.
            Recommended: portrait or square image, at least 600×750px.
          </p>

          <ImageUpload
            value={settings.hero_banner_url}
            onChange={url => setSettings({ ...settings, hero_banner_url: url })}
            bucket="product-images"
            label="Banner Image"
          />

          {settings.hero_banner_url && (
            <div className="mt-4 rounded-lg overflow-hidden" style={{ maxWidth: 240, aspectRatio: '4/5' }}>
              <img
                src={settings.hero_banner_url}
                alt="Hero banner preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {!settings.hero_banner_url && (
            <p className="text-xs text-on-surface-variant mt-3">
              No custom image set — the default hero photo is used.
            </p>
          )}
        </div>

        {/* Hero text */}
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6">
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Hero Section Text</h2>
          <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>The main heading and subtitle shown at the top of the homepage.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Hero Title</label>
              <input
                value={settings.hero_title}
                onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                placeholder="Unlock Creativity in Every Child"
                className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>Hero Subtitle</label>
              <textarea
                value={settings.hero_subtitle}
                onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })}
                rows={3}
                placeholder="Fun and educational creative books for schools and homeschoolers."
                className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface resize-none"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6">
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>WhatsApp Contact</h2>
          <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>This number is used for all WhatsApp links on the site.</p>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>WhatsApp Number</label>
          <input
            value={settings.whatsapp_number}
            onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
            placeholder="2348012345678"
            className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
          />
          <p style={{ fontSize: 11, color: '#999', marginTop: 6 }}>Include country code, no + sign. Example: 2348012345678</p>
        </div>

        {/* YouTube */}
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-6">
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>YouTube Video</h2>
          <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>The video embedded on the waitlist page.</p>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>YouTube Video ID</label>
          <input
            value={settings.youtube_video_id}
            onChange={e => setSettings({ ...settings, youtube_video_id: e.target.value })}
            placeholder="dQw4w9WgXcQ"
            className="w-full px-4 py-3 bg-surface-container-high rounded-lg text-sm text-on-surface"
          />
          <p style={{ fontSize: 11, color: '#999', marginTop: 6 }}>The part after v= in the YouTube URL. e.g. youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong></p>
          {settings.youtube_video_id && (
            <div style={{ marginTop: 16, borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${settings.youtube_video_id}`}
                title="Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-on-primary font-bold font-headline rounded-full disabled:opacity-60"
          style={{ padding: '14px 40px', fontSize: 15, cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
