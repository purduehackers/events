import { AlertTriangle } from 'react-feather'
import Nav from '../components/nav'
import StyledLink from '../components/styled-link'
import Head from 'next/head'
import Footer from '../components/footer'
import VercelLogo from '../components/vercel-logo'

const EmailVerificationFailed = () => (
  <main className="flex flex-col min-h-screen dark:bg-gray-900">
    <Head>
      <title>Email Verification Failed — Purdue Hackers</title>
    </Head>
    <Nav />
    <div className="flex items-center justify-center grow py-6">
      <div className="container mx-auto px-4 md:px-16 lg:px-72 xl:px-96">
        <div className="rounded-lg shadow-md dark:shadow-black/25 bg-gray-200 dark:bg-gray-700 p-4 flex flex-col justify-center gap-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center flex flex-wrap items-center gap-3 mb-1">
            <AlertTriangle color="red" size="1.125em" />
            Couldn't add you to the list :(
          </h1>
          <p>
            We couldn't add you to the mailing list :( this usually happens if
            you clicked a button on an old email.
          </p>
          <p>
            Try signing up to receive reminders again on the event page. Make
            sure to wait for a new email to arrive & click on that email's
            button.
          </p>
          <p>
            If you did that and you're still seeing this, shoot an email to{' '}
            <StyledLink destination="mailto:mstanciu@purdue.edu">
              mstanciu@purdue.edu
            </StyledLink>
            .
          </p>
        </div>
      </div>
    </div>
    <Footer>
      <VercelLogo />
    </Footer>
  </main>
)

export default EmailVerificationFailed
