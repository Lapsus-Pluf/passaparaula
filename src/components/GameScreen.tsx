import { useEffect, useCallback } from 'react'
import type { QuestionsFile } from '../types'
import { useGame } from '../hooks/useGame'
import { useTimer } from '../hooks/useTimer'
import { useCamera } from '../hooks/useCamera'
import { Rosco } from './Rosco'
import { CameraView } from './CameraView'
import { QuestionDisplay } from './QuestionDisplay'
import { Timer } from './Timer'
import { Controls } from './Controls'
import './GameScreen.css'

interface GameScreenProps {
  questionsFile: QuestionsFile
  initialTime: number
  onFinish: (results: { letters: ReturnType<typeof useGame>['letters']; stats: ReturnType<typeof useGame>['stats']; timeLeft: number }) => void
}

export function GameScreen({ questionsFile, initialTime, onFinish }: GameScreenProps) {
  const game = useGame(questionsFile.letters)
  const timer = useTimer(initialTime, game.finish)
  const camera = useCamera()

  // Sync timer with game phase
  useEffect(() => {
    if (game.phase === 'playing' && !timer.isRunning) {
      timer.resume()
    } else if (game.phase === 'paused' && timer.isRunning) {
      timer.pause()
    }
  }, [game.phase, timer])

  // When game finishes, notify parent
  useEffect(() => {
    if (game.phase === 'finished') {
      timer.pause()
      onFinish({
        letters: game.letters,
        stats: game.stats,
        timeLeft: timer.timeLeft,
      })
    }
  }, [game.phase]) // eslint-disable-line react-hooks/exhaustive-deps

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
        game.markCorrect()
      } else if (key === 'm' && game.phase === 'playing') {
        e.preventDefault()
        game.markIncorrect()
      } else if (key === 'p' && game.phase === 'playing') {
        e.preventDefault()
        game.passLetter()
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
  }, [game, handleStart, handlePause, handleResume])

  return (
    <div className="game-screen">
      <div className="game-question">
        <QuestionDisplay
          question={game.currentQuestion?.question ?? null}
          letter={game.currentQuestion?.letter ?? null}
          isPaused={game.phase === 'paused'}
        />
      </div>

      <div className="game-main">
        <div className="game-rosco">
          <Rosco
            letters={game.letters}
            currentIndex={game.currentIndex}
            cameraElement={
              <CameraView
                videoRef={camera.videoRef}
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
            onStart={handleStart}
            onCorrect={game.markCorrect}
            onIncorrect={game.markIncorrect}
            onPass={game.passLetter}
            onPause={handlePause}
            onResume={handleResume}
          />
        </div>
      </div>
    </div>
  )
}
