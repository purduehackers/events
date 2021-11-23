import { useState } from 'react'

const RSVPForm = ({ eventName, slug }) => {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    let submission = await fetch(
      '/api/verifyEmail',
      {
        method: 'POST',
        body: JSON.stringify({ email, eventName, slug }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
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
      <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">Enter your email</p>
      <form onSubmit={onSubmit} className="flex flex-row items-left gap-x-2 mb-1">
        <input type="email" name="email" id="email" value={email} placeholder="phacker@purdue.edu"
        onChange={(e) => setEmail(e.target.value)} className="rounded border-none outline-none dark:bg-gray-900 dark:text-gray-100"></input>
        <button type="submit" className="bg-yellow-400 dark:bg-yellow-500 rounded-md shadow-md px-2 font-bold hover:scale-105 transform transition
        disabled:opacity-50 disabled:hover:scale-100" disabled={email.length === 0}>
          {submitting ? '•••' : 'Submit'}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm">Something went wrong—please try again. If you keep seeing this, send an email to mstanciu@purdue.edu.</p>
      )}
      {done && (
        <p className="text-green-500 text-sm">✉️ 🚀 Yay! Now check your inbox & verify your email in order to receive the reminder.</p>
      )}
    </div>
  )
}

export default RSVPForm