import { useEffect, useState } from 'react'
import styles from './Deal.module.css'
import swiper from '../assets/Frame 20.svg'
import { motion } from 'framer-motion'

const WP_API = 'https://wp-internal.promallshop.com/wp-json/wp/v2'

interface WPPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  link: string
  date: string
  featured_media: number
}

interface WPMedia {
  source_url: string
  media_details?: { sizes?: { medium?: { source_url: string } } }
}

interface BlogCard {
  id: number
  title: string
  excerpt: string
  link: string
  date: string
  imageUrl: string
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function Blogs() {
  const [cards, setCards] = useState<BlogCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // 1. fetch latest 6 posts
        const res = await fetch(`${WP_API}/posts?per_page=6&status=publish&_fields=id,title,excerpt,link,date,featured_media`)
        const posts: WPPost[] = await res.json()
        // 2. fetch media for each post that has a featured_media id
        const mediaIds = posts.map(p => p.featured_media).filter(Boolean)
        const mediaMap: Record<number, string> = {}

        await Promise.allSettled(
          mediaIds.map(async (mid) => {
            const mRes = await fetch(`${WP_API}/media/${mid}?_fields=id,source_url,media_details`)
            const media: WPMedia & { id: number } = await mRes.json()
            if (media?.source_url) {
              mediaMap[mid] = media.media_details?.sizes?.medium?.source_url ?? media.source_url
            }
          })
        )

       

        const result: BlogCard[] = posts.map(p => ({
          id: p.id,
          title: stripHtml(p.title.rendered),
          excerpt: stripHtml(p.excerpt.rendered).slice(0, 120) + '…',
          link: p.link,
          date: formatDate(p.date),
          imageUrl: p.featured_media ? (mediaMap[p.featured_media] ?? '') : '',
        }))

        setCards(result)
      } catch (err) {
        console.error('Blog fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // duplicate cards for seamless infinite loop
  const blogTrack = loading ? [] : [...cards, ...cards]

  return (
       <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
    <section className={styles.blogs}>
      <h2 className={styles.header}>Our Latest Blogs</h2>

      {loading ? (
        <div className={styles.blogcontainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.blogOne}>
              <div style={{ width: '100%', height: 180, background: '#f0f0f0', animation: 'shimmer 1.5s infinite', borderTopLeftRadius: '0.6em', borderTopRightRadius: '0.6em' }} />
              <div className={styles.padding}>
                <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, marginBottom: 8, animation: 'shimmer 1.5s infinite' }} />
                <div style={{ height: 10, background: '#f0f0f0', borderRadius: 4, width: '80%', animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            {blogTrack.map((card, i) => (
              <a
                key={`${card.id}-${i}`}
                className={styles.blogOne}
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
              >
                {card.imageUrl ? (
                  <img
                    className={styles.image}
                    src={card.imageUrl}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div style={{ width: '100%', height: 180, background: '#f0f0f0', borderTopLeftRadius: '0.6em', borderTopRightRadius: '0.6em', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.8em' }}>
                    No image
                  </div>
                )}
                <div className={styles.padding}>
                  <p style={{ fontSize: '0.7em', color: '#aaa', margin: '0 0 0.3em' }}>{card.date}</p>
                  <div className={styles.discover}>{card.title}</div>
                  <div className={styles.explore}>{card.excerpt}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <img className={styles.swiper} src={swiper} alt="swiper" />
    </section>
    </motion.div>
  )
}
