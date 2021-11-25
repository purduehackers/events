import { NextApiRequest, NextApiResponse } from 'next'
import Mailgun from 'mailgun-js'
import { verifyUUID } from '../../lib/uuid'

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
          .then((pages) => pages.items)
          .then((items) => items.find((item: any) => item.name === list))
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
              .create({
                subscribed: true,
                address: email as string,
                name: email as string,
              })
              .then(async () => {
                resolve(res.redirect(`/email-confirm?eventName=${eventName}`))
              })
              .catch(async (error) => {
                if (error.toString().includes('Address already exists')) {
                  resolve(res.redirect(`/email-exists`))
                }
              })
          })
      }
    })
  })
