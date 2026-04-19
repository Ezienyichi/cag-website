'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookCarousel from '@/components/BookCarousel';
import RealTimeGrid from '@/components/RealTimeGrid';

// ============================================
// 🔧 CONFIGURATION
// ============================================
const WHATSAPP_NUMBER = '2348012345678'; // ← YOUR NUMBER
const YOUTUBE_VIDEO_ID = 'YOUR_VIDEO_ID'; // ← Replace with your YouTube video ID (the part after v= in the URL)

const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/cag_childrencolouringbook/?hl=en',
  facebook: 'https://www.facebook.com/ChangeArtGallerie/',
  youtube: 'https://youtube.com/@changeartgallerie',
  linkedin: 'https://linkedin.com/company/changeartgallerie',
  pinterest: 'https://www.pinterest.com/changeartgallerie/children-colouring-books/',
};
// ============================================

const FAQ_DATA = [
  {
    question: 'Where is the location of your office?',
    answer: 'Port Harcourt City. But we have distributors across the state for quicker delivery.',
  },
  {
    question: 'Can I buy in bulk?',
    answer: 'Yes! We offer bulk pricing for schools, bookshops, and distributors. Reach out via WhatsApp for a custom quote.',
  },
  {
    question: 'How many classes do you currently have?',
    answer: 'We currently have books for Nursery 1, Nursery 2, and Nursery 3 classes, covering ages 3 to 5.',
  },
  {
    question: 'How best can I reach out for quicker delivery?',
    answer: 'Reach out through WhatsApp — tap the green chat button on the bottom-right corner of any page for instant response.',
  },
  {
    question: 'What makes your books unique?',
    answer: 'Our books are tailor-made for children between ages 3 and 5, with YouTube practice class videos (access only for users) and an assignment allocation record sheet for parents and guardians. They cover preliminary introductions to music, folktales, and handicraft activities and follow the global Montessori curriculum design.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left group"
      >
        <span className="font-bold text-base font-headline pr-4">{question}</span>
        <span
          className={`material-symbols-outlined text-primary shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 pb-5 text-on-surface-variant leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function buildWhatsAppMessage() {
    const roleLabels: Record<string, string> = {
      parent: 'Parent/Guardian',
      teacher: 'Teacher/Educator',
      school: 'School Administrator',
      other: 'Other',
    };
    return encodeURIComponent(
      `Hi Change Art Gallerie! 👋\n\n` +
        `I just joined the waitlist!\n\n` +
        `*Name:* ${fullName}\n` +
        `*Email:* ${email}\n` +
        `*Phone:* ${phone}\n` +
        `*Role:* ${roleLabels[role] || role}\n` +
        `\nI'm interested in your creative books. Can you tell me more?`
    );
  }

  function openWhatsApp() {
    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  }

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
        toast.success("You're on the list! 🎉");
        setSubmitted(true);
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
    <>
      <Navbar />
      <main className="pt-24 overflow-x-hidden">
        {/* ============================================ */}
        {/* HERO — Waitlist Form */}
        {/* ============================================ */}
        <section className="relative px-6 md:px-8 py-16 md:py-24 max-w-screen-2xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Copy */}
            <div className="flex-1 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-headline">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Be the First to Know
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.1] font-headline">
                Join the{' '}
                <span className="relative inline-block">
                  Waitlist
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-primary-fixed"
                    preserveAspectRatio="none"
                    viewBox="0 0 300 20"
                  >
                    <path
                      d="M5 15Q150 2 295 15"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="6"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
                Get early access to our Montessori-approved creative arts books for Nursery 1, 2 &amp; 3.
                Be the first to know about new releases, exclusive discounts, and free teaching resources.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                  Montessori curriculum
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-lg">play_circle</span>
                  YouTube practice videos
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-lg">assignment</span>
                  Assignment record sheets
                </div>
              </div>
            </div>

            {/* Right: Form Card */}
            <div className="w-full lg:w-[440px] shrink-0">
              {!submitted ? (
                <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 ambient-shadow-lg relative">
                  {/* Decorative blobs */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-container rounded-full mix-blend-multiply filter blur-xl opacity-40" />
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-tertiary-container rounded-full mix-blend-multiply filter blur-xl opacity-40" />

                  <div className="relative z-10">
                    <h2 className="text-xl font-bold font-headline mb-1">Reserve your spot</h2>
                    <p className="text-on-surface-variant text-sm mb-6">
                      Join 500+ parents and educators on the waitlist.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Full Name *</label>
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
                        <label className="block text-sm font-medium mb-1.5">Email Address *</label>
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
                        <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 08012345678"
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
                        {loading ? 'Joining...' : 'Join the Waitlist — It\'s Free'}
                      </button>

                      <p className="text-xs text-on-surface-variant text-center">
                        No spam, ever. Unsubscribe anytime.
                      </p>
                    </form>
                  </div>
                </div>
              ) : (
                /* Success state */
                <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 ambient-shadow-lg text-center">
                  <div className="w-16 h-16 bg-tertiary-container rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-3xl text-on-tertiary-container">
                      check_circle
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-headline mb-2">
                    You&apos;re in, {fullName.split(' ')[0]}! 🎉
                  </h2>
                  <p className="text-on-surface-variant mb-6">
                    We&apos;ll notify you when the books are available. Chat with us now for instant answers!
                  </p>
                  <button
                    onClick={openWhatsApp}
                    className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all font-headline flex items-center justify-center gap-3 mb-3"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Continue on WhatsApp
                  </button>
                  <Link
                    href="/"
                    className="text-primary font-bold text-sm hover:underline underline-offset-4"
                  >
                    Browse our collection →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* WELCOME VIDEO */}
        {/* ============================================ */}
        <section className="px-6 md:px-8 py-12 max-w-screen-xl mx-auto">
          <div className="relative">
            {/* Decorative blobs like hero */}
            <div className="absolute -top-8 -left-8 w-28 h-28 bg-secondary-container rounded-full mix-blend-multiply filter blur-xl opacity-50" />
            <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-tertiary-container rounded-full mix-blend-multiply filter blur-xl opacity-50" />

            <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow-lg">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-error-container/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_circle
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-headline">Welcome Message</h2>
                    <p className="text-on-surface-variant text-sm">A quick introduction to Change Art Gallerie</p>
                  </div>
                </div>

                {/* YouTube Embed */}
                <div className="relative rounded-lg overflow-hidden aspect-video bg-surface-container-high">
                  <iframe
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
                    title="Welcome to Change Art Gallerie"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* WHY CHANGE ART GALLERIE — Social Proof Strip */}
        {/* ============================================ */}
        <section className="bg-surface-container-low py-16 px-6 md:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-surface rounded-xl p-6">
                <div className="text-3xl font-black font-headline text-primary mb-1">3</div>
                <p className="text-on-surface-variant text-sm">Class levels covered</p>
              </div>
              <div className="bg-surface rounded-xl p-6">
                <div className="text-3xl font-black font-headline text-secondary mb-1">500+</div>
                <p className="text-on-surface-variant text-sm">Parents on waitlist</p>
              </div>
              <div className="bg-surface rounded-xl p-6">
                <div className="text-3xl font-black font-headline text-tertiary mb-1">Ages 3–5</div>
                <p className="text-on-surface-variant text-sm">Tailor-made content</p>
              </div>
              <div className="bg-surface rounded-xl p-6">
                <div className="text-3xl font-black font-headline text-primary-dim mb-1">Montessori</div>
                <p className="text-on-surface-variant text-sm">Globally approved curriculum</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* WHAT'S INSIDE THE BOOKS */}
        {/* ============================================ */}
        <section className="py-20 px-6 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">
              What&apos;s Inside Our Books?
            </h2>
            <p className="text-on-surface-variant max-w-lg mx-auto">
              Every book is packed with activities designed to develop your child&apos;s creativity following the Montessori approach.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: 'music_note',
                title: 'Music Activities',
                desc: 'Preliminary introductions to rhythm, singing, and musical instruments through fun exercises.',
                color: 'bg-primary-container/20 text-primary',
              },
              {
                icon: 'auto_stories',
                title: 'Folktales & Stories',
                desc: 'Rich African folktales that teach moral lessons while building reading comprehension skills.',
                color: 'bg-secondary-container/20 text-secondary',
              },
              {
                icon: 'construction',
                title: 'Handicraft Activities',
                desc: 'Hands-on craft projects using everyday materials that develop fine motor skills and creativity.',
                color: 'bg-tertiary-container/20 text-tertiary',
              },
              {
                icon: 'play_circle',
                title: 'YouTube Practice Videos',
                desc: 'Exclusive video lessons that bring each book chapter to life — access included with every purchase.',
                color: 'bg-error-container/20 text-error',
              },
              {
                icon: 'assignment',
                title: 'Assignment Record Sheet',
                desc: 'Built-in tracking sheets so parents and guardians can monitor their child\'s progress at home.',
                color: 'bg-primary-container/20 text-primary-dim',
              },
              {
                icon: 'school',
                title: 'Montessori Curriculum',
                desc: 'Content aligned with the global Montessori curriculum — trusted by educators worldwide.',
                color: 'bg-tertiary-container/20 text-tertiary',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-surface-container-lowest rounded-xl p-7 hover:scale-[1.02] transition-transform duration-300 group"
              >
                <div
                  className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold font-headline mb-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ */}
        {/* BOOK PREVIEW CAROUSELS */}
        {/* ============================================ */}
        <section className="py-20 px-6 md:px-8 bg-surface-container-low">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">
                Peek Inside Our Books
              </h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">
                Browse through pages from each nursery level. Every book is crafted with love and aligned with the Montessori curriculum.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <BookCarousel
                title="Creative Arts — Nursery 1"
                subtitle="Foundation level for beginners"
                ageRange="Ages 2–3"
                accentColor="text-primary"
                accentBg="bg-primary-container/20"
                images={[
                  '/images/nursery1-page1.png',
                  '/images/nursery1-page2.png',
                  '/images/nursery1-page3.png',
                  '/images/nursery1-page4.png',
                  '/images/nursery1-page5.png',
                  '/images/nursery1-page6.png',
                  '/images/nursery1-page7.png',
                ]}
              />
              <BookCarousel
                title="Creative Arts — Nursery 2"
                subtitle="Building on the basics"
                ageRange="Ages 3–4"
                accentColor="text-secondary"
                accentBg="bg-secondary-container/20"
                images={[
                  '/images/nursery2-page1.png',
                  '/images/nursery2-page2.png',
                  '/images/nursery2-page3.png',
                  '/images/nursery2-page4.png',
                  '/images/nursery2-page5.png',
                  '/images/nursery2-page6.png',
                  '/images/nursery2-page7.png',
                ]}
              />
              <BookCarousel
                title="Creative Arts — Nursery 3"
                subtitle="Advanced creative expression"
                ageRange="Ages 4–5"
                accentColor="text-tertiary"
                accentBg="bg-tertiary-container/20"
                images={[
                  '/images/nursery3-page1.png',
                  '/images/nursery3-page2.png',
                  '/images/nursery3-page3.png',
                  '/images/nursery3-page4.png',
                  '/images/nursery3-page5.png',
                  '/images/nursery3-page6.png',
                  '/images/nursery3-page7.png',
                ]}
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* BOOKS IN ACTION — Real-Time Photo Grid */}
        {/* ============================================ */}
        <section className="py-20 px-6 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">
              Our Books in Action
            </h2>
            <p className="text-on-surface-variant max-w-lg mx-auto">
              See how children and teachers are using Change Art Gallerie books in classrooms and homes across Nigeria.
            </p>
          </div>

          <RealTimeGrid
            images={[
              { src: '/images/realtime-1.png', caption: 'Students exploring colour theory in the classroom' },
              { src: '/images/realtime-2.png', caption: 'Nursery 1 pupils working on their first art project' },
              { src: '/images/realtime-3.png', caption: 'A teacher guiding handicraft activities' },
              { src: '/images/realtime-4.png', caption: 'Creative arts lesson in progress' },
              { src: '/images/realtime-5.png', caption: 'Children proudly showing their completed work' },
              { src: '/images/realtime-6.png', caption: 'Parents and kids learning together at home' },
            ]}
          />
        </section>

        {/* ============================================ */}
        {/* FAQ SECTION */}
        {/* ============================================ */}
        <section className="bg-surface-container py-20 px-6 md:px-8">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-on-surface-variant">
                Everything you need to know about our books and delivery.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_DATA.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>

            {/* Still have questions? */}
            <div className="mt-10 text-center">
              <p className="text-on-surface-variant mb-4">Still have questions?</p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I have a question about your books.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all font-headline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SOCIAL LINKS + CONNECT */}
        {/* ============================================ */}
        <section className="py-16 px-6 md:px-8 max-w-screen-xl mx-auto">
          <div className="bg-surface-container-lowest rounded-xl p-10 md:p-14 text-center ambient-shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold font-headline mb-3">
              Follow Our Journey
            </h2>
            <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
              Stay connected for behind-the-scenes content, free teaching tips, and community highlights.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {/* Instagram */}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high px-5 py-3 rounded-full transition-all hover:scale-105 group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-on-surface-variant group-hover:text-primary transition-colors">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                </svg>
                <span className="font-bold text-sm font-headline">Instagram</span>
              </a>

              {/* Facebook */}
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high px-5 py-3 rounded-full transition-all hover:scale-105 group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface-variant group-hover:text-[#1877F2] transition-colors">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-bold text-sm font-headline">Facebook</span>
              </a>

              {/* YouTube */}
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high px-5 py-3 rounded-full transition-all hover:scale-105 group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface-variant group-hover:text-[#FF0000] transition-colors">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="font-bold text-sm font-headline">YouTube</span>
              </a>

              {/* LinkedIn */}
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high px-5 py-3 rounded-full transition-all hover:scale-105 group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface-variant group-hover:text-[#0A66C2] transition-colors">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-bold text-sm font-headline">LinkedIn</span>
              </a>

              {/* Pinterest */}
              <a
                href={SOCIAL_LINKS.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high px-5 py-3 rounded-full transition-all hover:scale-105 group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-on-surface-variant group-hover:text-[#E60023] transition-colors">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
                </svg>
                <span className="font-bold text-sm font-headline">Pinterest</span>
              </a>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FINAL CTA */}
        {/* ============================================ */}
        <section className="px-6 md:px-8 pb-12">
          <div className="max-w-screen-2xl mx-auto rounded-xl bg-gradient-to-br from-primary to-primary-dim p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-on-primary mb-4 font-headline">
                Don&apos;t miss out!
              </h2>
              <p className="text-on-primary/80 text-lg mb-8">
                Spots on the waitlist are filling fast. Join now and be the first to get our books when they launch.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="#top"
                  onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-surface-container-lowest text-primary px-8 py-4 rounded-full font-extrabold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all font-headline"
                >
                  Join the Waitlist
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to learn more about your books.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors font-headline"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
