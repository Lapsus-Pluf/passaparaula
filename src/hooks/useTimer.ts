import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimerReturn {
  timeLeft: number
  isRunning: boolean
  start: () => void
  pause: () => void
  resume: () => void
  reset: (newTime?: number) => void
}

export function useTimer(initialSeconds: number, onExpire: () => void): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const onExpireRef = useRef(onExpire)

  onExpireRef.current = onExpire

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clearTimer()
    setIsRunning(true)
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  const pause = useCallback(() => {
    clearTimer()
    setIsRunning(false)
  }, [clearTimer])

  const resume = useCallback(() => {
    if (timeLeft > 0) {
      start()
    }
  }, [timeLeft, start])

  const reset = useCallback((newTime?: number) => {
    clearTimer()
    setIsRunning(false)
    setTimeLeft(newTime ?? initialSeconds)
  }, [clearTimer, initialSeconds])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return { timeLeft, isRunning, start, pause, resume, reset }
}
