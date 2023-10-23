import { marked } from 'marked'
import { GetStaticPaths } from 'next'

import PastEvent from '../components/past-event'
import UpcomingEvent from '../components/upcoming-event'
import { fetchEvents } from '../lib/fetchEvents'
import { past } from '../lib/past'

const Slug = ({ event }: { event: PHEvent }) =>
  past(event.start) && event.hasPastEventDesc ? (
    <PastEvent event={event} />
  ) : (
    <UpcomingEvent event={event} />
  )

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await fetchEvents()
  const paths = events.map((event) => ({
    params: { slug: event.slug },
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
    .replace(
      new RegExp('<hr', 'g'),
      '<hr class="rounded border-2 border-amber-400 dark:border-amber-500 w-1/2 mx-auto my-4"'
    )

  event.pastEventDesc = marked(event.pastEventDesc)
    .replace(new RegExp('</p>\n<p>', 'g'), '</p><br/><p>')
    .replace(new RegExp('<a', 'g'), '<a class="desc" target="_blank"')
    .replace(
      new RegExp('<hr', 'g'),
      '<hr class="rounded border-2 border-amber-400 dark:border-amber-500 w-1/2 mx-auto my-4"'
    )

  return { props: { event }, revalidate: 10 }
}

export default Slug
