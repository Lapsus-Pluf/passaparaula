import { useState, useRef, useCallback, useEffect } from 'react'

interface UseCameraReturn {
  /** Callback ref - pass this to the <video> element's ref prop */
  setVideoElement: (el: HTMLVideoElement | null) => void
  isActive: boolean
  error: string | null
  toggle: () => void
  stop: () => void
}

export function useCamera(): UseCameraReturn {
  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Bind a stream to the current video element (if any) */
  const bindStream = useCallback(() => {
    const video = videoElRef.current
    const stream = streamRef.current
    if (video && stream) {
      video.srcObject = stream
      video.play().catch(() => {
        /* autoplay may be blocked */
      })
    }
  }, [])

  /** Callback ref: called when <video> mounts/unmounts */
  const setVideoElement = useCallback(
    (el: HTMLVideoElement | null) => {
      videoElRef.current = el
      if (el) {
        // Video just mounted — bind the stream if we already have one
        bindStream()
      }
    },
    [bindStream]
  )

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoElRef.current) {
      videoElRef.current.srcObject = null
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
      setIsActive(true)
      // If video element is already mounted, bind immediately
      // (usually it isn't yet because isActive just changed, so setVideoElement will handle it)
      bindStream()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No s'ha pogut accedir a la càmera."
      setError(message)
      setIsActive(false)
    }
  }, [bindStream])

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

  return { setVideoElement, isActive, error, toggle, stop: stopStream }
}
