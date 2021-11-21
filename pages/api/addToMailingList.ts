import { NextApiRequest, NextApiResponse } from 'next'
import { server } from '../../config'
import Mailgun from 'mailgun-js'

export default (req: NextApiRequest, res: NextApiResponse) => (
  new Promise(resolve => {
    const { list, email, eventName } = req.query

    console.log(`Adding eamil ${email} to mailing list ${list}`)
    const mailgun = Mailgun
    const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: 'ph.matthewstanciu.me' })
  
    mg.get('/lists/pages')
      .then(pages => pages.items)
      .then(items => items.find(item => item.name === list))
      .then(async item => {
        if (item === undefined) {
          await mg.post('/lists', {
            address: `${list}@ph.matthewstanciu.me`,
            description: list
          }).then(r => {
          }).catch(error => {})
        }
      })
      .then(() => {
        mg.lists(`${list}@ph.matthewstanciu.me`).members().create({
          subscribed: true,
          address: email as string,
          name: email as string,
        }).then(() => {
          // console.log(`Added user ${email} to mailing list ${list}!`)
          resolve(res.redirect(`${server}/email-confirm?eventName=${eventName}`))
        }).catch(error => {
          if (error.toString().includes('Address already exists')) {
            resolve(res.redirect(`${server}/email-exists`))
          }
        })
      })
  })
)
