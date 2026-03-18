import './CameraView.css'

interface CameraViewProps {
  setVideoRef: (el: HTMLVideoElement | null) => void
  isActive: boolean
  onToggle: () => void
}

export function CameraView({ setVideoRef, isActive, onToggle }: CameraViewProps) {
  return (
    <div className="camera-view" onClick={onToggle}>
      {isActive ? (
        <video
          ref={setVideoRef}
          className="camera-video"
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div className="camera-placeholder">
          <svg
            viewBox="0 0 24 24"
            className="camera-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="camera-label">Fes clic per obrir la càmera</p>
        </div>
      )}
    </div>
  )
}
