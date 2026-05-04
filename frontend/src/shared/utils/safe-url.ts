export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const base =
      typeof window !== 'undefined' ? window.location.origin : 'http://ssr';
    const parsed = new URL(value, base);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
