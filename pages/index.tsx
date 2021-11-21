import Head from 'next/head'
import { server } from '../config'
import Event from '../components/event'
import Footer from '../components/footer'
import StyledLink from '../components/styled-link'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import { orderBy } from 'lodash'

const Home = ({ events }) => {
  const past = dt => new Date(dt) < new Date()
  const upcomingEvents = events.filter(event => !past(event.end))
  const pastEvents = orderBy(events.filter(event => past(event.end)), 'end', 'desc')

  return (
    <div className="min-h-screen pb-32 overflow-hidden block relative font-title">
      <Head>
        <title>Events — Purdue Hackers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100">
        <div className="mt-8 sm:mt-16">
          <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-yellow-400">
            Purdue Hackers Events
          </h1>
          <p className="mt-3 text-lg sm:text-2xl">
            Check out & sign up for{' '}<StyledLink destination="https://purduehackers.com" newTab>
              Purdue Hackers
            </StyledLink>{'\' '}
            upcoming events.
          </p>
        </div>
      </div>
      <div className="flex flex-col p-8 sm:pt-14 px-5 sm:px-20 text-left gap-y-4">
        <h1 className={`text-2xl sm:text-3xl font-bold underline ${Object.keys(upcomingEvents).length === 0 ? 'hidden' : ''}`}>Upcoming events</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:auto-cols-fr text-center">
          {Object.keys(upcomingEvents).map(key => (          
            <Event key={key} name={upcomingEvents[key].name} slug={upcomingEvents[key].slug} start={upcomingEvents[key].start} end={upcomingEvents[key].end} />
          ))}
        </div>
      </div>
      {Object.keys(upcomingEvents).length === 0 && (
        <div className="container mx-auto px-4 md:px-16 lg:px-72 xl:px-96">
          <div className="rounded-lg shadow-lg bg-gray-200 p-4 flex flex-col justify-center gap-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">More events coming soon...</h1>
            <p>
              Want to be the first to hear about new events?{' '}
              <StyledLink destination="https://bit.ly/PurdueHackersDiscord" color="blue-discord" transitionColor="blue-discord-light">
                Hop in our Discord!
              </StyledLink>
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col p-8 sm:pt-14 px-5 sm:px-20 text-left gap-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold underline">Past events</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:auto-cols-fr text-center">
          {Object.keys(pastEvents).map(key => (          
            <Event key={key} name={pastEvents[key].name} slug={pastEvents[key].slug} start={pastEvents[key].start} end={pastEvents[key].end} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ()  => {
  const events = await fetch(`${server}/api/fetchEvents`).then(r => r.json())
  return {
    props: { events }
  }
}

export default Home
