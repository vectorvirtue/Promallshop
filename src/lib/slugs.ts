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

/**
 * Extract product ID from slug
 * Example: "yealink-sip-t46u-ip-phone-123" → 123
 */
export function extractIdFromSlug(slug: string): number {
  const match = slug.match(/-(\d+)$/)
  return match ? parseInt(match[1], 10) : 0
}
