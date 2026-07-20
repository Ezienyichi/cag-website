/* Safe wrapper around window.fbq — no-ops if pixel not loaded */
export function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    (window as any).fbq(...args);
  }
}
