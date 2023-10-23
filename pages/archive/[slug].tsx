import { marked } from 'marked'
import { GetStaticPaths } from 'next'

import UpcomingEvent from '../../components/upcoming-event'
import { fetchEvents } from '../../lib/fetchEvents'
import { past } from '../../lib/past'

const Slug = ({ event }: { event: PHEvent }) => <UpcomingEvent event={event} />

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await fetchEvents()
  const paths = events
    .filter((event) => past(event.start))
    .map((event) => ({
      params: { slug: event.slug },
    }))

  return { paths, fallback: false }
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

  return { props: { event }, revalidate: 10 }
}

export default Slug
