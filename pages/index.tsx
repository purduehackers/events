import Head from 'next/head'
import Event from '../components/event'
import Footer from '../components/footer'
import StyledLink from '../components/styled-link'
import ThemeButton from '../components/theme-button'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import { orderBy } from 'lodash'
import { fetchEvents } from '../lib/fetchEvents'
import { past } from '../lib/past'
import { useTheme } from 'next-themes'
import FooterLinks from '../components/footer-links'

const Index = ({ events }: { events: Array<PHEvent> }) => {
  const { resolvedTheme } = useTheme()
  const upcomingEvents = events.filter(
    (event: PHEvent) => !past(event.end) && !event.unlisted
  )
  const pastEvents = orderBy(
    events.filter((event: PHEvent) => past(event.end) && !event.unlisted),
    'end',
    'desc'
  )

  return (
    <div className="min-h-screen pb-36 overflow-hidden block relative font-title dark:bg-gray-900">
      <Head>
        <title>Events — Purdue Hackers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-row bg-gray-100 dark:bg-gray-800">
        {resolvedTheme && <ThemeButton />}
      </div>

      <div className="flex flex-col items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
        <div className="mt-8 sm:mt-16">
          <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-amber-450 dark:text-amber-500">
            Purdue Hackers Events
          </h1>
          <p className="mt-3 text-lg sm:text-2xl">
            Check out & sign up for{' '}
            <StyledLink destination="https://purduehackers.com" newTab>
              Purdue Hackers
            </StyledLink>
            {"' "}
            upcoming events.
          </p>
        </div>
      </div>
      <div className="flex flex-col p-8 sm:pt-14 px-5 sm:px-20 text-left gap-y-4 lg:max-w-screen-2xl mx-auto">
        <h1
          className={`text-3xl sm:text-4xl font-bold ml-1 ${
            Object.keys(upcomingEvents).length === 0 ? 'hidden' : ''
          }`}
        >
          Upcoming events
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:auto-cols-fr text-center">
          {Object.keys(upcomingEvents).map((key: string, i: number) => (
            <Event
              key={key}
              name={upcomingEvents[i].name}
              slug={upcomingEvents[i].slug}
              start={upcomingEvents[i].start}
              end={upcomingEvents[i].end}
            />
          ))}
        </div>
      </div>
      {Object.keys(upcomingEvents).length === 0 && (
        <div className="container mx-auto -mt-10 px-4 md:px-16 lg:px-72 xl:px-96">
          <div className="rounded-lg shadow-lg dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-center gap-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              More events coming soon...
            </h1>
            <p>
              There aren't currently any events that we're ready to announce.
              We're working hard though—check back soon though!
            </p>
            <p>
              Want to be the first to hear about new events?{' '}
              <span>
                <StyledLink
                  destination="https://bit.ly/PurdueHackersDiscord"
                  color="text-blue-discord hover:text-blue-discord-light"
                  newTab
                >
                  Hop in our Discord!
                </StyledLink>
              </span>
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col p-8 sm:pt-14 px-5 sm:px-20 text-left gap-y-4 lg:max-w-screen-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold ml-1">Past events</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:auto-cols-fr text-center">
          {Object.keys(pastEvents).map((key: string, i: number) => (
            <Event
              key={key}
              name={pastEvents[i].name}
              slug={pastEvents[i].slug}
              start={pastEvents[i].start}
              end={pastEvents[i].end}
            />
          ))}
        </div>
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
