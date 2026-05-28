'use client'
import { useCallback, useState } from 'react'
import { Upload, ImageIcon, X, AlertCircle } from 'lucide-react'

interface DropzoneProps {
  onFiles: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxFiles?: number
  hint?: string
}

export default function ImageDropzone({
  onFiles, multiple = true,
  accept = 'image/*',
  maxFiles = 20,
  hint = 'JPG, PNG, WEBP, AVIF, GIF, SVG supported'
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const processFiles = useCallback((rawFiles: FileList | File[]) => {
    setError('')
    const arr = Array.from(rawFiles)
    const images = arr.filter(f => f.type.startsWith('image/') || f.name.endsWith('.svg') || f.name.endsWith('.avif'))

    if (images.length === 0) {
      setError('Please upload valid image files.')
      return
    }
    if (images.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed at once.`)
      return
    }
    onFiles(images)
  }, [onFiles, maxFiles])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
  }, [processFiles])

  const inputId = 'dropzone-input-' + Math.random().toString(36).slice(2, 7)

  return (
    <div>
      <label
        htmlFor={inputId}
        className={`dropzone ${dragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{ display: 'block', cursor: 'pointer' }}
      >
        {/* Animated icons */}
        <div style={{ marginBottom: 20, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: dragging ? 'pulse-border 1s ease infinite' : 'none',
          }}>
            {dragging
              ? <ImageIcon size={36} color="#818cf8" />
              : <Upload size={36} color="#818cf8" />
            }
          </div>
          {/* floating dots */}
          <div style={{
            position: 'absolute', top: 0, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            animation: 'float1 3s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: -4,
            width: 10, height: 10, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            animation: 'float2 4s ease-in-out infinite',
          }} />
        </div>

        <p style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>
          {dragging ? 'Drop images here!' : 'Drop images here or click to browse'}
        </p>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>{hint}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['JPG', 'PNG', 'WEBP', 'AVIF', 'GIF', 'SVG'].map(fmt => (
            <span key={fmt} className="badge badge-purple" style={{ fontSize: 11 }}>{fmt}</span>
          ))}
        </div>

        {multiple && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#4b5563' }}>
            Up to {maxFiles} files at once · Max 50MB per file
          </p>
        )}
      </label>

      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onInputChange}
        style={{ display: 'none' }}
      />

      {error && (
        <div style={{
          marginTop: 12,
          padding: '10px 16px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#fca5a5', fontSize: 14,
        }}>
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
