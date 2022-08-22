import React, { useState } from 'react'

const RSVPForm = ({ eventName, slug }: { eventName: string; slug: string }) => {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    let submission = await fetch('/api/verifyEmail', {
      method: 'POST',
      body: JSON.stringify({ email, eventName, slug }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    if (submission.ok) {
      submission = await submission.json()
      setEmail('')
      setSubmitting(false)
      setDone(true)
    } else {
      setSubmitting(false)
      setError('Something went wrong')
    }
  }

  return (
    <div className="flex flex-col items-left mt-6">
      <label
        htmlFor="email"
        className="text-sm text-gray-500 dark:text-gray-400 mb-1"
      >
        Enter your email
      </label>
      <form
        onSubmit={onSubmit}
        className="flex flex-col xs:flex-row items-left gap-y-2 xs:gap-x-2 mb-1"
      >
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          placeholder="fhackworth@purdue.edu"
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border-none outline-none dark:bg-gray-900 dark:text-gray-100"
        ></input>
        <button
          type="submit"
          className="bg-amber-400 dark:bg-amber-500 rounded-md shadow-md dark:shadow-black/25 py-2 xs:px-2 font-bold hover:scale-105 transform transition
        disabled:opacity-50 disabled:hover:scale-100 dark:text-black"
          disabled={email.length === 0}
        >
          {submitting ? '•••' : 'Submit'}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-red-500 text-sm">
          Something went wrong—please try again. If you keep seeing this, send
          an email to mstanciu@purdue.edu.
        </p>
      )}
      {done && (
        <p role="status" className="text-green-500 text-sm">
          ✉️ 🚀 Yay! Now check your inbox & verify your email in order to
          receive the reminder.
        </p>
      )}
    </div>
  )
}

export default RSVPForm
