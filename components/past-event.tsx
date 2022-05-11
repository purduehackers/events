import tt from 'tinytime'
import Head from 'next/head'
import { Clock, MapPin } from 'react-feather'
import { formatDate } from '../lib/formatDate'
import Nav from './nav'
import StyledLink from './styled-link'
import Footer from './footer'
import FooterLinks from './footer-links'
import VercelBanner from './vercel-banner'
import ImageGrid from './image-grid'

const PastEvent = ({ event }: { event: PHEvent }) => {
  const ogUrl = `https://og.purduehackers.com/${event.name.replace(
    new RegExp(' ', 'g'),
    '%20'
  )}.png?theme=light&md=1&fontSize=${
    event.name.length < 30 ? '250' : '200'
  }px&caption=${
    event.start !== 'TBD'
      ? tt('{MM}%20{DD}%20•').render(
          formatDate(new Date(event.start), 'America/Indianapolis')
        )
      : ''
  }%20${event.loc.replace(new RegExp(' ', 'g'), '%20')}`

  return (
    <div className="min-h-screen overflow-hidden flex flex-col font-title dark:bg-gray-900">
      <Head>
        <meta property="og:site_name" content="Purdue Hackers" />
        <meta property="og:name" content={`${event.name} — Purdue Hackers`} />
        <meta property="og:title" content={`${event.name} — Purdue Hackers`} />
        <meta property="og:image" content={ogUrl} />
        <meta
          property="og:description"
          content={`${event.name}: a past event from Purdue Hackers.`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <title>{event.name} — Purdue Hackers</title>
      </Head>

      <Nav />

      <div className="flex flex-col grow-0 items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100 dark:bg-gray-800">
        <div className="mt-8 sm:mt-16">
          <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-gray-400">
            {event.name}
          </h1>
          <p className="mt-3 text-1xl sm:text-2xl flex flex-row gap-x-1 font-bold items-center justify-center dark:text-gray-200">
            <Clock />
            {event.start === 'TBD'
              ? 'Date TBD'
              : tt('{MM} {Do}, {YYYY} •').render(new Date(event.start))}{' '}
            {event.start === 'TBD'
              ? ''
              : tt('{h}:{mm}').render(new Date(event.start)) + '—'}
            {event.end === 'TBD'
              ? ''
              : tt('{h}:{mm} {a}').render(new Date(event.end))}
          </p>
          <p className="mt-1 text-1xl sm:text-2xl flex flex-row gap-x-1 items-center justify-center dark:text-gray-200">
            <MapPin />
            <strong>
              {event.loc === 'TBD' ? (
                'Location TBD'
              ) : event.gMap ? (
                <StyledLink destination={event.gMap} newTab>
                  {event.loc}
                </StyledLink>
              ) : (
                event.loc
              )}
            </strong>
          </p>
        </div>
      </div>
      <div className="flex flex-col flex-auto py-8 px-5 sm:px-20">
        <ImageGrid images={event.recapImages} />
      </div>
      <footer>
        <Footer>
          <FooterLinks />
          <VercelBanner />
        </Footer>
      </footer>
    </div>
  )
}

export default PastEvent
