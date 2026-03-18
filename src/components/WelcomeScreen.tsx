import { useCallback, useRef, useState } from 'react'
import type { QuestionsFile } from '../types'
import { validateQuestions } from '../utils/validateQuestions'
import './WelcomeScreen.css'

interface WelcomeScreenProps {
  onStart: (data: QuestionsFile, time: number) => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [data, setData] = useState<QuestionsFile | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [time, setTime] = useState(130)
  const [isDragging, setIsDragging] = useState(false)
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

  return (
    <div className="welcome">
      <div className="welcome-content">
        <h1 className="welcome-title">
          <span className="title-pass">Passa</span>
          <span className="title-paraula">paraula</span>
        </h1>
        <p className="welcome-subtitle">El joc del rosco en català</p>

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
              <span className="upload-icon">&#10003;</span>
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

        <div className="time-config">
          <label htmlFor="time-input">Temps (segons):</label>
          <input
            id="time-input"
            type="number"
            min={10}
            max={600}
            value={time}
            onChange={(e) => setTime(Math.max(10, Math.min(600, Number(e.target.value) || 130)))}
          />
        </div>

        <button
          className="start-button"
          onClick={handleStart}
          disabled={!data}
        >
          Començar
        </button>

        <div className="welcome-footer">
          <a
            href="/template.json"
            download="template.json"
            className="template-link"
          >
            Descarrega la plantilla JSON
          </a>
        </div>
      </div>
    </div>
  )
}
