import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import BackButton from './back-button'
import ThemeButton from './theme-button'

const Nav = () => {
  const { resolvedTheme } = useTheme()
  const { pathname } = useRouter()

  return (
    <nav className="w-full bg-gray-100 dark:bg-gray-800 sticky top-0">
      <div className="container px-4 sm:px-14 mx-auto flex">
        {pathname !== '/' && <BackButton />}
        <div className="grow" />
        {resolvedTheme && <ThemeButton />}
      </div>
    </nav>
  )
}

export default Nav
