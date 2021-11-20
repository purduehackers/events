import React from 'react'
import Link from 'next/dist/client/link'
import { ArrowLeft } from 'react-feather'

const BackButton = () => (
  <Link href="/" passHref>
    <div className="bg-gray-100">
      <a href="#" className="flex flex-row p-2 text-yellow-500 hover:text-yellow-400 transition px-16 py-4">
        <ArrowLeft />
        All Events
      </a>
    </div>
  </Link>
)

export default BackButton