import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'react-feather'

const BackButton = ({ bg = 'bg-gray-100 dark:bg-gray-800' }) => (
    <div className={`${bg}`}>
      <div className="">
      <Link href="/" passHref>
        <a href="#" className="flex flex-row justify-left p-2 text-yellow-500 hover:text-yellow-400 transition ml-4 mr:0 xl:ml-32 py-4 w-max">
            <ArrowLeft />
            All Events
        </a>
      </Link>
      </div>
    </div>
)

export default BackButton