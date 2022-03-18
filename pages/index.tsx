import Head from 'next/head'
import Event from '../components/event'
import Footer from '../components/footer'
import StyledLink from '../components/styled-link'
import { GetStaticProps } from 'next'
import { orderBy } from 'lodash'
import { fetchEvents } from '../lib/fetchEvents'
import { past } from '../lib/past'
import FooterLinks from '../components/footer-links'
import Nav from '../components/nav'
import { useEffect, useState } from 'react'

const Index = ({ events }: { events: Array<PHEvent> }) => {
  const upcomingEvents = events.filter(
    (event: PHEvent) => !past(event.end) && !event.unlisted
  )
  const pastEvents = orderBy(
    events.filter((event: PHEvent) => past(event.end) && !event.unlisted),
    'end',
    'desc'
  )

  const [smallScreenSize, setSmallScreenSize] = useState(false)
  const [pastEventNum, setPastEventNum] = useState(8)
  const [isMaxLength, setIsMaxLength] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 768) {
      setPastEventNum(4)
      setSmallScreenSize(true)
    }
  }, [])

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

      <Nav />

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
              <Event key={key} {...upcomingEvents[i]} />
            ))}
          </div>
        </div>
      )}
      {Object.keys(upcomingEvents).length === 0 && (
        <div className="container py-8 sm:pt-14 sm:pb-0 mx-auto px-4 md:px-16 lg:px-72 xl:px-96">
          <div className="rounded-lg shadow-lg dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-center gap-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              More events coming soon…
            </h2>
            <p>
              There aren't currently any events that we're ready to announce.
              We're working hard though—check back soon!
            </p>
            <p>
              Want to be the first to hear about new events?{' '}
              <span>
                <StyledLink
                  destination="https://bit.ly/PurdueHackersDiscord"
                  color="text-blue-discord hover:text-blue-discord-light"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:auto-cols-fr text-center">
          {Object.keys(pastEvents)
            .slice(0, pastEventNum)
            .map((key: string, i: number) => (
              <Event key={key} {...pastEvents[i]} />
            ))}
        </div>
        <button
          className="rounded-lg dark:text-black w-3/4 sm:w-1/5 mx-auto py-3 font-bold text-xl shadow-md dark:shadow-black/25 bg-amber-400 dark:bg-amber-500 p-2 px-4 text-center hover:scale-105 transform transition"
          onClick={() => {
            const multiple = smallScreenSize ? 4 : 8

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
          {isMaxLength ? 'Show Less' : 'Show More'}
        </button>
      </div>
      <Footer>
        <p>
          Made with 💛 by the{' '}
          <StyledLink destination="https://purduehackers.com" newTab>
            Purdue Hackers
          </StyledLink>{' '}
          organizing team.
        </p>
        <FooterLinks />
      </Footer>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const events = await fetchEvents()

  return {
    props: { events },
    revalidate: 10
  }
}

export default Index
