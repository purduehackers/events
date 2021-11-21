import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'
import { NextApiRequest, NextApiResponse } from 'next'

const airtable = new AirtablePlusPlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: 'appsGNvjNvL5rmGUM',
  tableName: 'Events'
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, slug } = req.body

  const record = (await airtable.read({
    filterByFormula: `Slug = "${slug}"`
  }))[0]
  airtable.update(record.id, {
    'Emails': record.fields['Emails'] ? record.fields['Emails'] + `, ${email}` : email
  })

  res.json({ ok: true })
}