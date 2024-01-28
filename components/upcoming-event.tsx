import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin } from 'react-feather'

import { footer } from '../lib/footerPonderings'
import { formatDate, startTimeFormatString } from '../lib/formatDate'
import { past } from '../lib/past'
import { ogUrl } from '../lib/utils'
import DescriptionBox from './desc-box'
import Footer from './footer'
import FooterLinks from './footer-links'
import Nav from './nav'
import RSVPForm from './rsvp-form'
import StyledLink from './styled-link'
import VercelBanner from './vercel-banner'

const UpcomingEvent = ({ event }: { event: PHEvent }) => {
  const [pondering, setPondering] = useState('')

  useEffect(() => {
    setPondering(footer[Math.floor(Math.random() * footer.length)])
  }, [])

  const title = `${event.name} — Purdue Hackers`

  return (
    <>
      <Nav />
      <div className="min-h-screen overflow-hidden flex flex-col font-title dark:bg-gray-900">
        <Head>
          <meta property="og:site_name" content="Purdue Hackers" />
          <meta property="og:name" content={`${event.name} — Purdue Hackers`} />
          <meta
            property="og:title"
            content={`${event.name} — Purdue Hackers`}
          />
          <meta property="og:image" content={ogUrl(event)} />
          <meta
            property="og:description"
            content={
              event.ogDescription === ''
                ? `Check out & sign up for ${event.name}, an upcoming event from Purdue Hackers.`
                : event.ogDescription
            }
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:type" content="website" />
          <title>{title}</title>
        </Head>

        <div className="flex flex-col grow-0 items-center justify-top w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
          <div className="mt-20 sm:mt-28">
            <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-amber-450 dark:text-amber-500">
              {event.name}
            </h1>
            <p className="mt-3 text-1xl sm:text-2xl flex flex-row gap-x-1 font-bold items-center justify-center dark:text-gray-200">
              <Clock />
              {event.start === 'TBD'
                ? 'Date TBD'
                : formatDate(
                    new Date(event.start),
                    `${past(event.start) ? 'LLL do, y •' : 'EEEE, LLL do •'}`
                  )}{' '}
              {event.start === 'TBD'
                ? ''
                : formatDate(
                    new Date(event.start),
                    startTimeFormatString(event.start, event.end)
                  ) + '—'}
              {event.end === 'TBD'
                ? '???'
                : formatDate(new Date(event.end), 'h:mm a')}
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
                past(event.start) ||
                typeof event.calLink !== 'string'
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
            className={`container mx-auto px-4 mb-8 md:px-16 lg:px-64 xl:px-96
      ${
        event.calLink === undefined || event.loc === 'TBD' || past(event.start)
          ? 'hidden'
          : ''
      }`}
          >
            <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-top gap-y-1">
              <h2 className="font-bold text-2xl dark:text-white dark:font-extrabold">
                RSVP for this event
              </h2>
              <p>
                Enter your email and we&apos;ll send you a reminder about the
                event the day before it happens. We won&apos;t use your email
                for anything else.
              </p>
              <RSVPForm eventName={event.name} slug={event.slug}></RSVPForm>
            </div>
          </div>
          <div
            className={`container mx-auto px-4 mb-8 md:px-16 lg:px-72 xl:px-96
      ${past(event.start) ? '' : 'hidden'}`}
          >
            <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-top">
              <h2 className="font-bold text-xl sm:text-2xl line-through">
                RSVP for this event
              </h2>
              <p className="mt-2">
                This event already happened...but check out{' '}
                <StyledLink destination="/">
                  the events we&apos;re going to run in the future
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
            <VercelBanner />
          </Footer>
        </footer>
      </div>
    </>
  )
}

export default UpcomingEvent
