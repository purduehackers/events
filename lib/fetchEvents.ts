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

const getImageUrls = (images: any) => {
  const imageUrls: any[] = []
  images.map((image: any) => {
    try {
      imageUrls.push(urlFor(image).url())
    } catch {}
  })
  return imageUrls
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
  const events = sanityEvents.map((event: any) => ({
    name: event.name,
    desc:
      event.desc ??
      `We're still working on this event...check back later for more details!`,
    start: event.start ?? 'TBD',
    end: event.end ?? 'TBD',
    loc: event.loc ?? 'TBD',
    gMap: event.gMap ?? '',
    calLink: event.calLink ?? '',
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
    recapImageUrls: event.recapImages ? getImageUrls(event.recapImages) : [],
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
