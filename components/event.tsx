import React from 'react'
import Link from 'next/link'
import tt from 'tinytime'

const past = dt => new Date(dt) < new Date()
const now = (start, end) =>
  new Date() > new Date(start) && new Date() < new Date(end)

const Event = ({ name, slug, start, end }) => {
  return (
    <Link href="/[slug]" as={`/${slug}`} passHref>
      <a href="#">
        <div className={past(end) ? "bg-gray-200 rounded-lg p-5" : "bg-yellow-400 rounded-lg p-5 hover:scale-105 transform transition"}>
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
}

export default Event