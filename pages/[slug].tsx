import Head from 'next/head'
import { GetStaticPaths } from 'next'
import { Clock, MapPin, Calendar } from 'react-feather'
import { marked } from 'marked'
import tt from 'tinytime'
import RSVPForm from '../components/rsvp-form'
import StyledLink from '../components/styled-link'
import Footer from '../components/footer'
import { fetchEvents } from '../lib/fetchEvents'
import { past } from '../lib/past'
import ponderings from '../lib/footerPonderings'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import FooterLinks from '../components/footer-links'
import Nav from '../components/nav'

const Slug = ({ event }: { event: PHEvent }) => {
  const router = useRouter()
  const [pondering, setPondering] = useState('')

  useEffect(() => {
    if (router.isReady) {
      setPondering(ponderings[Math.floor(Math.random() * ponderings.length)])
    }
  })

  return (
    <div className="min-h-screen pb-40 overflow-hidden block relative font-title dark:bg-gray-900">
      <Head>
        <title>{event.name} — Purdue Hackers</title>
      </Head>

      <Nav />

      <div className="flex flex-col items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
        <div className="mt-8 sm:mt-16">
          <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-amber-450 dark:text-amber-500">
            {event.name}
          </h1>
          <p className="mt-3 text-1xl sm:text-2xl flex flex-row gap-x-1 font-bold items-center justify-center dark:text-gray-200">
            <Clock />
            {event.start === 'TBD'
              ? 'Date TBD'
              : tt(
                  `${
                    past(event.end)
                      ? '{MM} {Do}, {YYYY}'
                      : '{dddd}, {MM} {Do} •'
                  }`
                ).render(new Date(event.start))}{' '}
            {event.start === 'TBD'
              ? ''
              : tt('{h}:{mm}').render(new Date(event.start)) + '—'}
            {event.end === 'TBD'
              ? ''
              : tt('{h}:{mm} {a}').render(new Date(event.end))}
          </p>
          <p className="mt-1 text-1xl sm:text-2xl flex flex-row gap-x-1 items-center justify-center dark:text-gray-200">
            <MapPin />
            <strong>
              {event.loc === 'TBD' ? (
                'Location TBD'
              ) : event.gMap ? (
                <StyledLink destination={event.gMap} newTab>
                  {event.loc}
                </StyledLink>
              ) : (
                event.loc
              )}
            </strong>
          </p>
        </div>
      </div>
      <div className="container mx-auto p-8 px-4 md:px-16 lg:px-72 xl:px-96">
        <div className="border-2 border-dashed rounded-lg p-4 border-amber-400 dark:border-amber-500">
          <div
            dangerouslySetInnerHTML={{ __html: event.desc }}
            className="text-l"
          />
          <div
            className={`pt-5 w-max ${
              event.calLink === undefined ||
              event.loc === 'TBD' ||
              past(event.end)
                ? 'hidden'
                : ''
            }`}
          >
            <a
              href={event.calLink}
              target="_blank"
              className="flex flex-row gap-x-1 rounded-lg shadow-md dark:shadow-black bg-amber-400 dark:bg-amber-500 p-2 text-center hover:scale-105 transform transition font-bold text-black dark:text-black"
            >
              <Calendar color="black" />
              Add to Google Calendar
            </a>
          </div>
        </div>
      </div>
      <div
        className={`container mx-auto px-4 mb-8 md:px-16 lg:px-72 xl:px-96
      ${
        event.calLink === undefined || event.loc === 'TBD' || past(event.end)
          ? 'hidden'
          : ''
      }`}
      >
        <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-top gap-y-1">
          <h2 className="font-bold text-2xl dark:text-white dark:font-extrabold">
            RSVP for this event
          </h2>
          <p>
            Enter your email and we'll send you reminder about the event the day
            before it happens. We won't use your email for anything else.
          </p>
          <RSVPForm eventName={event.name} slug={event.slug}></RSVPForm>
        </div>
      </div>
      <div
        className={`container mx-auto px-4 mb-8 md:px-16 lg:px-72 xl:px-96
      ${past(event.end) ? '' : 'hidden'}`}
      >
        <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-top">
          <h2 className="font-bold text-xl sm:text-2xl line-through">
            RSVP for this event
          </h2>
          <p className="mt-2">
            This event already happened...but check out{' '}
            <StyledLink destination="/">
              the events we're going to run in the future
            </StyledLink>
            !
          </p>
        </div>
      </div>
      <footer
        className={pondering.includes('stargazing') ? 'whitespace-pre' : ''}
      >
        <Footer>
          <p>{pondering}</p>
          <FooterLinks />
        </Footer>
      </footer>
    </div>
  )
}

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

  // @ts-ignore
  event.desc = marked(event.desc)
    .replace(new RegExp('</p>\n<p>', 'g'), '</p><br/><p>')
    .replace(new RegExp('<a', 'g'), '<a class="desc" target="_blank"')

  return { props: { event }, revalidate: 10 }
}

export default Slug
