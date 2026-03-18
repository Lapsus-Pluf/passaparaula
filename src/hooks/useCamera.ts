import { useState, useRef, useCallback, useEffect } from 'react'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isActive: boolean
  error: string | null
  toggle: () => void
  stop: () => void
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }, [])

  const startStream = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsActive(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No s'ha pogut accedir a la càmera."
      setError(message)
      setIsActive(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (isActive) {
      stopStream()
    } else {
      void startStream()
    }
  }, [isActive, stopStream, startStream])

  useEffect(() => {
    return stopStream
  }, [stopStream])

  return { videoRef, isActive, error, toggle, stop: stopStream }
}
