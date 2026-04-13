import './QuestionDisplay.css'

interface QuestionDisplayProps {
  question: string | null
  letter: string | null
  isPaused: boolean
  isIdle: boolean
  isFinished: boolean
  totalLetters?: number
}

export function QuestionDisplay({ question, letter, isPaused, isIdle, isFinished, totalLetters }: QuestionDisplayProps) {
  if (isIdle) {
    return (
      <div className="question-display question-idle">
        {totalLetters !== undefined
          ? `${totalLetters} lletres per jugar`
          : 'Preparat per començar'}
      </div>
    )
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
