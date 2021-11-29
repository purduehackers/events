import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'
import { orderBy } from 'lodash'
import { GithubSlugger } from 'github-slugger-typescript'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Events',
})

interface AirtableFields {
  'Event Name': string
  'Event Date & Start Time': string
  'Event Date & End Time': string
  'Event Location': string
  'Location Map Link (optional)': string
  'Calendar Link': string
  'Event Description': string
  Slug: string
  'Custom Slug': string
  'Reminder Email Sent': boolean
  Unlisted: boolean
  'RSVP Count': number
}

export const fetchEvents = async (): Promise<PHEvent[]> => {
  const slugger = new GithubSlugger()
  const airtableEvents =
    (await airtable.read()) as unknown as AirtablePlusPlusRecord<AirtableFields>[]
  const events = airtableEvents.map(({ id, fields }) => ({
    id,
    name: fields['Event Name'] ?? 'Mysterious Event',
    desc:
      fields['Event Description'] ??
      `We're still working on this event...check back later for more details!`,
    start: fields['Event Date & Start Time'] ?? 'TBD',
    end: fields['Event Date & End Time'] ?? 'TBD',
    loc: fields['Event Location'] ?? 'TBD',
    gMap: fields['Location Map Link (optional)'] ?? false,
    calLink: fields['Calendar Link'] ?? false,
    emailSent: fields['Reminder Email Sent'] ?? false,
    unlisted: fields['Unlisted'] ?? false,
    rsvpCount: fields['RSVP Count'],
    slug: fields['Custom Slug'] ?? slugger.slug(fields['Event Name']),
  }))

  return orderBy(events, 'start')
}
