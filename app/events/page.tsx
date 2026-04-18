import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import EventsClient from './EventsClient'

export const metadata = {
  title: 'Lenawee County Events | The Coe Lab',
  description: 'Discover events, activities, and happenings in Lenawee County, Michigan',
}

export default function EventsPage() {
  return (
    <>
      <Navigation currentPath="/events" />
      <EventsClient />
      <Footer />
    </>
  )
}