import type { LetterState, GameStats } from '../types'
import './ResultsScreen.css'

interface ResultsScreenProps {
  letters: LetterState[]
  stats: GameStats
  timeLeft: number
  title: string
  onPlayAgain: () => void
}

export function ResultsScreen({ letters, stats, timeLeft, title, onPlayAgain }: ResultsScreenProps) {
  const allCorrect = stats.correct === stats.total

  return (
    <div className="results">
      <div className="results-content">
        <h1 className="results-title">
          {allCorrect ? 'Rosco complet!' : 'Temps esgotat!'}
        </h1>
        <p className="results-subtitle">{title}</p>

        {/* Stats summary */}
        <div className="results-stats">
          <div className="stat stat-correct">
            <span className="stat-value">{stats.correct}</span>
            <span className="stat-label">Correctes</span>
          </div>
          <div className="stat stat-incorrect">
            <span className="stat-value">{stats.incorrect}</span>
            <span className="stat-label">Incorrectes</span>
          </div>
          <div className="stat stat-passed">
            <span className="stat-value">{stats.passed}</span>
            <span className="stat-label">Sense respondre</span>
          </div>
          <div className="stat stat-time">
            <span className="stat-value">{timeLeft}s</span>
            <span className="stat-label">Temps restant</span>
          </div>
        </div>

        {/* Detailed letter breakdown */}
        <div className="results-breakdown">
          <h3 className="breakdown-title">Detall per lletra</h3>
          <div className="breakdown-list">
            {letters.map((letter, i) => (
              <div
                key={i}
                className={`breakdown-item breakdown-${letter.status}`}
              >
                <span className="breakdown-letter">{letter.entry.letter}</span>
                <div className="breakdown-info">
                  <span className="breakdown-answer">{letter.entry.answer}</span>
                  <span className="breakdown-status">
                    {letter.status === 'correct' && 'Correcte'}
                    {letter.status === 'incorrect' && 'Incorrecte'}
                    {letter.status === 'passed' && 'Sense respondre'}
                    {letter.status === 'pending' && 'Sense respondre'}
                    {letter.status === 'current' && 'Sense respondre'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="play-again-button" onClick={onPlayAgain}>
          Tornar a jugar
        </button>
      </div>
    </div>
  )
}
