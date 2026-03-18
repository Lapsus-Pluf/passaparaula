import { useState, useCallback, useMemo } from 'react'
import type { QuestionEntry, LetterState, GamePhase, GameStats } from '../types'

interface UseGameReturn {
  letters: LetterState[]
  currentIndex: number
  phase: GamePhase
  stats: GameStats
  currentQuestion: QuestionEntry | null
  startGame: () => void
  markCorrect: () => void
  markIncorrect: () => void
  passLetter: () => void
  pause: () => void
  resume: () => void
  finish: () => void
}

export function useGame(entries: QuestionEntry[]): UseGameReturn {
  const [letters, setLetters] = useState<LetterState[]>(() =>
    entries.map((entry) => ({ entry, status: 'pending' as const }))
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('idle')
  // Queue of indices to revisit (passed letters)
  const [passedQueue, setPassedQueue] = useState<number[]>([])
  // Whether we're in the second pass (revisiting passed letters)
  const [inSecondPass, setInSecondPass] = useState(false)

  const stats: GameStats = useMemo(() => {
    const correct = letters.filter((l) => l.status === 'correct').length
    const incorrect = letters.filter((l) => l.status === 'incorrect').length
    const passed = letters.filter((l) => l.status === 'passed').length
    return {
      correct,
      incorrect,
      passed,
      remaining: letters.length - correct - incorrect,
      total: letters.length,
    }
  }, [letters])

  const currentQuestion = letters[currentIndex]?.entry ?? null

  const advanceToNext = useCallback(
    (updatedLetters: LetterState[]) => {
      if (inSecondPass) {
        // In second pass, consume from passed queue
        const nextQueue = [...passedQueue]
        const nextIdx = nextQueue.shift()

        if (nextIdx === undefined) {
          // No more passed letters, game done
          setPhase('finished')
          setPassedQueue([])
          return
        }

        setPassedQueue(nextQueue)
        setCurrentIndex(nextIdx)
        setLetters(
          updatedLetters.map((l, i) =>
            i === nextIdx ? { ...l, status: 'current' } : l
          )
        )
      } else {
        // First pass: find next pending letter
        let nextIdx: number | null = null
        for (let i = 1; i <= updatedLetters.length; i++) {
          const idx = (currentIndex + i) % updatedLetters.length
          const letter = updatedLetters[idx]
          if (letter && letter.status === 'pending') {
            nextIdx = idx
            break
          }
        }

        if (nextIdx !== null) {
          setCurrentIndex(nextIdx)
          setLetters(
            updatedLetters.map((l, i) =>
              i === nextIdx ? { ...l, status: 'current' } : l
            )
          )
        } else {
          // First pass done. Check if there are passed letters.
          const passedIndices = updatedLetters
            .map((l, i) => (l.status === 'passed' ? i : -1))
            .filter((i) => i !== -1)

          if (passedIndices.length > 0) {
            // Start second pass
            setInSecondPass(true)
            const [first, ...rest] = passedIndices
            setPassedQueue(rest)
            setCurrentIndex(first!)
            setLetters(
              updatedLetters.map((l, i) =>
                i === first ? { ...l, status: 'current' } : l
              )
            )
          } else {
            // All answered, game done
            setPhase('finished')
          }
        }
      }
    },
    [currentIndex, inSecondPass, passedQueue]
  )

  const startGame = useCallback(() => {
    const initial: LetterState[] = entries.map((entry) => ({ entry, status: 'pending' }))
    initial[0] = { ...initial[0]!, status: 'current' }
    setLetters(initial)
    setCurrentIndex(0)
    setPhase('playing')
    setPassedQueue([])
    setInSecondPass(false)
  }, [entries])

  const markCorrect = useCallback(() => {
    if (phase !== 'playing') return
    const updated = letters.map((l, i) =>
      i === currentIndex ? { ...l, status: 'correct' as const } : l
    )
    setLetters(updated)
    advanceToNext(updated)
  }, [phase, letters, currentIndex, advanceToNext])

  const markIncorrect = useCallback(() => {
    if (phase !== 'playing') return
    const updated = letters.map((l, i) =>
      i === currentIndex ? { ...l, status: 'incorrect' as const } : l
    )
    setLetters(updated)
    advanceToNext(updated)
  }, [phase, letters, currentIndex, advanceToNext])

  const passLetter = useCallback(() => {
    if (phase !== 'playing') return
    if (inSecondPass) {
      // In second pass, passing again means incorrect (can't keep passing forever)
      // Actually, let's allow passing again - add back to end of queue
      const updated = letters.map((l, i) =>
        i === currentIndex ? { ...l, status: 'passed' as const } : l
      )
      const newQueue = [...passedQueue, currentIndex]
      const nextIdx = newQueue.shift()

      if (nextIdx === undefined) {
        setPhase('finished')
        return
      }

      setPassedQueue(newQueue)
      setCurrentIndex(nextIdx)
      setLetters(
        updated.map((l, i) =>
          i === nextIdx ? { ...l, status: 'current' } : l
        )
      )
      return
    }

    const updated = letters.map((l, i) =>
      i === currentIndex ? { ...l, status: 'passed' as const } : l
    )
    setLetters(updated)
    advanceToNext(updated)
  }, [phase, letters, currentIndex, advanceToNext, inSecondPass, passedQueue])

  const pause = useCallback(() => {
    if (phase === 'playing') setPhase('paused')
  }, [phase])

  const resume = useCallback(() => {
    if (phase === 'paused') setPhase('playing')
  }, [phase])

  const finish = useCallback(() => {
    // Mark current letter back to passed if it was current
    setLetters((prev) =>
      prev.map((l) => (l.status === 'current' ? { ...l, status: 'passed' } : l))
    )
    setPhase('finished')
  }, [])

  return {
    letters,
    currentIndex,
    phase,
    stats,
    currentQuestion,
    startGame,
    markCorrect,
    markIncorrect,
    passLetter,
    pause,
    resume,
    finish,
  }
}
