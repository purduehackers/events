import { useEffect, useState } from 'react'

function match(q: string): boolean {
  return !!window && window.matchMedia(q).matches
}
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => match(query))

  useEffect(() => {
    const matchMedia = window.matchMedia(query)
    const handleChange = () => setMatches(match(query))
    handleChange()

    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange)
    } else {
      matchMedia.addEventListener('change', handleChange)
    }
    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange)
      } else {
        matchMedia.removeEventListener('change', handleChange)
      }
    }
  }, [query])

  return matches
}

export default useMediaQuery
