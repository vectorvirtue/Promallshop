/**
 * Generate SEO-friendly product slug from name and ID
 * Example: "Yealink SIP-T46U IP Phone" + 123 → "yealink-sip-t46u-ip-phone-123"
 */
export function generateProductSlug(name: string, id: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug}-${id}`
}

/** Product detail pages are published with a .html extension */
export function productPath(name: string, id: number): string {
  return `/product/${generateProductSlug(name, id)}.html`
}

/**
 * Extract product ID from slug, tolerating the .html extension and bare ids.
 * Examples: "yealink-sip-t46u-ip-phone-123" → 123,
 *           "yealink-sip-t46u-ip-phone-123.html" → 123,
 *           "123" / "123.html" → 123
 */
export function extractIdFromSlug(slug: string): number {
  const clean = slug.replace(/\.html$/i, '')
  if (/^\d+$/.test(clean)) return parseInt(clean, 10)
  const match = clean.match(/-(\d+)$/)
  return match ? parseInt(match[1], 10) : 0
}