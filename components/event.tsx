import React from 'react'
import Link from 'next/link'

type Props = {
  name: string,
  slug: string
}

const Event: React.FC<Props> = ({ name, slug}) => {
  return (
    <Link href="/[slug]" as={`/${slug}`} passHref>
      <a href="#">
        <div className="bg-gray-200 rounded-lg">
          <h1>{name}</h1>
        </div>
      </a>
    </Link>
  )
}

export default Event