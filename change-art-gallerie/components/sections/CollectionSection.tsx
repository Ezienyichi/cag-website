import Image from 'next/image';
import Link from 'next/link';

export default function CollectionSection() {
  return (
    <section id="collection" className="py-20 md:py-24 px-6 md:px-8 max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">The Collection</h2>
          <p className="text-on-surface-variant max-w-md">
            Montessori-approved workbooks, homeschooling resources, and digital storybooks for children ages 2 to 6.
          </p>
        </div>
        <Link
          href="/store/workbooks"
          className="text-primary font-bold flex items-center gap-2 hover:underline underline-offset-4 transition-all font-headline"
        >
          View Full Catalog
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Featured: School WorkBooks */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="text-primary font-bold text-sm mb-2 font-headline">Editor&apos;s Choice</div>
            <h3 className="text-2xl md:text-3xl font-bold font-headline mb-3">School WorkBooks</h3>
            <p className="text-on-surface-variant mb-6">
              A deep dive into colour theory through Montessori School Curriculum and African Storytelling.
            </p>
            <Link
              href="/store/workbooks"
              className="bg-primary-container text-on-primary-container w-fit px-6 py-2.5 rounded-full font-bold font-headline hover:scale-105 active:scale-95 transition-all"
            >
              Explore
            </Link>
          </div>
          <div className="md:w-1/2 h-72 md:h-auto relative">
            <Image
              src="/images/color-alchemist.png"
              alt="School WorkBooks"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Home Schooling Resources */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover:scale-[1.02] transition-transform duration-300">
          <div className="h-56 md:h-64 relative">
            <Image
              src="/images/shape-master.png"
              alt="Home Schooling Resources"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold font-headline mb-1.5">Home Schooling Resources</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              Take advantage of downloadable home schooling materials for your kids ages 2 to 6.
            </p>
            <Link href="/store/homeschooling" className="text-primary font-bold font-headline text-sm hover:underline underline-offset-4">
              Shop Now
            </Link>
          </div>
        </div>

        {/* Digital Storybooks and Resources */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover:scale-[1.02] transition-transform duration-300">
          <div className="h-56 md:h-64 relative">
            <Image
              src="/images/nature-sketchbook.png"
              alt="Digital Storybooks and Resources"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold font-headline mb-1.5">Digital Storybooks &amp; Resources</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              Get affordable access to Christian and educational storybooks.
            </p>
            <Link href="/store/digital" className="text-primary font-bold font-headline text-sm hover:underline underline-offset-4">
              Shop Now
            </Link>
          </div>
        </div>

        {/* All Collections banner */}
        <div className="md:col-span-8 bg-tertiary-container rounded-xl p-10 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="z-10">
            <h3 className="text-3xl md:text-4xl font-black text-on-tertiary-container mb-3 italic font-headline">
              Access All Our Collections
            </h3>
            <p className="text-on-tertiary-container/80 font-medium mb-6">
              School workbooks, homeschooling materials, and digital storybooks — all in one place.
            </p>
            <Link
              href="/store/workbooks"
              className="bg-on-tertiary-container text-tertiary-container px-8 md:px-10 py-3 rounded-full font-bold font-headline hover:scale-105 active:scale-95 transition-all"
            >
              Our Collections
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-20 rotate-12">
            <span className="material-symbols-outlined text-[160px] md:text-[200px]">palette</span>
          </div>
        </div>
      </div>
    </section>
  );
}
