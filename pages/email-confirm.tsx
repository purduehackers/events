import { useRouter } from 'next/router'
import Nav from '../components/nav'
import Head from 'next/head'
import Footer from '../components/footer'
import VercelLogo from '../components/vercel-logo'

const EmailConfirm = () => {
  const router = useRouter()
  const { eventName } = router.query

  return (
    <main className="flex flex-col min-h-screen dark:bg-gray-900">
      <Head>
        <title>Email Confirmed! — Purdue Hackers</title>
      </Head>
      <Nav />
      <div className="flex items-center justify-center grow py-6">
        <div className="container mx-auto px-4 md:px-16 lg:px-72 xl:px-96">
          <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-center gap-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              🎉 You're on the list!
            </h1>
            <p className={eventName ? '' : 'hidden'}>
              Thanks for signing up to receive a reminder for{' '}
              <strong>{eventName}</strong>! You'll receive an email from us a
              day before the event starts.
            </p>
            <p className={eventName ? '' : 'hidden'}>
              While you're waiting, you should join the Purdue Hackers Discord
              server if you aren't there already! You'll join a community of
              creative makers at Purdue, and you'll be the first to hear about
              new events.
            </p>
            <p className={eventName ? 'hidden' : ''}>
              Thanks for signing up to receive a reminder! You'll receive an
              email from us a day before the event starts.
            </p>
            <div
              className={
                eventName
                  ? 'rounded-lg shadow-md dark:shadow-black/25 bg-blue-discord p-2 px-4 text-center hover:scale-105 transform transition'
                  : 'hidden'
              }
            >
              <a
                href="https://bit.ly/PurdueHackersDiscord"
                className="font-bold text-white text-center"
                target="_blank"
              >
                Join Discord
              </a>
            </div>
            <p className={`mt-1 ${eventName ? 'hidden' : ''}`}>
              Hey, wait a second...what are you doing here...????
            </p>
          </div>
        </div>
      </div>
      <Footer>
        <VercelLogo />
      </Footer>
    </main>
  )
}

export default EmailConfirm
