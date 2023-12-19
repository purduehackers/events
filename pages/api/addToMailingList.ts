/* eslint-disable no-console */
import Mailgun from 'mailgun-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'

import { verifyUUID } from '../../lib/uuid'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true,
  token: process.env.SANITY_TOKEN,
})

// eslint-disable-next-line import/no-anonymous-default-export
export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve) => {
    const { list, email, eventName, uuid } = req.query

    console.log(`Adding email ${email} to mailing list ${list}`)
    const mailgun = Mailgun
    const mg = mailgun({
      apiKey: `${process.env.MAILGUN_API_KEY}`,
      domain: 'purduehackers.com',
    })

    verifyUUID(email as string, uuid as string).then((valid) => {
      if (!valid) {
        console.log(`${email} did not provide the right UUID. Skipping...`)
        resolve(res.redirect('/email-verification-failed'))
        return
      } else {
        mg.get('/lists/pages')
          .then((pages: Pages) => pages.items)
          .then((items: MailingListData[]) =>
            items.filter((item: MailingListData) => item.description === list)
          )
          .then(async (items) => {
            if (items.length === 0) {
              await mg
                .post('/lists', {
                  address: `${list}@purduehackers.com`,
                  description: list,
                })
                .catch((_err) => {})
            }
            const item: MailingListData = items[0]

            mg.lists(`${list}@purduehackers.com`)
              .members()
              .create({
                address: email as string,
                name: email as string,
                subscribed: true,
              })
              .then(async (response) => {
                console.log(response)
                console.log('Updating values in Sanity')
                const id = (
                  await client.fetch(`*[name == "${eventName}"]`)
                )?.[0]._id

                client
                  .patch(id)
                  .inc({ rsvpCount: 1 })
                  .commit()
                  .then(() => {
                    console.log('Done!')
                    resolve(
                      res.redirect(`/email-confirm?eventName=${eventName}`)
                    )
                  })
                  .catch((err) => console.log('error incrementing', err))
              })
              .catch((error) => {
                if (error.toString().includes('Address already exists')) {
                  console.log('Address already exists!')
                  resolve(res.redirect(`/email-exists`))
                }
              })
          })
      }
    })
  })
