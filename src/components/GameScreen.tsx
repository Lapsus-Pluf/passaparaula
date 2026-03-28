import { useState, useEffect, useCallback, useRef } from 'react'
import type { QuestionsFile } from '../types'
import { useGame } from '../hooks/useGame'
import { useTimer } from '../hooks/useTimer'
import { useCamera } from '../hooks/useCamera'
import { Rosco } from './Rosco'
import { CameraView } from './CameraView'
import { QuestionDisplay } from './QuestionDisplay'
import { Timer } from './Timer'
import { Controls } from './Controls'
import { ResultsScreen } from './ResultsScreen'
import './GameScreen.css'

interface AnswerLogEntry {
  letter: string
  answer: string
  status: 'correct' | 'incorrect'
}

interface PauseReveal {
  letter: string
  answer: string
  status: 'correct' | 'incorrect'
}

interface GameScreenProps {
  questionsFile: QuestionsFile
  initialTime: number
  onFinish: () => void
}

export function GameScreen({ questionsFile, initialTime, onFinish }: GameScreenProps) {
  const game = useGame(questionsFile.letters)
  const timer = useTimer(initialTime, game.finish)
  const camera = useCamera()
  // Default pauseOnAction to true
  const [pauseOnAction, setPauseOnAction] = useState(true)
  const [answerLog, setAnswerLog] = useState<AnswerLogEntry[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [pauseReveal, setPauseReveal] = useState<PauseReveal | null>(null)
  const pendingPauseRef = useRef(false)

  // Sync timer with game phase
  useEffect(() => {
    if (game.phase === 'playing' && !timer.isRunning) {
      timer.resume()
    } else if (game.phase === 'paused' && timer.isRunning) {
      timer.pause()
    }
  }, [game.phase, timer])

  // Pause-on-action: after an action completes and state updates, apply the pause
  useEffect(() => {
    if (pendingPauseRef.current && game.phase === 'playing') {
      pendingPauseRef.current = false
      game.pause()
      timer.pause()
    }
  }, [game.currentIndex, game.phase, game, timer])

  // When game finishes, show inline results (don't auto-jump)
  useEffect(() => {
    if (game.phase === 'finished' && !isFinished) {
      timer.pause()
      setIsFinished(true)
      // Clear any lingering reveal
      setPauseReveal(null)
    }
  }, [game.phase, isFinished, timer])

  // When game resumes (after paused-on-action), dismiss the reveal card
  useEffect(() => {
    if (game.phase === 'playing') {
      setPauseReveal(null)
    }
  }, [game.phase])

  // Start game: start both game state and timer
  const handleStart = useCallback(() => {
    game.startGame()
    timer.start()
  }, [game, timer])

  // Pause/Resume
  const handlePause = useCallback(() => {
    game.pause()
    timer.pause()
  }, [game, timer])

  const handleResume = useCallback(() => {
    game.resume()
    timer.resume()
  }, [game, timer])

  // Action handlers with pause-on-action support
  const handleCorrect = useCallback(() => {
    if (game.phase !== 'playing') return
    const current = game.currentQuestion
    if (current) {
      setAnswerLog((prev) => [
        ...prev,
        { letter: current.letter, answer: current.answer, status: 'correct' },
      ])
      if (pauseOnAction) {
        setPauseReveal({ letter: current.letter, answer: current.answer, status: 'correct' })
        pendingPauseRef.current = true
      }
    }
    game.markCorrect()
  }, [game, pauseOnAction])

  const handleIncorrect = useCallback(() => {
    if (game.phase !== 'playing') return
    const current = game.currentQuestion
    if (current) {
      setAnswerLog((prev) => [
        ...prev,
        { letter: current.letter, answer: current.answer, status: 'incorrect' },
      ])
      if (pauseOnAction) {
        setPauseReveal({ letter: current.letter, answer: current.answer, status: 'incorrect' })
        pendingPauseRef.current = true
      }
    }
    game.markIncorrect()
  }, [game, pauseOnAction])

  const handlePass = useCallback(() => {
    if (game.phase !== 'playing') return
    if (pauseOnAction) {
      pendingPauseRef.current = true
    }
    game.passLetter()
  }, [game, pauseOnAction])

  // Determine finish reason
  const finishReason: 'timeout' | 'completed' = timer.timeLeft <= 0 ? 'timeout' : 'completed'

  const handlePlayAgain = useCallback(() => {
    onFinish()
  }, [onFinish])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key.toLowerCase()

      if (key === 'enter' && game.phase === 'idle') {
        e.preventDefault()
        handleStart()
      } else if (key === 'b' && game.phase === 'playing') {
        e.preventDefault()
        handleCorrect()
      } else if (key === 'm' && game.phase === 'playing') {
        e.preventDefault()
        handleIncorrect()
      } else if (key === 'p' && game.phase === 'playing') {
        e.preventDefault()
        handlePass()
      } else if (key === ' ') {
        e.preventDefault()
        if (game.phase === 'playing') {
          handlePause()
        } else if (game.phase === 'paused') {
          handleResume()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game, handleStart, handlePause, handleResume, handleCorrect, handleIncorrect, handlePass])

  return (
    <>
      {isFinished ? (
        <ResultsScreen
          letters={game.letters}
          stats={game.stats}
          timeLeft={timer.timeLeft}
          title={questionsFile.title}
          onPlayAgain={handlePlayAgain}
        />
      ) : (
        <div className="game-screen">
          <div className="game-question">
            <QuestionDisplay
              question={game.currentQuestion?.question ?? null}
              letter={game.currentQuestion?.letter ?? null}
              isPaused={game.phase === 'paused'}
              isIdle={game.phase === 'idle'}
              isFinished={isFinished}
            />
          </div>

          <div className="game-main">
            <div className="game-rosco">
              <Rosco
                letters={game.letters}
                currentIndex={game.currentIndex}
                cameraElement={
                  <CameraView
                    setVideoRef={camera.setVideoElement}
                    isActive={camera.isActive}
                    onToggle={camera.toggle}
                  />
                }
              />
            </div>

            <div className="game-sidebar">
              <Timer timeLeft={timer.timeLeft} isRunning={timer.isRunning} />
              <Controls
                phase={game.phase}
                stats={game.stats}
                isFinished={isFinished}
                onStart={handleStart}
                onCorrect={handleCorrect}
                onIncorrect={handleIncorrect}
                onPass={handlePass}
                onPause={handlePause}
                onResume={handleResume}
                pauseOnAction={pauseOnAction}
                onTogglePauseOnAction={() => setPauseOnAction((prev) => !prev)}
                onPlayAgain={handlePlayAgain}
                finishReason={finishReason}
              />

              {/* Answer chips — compact wrap instead of scrolling list */}
              {answerLog.length > 0 && (
                <div className="answer-log">
                  <h4 className="answer-log-title">Respostes</h4>
                  <div className="answer-log-chips">
                    {answerLog.map((entry, i) => (
                      <span
                        key={i}
                        className={`answer-log-chip chip-${entry.status}`}
                        title={`${entry.letter}: ${entry.answer}`}
                      >
                        <span className="answer-log-chip-letter">{entry.letter}</span>
                        <span className="answer-log-chip-answer">{entry.answer}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pause-on-action reveal overlay */}
          {pauseReveal && game.phase === 'paused' && (
            <div className="pause-reveal-overlay" onClick={handleResume}>
              <div className={`pause-reveal-card reveal-${pauseReveal.status}`}>
                <div className="pause-reveal-icon">
                  {pauseReveal.status === 'correct' ? '✓' : '✗'}
                </div>
                <div className="pause-reveal-letter">Lletra {pauseReveal.letter}</div>
                <div className="pause-reveal-answer">{pauseReveal.answer}</div>
                <div className="pause-reveal-hint">Fes clic o prem Espai per continuar</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
