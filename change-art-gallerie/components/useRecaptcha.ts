'use client';

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export async function getRecaptchaToken(action: string): Promise<string> {
  return new Promise((resolve) => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
    if (!siteKey || typeof window === 'undefined' || !window.grecaptcha) {
      resolve('');
      return;
    }
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(() => resolve(''));
    });
  });
}
