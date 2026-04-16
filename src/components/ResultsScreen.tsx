import { useMemo } from 'react'
import type { LetterState, GameStats } from '../types'
import './ResultsScreen.css'

interface ResultsScreenProps {
  letters: LetterState[]
  stats: GameStats
  timeLeft: number
  title: string
  onPlayAgain: () => void
  onBackToRosco: () => void
}

export function ResultsScreen({ letters, stats, timeLeft, title, onPlayAgain, onBackToRosco }: ResultsScreenProps) {
  const allCorrect = stats.correct === stats.total
  const answered = stats.correct + stats.incorrect
  const pct = answered > 0 ? Math.round((stats.correct / answered) * 100) : 0

  const correctLetters = useMemo(
    () => letters.filter((l) => l.status === 'correct'),
    [letters]
  )
  const incorrectLetters = useMemo(
    () => letters.filter((l) => l.status === 'incorrect'),
    [letters]
  )
  const unansweredLetters = useMemo(
    () => letters.filter((l) => l.status === 'passed' || l.status === 'pending' || l.status === 'current'),
    [letters]
  )
  const unansweredCount = unansweredLetters.length
  const hasUnanswered = unansweredCount > 0

  return (
    <div className="results">
      <div className="results-content">
        <h1 className="results-title">
          {allCorrect ? 'Rosco complet!' : timeLeft <= 0 ? 'Temps esgotat!' : 'Joc acabat!'}
        </h1>
        <p className="results-subtitle">{title}</p>

        {/* Stats summary */}
        <div className={`results-main-stats ${hasUnanswered ? 'results-main-stats-three' : 'results-main-stats-two'}`}>
          <div className="stat stat-correct">
            <span className="stat-value">{stats.correct}</span>
            <span className="stat-label">Correctes</span>
          </div>
          <div className="stat stat-incorrect">
            <span className="stat-value">{stats.incorrect}</span>
            <span className="stat-label">Incorrectes</span>
          </div>
          {hasUnanswered && (
            <div className="stat stat-passed">
              <span className="stat-value">{unansweredCount}</span>
              <span className="stat-label">Sense respondre</span>
            </div>
          )}
        </div>

        <div className="results-meta-stats">
          <div className="meta-stat meta-stat-time">
            <span className="meta-stat-value">{timeLeft}s</span>
            <span className="meta-stat-label">Temps restant</span>
          </div>
          <div className="meta-stat">
            <span className="meta-stat-value">{stats.total}</span>
            <span className="meta-stat-label">Lletres totals</span>
          </div>
        </div>

        {/* Correctness percentage bar */}
        <div className="results-pct-row">
          <div className="results-pct-main">
            <span className="results-pct-value">{pct}%</span>
            <span className="results-pct-label">
              d'encerts ({stats.correct} de {answered} respostes)
            </span>
          </div>
          <div className="results-pct-bar-bg">
            <div
              className="results-pct-bar-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Grouped breakdown */}
        <div className="results-breakdown">
          {correctLetters.length > 0 && (
            <div className="breakdown-group">
              <h3 className="breakdown-group-title breakdown-group-correct">
                Correctes ({correctLetters.length})
              </h3>
              <div className="breakdown-list">
                {correctLetters.map((letter, i) => (
                  <div key={i} className="breakdown-item breakdown-correct">
                    <span className="breakdown-letter">{letter.entry.letter}</span>
                    <div className="breakdown-info">
                      <span className="breakdown-answer">{letter.entry.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incorrectLetters.length > 0 && (
            <div className="breakdown-group">
              <h3 className="breakdown-group-title breakdown-group-incorrect">
                Incorrectes ({incorrectLetters.length})
              </h3>
              <div className="breakdown-list">
                {incorrectLetters.map((letter, i) => (
                  <div key={i} className="breakdown-item breakdown-incorrect">
                    <span className="breakdown-letter">{letter.entry.letter}</span>
                    <div className="breakdown-info">
                      <span className="breakdown-answer">{letter.entry.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unansweredLetters.length > 0 && (
            <div className="breakdown-group">
              <h3 className="breakdown-group-title breakdown-group-passed">
                Sense respondre ({unansweredLetters.length})
              </h3>
              <div className="breakdown-list">
                {unansweredLetters.map((letter, i) => (
                  <div key={i} className="breakdown-item breakdown-passed">
                    <span className="breakdown-letter">{letter.entry.letter}</span>
                    <div className="breakdown-info">
                      <span className="breakdown-answer">{letter.entry.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="results-nav-actions">
          <button className="back-to-rosco-button" onClick={onBackToRosco}>
            ← Tornar al rosco
          </button>
          <button className="play-again-button" onClick={onPlayAgain}>
            Tornar a jugar
          </button>
        </div>
      </div>
    </div>
  )
}
