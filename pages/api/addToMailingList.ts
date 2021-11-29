import { NextApiRequest, NextApiResponse } from 'next'
import Mailgun from 'mailgun-js'
import { verifyUUID } from '../../lib/uuid'
import { AirtablePlusPlus } from 'airtable-plusplus'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Events',
})

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
          .then((items) =>
            items.find((item: MailingListData) => item.name === list),
          )
          .then(async (item) => {
            if (item === undefined) {
              await mg
                .post('/lists', {
                  address: `${list}@purduehackers.com`,
                  description: list,
                })
                .catch((err) => {})
            }
          })
          .then(() => {
            mg.lists(`${list}@purduehackers.com`)
              .members()
              .add({
                members: [
                  {
                    address: email as string,
                    name: email as string,
                    subscribed: true,
                  },
                ],
              })
              .then((response) => {
                const { members_count } = response.list
                airtable
                  .updateWhere(`{Event Name} = '${eventName}'`, {
                    'RSVP Count': members_count,
                  })
                  .then(() => {
                    resolve(
                      res.redirect(`/email-confirm?eventName=${eventName}`),
                    )
                  })
                  .catch((error) => {
                    if (error.toString().includes('Address already exists')) {
                      resolve(res.redirect(`/email-exists`))
                    }
                  })
              })
          })
      }
    })
  })
