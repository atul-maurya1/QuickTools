'use client'
import { useState, useCallback } from 'react'
import ImageDropzone from '@/components/ImageDropzone'
import {
  ArrowRight, Download, Trash2, CheckCircle,
  AlertCircle, RefreshCw, Package
} from 'lucide-react'
import JSZip from 'jszip'

interface FileItem {
  id: string
  file: File
  name: string
  status: 'waiting' | 'processing' | 'done' | 'error'
  outputBlob?: Blob
  outputUrl?: string
  outputFormat: string
  outputSize?: number
  previewUrl: string
  error?: string
}

type Format = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
const FORMAT_LABELS: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'image/gif': 'GIF',
}
const FORMAT_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const CONVERSION_PRESETS = [
  { from: 'PNG', to: 'JPG', desc: 'Reduce file size, lose transparency' },
  { from: 'JPG', to: 'PNG', desc: 'Add transparency support' },
  { from: 'PNG', to: 'WEBP', desc: 'Modern format, smaller size' },
  { from: 'WEBP', to: 'PNG', desc: 'Max compatibility' },
  { from: 'JPG', to: 'WEBP', desc: 'Best for web performance' },
  { from: 'WEBP', to: 'JPG', desc: 'Wide compatibility' },
]

function formatBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(2) + ' MB'
}

async function convertImage(file: File, targetFormat: Format, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      // Fill white bg for JPG (no transparency)
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url)
        if (blob) resolve(blob)
        else reject(new Error('Conversion failed'))
      }, targetFormat, quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

export default function ConverterTool() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [targetFormat, setTargetFormat] = useState<Format>('image/png')
  const [quality, setQuality] = useState(92)
  const [processing, setProcessing] = useState(false)

  const handleFiles = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      name: f.name,
      status: 'waiting',
      outputFormat: FORMAT_EXT[targetFormat],
      previewUrl: URL.createObjectURL(f),
    }))
    setFiles(prev => [...prev, ...items])
  }, [targetFormat])

  const convertAll = useCallback(async () => {
    setProcessing(true)
    const toProcess = files.filter(f => f.status !== 'done')

    for (const item of toProcess) {
      setFiles(prev => prev.map(f =>
        f.id === item.id ? { ...f, status: 'processing' } : f
      ))
      try {
        const blob = await convertImage(item.file, targetFormat, quality / 100)
        const url = URL.createObjectURL(blob)
        const baseName = item.file.name.replace(/\.[^.]+$/, '')
        setFiles(prev => prev.map(f =>
          f.id === item.id
            ? { ...f, status: 'done', outputBlob: blob, outputUrl: url, outputSize: blob.size, outputFormat: FORMAT_EXT[targetFormat], name: baseName }
            : f
        ))
      } catch (e: unknown) {
        setFiles(prev => prev.map(f =>
          f.id === item.id ? { ...f, status: 'error', error: (e as Error).message } : f
        ))
      }
    }
    setProcessing(false)
  }, [files, targetFormat, quality])

  const download = (item: FileItem) => {
    if (!item.outputUrl) return
    const a = document.createElement('a')
    a.href = item.outputUrl
    a.download = item.name + '.' + item.outputFormat
    a.click()
  }

  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.outputBlob)
    if (!done.length) return
    const zip = new JSZip()
    done.forEach(f => zip.file(f.name + '.' + f.outputFormat, f.outputBlob!))
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quicktools_converted.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  const remove = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))
  const clearAll = () => { files.forEach(f => URL.revokeObjectURL(f.previewUrl)); setFiles([]) }
  const doneCount = files.filter(f => f.status === 'done').length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Quick Presets */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 14, fontWeight: 500 }}>Quick Conversion Presets</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {CONVERSION_PRESETS.map(p => (
            <button key={p.from + p.to}
              className="btn-ghost"
              style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13 }}
              onClick={() => {
                const fmt = p.to === 'JPG' ? 'image/jpeg' : p.to === 'PNG' ? 'image/png' : p.to === 'WEBP' ? 'image/webp' : 'image/gif'
                setTargetFormat(fmt as Format)
              }}>
              <span style={{ color: '#6b7280' }}>{p.from}</span>
              <ArrowRight size={12} style={{ margin: '0 6px', color: '#6366f1' }} />
              <span style={{ color: '#818cf8', fontWeight: 600 }}>{p.to}</span>
            </button>
          ))}
        </div>

        {/* Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Output Format
            </label>
            <select className="styled-select" style={{ width: '100%' }}
              value={targetFormat} onChange={e => setTargetFormat(e.target.value as Format)}>
              <option value="image/jpeg">JPG / JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WEBP</option>
              <option value="image/gif">GIF</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Output Quality: <span style={{ color: '#818cf8' }}>{quality}%</span>
            </label>
            <input type="range" className="range-slider" min={10} max={100} value={quality}
              onChange={e => setQuality(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4b5563', marginTop: 4 }}>
              <span>Smaller file</span><span>Higher quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      {files.length === 0 && <ImageDropzone onFiles={handleFiles} />}

      {/* File list */}
      {files.length > 0 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {files.map(item => (
              <div key={item.id} className={`file-card ${item.status}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left part: Thumb and info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img src={item.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.file.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <span className="badge badge-purple" style={{ fontSize: 11 }}>
                          {item.file.type.split('/')[1]?.toUpperCase() || 'IMG'}
                        </span>
                        <ArrowRight size={12} color="#6366f1" />
                        <span className="badge badge-green" style={{ fontSize: 11 }}>
                          {FORMAT_LABELS[targetFormat]}
                        </span>
                        {item.outputSize && (
                          <span className="stat-value" style={{ color: '#10b981', fontSize: 12 }}>{formatBytes(item.outputSize)}</span>
                        )}
                        {item.error && <span style={{ color: '#fca5a5', fontSize: 12 }}>{item.error}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right part: Status actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    {item.status === 'done' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn-success" onClick={() => download(item)} style={{ padding: '6px 14px', fontSize: 13 }}>
                          <Download size={13} style={{ display: 'inline', marginRight: 4 }} /> Save
                        </button>
                        <CheckCircle size={18} color="#10b981" />
                      </div>
                    )}
                    {item.status === 'processing' && <RefreshCw size={18} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />}
                    {item.status === 'error' && <AlertCircle size={18} color="#ef4444" />}
                    {item.status === 'waiting' && <span style={{ fontSize: 12, color: '#6b7280' }}>Waiting…</span>}
                    <button className="btn-ghost" onClick={() => remove(item.id)} style={{ padding: '6px 8px', marginLeft: 'auto' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />
              <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                + Add More
              </span>
            </label>

            {!processing && files.some(f => f.status !== 'done') && (
              <button className="btn-primary" onClick={convertAll}>
                Convert {files.filter(f => f.status !== 'done').length} Image{files.filter(f => f.status !== 'done').length !== 1 ? 's' : ''} to {FORMAT_LABELS[targetFormat]}
              </button>
            )}

            {doneCount > 1 && (
              <button className="btn-success" onClick={downloadAll}>
                <Package size={16} /> Download All as ZIP
              </button>
            )}

            <button className="btn-ghost" onClick={clearAll}><Trash2 size={14} /> Clear All</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
