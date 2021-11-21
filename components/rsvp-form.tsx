import React from 'react'

const RSVPForm = ({ destination }) => (
  <div className="flex flex-col items-left mt-6">
    <p className="text-sm text-gray-500">Enter your email</p>
    <div className="flex flex-row items-left gap-x-2">
      <input type="email" placeholder="phacker@purdue.edu" className="rounded border-none outline-none"></input>
      <button className="bg-yellow-400 rounded-md shadow-md px-2 font-bold hover:scale-105 transform transition">Submit</button>
    </div>
  </div>
)

export default RSVPForm