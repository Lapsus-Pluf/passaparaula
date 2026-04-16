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
  const respondedPct = stats.total > 0 ? Math.round((answered / stats.total) * 100) : 0
  const correctOfRespondedPct = answered > 0 ? Math.round((stats.correct / answered) * 100) : 0

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

  const breakdownGroups: Array<{
    key: 'correct' | 'incorrect' | 'unanswered'
    title: string
    titleClass: string
    itemClass: string
    letters: LetterState[]
    emptyText: string
  }> = [
    {
      key: 'correct',
      title: `Correctes (${correctLetters.length})`,
      titleClass: 'breakdown-group-correct',
      itemClass: 'breakdown-correct',
      letters: correctLetters,
      emptyText: 'Cap resposta correcta',
    },
    {
      key: 'incorrect',
      title: `Incorrectes (${incorrectLetters.length})`,
      titleClass: 'breakdown-group-incorrect',
      itemClass: 'breakdown-incorrect',
      letters: incorrectLetters,
      emptyText: 'Cap resposta incorrecta',
    },
  ]

  if (hasUnanswered) {
    breakdownGroups.push({
      key: 'unanswered',
      title: `Sense respondre (${unansweredCount})`,
      titleClass: 'breakdown-group-passed',
      itemClass: 'breakdown-passed',
      letters: unansweredLetters,
      emptyText: 'No hi ha lletres pendents',
    })
  }

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

        {/* Percentages */}
        <div className="results-pct-grid">
          <div className="results-pct-card">
            <span className="results-pct-card-title">Respostes fetes</span>
            <span className="results-pct-value">{respondedPct}%</span>
            <span className="results-pct-note">{answered} de {stats.total} respostes</span>
            <div className="results-pct-bar-bg">
              <div
                className="results-pct-bar-fill pct-responded-fill"
                style={{ width: `${respondedPct}%` }}
              />
            </div>
          </div>

          <div className="results-pct-card">
            <span className="results-pct-card-title">Encert sobre respostes</span>
            <span className="results-pct-value">{correctOfRespondedPct}%</span>
            <span className="results-pct-note">
              {answered > 0
                ? `${stats.correct} de ${answered} correctes`
                : 'Sense respostes encara'}
            </span>
            <div className="results-pct-bar-bg">
              <div
                className="results-pct-bar-fill pct-accuracy-fill"
                style={{ width: `${correctOfRespondedPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Words breakdown by result */}
        <div className={`results-breakdown-grid ${hasUnanswered ? 'results-breakdown-grid-three' : 'results-breakdown-grid-two'}`}>
          {breakdownGroups.map((group) => (
            <section key={group.key} className="breakdown-group">
              <h3 className={`breakdown-group-title ${group.titleClass}`}>{group.title}</h3>
              <div className="breakdown-list">
                {group.letters.length > 0 ? (
                  group.letters.map((letter, i) => (
                    <div key={`${group.key}-${letter.entry.letter}-${i}`} className={`breakdown-item ${group.itemClass}`}>
                      <span className="breakdown-letter">{letter.entry.letter}</span>
                      <div className="breakdown-info">
                        <span className="breakdown-answer">{letter.entry.answer}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="breakdown-empty">{group.emptyText}</div>
                )}
              </div>
            </section>
          ))}
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
