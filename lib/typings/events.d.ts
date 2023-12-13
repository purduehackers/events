interface SanityImage {
  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string
  assetId: string
  extension: string
  metadata: ImageMetadata
  mimeType: string
  originalFilename: string
  path: string
  sha1hash: string
  size: number
  uploadId: string
  url: string
}

interface Stat {
  data: string
  label: string
}

interface SanityEvent {
  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string
  calLink: string
  customSlug: string
  desc: string
  emailSent: boolean
  end: string
  gMap: string
  hasPastEventDesc: boolean
  loc: string
  name: string
  ogDescription: string
  pastEventDesc: string
  recapImages: SanityImage[]
  rsvpCount: number
  secondEmailSent: boolean
  start: string
  stat1: Stat
  stat2: Stat
  stat3: Stat
  unlisted: boolean
}

interface PHEvent {
  id: string
  name: string
  desc: string
  start: string
  end: string
  loc: string
  gMap: string
  calLink: string
  ogDescription: string
  slug: string
  emailSent: boolean
  secondEmailSent: boolean
  unlisted: boolean
  rsvpCount: number
  pastEventDesc: string
  recapImages: SanityImage[]
  hasPastEventDesc: boolean
  stat1Label: string
  stat1Data: string
  stat2Label: string
  stat2Data: string
  stat3Label: string
  stat3Data: string
}

type HomepageEvent = Pick<
  PHEvent,
  'name' | 'start' | 'end' | 'unlisted' | 'slug'
>
