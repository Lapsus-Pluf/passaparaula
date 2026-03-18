import './QuestionDisplay.css'

interface QuestionDisplayProps {
  question: string | null
  letter: string | null
  isPaused: boolean
  isIdle: boolean
  isFinished: boolean
}

export function QuestionDisplay({ question, letter, isPaused, isIdle, isFinished }: QuestionDisplayProps) {
  if (isIdle) {
    return null
  }

  if (isFinished) {
    return (
      <div className="question-display question-finished">
        Joc finalitzat
      </div>
    )
  }

  if (isPaused) {
    return (
      <div className="question-display question-paused">
        <span className="question-pause-icon">&#9208;</span>
        <span>Joc en pausa</span>
      </div>
    )
  }

  if (!question || !letter) {
    return (
      <div className="question-display question-empty">
        Esperant...
      </div>
    )
  }

  return (
    <div className="question-display">
      <span className="question-letter">{letter}</span>
      <span className="question-text">{question}</span>
    </div>
  )
}
