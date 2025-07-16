import { createClient as createSanityClient } from 'next-sanity'

export const createClient = () => {
  return createSanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2022-03-25',
    useCdn: true,
    token: process.env.SANITY_TOKEN,
  })
}
