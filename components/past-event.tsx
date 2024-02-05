import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Clock } from 'react-feather'

import { footer } from '../lib/footerPonderings'
import { formatDate, startTimeFormatString } from '../lib/formatDate'
import { ogUrl } from '../lib/utils'
import Footer from './footer'
import FooterLinks from './footer-links'
import ImageGrid from './image-grid'
import Nav from './nav'
import StatsCard from './stats-card'
import Subhead from './subhead'
import VercelBanner from './vercel-banner'

const PastEvent = ({ event }: { event: PHEvent }) => {
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
            content={`Learn what happened at ${event.name}, an event from Purdue Hackers.`}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:type" content="website" />
          <title>{title}</title>
        </Head>

        <div className="flex flex-col grow-0 items-center justify-top w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
          <div className="mt-20 sm:mt-28">
            <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-amber-400 dark:text-amber-500">
              {event.name}
            </h1>
            <p className="mt-3 text-1xl sm:text-2xl flex flex-row gap-x-1 font-bold items-center justify-center dark:text-gray-200">
              <Clock />
              {event.start === 'TBD'
                ? 'Date TBD'
                : formatDate(new Date(event.start), 'LLL do, Y •')}{' '}
              {event.start === 'TBD'
                ? ''
                : formatDate(
                    new Date(event.start),
                    startTimeFormatString(event.start, event.end)
                  ) + '—'}
              {event.end === 'TBD'
                ? ''
                : formatDate(new Date(event.end), 'h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 sm:px-20 mb-auto">
          <div
            className={`flex flex-col ${
              event.recapImages.length > 1
                ? 'sm:flex-row-reverse sm:items-start'
                : 'sm:flex-col sm:items-center'
            } sm:gap-x-4 items-center`}
          >
            <StatsCard event={event} />
            <div className="sm:max-w-lg md:max-w-xl">
              <div className="flex flex-col justify-items-center sm:justify-items-end">
                <div
                  className={`mx-4 mt-4 ${
                    event.recapImages.length > 1 ? 'sm:mx-0 sm:mt-0' : ''
                  } mb-4 sm:w-fit`}
                >
                  <div className="border-2 border-dashed rounded-lg p-4 border-amber-400 dark:border-amber-500">
                    <div
                      dangerouslySetInnerHTML={{ __html: event.pastEventDesc }}
                      className="text-l"
                    />
                  </div>
                </div>
                {event.recapImages.length > 1 && (
                  <ImageGrid images={event.recapImages} />
                )}
              </div>
            </div>
          </div>
          <div className="mt-16 mx-4 sm:mx-auto sm:max-w-md md:max-w-lg">
            <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-center gap-y-3">
              <Subhead>Want to see more like this?</Subhead>
              <p>
                Purdue Hackers runs events nearly every week. If you want to be
                the first to find out about new events, you should join our
                Discord.
              </p>
              <p>
                You&apos;ll also get access to a wonderful, friendly community
                of hackers who are building & shipping cool things every day.
              </p>
              <a
                href="https://bit.ly/PurdueHackersDiscord"
                className="font-bold text-white text-center"
                target="_blank"
              >
                <div className="rounded-lg shadow-md dark:shadow-black/25 bg-blue-discord p-2 px-4 text-center hover:scale-105 transform transition">
                  Join Discord
                </div>
              </a>
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

export default PastEvent
