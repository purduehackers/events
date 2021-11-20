import React from 'react'
import Link from 'next/dist/client/link'
import { ArrowLeft } from 'react-feather'

const BackButton = () => (
  <Link href="/" passHref>
    <div className="bg-gray-100">
      <div className="w-1/2 sm:w-1/4">
        <a href="#" className="flex flex-row p-2 text-yellow-500 hover:text-yellow-400 transition px-4 xl:px-32 py-4">
          <ArrowLeft />
          All Events
        </a>
      </div>
    </div>
  </Link>
)

export default BackButton