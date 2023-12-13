import { useTheme } from 'next-themes'
import { Moon, Sun } from 'react-feather'

const ThemeButton = () => {
  // const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  // useEffect(() => setMounted(true), [])

  // if (!mounted) return null

  return (
    <button
      className="p-4 cursor-default"
      aria-hidden
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      {resolvedTheme === 'light' ? <Sun color="black" /> : <Moon />}
    </button>
  )
}

export default ThemeButton
