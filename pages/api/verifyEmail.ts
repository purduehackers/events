import { NextApiRequest, NextApiResponse } from 'next'
import Mailgun from 'mailgun-js'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, eventName, slug } = req.body
  const mailgun = Mailgun
  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: 'ph.matthewstanciu.me' })

  const data = {
    from: 'Purdue Hackers <mailgun@ph.matthewstanciu.me>',
    to: `${email}, mailgun@ph.matthewstanciu.me`,
    subject: `Purdue Hackers: Please verify your email`,
    template: 'verify-your-email', 'h:X-Mailgun-Variables': JSON.stringify({ eventName, list: slug, email })
  }

  mg.messages().send(data)
    .then((r) => {
      console.log('Successfully sent verification email!')
      console.log(r)
      res.json({ ok: true, status: 200 })
    })
    .catch(err => {
      console.log('Error sending verification email: ' + err)
      res.status(500).end()
    })
}