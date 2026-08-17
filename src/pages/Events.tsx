import { Helmet } from 'react-helmet-async'
import EventsComponent from '../components/Events'

export default function Events() {
  return (
    <>
      <Helmet>
        <title>Events - Technology Events & Webinars | Promallshop</title>
        <meta name="description" content="Join Promallshop at upcoming technology events, webinars, product launches, and training sessions. Stay updated with the latest in tech." />
      </Helmet>
      <EventsComponent />
    </>
  )
}
