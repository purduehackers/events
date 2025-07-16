/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

import { createClient } from '../../lib/sanityClient'
import { verifyUUID } from '../../lib/uuid'

const client = createClient()

// eslint-disable-next-line import/no-anonymous-default-export
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { list, email, eventName, uuid } = req.query

  console.log(`Adding email ${email} to mailing list ${list}`)
  const resend = new Resend(process.env.RESEND_API_KEY)

  const valid = await verifyUUID(email as string, uuid as string)

  if (!valid) {
    console.log(`${email} did not provide the right UUID. Skipping...`)
    return res.redirect('/email-verification-failed')
  }

  const audiences = await resend.audiences.list()

  if (!audiences.data?.data) {
    console.log('No audiences found')
    return res.redirect('/email-verification-failed')
  }

  const audience = audiences.data.data.find(
    (audience: any) => audience.name === list
  )

  let audienceId = audience?.id

  if (!audience) {
    console.log('No audience found, creating a new one')
    audienceId = (
      await resend.audiences.create({
        name: list as string,
      })
    ).data?.id
  }

  if (!audienceId) {
    console.log('Failed to create audience')
    return res.redirect('/email-verification-failed')
  }

  const contact = await resend.contacts.create({
    email: email as string,
    unsubscribed: false,
    audienceId,
  })

  if (contact.error) {
    console.log('An error occurred while adding the contact', contact.error)
    return res.redirect('/email-verification-failed')
  }

  console.log('Contact added successfully')

  const id = (await client.fetch(`*[name == "${eventName}"]`))?.[0]._id

  client
    .patch(id)
    .inc({ rsvpCount: 1 })
    .commit()
    .then(() => {
      console.log('Done!')
      return res.redirect(`/email-confirm?eventName=${eventName}`)
    })
    .catch((err) => console.log('error incrementing', err))
}
