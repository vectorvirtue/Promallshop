import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import styles from './Events.module.css'
import Breadcrumb from './Breadcrumb'
import { promallCombinedApi } from '../lib/api'

interface Event {
  id: number
  title: string
  event_datetime: string
  location: string
  description: string
  image: string
  registration_link: string
  event_type: string
  event_type_name: string
  is_online: boolean
}

interface ApiEvent {
  id: number
  name: string
  description: string
  event_datetime: string
  location: string
  event_type?: { name: string; slug: string }
  image: string
  registration_link: string
}

interface ApiEventType {
  name: string
  slug: string
  display_order?: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] as any },
  }),
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [eventTypes, setEventTypes] = useState<ApiEventType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  useEffect(() => {
    promallCombinedApi.getAll<{
      event_types?: ApiEventType[]
      upcoming_events?: ApiEvent[]
    }>()
      .then((data) => {
        const types: ApiEventType[] = Array.isArray(data.event_types) ? data.event_types : []
        setEventTypes(types.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)))

        const upcoming: ApiEvent[] = Array.isArray(data.upcoming_events) ? data.upcoming_events : []
        setEvents(upcoming.map((event) => ({
          id: event.id,
          title: event.name,
          event_datetime: event.event_datetime,
          location: event.location,
          description: event.description,
          image: event.image,
          registration_link: event.registration_link,
          event_type: event.event_type?.slug ?? '',
          event_type_name: event.event_type?.name ?? '',
          is_online: event.event_type?.slug === 'online',
        })))
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredEvents = activeFilter === 'all' 
    ? events 
    : events.filter(e => e.event_type === activeFilter)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  const filters = [
    { value: 'all', label: 'All Events' },
    ...eventTypes.map((type) => ({ value: type.slug, label: type.name })),
  ]

  return (
    <>
      <Breadcrumb items={[{ label: 'Events' }]} />
      <section className={styles.section}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.title}>Upcoming Events</h2>
        <p className={styles.subtitle}>Join us at our latest technology events, webinars, and training sessions</p>
      </motion.div>

      {/* Filter Buttons */}
      <div className={styles.filters}>
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterBtn} ${activeFilter === filter.value ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card} style={{ overflow: 'hidden' }}>
              <div className={styles.cardImage} style={{ background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ padding: '1.5em', display: 'flex', flexDirection: 'column', gap: '0.8em' }}>
                <div style={{ height: 16, borderRadius: 6, background: '#f0f0f0', width: '70%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '50%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '60%', animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className={styles.empty}>
          <Calendar size={48} />
          <p>No events found</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              className={styles.card}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <div className={styles.cardImage}>
                <img src={event.image} alt={event.title} onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=Event'
                }} />
                {event.is_online && (
                  <span className={styles.onlineBadge}>Online</span>
                )}
              </div>

              <div className={styles.cardContent}>
                <span className={styles.eventType}>
                  {event.event_type_name.toUpperCase()}
                </span>
                
                <h3 className={styles.eventTitle}>{event.title}</h3>
                
                <p className={styles.eventDescription}>{event.description}</p>

                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={16} />
                    <span>{formatDate(event.event_datetime)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={16} />
                    <span>{formatTime(event.event_datetime)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                </div>

                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.registerBtn}
                >
                  Register Now
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </section>
    </>
  )
}
