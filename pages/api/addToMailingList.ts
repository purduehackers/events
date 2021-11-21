import { NextApiRequest, NextApiResponse } from 'next'
import Mailgun from 'mailgun-js'

export default (req: NextApiRequest, res: NextApiResponse) => (
  new Promise(resolve => {
    const { event, email } = JSON.parse(req.body)
    console.log('Adding email', email)
    const list = event.slug
    const mailgun = Mailgun
    const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: 'ph.matthewstanciu.me' })
  
    mg.get('/lists/pages')
      .then(pages => pages.items)
      .then(items => items.find(item => item.name === event.slug))
      .then(async item => {
        if (item === undefined) {
          await mg.post('/lists', {
            address: `${list}@ph.matthewstanciu.me`,
            description: list
          }).then(r => {
            // console.log('List created!')
          }).catch(error => {})
        }
      })
      .then(() => {
        mg.lists(`${list}@ph.matthewstanciu.me`).members().create({
          subscribed: true,
          address: email,
          name: email,
        }).then(() => {
          // console.log(`Added user ${email} to mailing list ${list}!`)
          res.json({ ok: true })
          return resolve(`Added user ${email} to mailing list ${list}!`)
        }).catch(error => {
          if (error.toString().includes('Address already exists')) {
            res.json({ ok: false, error: `Address ${email} already exists` })
            return resolve(`Address ${email} already exists`)
          }
        })
      })
  })
)
