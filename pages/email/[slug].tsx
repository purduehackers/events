import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { server } from '../../config'

const EmailSlug = ({ event }) => {
  const router = useRouter()
  const email = router.query.email

  let r
  if (email) {
    r = fetch(`${server}/api/addToMailingList`, {
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify({ event, email })
    }).then(r => r.json())
  }

  return (
    <h1>hi</h1>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await fetch(`${server}/api/fetchEvents`).then(r => r.json()).catch(err => console.log(err))
  const paths = events.map((event) => ({
    params: { slug: event.slug }
  }))
  
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const event = await fetch(`${server}/api/fetchEvents`)
    .then(r => r.json())
    .then(events => events.find(event => event.slug === slug))
  
  return { props: { event }, revalidate: 10 }
}

export default EmailSlug