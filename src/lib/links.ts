export const AFFILIATE_PROGRAM_URL = 'https://affiliate.promallshop.com'
export const AFFILIATE_PROGRAM_PATH = '/become-an-affiliate'

export function partnerPath(slug: string) {
  return `/partners/${encodeURIComponent(slug)}`
}
