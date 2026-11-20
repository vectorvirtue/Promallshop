export const AFFILIATE_PROGRAM_URL = 'https://affiliate.promallshop.com'

export function partnerPath(slug: string) {
  return `/partners/${encodeURIComponent(slug)}`
}
