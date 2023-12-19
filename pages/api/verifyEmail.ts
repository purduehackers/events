/* eslint-disable no-console */
import Mailgun from 'mailgun-js'
import { NextApiRequest, NextApiResponse } from 'next'

import { generateUUID } from '../../lib/uuid'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, eventName, slug } = req.body
  const mailgun = Mailgun
  const mg = mailgun({
    apiKey: `${process.env.MAILGUN_API_KEY}`,
    domain: 'purduehackers.com',
  })
  const uuid = await generateUUID(email)

  const data = {
    from: 'Purdue Hackers <events@purduehackers.com>',
    to: `${email}`,
    subject: `Purdue Hackers: Please verify your email`,
    template: 'verify-your-email',
    'h:X-Mailgun-Variables': JSON.stringify({
      eventName,
      list: slug,
      email,
      uuid,
    }),
  }

  mg.messages()
    .send(data)
    .then((r) => {
      console.log(`Successfully sent verification email to ${email}!`)
      console.log(r)
      res.json({ ok: true, status: 200 })
    })
    .catch((err) => {
      console.log('Error sending verification email: ' + err)
      res.status(500).end()
    })
}
