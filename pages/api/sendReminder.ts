/* eslint-disable no-console */
import Mailgun from 'mailgun-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'

import { fetchEvents } from '../../lib/fetchEvents'
import { formatDate } from '../../lib/formatDate'
import { past } from '../../lib/past'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true,
  token: process.env.SANITY_TOKEN,
})

const mailgun = Mailgun
const mg = mailgun({
  apiKey: `${process.env.MAILGUN_API_KEY}`,
  domain: 'purduehackers.com',
})

// eslint-disable-next-line import/no-anonymous-default-export
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
          Promise.all(
            events.map((event: PHEvent) => {
              console.log('sending email to ' + event.name)
              return sendEmail(
                event.emailSent ? 'second' : 'first',
                event
              ).then(async () => {
                console.log('marking complete...')
                if (!event.emailSent) {
                  await markSent(event)
                } else {
                  await markSecondSent(event)
                }
              })
            })
          )
            .then(() => {
              console.log('done!')
              resolve(res.json({ ok: true }))
            })
            .catch((err) => {
              resolve(res.status(500).send('Error sending email: ' + err))
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
  const startDate = new Date(start)
  const endDate = new Date(end)
  let parsedStart =
    firstOrSecond === 'first'
      ? formatDate(startDate, 'EEEE') + ' from ' + formatDate(startDate, 'h:mm')
      : 'TODAY from ' + formatDate(startDate, 'h:mm')
  let parsedEnd
  try {
    parsedEnd = '—' + formatDate(endDate, 'h:mm a')
  } catch (err) {
    parsedStart =
      formatDate(startDate, 'EEEE') + ' at ' + formatDate(startDate, 'h:mm a')
    parsedEnd = ''
  }
  console.log('parsed start', parsedStart)
  console.log('parsed end', parsedEnd)

  const firstData = {
    from: 'Purdue Hackers <events@purduehackers.com>',
    to: `${slug}@purduehackers.com`,
    subject: `Reminder: ${name} is happening tomorrow!`,
    template: 'event-reminder',
    'h:X-Mailgun-Variables': JSON.stringify({
      name,
      start: parsedStart,
      end: parsedEnd,
      loc,
    }),
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
      loc,
    }),
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
  const id = (await client.fetch(`*[name == "${event.name}"]`))?.[0]._id
  await client.patch(id).set({ emailSent: true }).commit()
}

const markSecondSent = async (event: PHEvent): Promise<void> => {
  const id = (await client.fetch(`*[name == "${event.name}"]`))?.[0]._id
  await client.patch(id).set({ secondEmailSent: true }).commit()
}
