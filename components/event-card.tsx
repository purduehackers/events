import Link from 'next/link'
import tt from 'tinytime'
import { past } from '../lib/past'

const EventCard = ({
  name,
  slug,
  start,
  end
}: {
  name: string
  slug: string
  start: string
  end: string
}) => (
  <Link href={`/${slug}`} passHref>
    <a
      className={`col-span-1 shadow-lg dark:shadow-black/25 flex flex-col rounded-lg justify-center p-5 ${
        past(start)
          ? 'bg-gray-200 dark:bg-gray-700'
          : 'bg-amber-400 dark:bg-amber-500 hover:scale-105 transform transition'
      }`}
    >
      <p className={past(start) ? '' : 'text-black dark:text-black transition'}>
        {start === 'TBD'
          ? 'TBD'
          : tt(`${past(start) ? '{MM} {Do}, {YYYY} •' : '{dddd}. {MM} {Do} •'}`)
              .render(new Date(start))
              .replace('day', '')
              .replace('nes', '')
              .replace('Satur', 'Sat')}{' '}
        {start === 'TBD'
          ? ''
          : tt(`{h}:{mm}${end === 'TBD' ? ' {a}' : ''}`).render(
              new Date(start)
            ) + '—'}
        {end === 'TBD' ? '???' : tt('{h}:{mm} {a}').render(new Date(end))}
      </p>
      <h3
        className={`${name.length < 30 ? 'text-2xl' : 'text-2xl sm:text-xl'} ${
          past(start) ? '' : ' text-black dark:text-black transition'
        } font-bold`}
      >
        {name}
      </h3>
    </a>
  </Link>
)

export default EventCard
