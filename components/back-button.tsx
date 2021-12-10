import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'react-feather'

const BackButton = ({ bg = 'bg-gray-100 dark:bg-gray-800' }) => (
  <div className={`${bg}`}>
    <div className="p-4">
      <Link href="/" passHref>
        <a
          href="#"
          className="flex flex-row justify-left text-amber-500 hover:text-amber-400 transition ml-4 mr:0 xl:ml-32 w-max"
        >
          <ArrowLeft />
          All Events
        </a>
      </Link>
    </div>
  </div>
)

export default BackButton
