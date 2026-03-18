import { useState, useCallback } from 'react'
import type { QuestionsFile, LetterState, GameStats } from './types'
import { WelcomeScreen } from './components/WelcomeScreen'
import { GameScreen } from './components/GameScreen'
import { ResultsScreen } from './components/ResultsScreen'
import type { AppScreen } from './types'
import './App.css'

interface GameResults {
  letters: LetterState[]
  stats: GameStats
  timeLeft: number
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome')
  const [questionsFile, setQuestionsFile] = useState<QuestionsFile | null>(null)
  const [initialTime, setInitialTime] = useState(130)
  const [results, setResults] = useState<GameResults | null>(null)

  const handleStart = useCallback((data: QuestionsFile, time: number) => {
    setQuestionsFile(data)
    setInitialTime(time)
    setResults(null)
    setScreen('game')
  }, [])

  const handleFinish = useCallback((gameResults: GameResults) => {
    setResults(gameResults)
    setScreen('results')
  }, [])

  const handlePlayAgain = useCallback(() => {
    setScreen('welcome')
    setQuestionsFile(null)
    setResults(null)
  }, [])

  return (
    <div className="app">
      {screen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}

      {screen === 'game' && questionsFile && (
        <GameScreen
          key={Date.now()}
          questionsFile={questionsFile}
          initialTime={initialTime}
          onFinish={handleFinish}
        />
      )}

      {screen === 'results' && results && questionsFile && (
        <ResultsScreen
          letters={results.letters}
          stats={results.stats}
          timeLeft={results.timeLeft}
          title={questionsFile.title}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  )
}

export default App
