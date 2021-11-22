import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'
import { NextApiRequest, NextApiResponse } from 'next'
import { orderBy } from 'lodash'
import GHSlugger from 'github-slugger'

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
  "Calendar Link": string;
  "Event Description": string;
  "Slug": string;
}

export const fetchEvents = async () => {
  const slugger = new GHSlugger
  const airtableEvents = (await airtable.read()) as unknown as AirtablePlusPlusRecord<AirtableFields>[]
  const events = airtableEvents.map(({ id, fields }) => ({
    id,
    name: fields['Event Name'] ?? 'Mysterious Event',
    desc: fields['Event Description'] ?? 'We\'re still working on this event...check back later for more details!',
    start: fields['Event Date & Start Time'] ?? 'TBD',
    end: fields['Event Date & End Time'] ?? 'TBD',
    loc: fields['Event Location'] ?? 'TBD',
    gMap: fields['Location Map Link (optional)'] ?? false,
    calLink: fields['Calendar Link'] ?? false,
    slug: fields['Custom Slug'] ?? slugger.slug(fields['Event Name'])
  }))

  return orderBy(events, 'start')
}