import { getImageUrl } from '../lib/api'
import styles from './AffiliateBanner.module.css'

export interface AffiliateBannerRecord {
  id: number
  title?: string
  image?: string
  media_file?: string
  link?: string
  affiliate_url?: string
  placement: string
  display_order?: number
  is_active?: boolean
  is_live?: boolean
}

export default function AffiliateBanner({ banner, href }: { banner: AffiliateBannerRecord; href?: string }) {
  const src = getImageUrl(banner.image ?? banner.media_file ?? '')
  if (!src) return null

  const destination = href ?? (banner.link || banner.affiliate_url)
  const image = <img className={styles.image} src={src} alt={banner.title || 'Affiliate banner'} />

  return (
    <div className={styles.banner}>
      {destination ? (
        <a href={destination} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : image}
    </div>
  )
}
