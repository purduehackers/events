import { useEffect, useRef, useState } from 'react'

function init(key: string, initial: string | number) {
  if (typeof localStorage == 'undefined') {
    return initial
  }
  return localStorage.getItem(key) ?? initial
}
export function useLocalState(key: string, initial: string | number) {
  const prevKey = useRef(key)
  useEffect(() => {
    // do not allow changing keys
    // for the same state
    // since that makes it harder to predictably fetch the info
    if (key !== prevKey.current) {
      throw new Error('Cannot change keys for useLocalState')
    }
  }, [key])
  const [state, _setState] = useState(() => init(key, initial))
  const setState: typeof _setState = function (e) {
    return _setState((prev) => {
      const next = typeof e === 'function' ? e(prev) : e
      localStorage.setItem(key, String(next))
      return next
    })
  }
  return [state, setState] as const
}
