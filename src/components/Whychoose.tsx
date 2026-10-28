import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Whychoose.module.css'
import {
  promallCombinedApi,
  type AdditionalWebsiteContent,
  type PromallCombinedResponse,
} from '../lib/api'

const allowedHtmlTags = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'I', 'LI', 'OL', 'P', 'STRONG', 'U', 'UL',
])

function sanitizeCmsHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html')

  const sanitizeChildren = (parent: ParentNode) => {
    Array.from(parent.childNodes).forEach((node) => {
      if (!(node instanceof Element)) return

      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH'].includes(node.tagName)) {
        node.remove()
        return
      }

      sanitizeChildren(node)
      if (!allowedHtmlTags.has(node.tagName)) {
        node.replaceWith(...Array.from(node.childNodes))
        return
      }

      Array.from(node.attributes).forEach((attribute) => {
        if (node.tagName !== 'A' || !['href', 'target'].includes(attribute.name.toLowerCase())) {
          node.removeAttribute(attribute.name)
        }
      })

      if (node.tagName === 'A') {
        const href = node.getAttribute('href')
        if (href) {
          try {
            const url = new URL(href, window.location.origin)
            if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) node.removeAttribute('href')
          } catch {
            node.removeAttribute('href')
          }
        }
        if (node.getAttribute('target') === '_blank') {
          node.setAttribute('rel', 'noopener noreferrer')
        }
      }
    })
  }

  sanitizeChildren(parsed.body)
  return parsed.body.innerHTML
}

export default function Choose() {
  const [content, setContent] = useState<AdditionalWebsiteContent | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    promallCombinedApi.getAll<PromallCombinedResponse>()
      .then((response) => {
        const items = Array.isArray(response.additional_website_content)
          ? [...response.additional_website_content]
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          : []
        setContent(items[0] ?? null)
      })
      .catch((cause: unknown) => {
        console.error('Failed to load additional website content:', cause)
        setError('Unable to load this content right now.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <motion.article
      className={styles.container}
      aria-label="About Promallshop"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {content && (
        <>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {content.heading}
          </motion.h2>
          <motion.div
            className={styles.cmsContent}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content.description) }}
          />
        </>
      )}
      {!content && loading && <p role="status">Loading content…</p>}
      {!content && error && <p role="status">{error}</p>}
    </motion.article>
  )
}
