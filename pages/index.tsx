import Head from 'next/head'
import { server } from '../config'
import Event from '../components/event'
import { GetStaticProps } from 'next'

const Home = ({ events }) => {
  return (
    <div className="min-h-screen font-title">
      <Head>
        <title>Events — Purdue Hackers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100">
        <div className="mt-8 sm:mt-16">
          <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-yellow-400">
            Purdue Hackers Events
          </h1>
          <p className="mt-3 text-1xl sm:text-2xl">
            Check out & sign up for{' '}
            <a href="https://purduehackers.com" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition">
              Purdue Hackers
            </a>{'\' '}
            upcoming events.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:auto-cols-fr p-8 sm:pt-14 px-5 sm:px-20 text-center">
          {Object.keys(events).map(key => (          
            <Event key={key} name={events[key].name} slug={events[key].slug} start={events[key].start} end={events[key].end} />
          ))}
        </div>
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
