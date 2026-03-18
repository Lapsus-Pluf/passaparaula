import type { QuestionsFile, QuestionEntry } from '../types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  data?: QuestionsFile
}

export function validateQuestions(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, errors: ['El fitxer ha de contenir un objecte JSON vàlid.'] }
  }

  const obj = raw as Record<string, unknown>

  if (typeof obj.title !== 'string' || obj.title.trim() === '') {
    errors.push('Falta el camp "title" (títol del rosco).')
  }

  if (obj.time !== undefined && (typeof obj.time !== 'number' || obj.time < 10 || obj.time > 600)) {
    errors.push('El camp "time" ha de ser un número entre 10 i 600 segons.')
  }

  if (!Array.isArray(obj.letters) || obj.letters.length === 0) {
    errors.push('Falta el camp "letters" o està buit. Cal almenys una lletra.')
    return { valid: false, errors }
  }

  const seenLetters = new Set<string>()

  for (let i = 0; i < obj.letters.length; i++) {
    const item = obj.letters[i] as Record<string, unknown>
    const prefix = `Lletra #${i + 1}`

    if (typeof item.letter !== 'string' || item.letter.trim().length !== 1) {
      errors.push(`${prefix}: "letter" ha de ser un sol caràcter.`)
      continue
    }

    const letter = item.letter.toUpperCase()

    if (seenLetters.has(letter)) {
      errors.push(`${prefix}: La lletra "${letter}" està duplicada.`)
    }
    seenLetters.add(letter)

    if (item.type !== 'starts' && item.type !== 'contains') {
      errors.push(`${prefix} (${letter}): "type" ha de ser "starts" o "contains".`)
    }

    if (typeof item.question !== 'string' || item.question.trim() === '') {
      errors.push(`${prefix} (${letter}): Falta la pregunta.`)
    }

    if (typeof item.answer !== 'string' || item.answer.trim() === '') {
      errors.push(`${prefix} (${letter}): Falta la resposta.`)
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const letters: QuestionEntry[] = (obj.letters as Record<string, unknown>[]).map((item) => ({
    letter: (item.letter as string).toUpperCase(),
    type: item.type as 'starts' | 'contains',
    question: (item.question as string).trim(),
    answer: (item.answer as string).trim(),
  }))

  return {
    valid: true,
    errors: [],
    data: {
      title: (obj.title as string).trim(),
      time: typeof obj.time === 'number' ? obj.time : undefined,
      letters,
    },
  }
}
