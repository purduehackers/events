/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

import VerifyEmail from '../../emails/verify-email'
import { generateUUID } from '../../lib/uuid'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, eventName, slug } = req.body

  const resend = new Resend(process.env.RESEND_API_KEY)

  const uuid = await generateUUID(email)

  try {
    const message = await resend.emails.send({
      from: 'Purdue Hackers <events@purduehackers.com>',
      to: email,
      subject: 'Purdue Hackers: Please verify your email',
      replyTo: 'team@purduehackers.com',
      react: VerifyEmail({ email, uuid, eventName, slug }),
    })

    console.log(`Successfully sent verification email to ${email}!`)

    res.json({ ok: true, status: 200 })
  } catch (err) {
    console.log('Error sending verification email: ' + err)
    res.status(500).end()
  }
}
