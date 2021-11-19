import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'
import { NextApiRequest, NextApiResponse } from 'next'
import { orderBy } from 'lodash'

const airtable = new AirtablePlusPlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: 'appsGNvjNvL5rmGUM',
  tableName: 'Events'
})

interface AirtableFields {
  "Event Name": string;
  "Event Date & Start Time": string;
  "Event Date & End Time": string;
  "Event Location": string;
  "Location Map Link (optional)": string;
  "Event Description": string;
  "Slug": string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const airtableEvents = (await airtable.read()) as unknown as AirtablePlusPlusRecord<AirtableFields>[]
  const events = airtableEvents.map(({ id, fields }) => ({
    id,
    name: fields['Event Name'],
    desc: fields['Event Description'],
    start: fields['Event Date & Start Time'] || 'TBD',
    end: fields['Event Date & End Time'] || 'TBD',
    loc: fields['Event Location'],
    gMap: fields['Location Map Link (optional)'] || false,
    slug: fields.Slug
  }))

  res.json(orderBy(events, 'start'))
}