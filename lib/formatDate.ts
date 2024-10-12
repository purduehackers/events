import { format, toZonedTime } from 'date-fns-tz'

const formatDateTz = (date: Date) =>
  new Date(date.toLocaleString('en-US', { timeZone: 'America/Indianapolis' }))

export const formatDate = (date: Date, formatString: string) =>
  format(formatDateTz(date), formatString)

export const formatUTCDate = (date: Date, formatString: string) =>
  format(toZonedTime(date, 'UTC'), formatString, { timeZone: 'UTC' })

export const eventSpansAcrossMultipleDays = (
  start: string,
  end: string
): boolean => {
  const startDate = formatDateTz(new Date(start)).getDate()
  const endDate = formatDateTz(new Date(end)).getDate()
  return startDate !== endDate
}

export const startTimeFormatString = (start: string, end: string): string => {
  let baseString = 'h:mm'
  if (end === 'TBD' || eventSpansAcrossMultipleDays(start, end)) {
    baseString += ' a'
  }
  return baseString
}
