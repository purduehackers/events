import { orderBy } from 'lodash'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp } from 'react-feather'

import EventCard from '../components/event-card'
import Footer from '../components/footer'
import FooterLinks from '../components/footer-links'
import Nav from '../components/nav'
import StyledLink from '../components/styled-link'
import { fetchEvents } from '../lib/fetchEvents'
import { discord } from '../lib/footerPonderings'
import { useLocalState } from '../lib/hooks/use-local-state'
import useMediaQuery from '../lib/hooks/use-media-query'
import { past } from '../lib/past'

const Index = ({ events }: { events: Array<HomepageEvent> }) => {
  const upcomingEvents = events.filter(
    (event: HomepageEvent) => !past(event.start) && !event.unlisted
  )
  const pastEvents = orderBy(
    events.filter(
      (event: HomepageEvent) => past(event.start) && !event.unlisted
    ),
    'end',
    'desc'
  )

  const smallScreenSize = useMediaQuery('(max-width:768px)')
  const multiple = smallScreenSize ? 4 : 8

  const [_pastEventNum, setPastEventNum] = useLocalState('eventNum', multiple)
  const pastEventNum = +_pastEventNum
  const [isMaxLength, setIsMaxLength] = useState(false)
  const [discordFlavor, setDiscordFlavor] = useState('')

  useEffect(() => {
    setDiscordFlavor(discord[Math.floor(Math.random() * discord.length)])
    setIsMaxLength(pastEventNum >= pastEvents.length)
  }, [pastEventNum, pastEvents.length])

  return (
    <div className="min-h-screen overflow-hidden flex flex-col font-title dark:bg-gray-900">
      <Head>
        <meta property="og:site_name" content="Purdue Hackers" />
        <meta property="og:name" content="Events — Purdue Hackers" />
        <meta property="og:title" content="Events — Purdue Hackers" />
        <meta
          property="og:image"
          content="https://og.purduehackers.com/Events.png?theme=light&md=1&fontSize=300px&caption="
        />
        <meta
          property="og:description"
          content="Check out & sign up for upcoming events from Purdue Hackers."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <title>Events — Purdue Hackers</title>
      </Head>

      <Nav noSticky={true} />

      <div className="flex flex-col items-center justify-top mt-0 grow-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
        <div className="mt-8 sm:mt-16">
          <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-amber-450 dark:text-amber-500">
            Purdue Hackers Events
          </h1>
          <p className="mt-3 text-lg sm:text-2xl">
            Check out & sign up for upcoming events from{' '}
            <StyledLink destination="https://purduehackers.com" newTab>
              Purdue Hackers
            </StyledLink>
            .
          </p>
        </div>
      </div>
      {Object.keys(upcomingEvents).length !== 0 && (
        <div className="container flex flex-col py-8 sm:pt-14 px-5 sm:px-20 text-left gap-y-4 lg:max-w-screen-2xl mx-auto">
          <h1
            className={`text-3xl sm:text-4xl font-bold ml-1 ${
              Object.keys(upcomingEvents).length === 0 ? 'hidden' : ''
            }`}
          >
            Upcoming events
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:auto-cols-fr text-center">
            {Object.keys(upcomingEvents).map((key: string, i: number) => (
              <EventCard key={key} {...upcomingEvents[i]} />
            ))}
          </div>
        </div>
      )}
      {Object.keys(upcomingEvents).length === 0 && (
        <div className="container py-8 sm:pt-14 sm:pb-0 mx-auto px-4 sm:px-36 lg:px-72 xl:px-96">
          <div className="rounded-lg shadow-lg dark:shadow-black/25 bg-amber-400 dark:bg-amber-500 dark:text-black p-4 flex flex-col justify-center gap-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              Coming soon...
            </h2>
            <p>
              There aren&apos;t currently any events that we&apos;re ready to
              announce. We&apos;re working hard though—check back soon!
            </p>
            <p>
              {discordFlavor}{' '}
              <span>
                <StyledLink
                  destination="https://bit.ly/PurdueHackersDiscord"
                  color="hover:text-neutral-700 transition underline"
                  newTab
                >
                  Join our Discord!
                </StyledLink>
              </span>
            </p>
          </div>
        </div>
      )}
      <div className="container flex flex-col mb-14 sm:pt-14 px-5 sm:px-20 text-left gap-y-4 lg:max-w-screen-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold ml-1">Past events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:auto-cols-fr text-center">
          {Object.keys(pastEvents)
            .slice(0, pastEventNum)
            .map((key: string, i: number) => (
              <EventCard key={key} {...pastEvents[i]} />
            ))}
        </div>
        <button
          className="rounded-lg mx-auto py-2 px-2 font-bold dark:text-gray-200 text-xl shadow-md dark:shadow-black/25 border-solid border-2 border-amber-400 dark:border-amber-500 p-2 text-center hover:scale-105 transform transition"
          onClick={() => {
            if (isMaxLength) {
              setPastEventNum(multiple)
              setIsMaxLength(false)
            } else {
              if (pastEventNum + multiple >= pastEvents.length) {
                setIsMaxLength(true)
              }
              setPastEventNum(pastEventNum + multiple)
            }
          }}
        >
          {!isMaxLength ? (
            <div className="flex flex-row gap-x-1 items-center ml-1">
              <p>Show more</p>
              <ArrowDown strokeWidth={3} />
            </div>
          ) : (
            <div className="flex flex-row gap-x-1 items-center ml-1">
              <p>Show less</p>
              <ArrowUp strokeWidth={3} />
            </div>
          )}
        </button>
      </div>
      <Footer>
        <p>
          Made with 💛 •{' '}
          <span className="underline underline-offset-4 decoration-2">
            <a
              href="https://github.com/purduehackers/events"
              target="_blank"
              className="decoration-amber-400 dark:decoration-amber-500 hover:decoration-[3px]"
            >
              Open source
            </a>
          </span>{' '}
          •{' '}
          <span className="underline underline-offset-4 decoration-2">
            <a
              href="https://vercel.com?utm_source=purdue-hackers&utm_campaign=oss"
              target="_blank"
              className="decoration-amber-400 dark:decoration-amber-500 hover:decoration-[3px]"
            >
              Powered by ▲Vercel.
            </a>
          </span>
        </p>
        <FooterLinks />
      </Footer>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const events = await fetchEvents()
  const filteredEvents = events.map((event) => ({
    name: event.name,
    start: event.start,
    end: event.end,
    unlisted: event.unlisted,
    slug: event.slug,
  }))

  return {
    props: { events: filteredEvents },
    revalidate: 10,
  }
}

export default Index
