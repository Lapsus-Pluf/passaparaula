import type { LetterState } from '../types'
import './Rosco.css'

interface RoscoProps {
  letters: LetterState[]
  currentIndex: number
  cameraElement?: React.ReactNode
}

const STATUS_COLORS: Record<string, { fill: string; stroke: string }> = {
  pending: { fill: '#1a2444', stroke: '#2d3a5c' },
  current: { fill: '#2a1f5e', stroke: '#f1c40f' },
  correct: { fill: '#1a4d2e', stroke: '#2ecc71' },
  incorrect: { fill: '#4d1a1a', stroke: '#e74c3c' },
  passed: { fill: '#3d2e1a', stroke: '#e67e22' },
}

export function Rosco({ letters, currentIndex, cameraElement }: RoscoProps) {
  const count = letters.length
  const size = 600
  const center = size / 2
  const radius = size / 2 - 40
  const tileRadius = count <= 15 ? 30 : count <= 20 ? 28 : count <= 27 ? 25 : 20
  const topAnchorAngle = -Math.PI / 2

  return (
    <div className="rosco-container">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="rosco-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow filter for current letter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="camera-clip">
            <circle cx={center} cy={center} r={radius - tileRadius - 20} />
          </clipPath>
        </defs>

        {/* Letter tiles around the circle */}
        {letters.map((letterState, i) => {
          const angle = topAnchorAngle + (2 * Math.PI * i) / count
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          const colors = STATUS_COLORS[letterState.status] ?? STATUS_COLORS.pending!
          const isCurrent = i === currentIndex

          return (
            <g
              key={i}
              className={`rosco-tile ${letterState.status} ${isCurrent ? 'is-current' : ''}`}
              filter={isCurrent ? 'url(#glow)' : undefined}
            >
              <circle
                cx={x}
                cy={y}
                r={tileRadius}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isCurrent ? 3 : 2}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="rosco-letter"
                fill={isCurrent ? '#f1c40f' : '#ccd6f6'}
                fontSize={tileRadius * 0.9}
                fontWeight={isCurrent ? 800 : 600}
              >
                {letterState.entry.letter}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Camera in center of rosco */}
      <div className="rosco-center">
        {cameraElement}
      </div>
    </div>
  )
}
