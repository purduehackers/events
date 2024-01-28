import { formatDate } from './formatDate'

export const ogUrl = (event: PHEvent) =>
  `https://og.purduehackers.com/${event.name.replace(
    new RegExp(' ', 'g'),
    '%20'
  )}.png?theme=${
    event.name.includes('Hack Night') ? 'dark' : 'light'
  }&md=1&fontSize=${event.name.length < 30 ? '250' : '200'}px&caption=${
    event.start !== 'TBD'
      ? formatDate(new Date(event.start), 'LLL%20d%20•')
      : ''
  }%20${event.loc.replace(new RegExp(' ', 'g'), '%20')}`
