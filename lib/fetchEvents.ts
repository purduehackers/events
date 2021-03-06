import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'
import { orderBy } from 'lodash'
import { GithubSlugger } from 'github-slugger-typescript'
import { past } from './past'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Events'
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
  'Second Email Sent': boolean
  Unlisted: boolean
  'RSVP Count': number
  'Past Event Description': string
  'Recap Images': Array<AirtableAttachment>
  'Has Past Event Description?': number
  'Stat 1 Data': string
  'Stat 1 Label': string
  'Stat 2 Data': string
  'Stat 2 Label': string
  'Stat 3 Data': string
  'Stat 3 Label': string
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
    secondEmailSent: fields['Second Email Sent'] ?? false,
    unlisted: fields['Unlisted'] ?? false,
    rsvpCount: fields['RSVP Count'] ?? 0,
    slug: fields['Custom Slug'] ?? slugger.slug(fields['Event Name']),
    pastEventDesc:
      fields['Past Event Description'] ??
      'A past Purdue Hackers event...more details coming soon!',
    recapImages: fields['Recap Images'] ?? [{ url: 'https://mbs.zone/geck' }],
    hasPastEventDesc:
      fields['Has Past Event Description?'] === 1 ? true : false,
    stat1Data: fields['Stat 1 Data'] ?? '',
    stat1Label: fields['Stat 1 Label'] ?? '',
    stat2Data: fields['Stat 2 Data'] ?? '',
    stat2Label: fields['Stat 2 Label'] ?? '',
    stat3Data: fields['Stat 3 Data'] ?? '',
    stat3Label: fields['Stat 3 Label'] ?? ''
  }))

  return orderBy(events, 'start')
}
