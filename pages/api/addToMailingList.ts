import { NextApiRequest, NextApiResponse } from 'next'
import Mailgun from 'mailgun-js'
import { verifyUUID } from '../../lib/uuid'
import { AirtablePlusPlus } from 'airtable-plusplus'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Events'
})

export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve) => {
    const { list, email, eventName, uuid } = req.query

    console.log(`Adding email ${email} to mailing list ${list}`)
    const mailgun = Mailgun
    const mg = mailgun({
      apiKey: `${process.env.MAILGUN_API_KEY}`,
      domain: 'purduehackers.com'
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
                  description: list
                })
                .catch((err) => {})
            }
            const item: MailingListData = items[0]

            mg.lists(`${list}@purduehackers.com`)
              .members()
              .create({
                address: email as string,
                name: email as string,
                subscribed: true
              })
              .then((response) => {
                console.log(response)
                console.log('Updating values in Airtable')
                airtable
                  .updateWhere(`{Event Name} = '${eventName}'`, {
                    'RSVP Count': item.members_count + 1
                  })
                  .then(() => {
                    console.log('Done!')
                    resolve(
                      res.redirect(`/email-confirm?eventName=${eventName}`)
                    )
                  })
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
