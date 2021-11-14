import Head from 'next/head'
import { GetStaticProps } from 'next'

const Home = () => {
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
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ()  => {
  return {
    props: {}
  }
}

interface Props {

}

export default Home
