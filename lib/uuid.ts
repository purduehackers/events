/* eslint-disable no-console */
import { createClient } from 'next-sanity'
import { v4 as uuidv4 } from 'uuid'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true,
  token: process.env.SANITY_TOKEN,
})

export const generateUUID = async (email: string): Promise<string> => {
  const uuid = uuidv4()

  const doc = {
    _id: email.replace('@', ''),
    _type: 'email-uuid',
    email,
    uuid,
  }
  client
    .createOrReplace(doc)
    .then((res) => {
      console.log(`UUID was created, document ID is ${res._id}`)
    })
    .catch((err) => console.log('error creating', err))

  return uuid
}

export const verifyUUID = async (
  email: string,
  uuid: string
): Promise<boolean> => {
  const doc = await client.getDocument(email.replace('@', ''))
  return doc?.uuid === uuid
}
