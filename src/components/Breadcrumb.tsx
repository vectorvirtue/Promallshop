import { Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

export interface Crumb {
  label: string
  /** omit on the last (current) crumb — it renders as plain text */
  to?: string
}

/**
 * Shared page trail, e.g. Home → Account → Orders.
 * Home is always the first crumb; pass the rest in order.
 */
export default function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  const crumbs: Crumb[] = [{ label: 'Home', to: '/' }, ...items]

  return (
    <nav className={`${styles.breadcrumb} ${className ?? ''}`} aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <span key={`${crumb.label}-${index}`} className={styles.crumb}>
            {crumb.to && !isLast ? (
              <Link className={styles.link} to={crumb.to}>{crumb.label}</Link>
            ) : (
              <span className={isLast ? styles.current : undefined}>{crumb.label}</span>
            )}
            {!isLast && <span className={styles.separator} aria-hidden="true">→</span>}
          </span>
        )
      })}
    </nav>
  )
}
