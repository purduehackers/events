import { GetStaticPaths } from 'next'
import { marked } from 'marked'
import { fetchEvents } from '../lib/fetchEvents'
import UpcomingEvent from '../components/upcoming-event'
import { past } from '../lib/past'
import PastEvent from '../components/past-event'

const Slug = ({ event }: { event: PHEvent }) =>
  past(event.start) && event.hasPastEventDesc ? (
    <PastEvent event={event} />
  ) : (
    <UpcomingEvent event={event} />
  )

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await fetchEvents()
  const paths = events.map((event) => ({
    params: { slug: event.slug }
  }))

  return { paths, fallback: 'blocking' }
}

type Params = {
  params: {
    slug: string
  }
}

export const getStaticProps = async ({ params }: Params) => {
  const { slug } = params
  const event = await fetchEvents().then((events: Array<PHEvent>) =>
    events.find((event: PHEvent) => event.slug === slug)
  )
  if (!event) {
    return { notFound: true }
  }

  event.desc = marked(event.desc)
    .replace(new RegExp('</p>\n<p>', 'g'), '</p><br/><p>')
    .replace(new RegExp('<a', 'g'), '<a class="desc" target="_blank"')
    .replace(new RegExp('<img', 'g'), '<img class="rounded-lg max-w-xs" ')

  event.pastEventDesc = marked(event.pastEventDesc)
    .replace(new RegExp('</p>\n<p>', 'g'), '</p><br/><p>')
    .replace(new RegExp('<a', 'g'), '<a class="desc" target="_blank"')

  return { props: { event }, revalidate: 10 }
}

export default Slug
