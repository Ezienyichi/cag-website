import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full rounded-t-xl mt-20 bg-surface-container-low">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 md:px-12 py-16 max-w-screen-2xl mx-auto gap-8">
        <div>
          <Image
            src="/logo.png"
            alt="Change Art Gallerie"
            width={100}
            height={58}
            className="h-12 w-auto mb-3"
          />
          <p className="text-sm text-on-surface/70">
            © {new Date().getFullYear()} Change Art Gallerie. Handcrafted for curious minds.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm">
          <Link href="/privacy" className="text-on-surface/70 hover:text-primary hover:underline underline-offset-4 transition-all">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-on-surface/70 hover:text-primary hover:underline underline-offset-4 transition-all">
            Terms of Service
          </Link>
          <Link href="/faq" className="text-on-surface/70 hover:text-primary hover:underline underline-offset-4 transition-all">
            FAQ
          </Link>
          <Link href="/contact" className="text-on-surface/70 hover:text-primary hover:underline underline-offset-4 transition-all">
            Contact Us
          </Link>
        </div>

        <div className="flex gap-3">
          <a
            href="https://instagram.com/changeartgallerie"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center text-primary-dim hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined">share</span>
          </a>
          <a
            href="mailto:hello@changeartgallerie.com"
            className="w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center text-primary-dim hover:scale-110 transition-transform"
          >
            <span className="material-symbols-outlined">mail</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
