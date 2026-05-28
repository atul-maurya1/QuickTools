'use client'
import { useState, useCallback, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import ImageDropzone from '@/components/ImageDropzone'
import {
  Upload, Download, Trash2, X, Zap,
  CheckCircle, AlertCircle, FileImage, ArrowRight,
  Package, RefreshCw, Eye
} from 'lucide-react'
import JSZip from 'jszip'

interface FileItem {
  id: string
  file: File
  originalSize: number
  compressedBlob?: Blob
  compressedSize?: number
  status: 'waiting' | 'processing' | 'done' | 'error'
  progress: number
  previewUrl?: string
  compressedUrl?: string
  error?: string
  originalWidth?: number
  originalHeight?: number
  outputWidth?: number
  outputHeight?: number
}

type CompressionLevel = 'low' | 'medium' | 'high' | 'custom'

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function getSavings(orig: number, comp: number) {
  return Math.round((1 - comp / orig) * 100)
}



export default function CompressorTool() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [level, setLevel] = useState<CompressionLevel>('medium')
  const [targetSize, setTargetSize] = useState('')
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB' | 'GB' | 'KG'>('KB')
  const [processing, setProcessing] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const abortRef = useRef(false)

  const handleFiles = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles.map(f => {
      const previewUrl = URL.createObjectURL(f)
      const item: FileItem = {
        id: Math.random().toString(36).slice(2),
        file: f,
        originalSize: f.size,
        status: 'waiting',
        progress: 0,
        previewUrl: previewUrl,
      }
      const img = new Image()
      img.onload = () => {
        setFiles(prev => prev.map(p =>
          p.id === item.id
            ? { ...p, originalWidth: img.naturalWidth, originalHeight: img.naturalHeight }
            : p
        ))
      }
      img.src = previewUrl
      return item
    })
    setFiles(prev => [...prev, ...items])
  }, [])

  const qualityForLevel: Record<CompressionLevel, number> = {
    low: 0.8,
    medium: 0.65,
    high: 0.4,
    custom: 0.7,
  }

  const compressAll = useCallback(async () => {
    abortRef.current = false
    setProcessing(true)

    let targetBytes: number | undefined = undefined
    if (targetSize) {
      const val = parseFloat(targetSize)
      if (!isNaN(val) && val > 0) {
        if (targetUnit === 'KB') {
          targetBytes = val * 1024
        } else if (targetUnit === 'MB') {
          targetBytes = val * 1024 * 1024
        } else if (targetUnit === 'GB') {
          targetBytes = val * 1024 * 1024 * 1024
        } else if (targetUnit === 'KG') {
          // Map 1 KG to 1000 KB for our non-technical friend!
          targetBytes = val * 1000 * 1024
        }
      }
    }

    for (const item of files) {
      if (abortRef.current) break
      if (item.status === 'done') continue

      setFiles(prev => prev.map(f =>
        f.id === item.id ? { ...f, status: 'processing', progress: 10 } : f
      ))

      try {
        const options: Parameters<typeof imageCompression>[1] = {
          maxSizeMB: targetBytes
            ? targetBytes / (1024 * 1024)
            : item.file.size / (1024 * 1024) * qualityForLevel[level],
          initialQuality: targetBytes ? 0.95 : qualityForLevel[level],
          useWebWorker: true,
          onProgress: (p: number) => {
            setFiles(prev => prev.map(f =>
              f.id === item.id ? { ...f, progress: p } : f
            ))
          },
        }

        if (item.file.size < 100 * 1024) {
          // tiny file — just pass through
          options.maxSizeMB = item.file.size / (1024 * 1024)
        }

        const compressed = await imageCompression(item.file, options)
        const url = URL.createObjectURL(compressed)

        setFiles(prev => prev.map(f =>
          f.id === item.id
            ? {
                ...f,
                status: 'done',
                progress: 100,
                compressedBlob: compressed,
                compressedSize: compressed.size,
                compressedUrl: url,
                outputWidth: item.originalWidth,
                outputHeight: item.originalHeight,
              }
            : f
        ))
      } catch {
        setFiles(prev => prev.map(f =>
          f.id === item.id ? { ...f, status: 'error', error: 'Compression failed', progress: 0 } : f
        ))
      }
    }

    setProcessing(false)
  }, [files, level, targetSize, targetUnit, qualityForLevel])

  const downloadFile = (item: FileItem) => {
    if (!item.compressedUrl) return
    const a = document.createElement('a')
    a.href = item.compressedUrl
    a.download = 'compressed_' + item.file.name
    a.click()
  }

  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.compressedBlob)
    if (done.length === 0) return
    const zip = new JSZip()
    done.forEach(f => zip.file('compressed_' + f.file.name, f.compressedBlob!))
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quicktools_compressed.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearAll = () => {
    files.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
    setFiles([])
  }

  const doneCount = files.filter(f => f.status === 'done').length
  const totalOriginal = files.reduce((s, f) => s + f.originalSize, 0)
  const totalCompressed = files.filter(f => f.compressedSize).reduce((s, f) => s + (f.compressedSize ?? 0), 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Settings */}
      <div className="glass" style={{ padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, color: '#f9fafb' }}>
          Compression Settings
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {/* Level selector */}
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Compression Level
            </label>
            <div className="tab-bar">
              {(['low', 'medium', 'high', 'custom'] as CompressionLevel[]).map(l => (
                <button key={l} className={`tab-btn ${level === l ? 'active' : ''}`}
                  onClick={() => setLevel(l)} style={{ textTransform: 'capitalize', padding: '7px 10px', fontSize: 13 }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Target size */}
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Target File Size (optional)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                placeholder="e.g. 100"
                value={targetSize}
                onChange={e => setTargetSize(e.target.value)}
                min={1}
                className="styled-input"
                style={{ flex: 1 }}
              />
              <select
                className="styled-select"
                value={targetUnit}
                onChange={e => setTargetUnit(e.target.value as any)}
                style={{ width: '90px', padding: '10px 24px 10px 10px' }}
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="KG">KG</option>
              </select>
            </div>
            <p style={{ fontSize: 12, color: '#4b5563', marginTop: 6 }}>
              {targetUnit === 'KG' ? '💡 Note: 1 KG is mapped to 1000 KB.' : 'Leave blank to use level setting'}
            </p>
          </div>
        </div>

        {/* Level explanation */}
        <div style={{
          marginTop: 16, padding: '10px 16px',
          background: 'rgba(99,102,241,0.06)',
          borderRadius: 10, fontSize: 13, color: '#9ca3af',
        }}>
          {level === 'low' && '🟢 Low compression: ~80% quality, minimal size reduction. Best for print/archival.'}
          {level === 'medium' && '🟡 Medium compression: ~65% quality, balanced size & quality. Best for web use.'}
          {level === 'high' && '🔴 High compression: ~40% quality, maximum size reduction. Best for email/messaging.'}
          {level === 'custom' && '⚙️ Custom: Set exact target KB size above for precise control.'}
        </div>
      </div>

      {/* Upload zone */}
      {files.length === 0 && (
        <ImageDropzone onFiles={handleFiles} />
      )}

      {/* File list */}
      {files.length > 0 && (
        <div>
          {/* Summary stats */}
          {doneCount > 0 && (
            <div className="glass" style={{
              padding: '16px 24px', marginBottom: 20,
              display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Original Total</p>
                <p className="stat-value" style={{ color: '#f9fafb', fontSize: 18, fontWeight: 700 }}>{formatBytes(totalOriginal)}</p>
              </div>
              <ArrowRight size={20} color="#6366f1" />
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Compressed Total</p>
                <p className="stat-value" style={{ color: '#10b981', fontSize: 18, fontWeight: 700 }}>{formatBytes(totalCompressed)}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Saved</p>
                <p className="stat-value gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>
                  {getSavings(totalOriginal, totalCompressed)}%
                </p>
              </div>
            </div>
          )}

          {/* Files grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {files.map(item => (
              <div key={item.id} className={`file-card ${item.status}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left part: Thumb and info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Thumb */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.previewUrl
                        ? <img src={item.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <FileImage size={24} color="#6b7280" />
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.file.name}
                      </p>
                      {item.originalWidth && item.originalHeight && (
                        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                          {item.originalWidth}×{item.originalHeight} px
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span className="stat-value" style={{ color: '#6b7280', fontSize: 12 }}>{formatBytes(item.originalSize)}</span>
                        {item.status === 'done' && item.compressedSize && (
                          <>
                            <ArrowRight size={12} color="#6366f1" />
                            <span className="stat-value" style={{ color: '#10b981', fontSize: 12 }}>{formatBytes(item.compressedSize)}</span>
                            <span className="badge badge-green" style={{ fontSize: 11, padding: '2px 8px' }}>
                              -{getSavings(item.originalSize, item.compressedSize)}%
                            </span>
                          </>
                        )}
                        {item.status === 'error' && (
                          <span style={{ color: '#fca5a5', fontSize: 12 }}>{item.error}</span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {item.status === 'processing' && (
                        <div className="progress-bar" style={{ marginTop: 8 }}>
                          <div className="progress-bar-fill" style={{ width: item.progress + '%' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right part: Status actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    {item.status === 'done' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => setPreviewFile(item)} className="btn-ghost" title="Preview"
                          style={{ padding: '6px 10px' }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => downloadFile(item)} className="btn-success"
                          style={{ padding: '6px 14px', fontSize: 13 }}>
                          <Download size={13} style={{ display: 'inline', marginRight: 4 }} /> Save
                        </button>
                        <CheckCircle size={18} color="#10b981" />
                      </div>
                    )}
                    {item.status === 'waiting' && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Waiting…</span>
                    )}
                    {item.status === 'processing' && (
                      <RefreshCw size={18} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                    )}
                    {item.status === 'error' && <AlertCircle size={18} color="#ef4444" />}
                    
                    <button onClick={() => removeFile(item.id)} className="btn-ghost"
                      style={{ padding: '6px 8px', color: '#6b7280', marginLeft: 'auto' }} title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add more + action buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />
              <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Upload size={16} /> Add More Images
              </span>
            </label>

            {!processing && files.some(f => f.status !== 'done') && (
              <button className="btn-primary" onClick={compressAll}
                disabled={processing}
                style={{ opacity: processing ? 0.7 : 1 }}>
                <Zap size={16} />
                Compress {files.filter(f => f.status !== 'done').length} Image{files.filter(f => f.status !== 'done').length !== 1 ? 's' : ''}
              </button>
            )}

            {processing && (
              <button className="btn-secondary" onClick={() => { abortRef.current = true }}>
                Stop Processing
              </button>
            )}

            {doneCount > 1 && (
              <button className="btn-success" onClick={downloadAll}>
                <Package size={16} /> Download All ({doneCount}) as ZIP
              </button>
            )}

            <button className="btn-ghost" onClick={clearAll} style={{ color: '#6b7280' }}>
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }} onClick={() => setPreviewFile(null)}>
          <div className="glass-strong" style={{ padding: 24, maxWidth: 800, width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: '#f9fafb' }}>Preview: {previewFile.file.name}</h3>
              <button className="btn-ghost" onClick={() => setPreviewFile(null)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                  Original · {previewFile.originalWidth && previewFile.originalHeight ? `${previewFile.originalWidth}x${previewFile.originalHeight} px · ` : ''}{formatBytes(previewFile.originalSize)}
                </p>
                <img src={previewFile.previewUrl} alt="Original" style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 300 }} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#10b981', marginBottom: 8 }}>
                  Compressed · {previewFile.outputWidth && previewFile.outputHeight ? `${previewFile.outputWidth}x${previewFile.outputHeight} px · ` : ''}{formatBytes(previewFile.compressedSize ?? 0)} · -{getSavings(previewFile.originalSize, previewFile.compressedSize ?? 0)}%
                </p>
                <img src={previewFile.compressedUrl} alt="Compressed" style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 300 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-success" onClick={() => downloadFile(previewFile)}>
                <Download size={15} /> Download Compressed
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}


