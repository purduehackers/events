import Head from 'next/head'
import { Clock, MapPin, Calendar } from 'react-feather'
import tt from 'tinytime'
import RSVPForm from './rsvp-form'
import StyledLink from './styled-link'
import Footer from './footer'
import { past } from '../lib/past'
import { footer } from '../lib/footerPonderings'
import { useEffect, useState } from 'react'
import FooterLinks from './footer-links'
import Nav from './nav'
import { formatDate } from '../lib/formatDate'
import VercelBanner from './vercel-banner'
import DescriptionBox from './desc-box'

const UpcomingEvent = ({ event }: { event: PHEvent }) => {
  const [pondering, setPondering] = useState('')

  useEffect(() => {
    setPondering(footer[Math.floor(Math.random() * footer.length)])
  }, [])

  const ogUrl = `https://og.purduehackers.com/${event.name.replace(
    new RegExp(' ', 'g'),
    '%20'
  )}.png?theme=light&md=1&fontSize=${
    event.name.length < 30 ? '250' : '200'
  }px&caption=${
    event.start !== 'TBD'
      ? tt('{MM}%20{DD}%20•').render(
          formatDate(new Date(event.start), 'America/Indianapolis')
        )
      : ''
  }%20${event.loc.replace(new RegExp(' ', 'g'), '%20')}`

  return (
    <div className="min-h-screen overflow-hidden flex flex-col font-title dark:bg-gray-900">
      <Head>
        <meta property="og:site_name" content="Purdue Hackers" />
        <meta property="og:name" content={`${event.name} — Purdue Hackers`} />
        <meta property="og:title" content={`${event.name} — Purdue Hackers`} />
        <meta property="og:image" content={ogUrl} />
        <meta
          property="og:description"
          content={`Check out & sign up for ${event.name}, an upcoming event from Purdue Hackers.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <title>{event.name} — Purdue Hackers</title>
      </Head>

      <Nav />

      <div className="flex flex-col grow-0 items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
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
      <div className="flex flex-col flex-auto">
        <DescriptionBox>
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
        </DescriptionBox>
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
              Enter your email and we'll send you a reminder about the event the
              day before it happens. We won't use your email for anything else.
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
      </div>
      <footer
        className={pondering.includes('stargazing') ? 'whitespace-pre' : ''}
      >
        <Footer>
          <p>{pondering}</p>
          <FooterLinks />
          <div className="m-auto">
            <a
              href="https://vercel.com?utm_source=purduehackers&utm_campaign=oss"
              target="_blank"
            >
              <img src="https://raw.githubusercontent.com/purduehackers/events/main/public/powered-by-vercel.svg" />
            </a>
          </div>
        </Footer>
      </footer>
    </div>
  )
}

export default UpcomingEvent
