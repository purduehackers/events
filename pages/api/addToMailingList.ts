import { NextApiRequest, NextApiResponse } from 'next'
import Mailgun from 'mailgun-js'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { event, email } = JSON.parse(req.body)
  const list = event.slug
  const mailgun = Mailgun
  const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: 'ph.matthewstanciu.me' })

  await mg.get('/lists/pages')
    .then(pages => pages.items)
    .then(items => items.find(item => item.name === event.slug))
    .then(item => {
      if (item === undefined) {
        mg.post('/lists', {
          address: `${list}@ph.matthewstanciu.me`,
          description: list
        }).then(r => {
          console.log('List created!')
        }).catch(error => {})
      }
    })
    .then(() => {
      mg.lists(`${list}@ph.matthewstanciu.me`).members().create({
        subscribed: true,
        address: email,
        name: email,
      }).then(() => {
        res.status(200).send(`Added user ${email} to mailing list ${list}!`)
      }).catch(error => {
        if (error.toString().includes('Address already exists')) {
          res.status(500).send('Address already exists')
        }
      })
    })

  res.json({ ok: true })
}