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

  const [pauseOnAction, setPauseOnAction] = useState(true)
  const [pauseOnPass, setPauseOnPass] = useState(false)
  const [answerLog, setAnswerLog] = useState<AnswerLogEntry[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [pendingResults, setPendingResults] = useState(false)
  const [pauseReveal, setPauseReveal] = useState<PauseReveal | null>(null)
  const pendingPauseRef = useRef(false)

  // Sync timer with game phase
  useEffect(() => {
    if (game.phase === 'playing' && !timer.isRunning) timer.resume()
    else if (game.phase === 'paused' && timer.isRunning) timer.pause()
  }, [game.phase, timer])

  // Pause-on-action: after the next letter becomes current, apply the deferred pause
  useEffect(() => {
    if (pendingPauseRef.current && game.phase === 'playing') {
      pendingPauseRef.current = false
      game.pause()
      timer.pause()
    }
  }, [game.currentIndex, game.phase, game, timer])

  // Game finished → stop timer + camera; if a reveal card is pending, wait for dismiss
  useEffect(() => {
    if (game.phase === 'finished' && !isFinished && !pendingResults) {
      timer.pause()
      camera.stop()
      pendingPauseRef.current = false
      if (pauseReveal) {
        // Last word: keep reveal card visible, show end-game CTA instead of jumping to results
        setPendingResults(true)
      } else {
        setIsFinished(true)
      }
    }
  }, [game.phase, isFinished, pendingResults, pauseReveal, timer, camera])

  // When game resumes, dismiss the reveal card
  useEffect(() => {
    if (game.phase === 'playing') setPauseReveal(null)
  }, [game.phase])

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

  // Dismiss the reveal overlay: resume game or, if end-of-game, go to results
  const handleDismissReveal = useCallback(() => {
    if (pendingResults) {
      setPauseReveal(null)
      setPendingResults(false)
      setIsFinished(true)
    } else {
      game.resume()
      timer.resume()
    }
  }, [pendingResults, game, timer])

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
    // Only trigger a pause if pauseOnAction is on AND the pauseOnPass sub-option is also on
    if (pauseOnAction && pauseOnPass) pendingPauseRef.current = true
    game.passLetter()
  }, [game, pauseOnAction, pauseOnPass])

  const handlePlayAgain = useCallback(() => onFinish(), [onFinish])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toLowerCase()
      if (key === 'enter') {
        e.preventDefault()
        if (game.phase === 'idle') handleStart()
        else if (pendingResults) handleDismissReveal()
      } else if (key === 'b' && game.phase === 'playing') { e.preventDefault(); handleCorrect() }
      else if (key === 'm' && game.phase === 'playing') { e.preventDefault(); handleIncorrect() }
      else if (key === 'p' && game.phase === 'playing') { e.preventDefault(); handlePass() }
      else if (key === ' ') {
        e.preventDefault()
        if (game.phase === 'playing') handlePause()
        else if (game.phase === 'paused') handleResume()
        else if (pendingResults) handleDismissReveal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game, pendingResults, handleStart, handlePause, handleResume, handleDismissReveal, handleCorrect, handleIncorrect, handlePass])

  // Software zoom factor (hardware zoom is handled in the track itself, no CSS needed)
  const cssZoom = camera.isHardwareZoom ? 1 : camera.zoomLevel

  if (isFinished) {
    return (
      <ResultsScreen
        letters={game.letters}
        stats={game.stats}
        timeLeft={timer.timeLeft}
        title={questionsFile.title}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  return (
    <div className="game-screen">
      {/* ── Header: timer + question + score ── */}
      <header className="game-header">
        <div className="game-header-timer">
          <Timer timeLeft={timer.timeLeft} isRunning={timer.isRunning} />
        </div>
        <div className="game-header-question">
          <QuestionDisplay
            question={game.currentQuestion?.question ?? null}
            letter={game.currentQuestion?.letter ?? null}
            isPaused={game.phase === 'paused'}
            isIdle={game.phase === 'idle'}
            isFinished={isFinished}
          />
        </div>
        <div className="game-header-score">
          <div className="header-score-item score-correct">
            <span className="header-score-value">{game.stats.correct}</span>
            <span className="header-score-label">✓</span>
          </div>
          <div className="header-score-item score-incorrect">
            <span className="header-score-value">{game.stats.incorrect}</span>
            <span className="header-score-label">✗</span>
          </div>
          <div className="header-score-item score-remaining">
            <span className="header-score-value">{game.stats.remaining}</span>
            <span className="header-score-label">~</span>
          </div>
        </div>
      </header>

      {/* ── Arena: rosco centered ── */}
      <div className="game-arena">
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

        {/* Zoom controls — shown below the rosco only when camera is active */}
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
      </div>

      {/* ── Footer: action buttons + settings + answer chips ── */}
      <footer className="game-footer">
        <Controls
          phase={game.phase}
          onStart={handleStart}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onPass={handlePass}
          onPause={handlePause}
          onResume={handleResume}
          pauseOnAction={pauseOnAction}
          onTogglePauseOnAction={() => setPauseOnAction((prev) => !prev)}
          pauseOnPass={pauseOnPass}
          onTogglePauseOnPass={() => setPauseOnPass((prev) => !prev)}
        />

        {/* Answer chips — compact wrap, no scroll */}
        {answerLog.length > 0 && (
          <div className="answer-log">
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
      </footer>

      {/* ── Pause reveal overlay ── */}
      {pauseReveal && (game.phase === 'paused' || pendingResults) && (
        <div className="pause-reveal-overlay" onClick={handleDismissReveal}>
          <div
            className="pause-reveal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`pause-reveal-header header-${pauseReveal.status}`}>
              <div className="pause-reveal-icon">
                {pauseReveal.status === 'correct' ? '✓' : '✗'}
              </div>
              <div className="pause-reveal-status-label">
                {pauseReveal.status === 'correct' ? 'Correcte' : 'Incorrecte'}
              </div>
            </div>
            <div className="pause-reveal-body">
              <div className="pause-reveal-letter">Lletra {pauseReveal.letter}</div>
              <div className="pause-reveal-answer">{pauseReveal.answer}</div>
              {pendingResults ? (
                <>
                  <div className="pause-reveal-game-over">Joc acabat!</div>
                  <button className="pause-reveal-results-btn" onClick={handleDismissReveal}>
                    Veure resultats
                  </button>
                </>
              ) : (
                <div className="pause-reveal-hint">Fes clic o prem Espai per continuar</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
