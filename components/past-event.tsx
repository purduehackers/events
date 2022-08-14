import tt from 'tinytime'
import Head from 'next/head'
import { Clock } from 'react-feather'
import { formatDate } from '../lib/formatDate'
import Nav from './nav'
import Footer from './footer'
import FooterLinks from './footer-links'
import VercelBanner from './vercel-banner'
import ImageGrid from './image-grid'
import Subhead from './subhead'
import StatsCard from './stats-card'
import { useEffect, useState } from 'react'
import { footer } from '../lib/footerPonderings'

const PastEvent = ({ event }: { event: PHEvent }) => {
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

  const [pondering, setPondering] = useState('')

  useEffect(() => {
    setPondering(footer[Math.floor(Math.random() * footer.length)])
  }, [])

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
          <meta property="og:image" content={ogUrl} />
          <meta
            property="og:description"
            content={`${event.name}: a past event from Purdue Hackers.`}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:type" content="website" />
          <title>{event.name} — Purdue Hackers</title>
        </Head>

        <div className="flex flex-col grow-0 items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
          <div className="mt-8 sm:mt-16">
            <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-amber-400 dark:text-amber-500">
              {event.name}
            </h1>
            <p className="mt-3 text-1xl sm:text-2xl flex flex-row gap-x-1 font-bold items-center justify-center dark:text-gray-200">
              <Clock />
              {event.start === 'TBD'
                ? 'Date TBD'
                : tt('{MM} {Do}, {YYYY} •').render(new Date(event.start))}{' '}
              {event.start === 'TBD'
                ? ''
                : tt('{h}:{mm}').render(new Date(event.start)) + '—'}
              {event.end === 'TBD'
                ? ''
                : tt('{h}:{mm} {a}').render(new Date(event.end))}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 sm:px-20">
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
                You'll also get access to a wonderful, friendly community of
                hackers who are building & shipping cool things every day.
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
