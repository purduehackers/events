import GithubSlugger from 'github-slugger'
import { orderBy } from 'lodash'
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true,
})

function formatTime(date: Date) {
  return date.toISOString().replace(/-|:|\.\d+/g, '')
}

const getCalLink = (event: SanityEvent) => {
  try {
    let endTime: Date

    // if event end time is undefined, set it to the same date as the start time
    // and set time to 23:59

    if (event.end == undefined) {
      endTime = new Date(event.start)
      endTime.setHours(23)
      endTime.setMinutes(59)
      endTime.setSeconds(0)
      endTime.setMilliseconds(0)
    } else {
      endTime = new Date(event.end)
    }
    const startTimeStr = formatTime(new Date(event.start))
    const endTimeStr = formatTime(new Date(endTime))
    return new URL(
      `https://www.google.com/calendar/render?action=TEMPLATE&text=${event.name} (Purdue Hackers)&location=${event.loc}&details=A Purdue Hackers Event&dates=${startTimeStr}00Z%2F${endTimeStr}00Z`
    ).href
  } catch {
    return new URL(
      `https://www.google.com/calendar/render?action=TEMPLATE&text=${event.name} (Purdue Hackers)&location=${event.loc}&details=A Purdue Hackers Event`
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
