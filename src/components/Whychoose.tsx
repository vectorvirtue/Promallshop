import { useEffect, useState } from 'react'
import styles from './Whychoose.module.css'
import {
  promallCombinedApi,
  type PromallSection2,
  type PromallCombinedResponse,
} from '../lib/api'

function splitParagraphs(text: string): string[] {
  return text.split(/\r?\n\s*\r?\n/).map(paragraph => paragraph.trim()).filter(Boolean)
}

export default function Choose() {
  const [content, setContent] = useState<PromallSection2 | null>(null)

  useEffect(() => {
    let cancelled = false

    promallCombinedApi.getAll<PromallCombinedResponse>()
      .then((response) => {
        const section = response.promallsection2
        if (!section || ![section.title, section.subtitle, section.description]
          .every(value => typeof value === 'string' && value.trim())) return

        const subsections = Array.isArray(section.subsections)
          ? section.subsections
              .filter(item => item && typeof item.title === 'string' && item.title.trim()
                && typeof item.description === 'string' && item.description.trim())
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          : []

        if (!cancelled) setContent({ ...section, subsections })
      })
      .catch((cause: unknown) => {
        console.error('Failed to load equipment guide:', cause)
      })

    return () => { cancelled = true }
  }, [])

  if (!content) return null

  return (
    <section className={styles.container} aria-labelledby="equipment-range-title">
      <div className={styles.introduction}>
        <p className={styles.eyebrow}>{content.title}</p>
        <h2 id="equipment-range-title">{content.subtitle}</h2>
        {splitParagraphs(content.description).map((paragraph, index) => (
          <p className={styles.intro} key={index}>{paragraph}</p>
        ))}
      </div>

      {content.subsections.length > 0 && (
        <div className={styles.sections}>
          {content.subsections.map((subsection, index) => (
            <article key={subsection.id} className={styles.category}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{subsection.title}</h3>
              <div className={styles.copy}>
                {splitParagraphs(subsection.description).map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
