/**
 * Formats a given URL so that it is a safe external link.
 * Prepends 'https://' if it doesn't already start with http:// or https://.
 */
export function formatExternalUrl(url: string | undefined): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#') return '#';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
