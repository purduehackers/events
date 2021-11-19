import Head from 'next/head'
import Event from '../components/event'
import { GetStaticProps } from 'next'

const Home = ({ events }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 font-title">
      <Head>
        <title>Purdue Hackers RSVP</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-top mt-20 w-full flex-1 px-5 text-center sm:px-20">
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

        <div className="flex flex-row items-center justify-center mt-50">
          {Object.keys(events).map(key => (          
            <Event key={key} name={events[key].name} slug={events[key].slug}>
              <p className="mt-3 text-2xl" key={key}>
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
