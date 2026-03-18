import { useState, useCallback } from 'react'
import type { QuestionsFile } from './types'
import { WelcomeScreen } from './components/WelcomeScreen'
import { GameScreen } from './components/GameScreen'
import './App.css'

function App() {
  const [screen, setScreen] = useState<'welcome' | 'game'>('welcome')
  const [questionsFile, setQuestionsFile] = useState<QuestionsFile | null>(null)
  const [initialTime, setInitialTime] = useState(130)
  const [gameKey, setGameKey] = useState(0)

  const handleStart = useCallback((data: QuestionsFile, time: number) => {
    setQuestionsFile(data)
    setInitialTime(time)
    setGameKey((prev) => prev + 1)
    setScreen('game')
  }, [])

  const handlePlayAgain = useCallback(() => {
    setScreen('welcome')
    setQuestionsFile(null)
  }, [])

  return (
    <div className="app">
      {screen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}

      {screen === 'game' && questionsFile && (
        <GameScreen
          key={gameKey}
          questionsFile={questionsFile}
          initialTime={initialTime}
          onFinish={handlePlayAgain}
        />
      )}
    </div>
  )
}

export default App
