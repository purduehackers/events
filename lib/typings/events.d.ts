interface AirtableAttachment {
  id: string
  size: number
  width: number
  height: number
  url: string
  type: string
  filename: string
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
  slug: string
  emailSent: boolean
  secondEmailSent: boolean
  unlisted: boolean
  rsvpCount: number
  pastEventDesc: string
  recapImages: Array<AirtableAttachment>
  hasPastEventDesc: boolean
}
