/** A single question entry from the JSON file */
export interface QuestionEntry {
  letter: string
  type: 'starts' | 'contains'
  question: string
  answer: string
}

/** The full questions file format */
export interface QuestionsFile {
  title: string
  time?: number
  letters: QuestionEntry[]
}

/** Status of each letter in the rosco */
export type LetterStatus = 'pending' | 'current' | 'correct' | 'incorrect' | 'passed'

/** Runtime state for a single letter during the game */
export interface LetterState {
  entry: QuestionEntry
  status: LetterStatus
}

/** Overall game phase */
export type GamePhase = 'idle' | 'playing' | 'paused' | 'finished'

/** Game statistics */
export interface GameStats {
  correct: number
  incorrect: number
  passed: number
  remaining: number
  total: number
}

/** Screen the app is showing */
export type AppScreen = 'welcome' | 'game' | 'results'
