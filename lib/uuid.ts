import { v4 as uuidv4 } from 'uuid'
import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Emails'
})

export const generateUUID = async (email: string): Promise<string> => {
  const uuid = uuidv4()

  const emailRecords = await airtable.read({
    filterByFormula: `Email = '${email}'`
  }) as unknown as AirtablePlusPlusRecord<{ email: string; uuid: string }>[]

  if (emailRecords.length === 0) {
    await airtable.create({
      'Email': email,
      'UUID': uuid
    })
  } else {
    await airtable.updateWhere(`Email = '${email}'`, {
      'UUID': uuid 
    })
  }

  return uuid
}

export const uuidIsValid = async (email: string|string[], uuid: string|string[]): Promise<boolean> => {
  const emailRecord = (await airtable.read({
    filterByFormula: `Email = '${email}'`
  }))[0]

  return emailRecord?.fields['UUID'] === uuid ?? false
}

export const deleteUUIDRecord = async (email: string|string[]): Promise<void> => {
  await airtable.deleteWhere(`Email = '${email}'`)
}