import { useCallback, useRef, useState } from 'react'
import type { QuestionsFile } from '../types'
import { validateQuestions } from '../utils/validateQuestions'
import { APP_VERSION } from '../version'
import './WelcomeScreen.css'

interface WelcomeScreenProps {
  onStart: (data: QuestionsFile, time: number) => void
}

const TIME_PRESETS = [
  { label: '45s', value: 45 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '3m', value: 180 },
] as const

const DECO_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [data, setData] = useState<QuestionsFile | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [time, setTime] = useState(130)
  const [isDragging, setIsDragging] = useState(false)
  const [customTime, setCustomTime] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setFileName(file.name)
    setErrors([])
    setData(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string)
        const result = validateQuestions(raw)
        if (result.valid && result.data) {
          setData(result.data)
          if (result.data.time) {
            setTime(result.data.time)
          }
          setErrors([])
        } else {
          setErrors(result.errors)
        }
      } catch {
        setErrors(['El fitxer no és un JSON vàlid.'])
      }
    }
    reader.readAsText(file)
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleStart = useCallback(() => {
    if (data) {
      onStart(data, time)
    }
  }, [data, time, onStart])

  const handleCustomTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomTime(val)
    const n = Math.max(10, Math.min(600, Number(val) || 130))
    setTime(n)
  }, [])

  const isPreset = TIME_PRESETS.some((p) => p.value === time)

  return (
    <div className="welcome">
      {/* Background glow decorations */}
      <div className="welcome-glow welcome-glow-1" aria-hidden />
      <div className="welcome-glow welcome-glow-2" aria-hidden />

      <div className="welcome-content">
        {/* Title */}
        <h1 className="welcome-title">
          <span className="title-passa">Passa</span>
          <span className="title-paraula">paraula</span>
        </h1>
        <p className="welcome-subtitle">El joc del rosco en català</p>

        {/* Decorative letter tiles row */}
        <div className="welcome-tiles" aria-hidden>
          {DECO_LETTERS.map((l) => (
            <span key={l} className="welcome-tile">{l}</span>
          ))}
        </div>

        {/* Game card */}
        <div className="welcome-card">
          {/* Upload zone */}
          <div
            className={`upload-zone ${isDragging ? 'dragging' : ''} ${data ? 'loaded' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              hidden
            />
            {data ? (
              <div className="upload-success">
                <span className="upload-icon upload-icon-ok">&#10003;</span>
                <p className="upload-file-name">{fileName}</p>
                <p className="upload-info">
                  &laquo;{data.title}&raquo; &mdash; {data.letters.length} lletres
                </p>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">&#8593;</span>
                <p>Arrossega el fitxer JSON aquí</p>
                <p className="upload-hint">o fes clic per seleccionar-lo</p>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div className="upload-errors">
              {errors.map((err, i) => (
                <p key={i} className="upload-error">{err}</p>
              ))}
            </div>
          )}

          {/* Time config */}
          <div className="time-config">
            <span className="time-config-label">Temps:</span>
            <div className="time-presets">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`time-preset-btn ${time === p.value ? 'active' : ''}`}
                  onClick={() => { setTime(p.value); setCustomTime('') }}
                >
                  {p.label}
                </button>
              ))}
              <input
                type="number"
                className={`time-custom-input ${!isPreset ? 'active' : ''}`}
                min={10}
                max={600}
                placeholder="seg."
                value={customTime}
                onChange={handleCustomTimeChange}
                title="Temps personalitzat en segons"
              />
            </div>
          </div>

          {/* Start button */}
          <button
            className="start-button"
            onClick={handleStart}
            disabled={!data}
          >
            Començar
          </button>
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <a
            href="/template.json"
            download="template.json"
            className="template-link"
          >
            Descarrega la plantilla JSON
          </a>
          <span className="welcome-version">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  )
}
