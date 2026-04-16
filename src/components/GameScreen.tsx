import { useState, useEffect, useCallback } from 'react'
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

interface GameScreenProps {
  questionsFile: QuestionsFile
  initialTime: number
  onFinish: () => void
}

export function GameScreen({ questionsFile, initialTime, onFinish }: GameScreenProps) {
  const game = useGame(questionsFile.letters)
  const timer = useTimer(initialTime, game.finish)
  const camera = useCamera()

  const [answerLog, setAnswerLog] = useState<AnswerLogEntry[]>([])
  const [endView, setEndView] = useState<'rosco' | 'stats'>('rosco')
  // Capture timeLeft at the moment game finishes
  const [finalTimeLeft, setFinalTimeLeft] = useState<number>(initialTime)

  // Sync timer with game phase
  useEffect(() => {
    if (game.phase === 'playing' && !timer.isRunning) timer.resume()
    else if (game.phase === 'paused' && timer.isRunning) timer.pause()
  }, [game.phase, timer])

  // Game finished → stop timer + camera, capture final time
  useEffect(() => {
    if (game.phase === 'finished') {
      setFinalTimeLeft(timer.timeLeft)
      timer.pause()
      camera.stop()
    }
  }, [game.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(() => {
    game.startGame()
    timer.start()
  }, [game, timer])

  const handlePause = useCallback(() => {
    game.pause()
    timer.pause()
  }, [game, timer])

  const handleResume = useCallback(() => {
    game.resume()
    timer.resume()
  }, [game, timer])

  const handleCorrect = useCallback(() => {
    if (game.phase !== 'playing') return
    const current = game.currentQuestion
    if (current) {
      setAnswerLog((prev) => [
        ...prev,
        { letter: current.letter, answer: current.answer, status: 'correct' },
      ])
    }
    // Correct: advance without pausing
    game.markCorrect()
  }, [game])

  const handleIncorrect = useCallback(() => {
    if (game.phase !== 'playing') return
    const current = game.currentQuestion
    if (current) {
      setAnswerLog((prev) => [
        ...prev,
        { letter: current.letter, answer: current.answer, status: 'incorrect' },
      ])
    }
    // Incorrect: mark then auto-pause (after state update advances to next letter)
    game.markIncorrect()
    // Pause after advancing so user sees which letter is now current
    setTimeout(() => {
      game.pause()
      timer.pause()
    }, 0)
  }, [game, timer])

  const handlePass = useCallback(() => {
    if (game.phase !== 'playing') return
    // Passaparaula: skip and auto-pause, no popup
    game.passLetter()
    setTimeout(() => {
      game.pause()
      timer.pause()
    }, 0)
  }, [game, timer])

  const handlePlayAgain = useCallback(() => onFinish(), [onFinish])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toLowerCase()
      if (key === 'enter') {
        e.preventDefault()
        if (game.phase === 'idle') handleStart()
      } else if (key === 'b' && game.phase === 'playing') { e.preventDefault(); handleCorrect() }
      else if (key === 'm' && game.phase === 'playing') { e.preventDefault(); handleIncorrect() }
      else if (key === 'p' && game.phase === 'playing') { e.preventDefault(); handlePass() }
      else if (key === ' ') {
        e.preventDefault()
        if (game.phase === 'playing') handlePause()
        else if (game.phase === 'paused') handleResume()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game, handleStart, handlePause, handleResume, handleCorrect, handleIncorrect, handlePass])

  // Software zoom factor (hardware zoom is handled in the track itself, no CSS needed)
  const cssZoom = camera.isHardwareZoom ? 1 : camera.zoomLevel

  const isFinished = game.phase === 'finished'
  const answeredCount = game.stats.correct + game.stats.incorrect
  const liveAccuracy = answeredCount > 0
    ? Math.round((game.stats.correct / answeredCount) * 100)
    : 0
  const liveProgressText = `${answeredCount} de ${game.stats.total} respostes`
  const liveAccuracyText = answeredCount > 0
    ? `${liveAccuracy}% d'encerts (${game.stats.correct} de ${answeredCount} respostes)`
    : 'Sense respostes encara'

  // Stats view (full screen)
  if (isFinished && endView === 'stats') {
    return (
      <ResultsScreen
        letters={game.letters}
        stats={game.stats}
        timeLeft={finalTimeLeft}
        title={questionsFile.title}
        onPlayAgain={handlePlayAgain}
        onBackToRosco={() => setEndView('rosco')}
      />
    )
  }

  return (
    <div className="game-screen">
      <div className="game-layout">
        <aside className="game-info-panel">
          <div className="game-info-section">
            <Timer timeLeft={isFinished ? finalTimeLeft : timer.timeLeft} isRunning={timer.isRunning} />
          </div>

          <div className="game-info-section game-info-question">
            <QuestionDisplay
              question={game.currentQuestion?.question ?? null}
              letter={game.currentQuestion?.letter ?? null}
              isPaused={game.phase === 'paused'}
              isIdle={game.phase === 'idle'}
              isFinished={isFinished}
              totalLetters={questionsFile.letters.length}
            />
          </div>

          <div className="game-info-section game-info-score">
            <div className="game-header-score">
              <div className="header-score-item score-correct">
                <span className="header-score-value">{game.stats.correct}</span>
                <span className="header-score-label">Correctes</span>
              </div>
              <div className="header-score-item score-incorrect">
                <span className="header-score-value">{game.stats.incorrect}</span>
                <span className="header-score-label">Incorrectes</span>
              </div>
              <div className="header-score-item score-remaining">
                <span className="header-score-value">{game.stats.remaining}</span>
                <span className="header-score-label">Sense respondre</span>
              </div>
            </div>
            <p className="game-info-progress">{liveProgressText}</p>
            <p className="game-info-accuracy">{liveAccuracyText}</p>
          </div>
        </aside>

        <main className="game-rosco-panel">
          <Rosco
            letters={game.letters}
            currentIndex={game.currentIndex}
            cameraElement={
              <CameraView
                setVideoRef={camera.setVideoElement}
                isActive={camera.isActive}
                onToggle={camera.toggle}
                cssZoom={cssZoom}
              />
            }
          />
        </main>

        <aside className="game-actions-panel">
          {isFinished ? (
            <div className="game-finished-banner">
              <span className="game-finished-label">Joc acabat!</span>
              <div className="game-finished-actions">
                <button className="btn btn-stats" onClick={() => setEndView('stats')}>
                  Veure estadístiques
                </button>
                <button className="btn btn-play-again" onClick={handlePlayAgain}>
                  Tornar a jugar
                </button>
              </div>
            </div>
          ) : (
            <>
              <Controls
                phase={game.phase}
                onStart={handleStart}
                onCorrect={handleCorrect}
                onIncorrect={handleIncorrect}
                onPass={handlePass}
                onPause={handlePause}
                onResume={handleResume}
              />

              {camera.isActive && (
                <div className="camera-zoom-bar">
                  <button
                    className="camera-zoom-btn"
                    onClick={camera.zoomOut}
                    disabled={camera.zoomLevel <= 1}
                    title="Allunyar"
                  >
                    −
                  </button>
                  <span
                    className="camera-zoom-level"
                    onClick={camera.resetZoom}
                    title="Restablir zoom"
                  >
                    {camera.zoomLevel.toFixed(2).replace(/\.?0+$/, '')}×
                  </span>
                  <button
                    className="camera-zoom-btn"
                    onClick={camera.zoomIn}
                    disabled={camera.zoomLevel >= 4}
                    title="Apropar"
                  >
                    +
                  </button>
                </div>
              )}

              {answerLog.length > 0 && (
                <div className="answer-log">
                  <div className="answer-log-title">Respostes ({answerLog.length})</div>
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
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
