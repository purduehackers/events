import { GetStaticPaths, GetStaticProps } from 'next'
import * as marked from 'marked'
import { server } from '../config'

const Slug = ({ event }) => {
  return (
    <main>
      <h1>{event.name}</h1>
      <h1 dangerouslySetInnerHTML={{ __html: event.desc }} className=""></h1>
    </main>
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

  event.desc = marked.marked(event.desc).replaceAll('</p>\n<p>', '</p><br/><p>')
  console.log(event.desc)

  return { props: { event } }
}

export default Slug