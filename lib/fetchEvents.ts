import { AirtablePlusPlus, AirtablePlusPlusRecord } from 'airtable-plusplus'
import { orderBy } from 'lodash'
import { GithubSlugger } from 'github-slugger-typescript'
import { past } from './past'

const airtable = new AirtablePlusPlus({
  apiKey: `${process.env.AIRTABLE_API_KEY}`,
  baseId: 'appfaalz9AzKDwSup',
  tableName: 'Events'
})

interface AirtableFields {
  'Event Name': string
  'Event Date & Start Time': string
  'Event Date & End Time': string
  'Event Location': string
  'Location Map Link (optional)': string
  'Calendar Link': string
  'OG Description': string
  'Event Description': string
  Slug: string
  'Custom Slug': string
  'Reminder Email Sent': boolean
  'Second Email Sent': boolean
  Unlisted: boolean
  'RSVP Count': number
  'Past Event Description': string
  'Recap Images': Array<AirtableAttachment>
  'Has Past Event Description?': number
  'Stat 1 Data': string
  'Stat 1 Label': string
  'Stat 2 Data': string
  'Stat 2 Label': string
  'Stat 3 Data': string
  'Stat 3 Label': string
}

export const fetchEvents = async (): Promise<PHEvent[]> => {
  const slugger = new GithubSlugger()
  const airtableEvents =
    (await airtable.read({ 
        filterByFormula: '({Event Name})'
      })) as unknown as AirtablePlusPlusRecord<AirtableFields>[]
  const events = airtableEvents.map(({ id, fields }) => ({
    id,
    name: fields['Event Name'] ?? 'Mysterious Event',
    desc:
      fields['Event Description'] ??
      `We're still working on this event...check back later for more details!`,
    start: fields['Event Date & Start Time'] ?? 'TBD',
    end: fields['Event Date & End Time'] ?? 'TBD',
    loc: fields['Event Location'] ?? 'TBD',
    gMap: fields['Location Map Link (optional)'] ?? false,
    calLink: fields['Calendar Link'] ?? false,
    ogDescription: fields['OG Description'] ?? '',
    emailSent: fields['Reminder Email Sent'] ?? false,
    secondEmailSent: fields['Second Email Sent'] ?? false,
    unlisted: fields['Unlisted'] ?? false,
    rsvpCount: fields['RSVP Count'] ?? 0,
    slug: fields['Custom Slug'] ?? slugger.slug(fields['Event Name']),
    pastEventDesc:
      fields['Past Event Description'] ??
      'A past Purdue Hackers event...more details coming soon!',
    recapImages: fields['Recap Images'] ?? [{ url: 'https://mbs.zone/geck' }],
    hasPastEventDesc:
      fields['Has Past Event Description?'] === 1 ? true : false,
    stat1Data: fields['Stat 1 Data'] ?? '',
    stat1Label: fields['Stat 1 Label'] ?? '',
    stat2Data: fields['Stat 2 Data'] ?? '',
    stat2Label: fields['Stat 2 Label'] ?? '',
    stat3Data: fields['Stat 3 Data'] ?? '',
    stat3Label: fields['Stat 3 Label'] ?? ''
  }))

  return orderBy(events, 'start')
}

/** 
console.log(gatherBlankRecords(airtable))
console.log('adasd')

async function gatherBlankRecords(table) {
  let reachedBatchLimit = false;
  // get list of non-computed fields (don't need to check for values in computed fields)
  let nonComputedFields = table.fields.filter((field) => { return (! field.isComputed)});
  let primaryFieldId = table.fields[0].id;
  let nonComputedFieldIds = nonComputedFields.map((field) => { return field.id});
  // get all the records in the table, returning only non-computed fields
  // sort by primary field, as blank records should appear first
  let queryResult = await table.selectRecordsAsync({
    sorts: [{field: primaryFieldId, direction: 'asc'}],
    fields: nonComputedFieldIds
  });
  // pick out blank records until reach batch limit or the end of the records
  let blankRecordIds = [];
  for (let record of queryResult.records) {
    let recordIsBlank = true;
    // check if this record has a value for any non-computed field
    for (let fieldId of nonComputedFieldIds) {
      if (record.getCellValue(fieldId) !== null) {
        recordIsBlank = false;
        break; // don't need to check other fields for this record, move on ot next record
      }
    }
    if (recordIsBlank) {
      // add blank record to list of blank records and check for batch limit
      blankRecordIds.push(record.id);
      if (blankRecordIds.length >= batchLimit) {
        reachedBatchLimit = true;
        break; // reached the batch limit so can stop checking other records
      }
    };
  }
  return {blankRecordIds, reachedBatchLimit};
}

async function deleteRecords(blankRecordIds, reachedBatchLimit = null) {
  // tell user number of blank records and show preview
  if (blankRecordIds.length == 0) {
    output.markdown(`# No blank records found.`);
    return ("no records to delete");
  } else if (blankRecordIds.length == 1) {
    output.markdown(`# Found 1 blank record to delete.`);
  } else if (reachedBatchLimit) {
    output.markdown(`Found ${batchLimit} blank records to delete (batch limit). There may be more.`);
  } else {
    output.markdown(`# Found ${blankRecordIds.length} blank records to delete`);
  }
  output.inspect(blankRecordIds);
  // ask for confirmation
  let userResponse = await input.buttonsAsync('Delete records?', [
    {label: 'Abort', value: 'Abort'},
    {label: 'Delete', value: 'Delete', variant: 'danger'}
  ]);
  // Evaluate user decision
  if (userResponse == "Delete") {
    // do the delete
    await table.deleteRecordsAsync(blankRecordIds);
    return "Deleted records";
  } else {
    return "Aborted";
  }
}**/