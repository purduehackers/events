import React from 'react'
import Link from 'next/link'
import tt from 'tinytime'
import { past } from '../lib/past'

const Event = ({ name, slug, start, end }: { name: string, slug: string, start: string, end: string }) => (
  <Link href="/[slug]" as={`/${slug}`} passHref>
    <a href="#">
      
      <div className={`col-span-1 shadow-lg flex flex-col rounded-lg justify-center p-5 sm:min-h-full ${past(end)
        ? "bg-gray-200 dark:bg-gray-600" : "bg-yellow-400 dark:bg-yellow-500 hover:scale-105 transform transition"}`}>
        <p className={past(end) ? '' : 'text-black dark:text-black transition'}>
          {start === 'TBD' ? 'TBD' : tt(`${past(end) ? '{MM} {Do}, {YYYY} •' : '{dddd}. {MM} {Do} •'}`)
            .render(new Date(start))
            .replace('day', '').replace('nes', '').replace('Satur', 'Sat')}{' '}
          {start === 'TBD' ? '' : tt('{h}:{mm}').render(new Date(start)) + "—"}
          {end === 'TBD' ? '' : tt('{h}:{mm} {a}').render(new Date(end))}
        </p>
        <h1 className={`${name.length < 30 ? 'text-2xl' : 'text-2xl sm:text-xl'} ${past(end) ? '' : ' text-black dark:text-black transition'} font-bold`}>{name}</h1>
      </div>
    </a>
  </Link>
)

export default Event