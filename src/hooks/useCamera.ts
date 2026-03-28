import { useState, useRef, useCallback, useEffect } from 'react'

/** Hardware zoom capability reported by the browser */
type ZoomCapability = { min: number; max: number; step?: number }

const SW_ZOOM_STEP = 0.25
const SW_MAX_ZOOM = 4
const SW_MIN_ZOOM = 1

interface UseCameraReturn {
  /** Callback ref — pass to the <video> element's ref prop */
  setVideoElement: (el: HTMLVideoElement | null) => void
  isActive: boolean
  error: string | null
  toggle: () => void
  stop: () => void
  /** Current zoom level (1 = no zoom) */
  zoomLevel: number
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  /**
   * true  → hardware zoom via applyConstraints (no CSS scale needed)
   * false → software zoom via CSS transform: scale()
   */
  isHardwareZoom: boolean
}

export function useCamera(): UseCameraReturn {
  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const hwZoomRef = useRef<ZoomCapability | null>(null)

  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isHardwareZoom, setIsHardwareZoom] = useState(false)

  /** Bind the current stream to the current video element */
  const bindStream = useCallback(() => {
    const video = videoElRef.current
    const stream = streamRef.current
    if (video && stream) {
      video.srcObject = stream
      video.play().catch(() => { /* autoplay may be blocked */ })
    }
  }, [])

  /** Callback ref: called when <video> mounts or unmounts */
  const setVideoElement = useCallback(
    (el: HTMLVideoElement | null) => {
      videoElRef.current = el
      if (el) bindStream()
    },
    [bindStream]
  )

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoElRef.current) {
      videoElRef.current.srcObject = null
    }
    hwZoomRef.current = null
    setIsActive(false)
    setZoomLevel(1)
    setIsHardwareZoom(false)
  }, [])

  const applyHardwareZoom = useCallback(async (level: number): Promise<void> => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      // 'zoom' is not in the standard TS types yet — cast required
      await track.applyConstraints({
        advanced: [{ zoom: level } as unknown as MediaTrackConstraintSet],
      })
    } catch {
      // Silently ignore: device may not support zoom at this level
    }
  }, [])

  const startStream = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } },
        audio: false,
      })
      streamRef.current = stream
      setZoomLevel(1)

      // Detect hardware zoom capability
      const track = stream.getVideoTracks()[0]
      if (track) {
        const caps = track.getCapabilities() as MediaTrackCapabilities & {
          zoom?: ZoomCapability
        }
        if (caps.zoom) {
          hwZoomRef.current = caps.zoom
          setIsHardwareZoom(true)
        }
      }

      setIsActive(true)
      bindStream()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No s'ha pogut accedir a la càmera."
      setError(message)
      setIsActive(false)
    }
  }, [bindStream])

  const toggle = useCallback(() => {
    if (isActive) stopStream()
    else void startStream()
  }, [isActive, stopStream, startStream])

  const zoomIn = useCallback(() => {
    if (!isActive) return
    const hw = hwZoomRef.current
    if (hw) {
      setZoomLevel((prev) => {
        const next = Math.min(prev + (hw.step ?? 0.5), hw.max)
        void applyHardwareZoom(next)
        return +next.toFixed(2)
      })
    } else {
      setZoomLevel((prev) => +Math.min(prev + SW_ZOOM_STEP, SW_MAX_ZOOM).toFixed(2))
    }
  }, [isActive, applyHardwareZoom])

  const zoomOut = useCallback(() => {
    if (!isActive) return
    const hw = hwZoomRef.current
    if (hw) {
      setZoomLevel((prev) => {
        const next = Math.max(prev - (hw.step ?? 0.5), hw.min)
        void applyHardwareZoom(next)
        return +next.toFixed(2)
      })
    } else {
      setZoomLevel((prev) => +Math.max(prev - SW_ZOOM_STEP, SW_MIN_ZOOM).toFixed(2))
    }
  }, [isActive, applyHardwareZoom])

  const resetZoom = useCallback(() => {
    if (!isActive) return
    const hw = hwZoomRef.current
    const resetVal = hw ? hw.min : 1
    setZoomLevel(resetVal)
    if (hw) void applyHardwareZoom(resetVal)
  }, [isActive, applyHardwareZoom])

  // Clean up stream on unmount
  useEffect(() => {
    return stopStream
  }, [stopStream])

  return {
    setVideoElement,
    isActive,
    error,
    toggle,
    stop: stopStream,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    isHardwareZoom,
  }
}
