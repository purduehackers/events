import { useRouter } from 'next/router'
import BackButton from '../components/back-button'

const EmailConfirm = () => {
  const router = useRouter()
  const { eventName } = router.query

  return (
    <main>
      <BackButton bg="bg-white" />
      <div className="flex items-center justify-center h-screen -my-12 sm:-my-14">
      <div className="container mx-auto px-4 md:px-16 lg:px-72 xl:px-96">
        <div className="rounded-lg shadow-md bg-gray-200 p-4 flex flex-col justify-center gap-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">You've already signed up!</h1>
          <p>
            Good on you for double-checking, but you're all set! Your email has already been added to the list.{' '}
            You'll receive an email from us a day before the event starts.
          </p>
          <p>
            While you're waiting, you should join the Purdue Hackers Discord server if you aren't there already!{' '}
            You'll join a community of creative makers at Purdue, and you'll be the first to hear about new events.
          </p>
          <div className="pt-5 w-max">
            <a href="https://bit.ly/PurdueHackersDiscord" target="_blank">
              <div className="flex flex-row gap-x-1 rounded-lg shadow-md bg-blue-discord p-2 px-4 text-center hover:scale-105 transform transition">
                <h1 className="font-bold text-white">Join Discord</h1>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
    </main>
  )
}

export default EmailConfirm