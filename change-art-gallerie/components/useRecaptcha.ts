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

    let settled = false;
    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    // grecaptcha.ready()/execute() can silently never call back (blocked script,
    // slow network) — never let that stall form submission.
    setTimeout(() => {
      console.error('reCAPTCHA timed out, continuing without a token');
      finish('');
    }, 4000);

    try {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action }).then(finish).catch((err) => {
          console.error('reCAPTCHA execute failed:', err);
          finish('');
        });
      });
    } catch (err) {
      console.error('reCAPTCHA ready() threw:', err);
      finish('');
    }
  });
}
