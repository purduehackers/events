import React from 'react'
import Link from 'next/link'
import tt from 'tinytime'

const past = dt => new Date(dt) < new Date()

const Event = ({ name, slug, start, end }) => (
  <Link href="/[slug]" as={`/${slug}`} passHref>
    <a href="#">
      
      <div className={`col-span-1 flex flex-col rounded-lg p-5 sm:min-h-full ${past(end)
        ? "bg-gray-200" : "bg-yellow-400 hover:scale-105 transform transition"}`}>
        <p>
          <strong>{start === 'TBD' ? 'TBD' : tt('{MM} {Do}').render(new Date(start))}</strong>{' '}
          {start === 'TBD' ? '' : tt('{h}:{mm}').render(new Date(start)) + "—"}
          {end === 'TBD' ? '' : tt('{h}:{mm} {a}').render(new Date(end))}
        </p>
        <h1 className="text-xl">{name}</h1>
      </div>
    </a>
  </Link>
)

export default Event