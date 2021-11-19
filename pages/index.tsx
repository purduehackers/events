import Head from 'next/head'
import Event from '../components/event'
import { GetStaticProps } from 'next'

const Home = ({ events }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-title">
      <Head>
        <title>Purdue Hackers RSVP</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-top mt-0 w-full flex-1 px-5 text-center sm:px-20">
        <div className="mt-20 w-full">
          <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-yellow-400">
            Purdue Hackers Events
          </h1>
          <p className="mt-3 text-1xl sm:text-2xl">
            Check out & sign up for{' '}
            <a href="https://purduehackers.com" target="_blank" className="text-yellow-400 hover:text-yellow-500 transition">
              Purdue Hackers
            </a>{'\' '}
            upcoming events.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 auto-rows-fr auto-cols-fr mt-16 sm:mt-28">
          {Object.keys(events).map(key => (          
            <Event key={key} name={events[key].name} slug={events[key].slug} start={events[key].start} end={events[key].end}>
              <p key={key}>
                {events[key].name}
              </p>
            </Event>
          ))}
        </div>
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ()  => {
  const events = await fetch('http://localhost:3000/api/fetchEvents').then(r => r.json())
  return {
    props: { events }
  }
}

export default Home
