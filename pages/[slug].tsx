import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import * as marked from 'marked'
import tt from 'tinytime'
import { server } from '../config'

const Slug = ({ event }) => {
  return (
    <div className="min-h-screen font-title">
      <Head>
        <title>{event.name} — Purdue Hackers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center justify-top mt-0 w-full flex-1 px-5 pb-8 sm:pb-16 text-center sm:px-20 bg-gray-100">
        <div className="mt-8 sm:mt-16">
            <h1 className="text-4xl sm:text-7xl lg:text-8-xl font-bold text-yellow-400">
              {event.name}
            </h1>
            <p className="mt-3 text-1xl sm:text-2xl flex flex-row gap-x-1 items-center justify-center">
              <span><img src="clock.svg"></img></span>
              <strong>{event.start === 'TBD' ? 'Date TBD' : tt('{MM} {Do}').render(new Date(event.start))}</strong>{' '}
              {event.start === 'TBD' ? '' : tt('{h}:{mm}').render(new Date(event.start)) + "—"}
              {event.end === 'TBD' ? '' : tt('{h}:{mm} {a}').render(new Date(event.end))}
            </p>
            <p className="mt-1 text-1xl sm:text-2xl flex flex-row gap-x-1 items-center justify-center">
              <span><img src="map-pin.svg"></img></span>
              <strong>{event.loc === 'TBD' ? 'Location TBD' :
                  event.gMap
                  ? <a href={event.gMap} target="_blank" className="text-yellow-500 hover:text-yellow-400 transition">{event.loc}</a>
                  : event.loc}</strong>
            </p>
          </div>
      </div>

      <h1>{event.name}</h1>
      <h1 dangerouslySetInnerHTML={{ __html: event.desc }}></h1>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await fetch(`${server}/api/fetchEvents`).then(r => r.json())
  const paths = events.map((event) => ({
    params: { slug: event.slug }
  }))
  
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params })  => {
  const { slug } = params
  const event = await fetch(`${server}/api/fetchEvents`)
    .then(r => r.json())
    .then(events => events.find(event => event.slug === slug))

  event.desc = event.desc !== undefined ? marked.marked(event.desc)
    .replace(new RegExp('</p>\n<p>', 'g'), '</p><br/><p>')
    .replace(new RegExp('<a', 'g'), '<a class="desc"') : ''

  return { props: { event } }
}

export default Slug