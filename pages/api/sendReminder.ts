import { NextApiRequest, NextApiResponse } from 'next'
import { fetchEvents } from '../../lib/fetchEvents'
import { past } from '../../lib/past'
import tt from 'tinytime'
import Mailgun from 'mailgun-js'
import { AirtablePlusPlus } from 'airtable-plusplus'
import { formatDate } from '../../lib/formatDate'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Events'
})

const mailgun = Mailgun
const mg = mailgun({
  apiKey: `${process.env.MAILGUN_API_KEY}`,
  domain: 'purduehackers.com'
})

export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve) => {
    const { authorization } = req.headers
    if (authorization !== `Bearer ${process.env.MAILGUN_API_KEY}`) {
      resolve(res.status(401).send('incorrect api key!'))
      return
    }

    fetchEvents()
      .then((events) =>
        events.filter(
          (event) =>
            (!past(event.start) &&
              eventHappens('tomorrow', event.start) &&
              !event.emailSent) ||
            (eventHappens('today', event.start) &&
              event.emailSent &&
              !event.secondEmailSent)
        )
      )
      .then((events) => {
        if (events.length > 0) {
          events.map((event: PHEvent) => {
            console.log('sending email to ' + event.name)
            sendEmail(event.emailSent ? 'second' : 'first', event)
              .then(async () => {
                console.log('marking complete...')
                if (!event.emailSent) {
                  await markSent(event)
                } else {
                  await markSecondSent(event)
                }
              })
              .then(() => {
                console.log('done!')
                resolve(res.json({ ok: true }))
              })
              .catch((err) => {
                resolve(res.status(500).send('Error sending email: ' + err))
              })
          })
        } else {
          console.log('No emails to send.')
          resolve(res.status(200).send('No emails to send.'))
        }
      })
  })

const eventHappens = (todayOrTomorrow: string, eventStart: string): boolean => {
  const now = new Date()
  const eventDate = new Date(eventStart)
  const timeDiff = eventDate.getTime() - now.getTime()

  if (todayOrTomorrow === 'today') {
    return Math.floor(timeDiff) < 86400000 && timeDiff > 0
  } else if (todayOrTomorrow === 'tomorrow') {
    return Math.floor(timeDiff) < 172800000 && timeDiff > 0
  } else {
    return false
  }
}

const sendEmail = async (
  firstOrSecond: string,
  event: PHEvent
): Promise<void> => {
  const { name, start, end, loc, slug } = event
  const startDate = formatDate(new Date(start), 'America/Indianapolis')
  const endDate = formatDate(new Date(end), 'America/Indianapolis')
  const parsedStart = tt('{dddd} from {h}:{mm}').render(startDate)
  const parsedEnd = tt('{h}:{mm} {a}').render(endDate)

  const firstData = {
    from: 'Purdue Hackers <events@purduehackers.com>',
    to: `${slug}@purduehackers.com`,
    subject: `Reminder: ${name} is happening tomorrow!`,
    template: 'event-reminder',
    'h:X-Mailgun-Variables': JSON.stringify({
      name,
      start: parsedStart,
      end: parsedEnd,
      loc
    })
  }

  const secondData = {
    from: 'Purdue Hackers <events@purduehackers.com>',
    to: `${slug}@purduehackers.com`,
    subject: `[REMINDER] ${name} is happening today!`,
    template: 'second-event-reminder',
    'h:X-Mailgun-Variables': JSON.stringify({
      name,
      start: parsedStart,
      end: parsedEnd,
      loc
    })
  }

  await mg
    .messages()
    .send(firstOrSecond === 'first' ? firstData : secondData)
    .then((r) => {
      console.log(`Successfully sent reminder email to ${event.slug}`)
      console.log(r)
    })
    .catch((err) => {
      console.log('Error sending reminder email: ' + err)
    })
}

const markSent = async (event: PHEvent): Promise<void> => {
  await airtable.updateWhere(`{Event Name} = '${event.name}'`, {
    'Reminder Email Sent': true
  })
}

const markSecondSent = async (event: PHEvent): Promise<void> => {
  await airtable.updateWhere(`{Event Name} = '${event.name}'`, {
    'Second Email Sent': true
  })
}
