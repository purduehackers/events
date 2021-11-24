import { useTheme } from 'next-themes'
import BackButton from '../components/back-button'
import StyledLink from '../components/styled-link'
import ThemeButton from '../components/theme-button'

const EmailConfirm = () => {
  const { resolvedTheme } = useTheme()

  return (
    <main>
      <div className="flex flex-row bg-gray-100 dark:bg-gray-800">
        <BackButton />
        {resolvedTheme && (
          <ThemeButton />
        )}
      </div>
      <div className="flex items-center justify-center h-screen -my-12 sm:-my-14">
      <div className="container mx-auto px-4 md:px-16 lg:px-72 xl:px-96">
        <div className="rounded-lg shadow-md bg-red-200 dark:bg-red-900 p-4 flex flex-col justify-center gap-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Couldn't add you to the list :(</h1>
          <p>
            We couldn't add you to the mailing list :( this usually happens if you clicked a button on an old email.
          </p>
          <p>
            Try signing up to receive reminders again on the event page. Make sure to wait for a new email to arrive &{' '}
            click on that email's button.
          </p>
          <p>
            If you did that and you're still seeing this, shoot an email to{' '}
            <StyledLink destination="mailto:mstanciu@purdue.edu" color="text-blue-600 hover:text-blue-500">mstanciu@purdue.edu</StyledLink>.
          </p>
        </div>
      </div>
    </div>
    </main>
  )
}

export default EmailConfirm