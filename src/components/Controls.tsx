import type { GamePhase, GameStats } from '../types'
import './Controls.css'

interface ControlsProps {
  phase: GamePhase
  stats: GameStats
  isFinished: boolean
  onStart: () => void
  onCorrect: () => void
  onIncorrect: () => void
  onPass: () => void
  onPause: () => void
  onResume: () => void
  pauseOnAction: boolean
  onTogglePauseOnAction: () => void
  onPlayAgain: () => void
  finishReason: 'timeout' | 'completed'
}

export function Controls({
  phase,
  stats,
  isFinished,
  onStart,
  onCorrect,
  onIncorrect,
  onPass,
  onPause,
  onResume,
  pauseOnAction,
  onTogglePauseOnAction,
  onPlayAgain,
  finishReason,
}: ControlsProps) {
  const isPlaying = phase === 'playing'
  const isPaused = phase === 'paused'
  const isIdle = phase === 'idle'

  return (
    <div className="controls">
      {/* Score section */}
      <div className="score-panel">
        <div className="score-item score-correct">
          <span className="score-value">{stats.correct}</span>
          <span className="score-label">Correctes</span>
        </div>
        <div className="score-item score-incorrect">
          <span className="score-value">{stats.incorrect}</span>
          <span className="score-label">Incorrectes</span>
        </div>
        <div className="score-item score-remaining">
          <span className="score-value">{stats.remaining}</span>
          <span className="score-label">Restants</span>
        </div>
      </div>

      {/* Finished summary */}
      {isFinished && (
        <div className="finished-panel">
          <p className="finished-title">
            {stats.correct === stats.total
              ? 'Rosco complet!'
              : finishReason === 'timeout'
                ? 'Temps esgotat!'
                : 'Joc acabat!'}
          </p>
          <button className="btn btn-play-again" onClick={onPlayAgain}>
            Tornar a jugar
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="action-buttons">
        {isIdle && (
          <button className="btn btn-start" onClick={onStart}>
            Començar
          </button>
        )}

        {isPlaying && (
          <>
            <button className="btn btn-correct" onClick={onCorrect}>
              Correcte
            </button>
            <button className="btn btn-incorrect" onClick={onIncorrect}>
              Incorrecte
            </button>
            <button className="btn btn-pass" onClick={onPass}>
              Passaparaula
            </button>
            <button className="btn btn-pause" onClick={onPause}>
              Pausar
            </button>
          </>
        )}

        {isPaused && (
          <button className="btn btn-resume" onClick={onResume}>
            Reprendre
          </button>
        )}
      </div>

      {/* Pause-on-action toggle */}
      {!isFinished && (
        <label className="pause-on-action-toggle">
          <input
            type="checkbox"
            checked={pauseOnAction}
            onChange={onTogglePauseOnAction}
          />
          <span className="toggle-label">Pausar després de cada acció</span>
        </label>
      )}

      {/* Keyboard legend */}
      {!isFinished && (
        <div className="keyboard-legend">
          <h4 className="legend-title">Controls</h4>
          <div className="legend-items">
            {isIdle ? (
              <div className="legend-item">
                <kbd>Enter</kbd>
                <span>Començar</span>
              </div>
            ) : (
              <>
                <div className="legend-item">
                  <kbd>B</kbd>
                  <span>Correcte</span>
                </div>
                <div className="legend-item">
                  <kbd>M</kbd>
                  <span>Incorrecte</span>
                </div>
                <div className="legend-item">
                  <kbd>P</kbd>
                  <span>Passaparaula</span>
                </div>
                <div className="legend-item">
                  <kbd>Espai</kbd>
                  <span>Pausar / Reprendre</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
