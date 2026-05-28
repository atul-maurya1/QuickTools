'use client'
import { useState, useCallback } from 'react'
import ImageDropzone from '@/components/ImageDropzone'
import imageCompression from 'browser-image-compression'
import {
  Download, Trash2, CheckCircle, AlertCircle, RefreshCw,
  Package, Layers, Settings, ChevronDown
} from 'lucide-react'
import JSZip from 'jszip'

type Action = 'compress' | 'convert' | 'resize'
type Format = 'image/jpeg' | 'image/png' | 'image/webp'

interface FileItem {
  id: string
  file: File
  previewUrl: string
  status: 'waiting' | 'processing' | 'done' | 'error'
  outputBlob?: Blob
  outputUrl?: string
  outputSize?: number
  error?: string
}

function formatBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(2) + ' MB'
}

async function processFile(
  file: File, action: Action,
  opts: { quality: number; format: Format; width: number; height: number }
): Promise<Blob> {
  if (action === 'compress') {
    return await imageCompression(file, {
      initialQuality: opts.quality / 100,
      maxSizeMB: file.size / (1024 * 1024),
      useWebWorker: true,
    })
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const w = action === 'resize' ? opts.width : img.naturalWidth
      const h = action === 'resize' ? opts.height : img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')!
      if (opts.format === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h) }
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url)
        blob ? resolve(blob) : reject(new Error('Failed'))
      }, opts.format, opts.quality / 100)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')) }
    img.src = url
  })
}

export default function BulkProcessorClient() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [action, setAction] = useState<Action>('compress')
  const [quality, setQuality] = useState(75)
  const [format, setFormat] = useState<Format>('image/webp')
  const [width, setWidth] = useState(1920)
  const [height, setHeight] = useState(1080)
  const [processing, setProcessing] = useState(false)
  const [concurrency] = useState(3)

  const handleFiles = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'waiting',
    }))
    setFiles(prev => [...prev, ...items])
  }, [])

  const processAll = useCallback(async () => {
    setProcessing(true)
    const pending = files.filter(f => f.status !== 'done')

    // Process in batches of `concurrency`
    for (let i = 0; i < pending.length; i += concurrency) {
      const batch = pending.slice(i, i + concurrency)
      await Promise.all(batch.map(async item => {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f))
        try {
          const blob = await processFile(item.file, action, { quality, format, width, height })
          const url = URL.createObjectURL(blob)
          setFiles(prev => prev.map(f =>
            f.id === item.id ? { ...f, status: 'done', outputBlob: blob, outputUrl: url, outputSize: blob.size } : f
          ))
        } catch (e: unknown) {
          setFiles(prev => prev.map(f =>
            f.id === item.id ? { ...f, status: 'error', error: (e as Error).message } : f
          ))
        }
      }))
    }
    setProcessing(false)
  }, [files, action, quality, format, width, height, concurrency])

  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.outputBlob)
    if (!done.length) return
    const zip = new JSZip()
    const ext = action === 'compress' ? 'jpg' : format.split('/')[1]
    done.forEach(f => {
      const base = f.file.name.replace(/\.[^.]+$/, '')
      zip.file(base + '_pf.' + ext, f.outputBlob!)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'quicktools_bulk.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const remove = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))
  const clearAll = () => { files.forEach(f => URL.revokeObjectURL(f.previewUrl)); setFiles([]) }

  const total = files.length
  const doneCount = files.filter(f => f.status === 'done').length
  const errorCount = files.filter(f => f.status === 'error').length
  const processingCount = files.filter(f => f.status === 'processing').length
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Action selector */}
      <div className="glass" style={{ padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f9fafb', marginBottom: 20 }}>
          <Settings size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: '#818cf8' }} />
          Bulk Settings
        </h2>

        {/* Action tabs */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Action</label>
          <div className="tab-bar" style={{ maxWidth: 400 }}>
            {(['compress', 'convert', 'resize'] as Action[]).map(a => (
              <button key={a} className={`tab-btn ${action === a ? 'active' : ''}`}
                onClick={() => setAction(a)} style={{ textTransform: 'capitalize' }}>
                {a === 'compress' ? '🗜️' : a === 'convert' ? '🔄' : '📐'} {a}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Quality: <span style={{ color: '#818cf8' }}>{quality}%</span>
            </label>
            <input type="range" className="range-slider" min={10} max={100} value={quality}
              onChange={e => setQuality(Number(e.target.value))} />
          </div>

          {(action === 'convert' || action === 'resize') && (
            <div>
              <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Output Format</label>
              <select className="styled-select" style={{ width: '100%' }} value={format}
                onChange={e => setFormat(e.target.value as Format)}>
                <option value="image/webp">WEBP</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
          )}

          {action === 'resize' && (
            <>
              <div>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Width (px)</label>
                <input type="number" className="styled-input" value={width}
                  onChange={e => setWidth(Number(e.target.value))} min={1} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Height (px)</label>
                <input type="number" className="styled-input" value={height}
                  onChange={e => setHeight(Number(e.target.value))} min={1} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dropzone */}
      {files.length === 0 && (
        <ImageDropzone onFiles={handleFiles} maxFiles={200}
          hint="Upload up to 200 images at once · JPG, PNG, WEBP, GIF supported" />
      )}

      {/* Queue */}
      {files.length > 0 && (
        <div>
          {/* Progress overview */}
          <div className="glass" style={{ padding: '16px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                <span style={{ fontSize: 14, color: '#9ca3af' }}>
                  <Layers size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  {total} files
                </span>
                <span style={{ fontSize: 14, color: '#10b981' }}>✓ {doneCount} done</span>
                {processingCount > 0 && <span style={{ fontSize: 14, color: '#818cf8' }}>⚙ {processingCount} processing</span>}
                {errorCount > 0 && <span style={{ fontSize: 14, color: '#ef4444' }}>✗ {errorCount} failed</span>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb' }}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: progress + '%' }} />
            </div>
          </div>

          {/* File list (virtualized-style, show first 50) */}
          <div style={{
            maxHeight: 480, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 6,
            marginBottom: 20,
          }}>
            {files.map(item => (
              <div key={item.id} className={`file-card ${item.status}`}
                style={{ padding: '10px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.file.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>
                      {formatBytes(item.file.size)}
                      {item.outputSize && ` → ${formatBytes(item.outputSize)}`}
                      {item.error && ` · ${item.error}`}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {item.status === 'done' && item.outputUrl && (
                      <a href={item.outputUrl} download={item.file.name} className="btn-ghost" style={{ padding: '4px 8px' }}>
                        <Download size={12} />
                      </a>
                    )}
                    {item.status === 'done' && <CheckCircle size={14} color="#10b981" />}
                    {item.status === 'processing' && <RefreshCw size={14} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />}
                    {item.status === 'error' && <AlertCircle size={14} color="#ef4444" />}
                    {item.status === 'waiting' && <span style={{ fontSize: 11, color: '#4b5563' }}>Queued</span>}
                    <button className="btn-ghost" onClick={() => remove(item.id)} style={{ padding: '4px 6px' }}>
                      <Trash2 size={12} />
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
              <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>+ Add More</span>
            </label>

            {!processing && files.some(f => f.status !== 'done') && (
              <button className="btn-primary" onClick={processAll}>
                ⚡ Process {files.filter(f => f.status !== 'done').length} Images
              </button>
            )}

            {processing && (
              <button className="btn-secondary" onClick={() => setProcessing(false)}>Stop</button>
            )}

            {doneCount > 0 && (
              <button className="btn-success" onClick={downloadAll}>
                <Package size={16} /> Download {doneCount} as ZIP
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
