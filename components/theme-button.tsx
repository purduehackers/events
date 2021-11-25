import { Moon, Sun } from 'react-feather'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const ThemeButton = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="p-4 mr-4 w-full xl:mr-32 flex flex-row justify-end bg-gray-100 dark:bg-gray-800">
      {resolvedTheme === 'light' && (
        <Moon color="black" onClick={() => setTheme('dark')} />
      )}
      {resolvedTheme === 'dark' && <Sun onClick={() => setTheme('light')} />}
    </div>
  )
}

export default ThemeButton
