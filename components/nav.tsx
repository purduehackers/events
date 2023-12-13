import { useRouter } from 'next/router'

import BackButton from './back-button'
import ThemeButton from './theme-button'

const Nav = ({ noSticky = false }: { noSticky?: boolean }) => {
  const { pathname } = useRouter()

  return (
    <nav
      className={
        noSticky
          ? `w-full top-0 z-10 bg-gray-100 dark:bg-gray-800 h-14`
          : `w-full top-0 z-10 bg-gray-nav dark:bg-gray-nav-dark backdrop-blur fixed h-14`
      }
    >
      <div className="container px-4 sm:px-14 mx-auto flex">
        {pathname !== '/' && <BackButton />}
        <div className="grow" />
        <ThemeButton />
      </div>
    </nav>
  )
}

export default Nav
