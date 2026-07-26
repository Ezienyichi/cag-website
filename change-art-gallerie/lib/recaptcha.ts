export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // skip verification if key not configured

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json();
  return data.success && data.score >= 0.5;
}

export function isGibberish(name: string): boolean {
  const cleaned = name.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 2) return true;
  if (/[^aeiou]{5,}/.test(cleaned)) return true;
  const vowels = cleaned.replace(/[^aeiou]/g, '').length;
  if (vowels / cleaned.length < 0.15) return true;
  return false;
}
