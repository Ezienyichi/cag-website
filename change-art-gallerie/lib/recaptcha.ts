export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return true; // skip verification if key or token missing

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    return data.success && data.score >= 0.5;
  } catch (err) {
    console.error('reCAPTCHA verification failed, allowing submission:', err);
    return true; // fail open — don't block real signups if Google's API is slow/unreachable
  }
}

export function isGibberish(name: string): boolean {
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 2) return true;
  if (/[^aeiou]{5,}/.test(cleaned)) return true;
  const vowels = cleaned.replace(/[^aeiou]/g, '').length;
  if (vowels / cleaned.length < 0.15) return true;
  return false;
}
