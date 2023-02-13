import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'
import { orderBy } from 'lodash'
import { GithubSlugger } from 'github-slugger-typescript'
import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true
})
const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  return builder.image(source)
}

// const airtable = new AirtablePlusPlus({
//   apiKey: `${process.env.AIRTABLE_API_KEY}`,
//   baseId: 'appfaalz9AzKDwSup',
//   tableName: 'Events'
// })

interface AirtableFields {
  'Event Name': string
  'Event Date & Start Time': string
  'Event Date & End Time': string
  'Event Location': string
  'Location Map Link (optional)': string
  'Calendar Link': string
  'OG Description': string
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
  // const airtableEvents = (await airtable.read({
  //   filterByFormula: `{Event Name} != ''`
  // })) as unknown as AirtablePlusPlusRecord<AirtableFields>[]
  // const sanityEvents = (
  //   await client
  //     .fetch(`*[_type == "event"]`)
  //     .catch((err) => console.log('err', err))
  // ).map((event: any) => {
  //   const recapImageUrls: any[] = []
  //   event.recapImages.map((image: any) => {
  //     recapImageUrls.push(urlFor(image).url())
  //   })
  //   event.recapImages = recapImageUrls
  // })
  const sanityEvents = await client.fetch(`*[_type == "event"]`)
  const events = sanityEvents.map((event: any) => ({
    name: event.name,
    desc:
      event.desc ??
      `We're still working on this event...check back later for more details!`,
    start: event.start ?? 'TBD',
    end: event.end ?? 'TBD',
    loc: event.loc ?? 'TBD',
    gMap: event.gMap ?? false,
    calLink: event.calLink ?? false,
    ogDescription: event.ogDescription ?? '',
    emailSent: event.emailSent ?? false,
    secondEmailSent: event.secondEmailSent ?? false,
    unlisted: event.unlisted ?? false,
    rsvpCount: event.rsvpCount ?? 0,
    slug: event.customSlug ?? slugger.slug(event.name),
    pastEventDesc:
      event.pastEventDesc ??
      'A past Purdue Hackers event...more details coming soon!',
    recapImages: event.recapImages ?? [{ url: 'https://mbs.zone/geck' }],
    hasPastEventDesc: event.pastEventDesc !== '',
    stat1Data: event.stat1.data ?? '',
    stat1Label: event.stat1.label ?? '',
    stat2Data: event.stat2.data ?? '',
    stat2Label: event.stat2.label ?? '',
    stat3Data: event.stat3.data ?? '',
    stat3Label: event.stat3.label ?? ''
  }))

  return orderBy(events, 'start')
}
