import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './ProductRow.module.css'

interface ProductRowProps {
  image: string
  name: string
  /** optional product link — pass the slug to make the name clickable */
  to?: string
  price?: string
  oldPrice?: string
  /** middle column, e.g. an order date or a status pill */
  detail?: ReactNode
  /** sits next to `detail` — used for an order's status pill */
  status?: ReactNode
  /** right column before the actions, e.g. a total */
  end?: ReactNode
  actions?: ReactNode
  onRemove?: () => void
  /** out of stock / unavailable — dims the row and disables its actions */
  dimmed?: boolean
}

/**
 * A product row that mirrors Cart's item row, so the cart, wishlist and orders
 * all read the same. Slots keep each caller free to put its own content in the
 * middle and right-hand columns.
 */
export default function ProductRow({
  image,
  name,
  to,
  price,
  oldPrice,
  detail,
  status,
  end,
  actions,
  onRemove,
  dimmed = false,
}: ProductRowProps) {
  return (
    <div className={`${styles.item} ${dimmed ? styles.itemDimmed : ''}`}>
      <div className={styles.productInfo}>
        <div className={styles.imgWrap}>
          {image ? <img src={image} alt={name} /> : <span className={styles.imgPlaceholder} />}
        </div>
        <span className={styles.productName}>
          {to ? <Link className={styles.nameLink} to={to}>{name}</Link> : name}
        </span>
      </div>

      {price && (
        <div className={styles.priceCol}>
          <span className={styles.price}>{price}</span>
          {oldPrice && <span className={styles.oldPrice}>{oldPrice}</span>}
        </div>
      )}

      {detail && <div className={styles.detailCol}>{detail}</div>}
      {status && <div className={styles.statusCol}>{status}</div>}
      {end && <div className={styles.endCol}>{end}</div>}
      {actions && <div className={styles.actionsCol}>{actions}</div>}

      {onRemove && (
        <button className={styles.removeBtn} onClick={onRemove} title="Remove" aria-label={`Remove ${name}`}>
          <X size={20} />
        </button>
      )}
    </div>
  )
}
