import './Timer.css'

interface TimerProps {
  timeLeft: number
  isRunning: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Timer({ timeLeft, isRunning }: TimerProps) {
  const isLow = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className={`timer ${isLow ? 'timer-low' : ''} ${isCritical ? 'timer-critical' : ''}`}>
      <div className="timer-label">{isRunning ? 'Temps' : 'En pausa'}</div>
      <div className="timer-value">{formatTime(timeLeft)}</div>
    </div>
  )
}
