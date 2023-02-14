import { orderBy } from 'lodash'
import GithubSlugger from 'github-slugger'
import { createClient } from 'next-sanity'
import { format } from 'date-fns'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true
})

const getCalLink = (event: SanityEvent) => {
  try {
    return new URL(
      `https://www.google.com/calendar/render?action=TEMPLATE&text=${
        event.name
      } (Purdue Hackers)&location=${
        event.loc
      }&details=A Purdue Hackers Event&dates=${format(
        new Date(event.start),
        'yyyyMMdd'
      )}T${format(new Date(event.start), 'HHmm')}00Z%2F${format(
        new Date(event.end),
        'yyyyMMdd'
      )}T${format(new Date(event.end), 'HHmm')}00Z`
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
    hasPastEventDesc: event.pastEventDesc !== '',
    stat1Data: event.stat1?.data ?? '',
    stat1Label: event.stat1?.label ?? '',
    stat2Data: event.stat2?.data ?? '',
    stat2Label: event.stat2?.label ?? '',
    stat3Data: event.stat3?.data ?? '',
    stat3Label: event.stat3?.label ?? ''
  }))

  return orderBy(events, 'start')
}
