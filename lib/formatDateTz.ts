export const formatDateTz = (date: Date, tzString: string) =>
  new Date(date.toLocaleString('en-US', { timeZone: tzString }))
