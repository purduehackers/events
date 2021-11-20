import { GetStaticPaths, GetStaticProps } from 'next'
import { server } from '../config'

const Slug = ({ event }) => {
  return (
    <h1>{event.name}</h1>
  )
}

export const getStaticProps: GetStaticProps = async ({ params })  => {
  const { slug } = params
  const event = await fetch(`${server}/api/fetchEvents`)
    .then(r => r.json())
    .then(events => events.find(event => event.slug === slug))

  return { props: { event } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await fetch(`${server}/api/fetchEvents`).then(r => r.json())
  const paths = events.map((event) => ({
    params: { slug: event.slug }
  }))
  
  return { paths, fallback: false }
}

export default Slug