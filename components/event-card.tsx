import { format as formatDate } from 'date-fns'
import Link from 'next/link'
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
  <div>
    <Link
      href={`/${slug}`}
      className={`col-span-1 h-full shadow-lg dark:shadow-black/25 flex flex-col rounded-lg justify-center p-5 ${
        past(start)
          ? 'bg-gray-200 dark:bg-gray-700'
          : 'bg-amber-400 dark:bg-amber-500 hover:scale-105 transform transition'
      }`}
    >
      <p className={past(start) ? '' : 'text-black dark:text-black transition'}>
        {start === 'TBD'
          ? 'TBD'
          : formatDate(
              new Date(start),
              `${past(start) ? 'LLL do, Y •' : 'eee. LLL do •'}`
            )}{' '}
        {start === 'TBD'
          ? ''
          : formatDate(new Date(start), `h:mm${end === 'TBD' ? ' a' : ''}`) +
            '—'}
        {end === 'TBD' ? '???' : formatDate(new Date(end), 'h:mm a')}
      </p>
      <h3
        className={`${name.length < 30 ? 'text-2xl' : 'text-2xl sm:text-xl'} ${
          past(start) ? '' : ' text-black dark:text-black transition'
        } font-bold`}
      >
        {name}
      </h3>
    </Link>
  </div>
)

export default EventCard
