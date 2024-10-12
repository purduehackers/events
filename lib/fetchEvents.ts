import GithubSlugger from 'github-slugger'
import { orderBy } from 'lodash'
import { createClient } from 'next-sanity'

import { formatUTCDate } from './formatDate'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true,
})

const getSanitizedTime = (start: string, end: string) => {
  let startDate = new Date(start)
  let endDate = new Date(end)

  if (isNaN(startDate.valueOf())) {
    return undefined
  }

  if (isNaN(endDate.valueOf())) {
    endDate = new Date(start)
    // End hour is undefined, assume it's Hack Night & set to 11:59pm
    endDate.setUTCHours(23, 59, 59, 999)
  }

  return [startDate, endDate]
}

const getCalLink = (event: SanityEvent) => {
  var sanitizedDates = getSanitizedTime(event.start, event.end)

  if (typeof sanitizedDates === 'undefined') {
    return new URL(
      `https://www.google.com/calendar/render?action=TEMPLATE&text=${event.name} (Purdue Hackers)&location=${event.loc}&details=A Purdue Hackers Event`
    ).href
  } else {
    const [startDate, endDate] = sanitizedDates
    return new URL(
      `https://www.google.com/calendar/render?action=TEMPLATE&text=${
        event.name
      } (Purdue Hackers)&location=${
        event.loc
      }&details=A Purdue Hackers Event&dates=${formatUTCDate(
        startDate,
        'yyyyMMdd'
      )}T${formatUTCDate(startDate, 'HHmm')}00Z%2F${formatUTCDate(
        endDate,
        'yyyyMMdd'
      )}T${formatUTCDate(endDate, 'HHmm')}00Z`
    ).href
  }
}

export const fetchEvents = async (): Promise<PHEvent[]> => {
  const slugger = new GithubSlugger()
  const sanityEvents = await client.fetch(`*[_type == "event"] {
    ...,
    "recapImages": recapImages[].asset->{
      ...,
      metadata
    }
  }`)
  const events = sanityEvents.map((event: SanityEvent) => ({
    name: event.name,
    desc:
      event.desc ??
      `We're still working on this event...check back later for more details!`,
    start: event.start ?? 'TBD',
    end: event.end ?? 'TBD',
    loc: event.loc ?? 'TBD',
    gMap: event.gMap ?? '',
    calLink: event.calLink ?? getCalLink(event),
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
    hasPastEventDesc: typeof event.pastEventDesc !== 'undefined',
    stat1Data: event.stat1?.data ?? '',
    stat1Label: event.stat1?.label ?? '',
    stat2Data: event.stat2?.data ?? '',
    stat2Label: event.stat2?.label ?? '',
    stat3Data: event.stat3?.data ?? '',
    stat3Label: event.stat3?.label ?? '',
  }))

  return orderBy(events, 'start')
}
