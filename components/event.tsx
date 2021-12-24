import Link from 'next/link'
import tt from 'tinytime'
import { past } from '../lib/past'

const Event = ({
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
        past(end)
          ? 'bg-gray-200 dark:bg-gray-700'
          : 'bg-amber-400 dark:bg-amber-500 hover:scale-105 transform transition'
      }`}
    >
      <p className={past(end) ? '' : 'text-black dark:text-black transition'}>
        {start === 'TBD'
          ? 'TBD'
          : tt(`${past(end) ? '{MM} {Do}, {YYYY} •' : '{dddd}. {MM} {Do} •'}`)
              .render(new Date(start))
              .replace('day', '')
              .replace('nes', '')
              .replace('Satur', 'Sat')}{' '}
        {start === 'TBD' ? '' : tt('{h}:{mm}').render(new Date(start)) + '—'}
        {end === 'TBD' ? '' : tt('{h}:{mm} {a}').render(new Date(end))}
      </p>
      <h3
        className={`${name.length < 30 ? 'text-2xl' : 'text-2xl sm:text-xl'} ${
          past(end) ? '' : ' text-black dark:text-black transition'
        } font-bold`}
      >
        {name}
      </h3>
    </a>
  </Link>
)

export default Event
