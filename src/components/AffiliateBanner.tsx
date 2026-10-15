import { getImageUrl } from '../lib/api'
import styles from './AffiliateBanner.module.css'

export interface AffiliateBannerRecord {
  id: number
  title?: string
  image?: string
  media_file?: string
  link?: string
  placement: string
  display_order?: number
  is_active?: boolean
  is_live?: boolean
}

export default function AffiliateBanner({ banner }: { banner: AffiliateBannerRecord }) {
  const src = getImageUrl(banner.image ?? banner.media_file ?? '')
  if (!src) return null

  const image = <img className={styles.image} src={src} alt={banner.title || 'Affiliate banner'} />

  return (
    <div className={styles.banner}>
      {banner.link ? (
        <a href={banner.link} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : image}
    </div>
  )
}