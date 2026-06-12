import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Free Resources | Change Art Gallerie',
  description: 'Download free worksheets, activities and teaching guides for children — no payment needed.',
};

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 md:px-8 max-w-screen-xl mx-auto min-h-screen">
        <nav className="text-sm text-on-surface-variant mb-6">
          <a href="/store/workbooks" className="hover:text-primary transition-colors">Shop</a>
          <span className="mx-2">→</span>
          <span className="text-on-surface font-medium">Free Resources</span>
        </nav>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-tertiary-container/30 text-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-headline mb-4">
            <span className="material-symbols-outlined text-[14px]">card_giftcard</span>
            100% Free — No Payment Needed
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">Free Resources</h1>
          <p className="text-on-surface-variant max-w-lg text-lg">
            Download free worksheets, activities and teaching guides for your children — completely free, no payment needed.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-3">
            <span className="material-symbols-outlined text-4xl text-primary">draw</span>
            <h2 className="font-bold font-headline text-lg">Art Activity Sheets</h2>
            <p className="text-on-surface-variant text-sm flex-1">
              Printable colouring and drawing activity sheets designed to spark creativity in young children.
            </p>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full self-start">Coming soon</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-3">
            <span className="material-symbols-outlined text-4xl text-secondary">article</span>
            <h2 className="font-bold font-headline text-lg">Teaching Guides</h2>
            <p className="text-on-surface-variant text-sm flex-1">
              Step-by-step guides for parents and teachers on introducing creative arts to children aged 2–6.
            </p>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full self-start">Coming soon</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-3">
            <span className="material-symbols-outlined text-4xl text-tertiary">quiz</span>
            <h2 className="font-bold font-headline text-lg">Sample Worksheets</h2>
            <p className="text-on-surface-variant text-sm flex-1">
              Sample pages from our Montessori workbook series so you can preview before purchasing.
            </p>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full self-start">Coming soon</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-headline mb-2">Ready to go further?</h3>
            <p className="text-on-surface-variant">Explore our full range of workbooks, homeschooling packs and digital storybooks.</p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <a href="/store/workbooks" className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all">
              Workbooks
            </a>
            <a href="/store/homeschooling" className="bg-surface-container-lowest text-primary px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all border border-outline-variant/20">
              Homeschooling
            </a>
            <a href="/store/digital" className="bg-surface-container-lowest text-primary px-6 py-2.5 rounded-full font-bold text-sm font-headline hover:scale-105 transition-all border border-outline-variant/20">
              Digital Books
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
