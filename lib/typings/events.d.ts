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
  ogDescription: string
  slug: string
  emailSent: boolean
  secondEmailSent: boolean
  unlisted: boolean
  rsvpCount: number
  pastEventDesc: string
  recapImages: Array<AirtableAttachment>
  hasPastEventDesc: boolean
  stat1Label: string
  stat1Data: string
  stat2Label: string
  stat2Data: string
  stat3Label: string
  stat3Data: string
}
