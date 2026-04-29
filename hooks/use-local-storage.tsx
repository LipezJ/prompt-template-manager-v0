"use client"

import { useState, useEffect, type Dispatch, type SetStateAction } from "react"

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(error)
    }
    setIsLoaded(true)
  }, [key])

  useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue, isLoaded])

  return [storedValue, setStoredValue]
}
