import { NextApiRequest, NextApiResponse } from 'next'
import { fetchEvents } from '../../lib/fetchEvents'
import { past } from '../../lib/past'
import tt from 'tinytime'
import Mailgun from 'mailgun-js'

const mailgun = Mailgun
const mg = mailgun({ apiKey: `${process.env.MAILGUN_API_KEY}`, domain: 'ph.matthewstanciu.me' })

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query
  if (token !== process.env.MAILGUN_API_KEY) {
    return res.status(401).send('incorrect api key!')
  }

  const events = await fetchEvents()
  .then(events => events.filter(event => !past(event.start)))
  .then(events => events.filter(event => eventHappensTomorrow(event.start)))
  events.map((event: any) => {
    sendEmail(event)
  })

  events.map(event => {
    console.log(event.name)
  })

  res.json({ ok: true })
}

const eventHappensTomorrow = (eventStart: string): boolean => {
  const now = new Date()
  const eventDate = new Date(eventStart)
  const timeDiff = eventDate.getTime() - now.getTime()

  return Math.floor(timeDiff) < 172800000
}

const sendEmail = (event: Event): void => {
  const { name, start, end, loc, slug } = event
  const parsedStart = tt('{dddd} from {h}:{mm}').render(new Date(start))
  const parsedEnd = tt('{h}:{mm} {a}').render(new Date(end))

  const data = {
    from: 'Purdue Hackers <mailgun@ph.matthewstanciu.me>',
    to: `${slug}@ph.matthewstanciu.me`,
    subject: `Reminder: ${name} is happening tomorrow!`,
    template: 'event-reminder', 'h:X-Mailgun-Variables': JSON.stringify({ name, start: parsedStart, end: parsedEnd, loc })
  }

  mg.messages().send(data)
  .then((r) => {
    console.log(`Successfully sent reminder email to ${event.slug}`)
    console.log(r)
  })
  .catch(err => {
    console.log('Error sending reminder email: ' + err)
  })
}