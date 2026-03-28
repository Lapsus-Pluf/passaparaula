import type { GamePhase } from '../types'
import './Controls.css'

interface ControlsProps {
  phase: GamePhase
  onStart: () => void
  onCorrect: () => void
  onIncorrect: () => void
  onPass: () => void
  onPause: () => void
  onResume: () => void
  pauseOnAction: boolean
  onTogglePauseOnAction: () => void
  pauseOnPass: boolean
  onTogglePauseOnPass: () => void
}

export function Controls({
  phase,
  onStart,
  onCorrect,
  onIncorrect,
  onPass,
  onPause,
  onResume,
  pauseOnAction,
  onTogglePauseOnAction,
  pauseOnPass,
  onTogglePauseOnPass,
}: ControlsProps) {
  const isPlaying = phase === 'playing'
  const isPaused = phase === 'paused'
  const isIdle = phase === 'idle'

  return (
    <div className="controls">
      {/* ── Action buttons row ── */}
      <div className="controls-actions">
        {isIdle && (
          <button className="btn btn-start" onClick={onStart}>
            <span className="btn-label">Començar</span>
            <kbd>Enter</kbd>
          </button>
        )}

        {isPlaying && (
          <>
            <button className="btn btn-correct" onClick={onCorrect}>
              <span className="btn-label">Correcte</span>
              <kbd>B</kbd>
            </button>
            <button className="btn btn-incorrect" onClick={onIncorrect}>
              <span className="btn-label">Incorrecte</span>
              <kbd>M</kbd>
            </button>
            <button className="btn btn-pass" onClick={onPass}>
              <span className="btn-label">Passaparaula</span>
              <kbd>P</kbd>
            </button>
            <button className="btn btn-pause" onClick={onPause}>
              <span className="btn-label">Pausar</span>
              <kbd>Espai</kbd>
            </button>
          </>
        )}

        {isPaused && (
          <button className="btn btn-resume" onClick={onResume}>
            <span className="btn-label">Reprendre</span>
            <kbd>Espai</kbd>
          </button>
        )}
      </div>

      {/* ── Settings row ── */}
      <div className="controls-settings">
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={pauseOnAction}
            onChange={onTogglePauseOnAction}
          />
          <span className="toggle-label">Pausar per lletra</span>
        </label>

        {pauseOnAction && (
          <label className="setting-toggle setting-toggle-sub">
            <input
              type="checkbox"
              checked={pauseOnPass}
              onChange={onTogglePauseOnPass}
            />
            <span className="toggle-label">i en passaparaula</span>
          </label>
        )}
      </div>
    </div>
  )
}
