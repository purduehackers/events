import { v4 as uuidv4 } from 'uuid'
import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Emails'
})

export const generateUUID = async (email: string): Promise<void> => {
  const uuid = uuidv4()

  const emailRecords = await airtable.read({
    filterByFormula: `Email = '${email}'`
  }) as unknown as AirtablePlusPlusRecord<{ name: string; uuid: string }>[]

  if (emailRecords.length === 0) {
    await airtable.create({
      'Email': email,
      'UUID': uuid
    })
  } else {
    await airtable.updateWhere(`Name = '${email}'`, {
      'UUID': uuid 
    })
  }
}

export const uuidIsValid = async (email: string, uuid: string): Promise<boolean> => {
  const emailRecord = (await airtable.read({
    filterByFormula: `Email = '${email}'`
  }))[0]
  if (typeof emailRecord === undefined) return false

  return emailRecord.fields['UUID'] === uuid
}