import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'
import { Resend } from 'resend'

import ReminderEmail from '../../emails/reminder-email'
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

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.headers.authorization !== `Bearer ${process.env.RESEND_API_KEY}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const events = await fetchEvents()
    const upcomingEvents = events.filter(
      (event) =>
        (!past(event.start) &&
          eventHappens('tomorrow', event.start) &&
          !event.emailSent) ||
        (eventHappens('today', event.start) &&
          event.emailSent &&
          !event.secondEmailSent)
    )

    if (upcomingEvents.length === 0) {
      console.log('No emails to send.')
      return res.status(200).json({ message: 'No emails to send.' })
    }

    await Promise.all(
      upcomingEvents.map(async (event) => {
        console.log(`Sending email to ${event.name}`)
        await sendEmail(event.emailSent ? 'second' : 'first', event)
        await markEmailSent(event)
      })
    )

    console.log('Emails sent successfully.')
    res.json({ success: true })
  } catch (error) {
    console.error('Error processing emails:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

function eventHappens(todayOrTomorrow: string, eventStart: string): boolean {
  const now = new Date()
  const eventDate = new Date(eventStart)
  const timeDiff = eventDate.getTime() - now.getTime()

  return todayOrTomorrow === 'today'
    ? timeDiff < 86400000 && timeDiff > 0
    : todayOrTomorrow === 'tomorrow'
      ? timeDiff < 172800000 && timeDiff > 0
      : false
}

async function sendEmail(emailType: 'first' | 'second', event: PHEvent) {
  const { name, start, end, loc, slug } = event
  const startDate = new Date(start)
  const endDate = new Date(end)

  let parsedStart =
    emailType === 'first'
      ? `${formatDate(startDate, 'EEEE')} from ${formatDate(startDate, 'h:mm')}`
      : `TODAY from ${formatDate(startDate, 'h:mm')}`

  try {
    const audiences = await resend.audiences.list()
    const audience = audiences.data?.data?.find((a: any) => a.name === slug)
    if (!audience) {
      console.log(`No audience found for ${slug}`)
      return
    }

    const response = await resend.broadcasts.create({
      audienceId: audience.id,
      name: `${name} ${emailType} reminder`,
      from: 'Purdue Hackers <events@purduehackers.com>',
      subject:
        emailType === 'first'
          ? `Reminder: ${name} is happening tomorrow!`
          : `[REMINDER] ${name} is happening today!`,
      replyTo: 'team@purduehackers.com',
      react: ReminderEmail({
        state: emailType === 'first' ? 'tomorrow' : 'today',
        event: {
          name,
          date: parsedStart,
          location: loc,
        },
      }),
    })

    if (response.error) {
      throw new Error(
        `Error sending ${emailType} reminder email: ${response.error.message}`
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log(
      await resend.broadcasts.send(response.data!.id, {
        scheduledAt: 'in 1 min',
      })
    )

    console.log(
      `Successfully sent ${emailType} reminder email to audience: ${slug}`
    )
  } catch (error) {
    console.error(`Error sending ${emailType} reminder email:`, error)
  }
}

async function markEmailSent(event: PHEvent) {
  try {
    const id = (await client.fetch(`*[name == "${event.name}"]`))?.[0]?._id
    if (!id) return
    await client
      .patch(id)
      .set(event.emailSent ? { secondEmailSent: true } : { emailSent: true })
      .commit()
    console.log(`Marked email sent for event: ${event.name}`)
  } catch (error) {
    console.error(`Error marking email sent for ${event.name}:`, error)
  }
}
