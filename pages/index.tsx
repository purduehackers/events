import Head from 'next/head'
import { GetStaticProps } from 'next'

const Home = ({ events }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 font-title">
      <Head>
        <title>Purdue Hackers RSVP</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-top mt-20 w-full flex-1 px-5 text-center sm:px-20 sm:justify-center sm:m-0">
        <h1 className="text-6xl sm:text-7xl lg:text-8-xl font-bold text-yellow-400">
          Well hello!
        </h1>
        <p className="mt-3 text-2xl">
          You've stumbled across{' '}
          <a href="https://purduehackers.com" target="_blank" className="text-yellow-400 hover:text-yellow-500 transition">
            Purdue Hackers
          </a>{'\' '}
          Event RSVP service.
        </p>

        <h1 className="text-6xl sm:text-7xl lg:text-8-xl font-bold text-yellow-400">
          Events
        </h1>
        {Object.keys(events).map(key => (
          <div className="px-20" key={key}>
            <p className="mt-3 text-2xl" key={key}>
              {events[key].name}
            </p>
          </div>
        ))}
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
