'use client'
import { useState, useCallback, useRef } from 'react'
import ImageDropzone from '@/components/ImageDropzone'
import { Download, Trash2, CheckCircle, RefreshCw, AlertCircle, Package, Lock, Unlock, Eye, X, Upload } from 'lucide-react'
import JSZip from 'jszip'

interface FileItem {
  id: string
  file: File
  previewUrl: string
  originalWidth?: number
  originalHeight?: number
  outputUrl?: string
  outputBlob?: Blob
  outputSize?: number
  outputWidth?: number
  outputHeight?: number
  status: 'waiting' | 'processing' | 'done' | 'error'
  error?: string
}

const PRESETS = [
  { label: '25% (Shrink)', value: 25 },
  { label: '50% (Half)', value: 50 },
  { label: '75% (Medium)', value: 75 },
  { label: '100% (Original)', value: 100 },
  { label: '150% (Large)', value: 150 },
  { label: '200% (Double/2x)', value: 200 },
  { label: '300% (Triple/3x)', value: 300 },
  { label: '400% (Quad/4x)', value: 400 },
]

function formatBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(2) + ' MB'
}

async function scaleImage(
  file: File,
  scalePercent: number,
  format: string,
  quality: number
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const targetW = Math.max(1, Math.round(img.naturalWidth * (scalePercent / 100)))
      const targetH = Math.max(1, Math.round(img.naturalHeight * (scalePercent / 100)))
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')!
      
      // Handle transparent background for JPG
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, targetW, targetH)
      }
      
      ctx.drawImage(img, 0, 0, targetW, targetH)
      canvas.toBlob(
        blob => {
          URL.revokeObjectURL(url)
          if (blob) {
            resolve({ blob, width: targetW, height: targetH })
          } else {
            reject(new Error('Scaling failed'))
          }
        },
        format,
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export default function ScalerTool() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [scaleMode, setScaleMode] = useState<'decrease' | 'increase'>('decrease')
  const [scale, setScale] = useState<number>(50) // Default 50% (Half)
  const [scaleInput, setScaleInput] = useState<string>('50')
  const changeScaleMode = (mode: 'decrease' | 'increase') => {
    setScaleMode(mode)
    if (mode === 'decrease') {
      setScale(50)
      setScaleInput('50')
    } else {
      setScale(200)
      setScaleInput('200')
    }
  }
  const [outputFormat, setOutputFormat] = useState('image/jpeg')
  const [quality, setQuality] = useState(90)
  const [processing, setProcessing] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  const handleFiles = useCallback((newFiles: File[]) => {
    const items = newFiles.map(f => {
      const item: FileItem = {
        id: Math.random().toString(36).slice(2),
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: 'waiting',
      }
      // Read original dimensions
      const img = new Image()
      img.onload = () => {
        setFiles(prev =>
          prev.map(p =>
            p.id === item.id
              ? { ...p, originalWidth: img.naturalWidth, originalHeight: img.naturalHeight }
              : p
          )
        )
      }
      img.src = item.previewUrl
      return item
    })
    setFiles(prev => [...prev, ...items])
  }, [])

  const handleScalePercentChange = (val: number) => {
    const minVal = scaleMode === 'decrease' ? 1 : 101
    const maxVal = scaleMode === 'decrease' ? 99 : 1000
    const clamped = Math.max(minVal, Math.min(maxVal, val))
    setScale(clamped)
    setScaleInput(String(clamped))
  }

  const handleInputChange = (val: string) => {
    setScaleInput(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) {
      const minVal = scaleMode === 'decrease' ? 1 : 101
      const maxVal = scaleMode === 'decrease' ? 99 : 1000
      setScale(Math.max(minVal, Math.min(maxVal, Math.round(num))))
    }
  }

  const scaleAll = useCallback(async () => {
    setProcessing(true)
    for (const item of files.filter(f => f.status !== 'done')) {
      setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, status: 'processing' } : f)))
      try {
        const { blob, width: outW, height: outH } = await scaleImage(
          item.file,
          scale,
          outputFormat,
          quality / 100
        )
        const url = URL.createObjectURL(blob)
        setFiles(prev =>
          prev.map(f =>
            f.id === item.id
              ? {
                  ...f,
                  status: 'done',
                  outputBlob: blob,
                  outputUrl: url,
                  outputSize: blob.size,
                  outputWidth: outW,
                  outputHeight: outH,
                }
              : f
          )
        )
      } catch (e: unknown) {
        setFiles(prev =>
          prev.map(f =>
            f.id === item.id ? { ...f, status: 'error', error: (e as Error).message } : f
          )
        )
      }
    }
    setProcessing(false)
  }, [files, scale, outputFormat, quality])

  const download = (item: FileItem) => {
    if (!item.outputUrl) return
    const ext = outputFormat.split('/')[1]
    const a = document.createElement('a')
    a.href = item.outputUrl
    a.download = `scaled_${scale}pct_${item.file.name.replace(/\.[^.]+$/, '')}.${ext}`
    a.click()
  }

  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.outputBlob)
    if (!done.length) return
    const zip = new JSZip()
    const ext = outputFormat.split('/')[1]
    done.forEach(f =>
      zip.file(
        `scaled_${scale}pct_${f.file.name.replace(/\.[^.]+$/, '')}.${ext}`,
        f.outputBlob!
      )
    )
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quicktools_scaled_${scale}pct.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  const remove = (id: string) => {
    const item = files.find(f => f.id === id)
    if (item) {
      URL.revokeObjectURL(item.previewUrl)
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl)
    }
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearAll = () => {
    files.forEach(f => {
      URL.revokeObjectURL(f.previewUrl)
      if (f.outputUrl) URL.revokeObjectURL(f.outputUrl)
    })
    setFiles([])
  }

  const doneCount = files.filter(f => f.status === 'done').length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Configuration Settings */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        
        {/* Simple Scaling Selection Mode */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Resize Dimensions Mode
          </label>
          <div className="tab-bar" style={{ maxWidth: '500px' }}>
            <button
              type="button"
              className={`tab-btn ${scaleMode === 'decrease' ? 'active' : ''}`}
              onClick={() => changeScaleMode('decrease')}
              style={{ fontSize: 12, padding: '8px 10px' }}
            >
              📉 Decrease Size (Make Smaller)
            </button>
            <button
              type="button"
              className={`tab-btn ${scaleMode === 'increase' ? 'active' : ''}`}
              onClick={() => changeScaleMode('increase')}
              style={{ fontSize: 12, padding: '8px 10px' }}
            >
              📈 Increase Size (Make Larger)
            </button>
          </div>
        </div>

        {/* Dynamic Controls based on Decrease / Increase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              {scaleMode === 'decrease' ? 'Choose How Much Smaller' : 'Choose How Much Larger'}
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {scaleMode === 'decrease'
                ? [75, 50, 25].map(val => (
                    <button
                      key={val}
                      type="button"
                      className="preset-btn"
                      onClick={() => { setScale(val); setScaleInput(String(val)) }}
                      style={{
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: scale === val ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                        background: scale === val ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                        color: scale === val ? '#f9fafb' : '#9ca3af',
                      }}
                    >
                      {val === 75 && '75% (Medium Small)'}
                      {val === 50 && '50% (Half Size)'}
                      {val === 25 && '25% (Tiny Size)'}
                    </button>
                  ))
                : [150, 200, 300, 400].map(val => (
                    <button
                      key={val}
                      type="button"
                      className="preset-btn"
                      onClick={() => { setScale(val); setScaleInput(String(val)) }}
                      style={{
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: scale === val ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                        background: scale === val ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                        color: scale === val ? '#f9fafb' : '#9ca3af',
                      }}
                    >
                      {val === 150 && '1.5x (Larger)'}
                      {val === 200 && '2x (Double Size)'}
                      {val === 300 && '3x (Triple Size)'}
                      {val === 400 && '4x (Quadruple Size)'}
                    </button>
                  ))
              }
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              {scaleMode === 'decrease' ? 'Shrinks the image dimensions.' : 'Enlarges the image resolution.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: '100px' }}>
              <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Custom Scale
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={scaleInput}
                  onChange={e => handleInputChange(e.target.value)}
                  min={scaleMode === 'decrease' ? 1 : 101}
                  max={scaleMode === 'decrease' ? 99 : 1000}
                />
                <span>%</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Adjust ({scaleMode === 'decrease' ? '1% - 99%' : '101% - 1000%'})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                <input
                  type="range"
                  className="range-slider"
                  min={scaleMode === 'decrease' ? 1 : 101}
                  max={scaleMode === 'decrease' ? 99 : 1000}
                  value={scale}
                  onChange={e => handleScalePercentChange(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '20px 0' }} />

        {/* Format and Quality Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Output Format
            </label>
            <select
              className="styled-select"
              style={{ width: '100%' }}
              value={outputFormat}
              onChange={e => setOutputFormat(e.target.value)}
            >
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WEBP</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Quality: <span style={{ color: '#818cf8' }}>{quality}%</span>
            </label>
            <input
              type="range"
              className="range-slider"
              min={10}
              max={100}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
            />
          </div>
        </div>

      </div>

      {/* Upload Zone */}
      {files.length === 0 && <ImageDropzone onFiles={handleFiles} />}

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {files.map(item => {
              const origW = item.originalWidth ?? 0
              const origH = item.originalHeight ?? 0
              const outW = Math.round(origW * (scale / 100))
              const outH = Math.round(origH * (scale / 100))
              return (
                <div key={item.id} className={`file-card ${item.status}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left part: Thumb and info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={item.status === 'done' && item.outputUrl ? item.outputUrl : item.previewUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.file.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                          {origW ? `${origW}×${origH} px` : 'Reading size...'} →{' '}
                          <span style={{ color: scale > 100 ? '#a78bfa' : scale < 100 ? '#ec4899' : '#f9fafb', fontWeight: 600 }}>
                            {outW}×{outH} px ({scale}%)
                          </span>
                        </p>
                        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          {item.status === 'done' && item.outputSize
                            ? `Compressed size: ${formatBytes(item.outputSize)}`
                            : `Original size: ${formatBytes(item.file.size)}`}
                        </p>
                      </div>
                    </div>

                    {/* Right part: Status actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      {item.status === 'done' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            className="btn-ghost"
                            onClick={() => setPreviewFile(item)}
                            style={{ padding: '6px 8px' }}
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn-success"
                            onClick={() => download(item)}
                            style={{ padding: '6px 14px', fontSize: 13 }}
                          >
                            <Download size={13} style={{ display: 'inline', marginRight: 4 }} /> Save
                          </button>
                          <CheckCircle size={18} color="#10b981" />
                        </div>
                      )}
                      {item.status === 'processing' && (
                        <RefreshCw size={18} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                      )}
                      {item.status === 'error' && <AlertCircle size={18} color="#ef4444" />}
                      {item.status === 'waiting' && <span style={{ fontSize: 12, color: '#6b7280' }}>Ready</span>}
                      <button
                        className="btn-ghost"
                        onClick={() => remove(item.id)}
                        style={{ padding: '6px 8px', marginLeft: 'auto' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => e.target.files && handleFiles(Array.from(e.target.files))}
              />
              <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Upload size={14} /> Add More
              </span>
            </label>

            {!processing && files.some(f => f.status !== 'done') && (
              <button className="btn-primary" onClick={scaleAll}>
                Scale {files.filter(f => f.status !== 'done').length} Image
                {files.filter(f => f.status !== 'done').length !== 1 ? 's' : ''} to {scale}%
              </button>
            )}

            {doneCount > 1 && (
              <button className="btn-success" onClick={downloadAll}>
                <Package size={16} /> Download All as ZIP
              </button>
            )}

            <button className="btn-ghost" onClick={clearAll}>
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="glass-strong"
            style={{ padding: 24, maxWidth: 800, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: '#f9fafb' }}>Preview: {previewFile.file.name}</h3>
              <button className="btn-ghost" onClick={() => setPreviewFile(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                  Original · {previewFile.originalWidth}x{previewFile.originalHeight} px ·{' '}
                  {formatBytes(previewFile.file.size)}
                </p>
                <img
                  src={previewFile.previewUrl}
                  alt="Original"
                  style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 300 }}
                />
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#10b981', marginBottom: 8 }}>
                  Scaled ({scale}%) · {previewFile.outputWidth}x{previewFile.outputHeight} px ·{' '}
                  {previewFile.outputSize ? formatBytes(previewFile.outputSize) : ''}
                </p>
                <img
                  src={previewFile.outputUrl}
                  alt="Scaled"
                  style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 300 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-success" onClick={() => download(previewFile)}>
                <Download size={15} /> Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
