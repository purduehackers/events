import React from 'react'
import Link from 'next/link'
import tt from 'tinytime'

const past = dt => new Date(dt) < new Date()

const Event = ({ name, slug, start, end }) => (
  <Link href="/[slug]" as={`/${slug}`} passHref>
    <a href="#">
      
      <div className={`col-span-1 shadow-lg flex flex-col rounded-lg justify-center p-5 sm:min-h-full ${past(end)
        ? "bg-gray-200" : "bg-yellow-400 hover:scale-105 transform transition"}`}>
        <p>
          {start === 'TBD' ? 'TBD' : tt(`${past(end) ? '{MM} {Do}, {YYYY} •' : '{MM} {Do} •'}`).render(new Date(start))}{' '}
          {start === 'TBD' ? '' : tt('{h}:{mm}').render(new Date(start)) + "—"}
          {end === 'TBD' ? '' : tt('{h}:{mm} {a}').render(new Date(end))}
        </p>
        <h1 className={`text-2xl sm:text-${name.length < 30 ? '2xl' : 'xl'} font-bold`}>{name}</h1>
      </div>
    </a>
  </Link>
)

export default Event