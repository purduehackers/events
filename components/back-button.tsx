import Link from 'next/link'
import { ArrowLeft } from 'react-feather'

const BackButton = () => (
  <div className="p-4">
    <Link
      href="/"
      className="flex flex-row justify-left text-amber-500 hover:text-amber-400 transition"
    >
      <ArrowLeft />
      All Events
    </Link>
  </div>
)

export default BackButton
