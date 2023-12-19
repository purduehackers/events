import { NextApiRequest, NextApiResponse } from 'next'

import { fetchEvents } from '../../lib/fetchEvents'

export default async function fetchEventsApi(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const events = await fetchEvents()
  res.json(events)
}
