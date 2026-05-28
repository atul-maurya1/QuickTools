'use client'
import { useState, useCallback, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import ImageDropzone from '@/components/ImageDropzone'
import {
  Upload, Download, Trash2, Zap,
  CheckCircle, AlertCircle, FileImage, ArrowRight,
  RefreshCw, Eye, X
} from 'lucide-react'

interface ImageFile {
  file: File
  name: string
  originalSize: number
  previewUrl: string
  width?: number
  height?: number
}

interface ProcessedResult {
  blob: Blob
  size: number
  url: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function getSavings(orig: number, comp: number) {
  const savings = Math.round((1 - comp / orig) * 100)
  return savings > 0 ? savings : 0
}

async function compressToTargetKB(
  file: File,
  previewUrl: string,
  targetBytes: number,
  onProgress: (p: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      try {
        const originalWidth = img.naturalWidth
        const originalHeight = img.naturalHeight
        
        let bestBlob: Blob | null = null
        let scale = 1.0
        let quality = 0.95
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        let attempts = 0
        const maxAttempts = 15
        
        while (attempts < maxAttempts) {
          const w = Math.max(1, Math.round(originalWidth * scale))
          const h = Math.max(1, Math.round(originalHeight * scale))
          canvas.width = w
          canvas.height = h
          
          ctx.clearRect(0, 0, w, h)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
          ctx.drawImage(img, 0, 0, w, h)
          
          const currentBlob: Blob = await new Promise(res => {
            canvas.toBlob(b => res(b || new Blob()), 'image/jpeg', quality)
          })
          
          onProgress(Math.min(95, Math.round((attempts / maxAttempts) * 80) + 15))
          
          if (currentBlob.size <= targetBytes) {
            bestBlob = currentBlob
            // Close enough to target or quality maximized
            if (currentBlob.size >= targetBytes * 0.90 || quality >= 0.95) {
              break
            }
            quality = Math.min(0.98, quality + 0.04)
            if (scale < 1.0) {
              scale = Math.min(1.0, scale * 1.1)
            } else {
              break
            }
          } else {
            if (quality > 0.35) {
              quality -= 0.15
            } else {
              if (currentBlob.size > 0) {
                const sizeRatio = targetBytes / currentBlob.size
                const scaleAdjust = Math.sqrt(sizeRatio) * 0.95
                scale = Math.max(0.02, scale * scaleAdjust)
              } else {
                scale = Math.max(0.02, scale * 0.5)
              }
              quality = 0.6
            }
          }
          attempts++
        }
        
        if (!bestBlob) {
          const w = Math.max(1, Math.round(originalWidth * 0.05))
          const h = Math.max(1, Math.round(originalHeight * 0.05))
          canvas.width = w
          canvas.height = h
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
          ctx.drawImage(img, 0, 0, w, h)
          const fallbackBlob: Blob = await new Promise(res => {
            canvas.toBlob(b => res(b || new Blob()), 'image/jpeg', 0.1)
          })
          bestBlob = fallbackBlob
        }
        
        if (bestBlob.size < targetBytes) {
          const paddingNeeded = targetBytes - bestBlob.size
          const paddingArray = new Uint8Array(paddingNeeded)
          paddingArray.fill(0)
          bestBlob = new Blob([bestBlob, paddingArray], { type: 'image/jpeg' })
        }
        
        resolve(bestBlob)
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'))
    }
    img.src = previewUrl
  })
}

export default function DecreaseSizeTool() {
  const [image, setImage] = useState<ImageFile | null>(null)
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic')
  const [targetSize, setTargetSize] = useState('')
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB' | 'GB' | 'KG'>('KB')
  
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessedResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    
    // Revoke old URL if any
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl)
    }
    
    const previewUrl = URL.createObjectURL(file)
    const imgFile: ImageFile = {
      file,
      name: file.name,
      originalSize: file.size,
      previewUrl,
    }

    const img = new Image()
    img.onload = () => {
      setImage(prev => prev ? { ...prev, width: img.naturalWidth, height: img.naturalHeight } : null)
    }
    img.src = previewUrl
    
    setImage(imgFile)
    setResult(null)
    setError(null)
    setProgress(0)
  }, [image])

  const compressImage = async () => {
    if (!image) return
    setProcessing(true)
    setError(null)
    setProgress(10)

    let targetBytes: number | undefined = undefined
    if (mode === 'manual' && targetSize) {
      const val = parseFloat(targetSize)
      if (!isNaN(val) && val > 0) {
        if (targetUnit === 'KB') {
          targetBytes = val * 1024
        } else if (targetUnit === 'MB') {
          targetBytes = val * 1024 * 1024
        } else if (targetUnit === 'GB') {
          targetBytes = val * 1024 * 1024 * 1024
        } else if (targetUnit === 'KG') {
          targetBytes = val * 1000 * 1024
        }
      }
    }

    // Manual size validation check
    if (targetBytes && targetBytes >= image.originalSize) {
      setError(`Your target size (${formatBytes(targetBytes)}) is larger than or equal to the original size (${formatBytes(image.originalSize)}). Please use the Increase Size tool if you want to make the image size larger.`)
      setProcessing(false)
      return
    }

    if (mode === 'manual' && targetBytes) {
      try {
        const compressed = await compressToTargetKB(
          image.file,
          image.previewUrl,
          targetBytes,
          (p: number) => setProgress(p)
        )
        const url = URL.createObjectURL(compressed)
        setResult({
          blob: compressed,
          size: compressed.size,
          url
        })
        setProgress(100)
      } catch (e: any) {
        setError(e.message || 'Compression failed. Try a slightly different target size.')
      } finally {
        setProcessing(false)
      }
      return
    }

    try {
      const options: Parameters<typeof imageCompression>[1] = {
        maxSizeMB: (image.originalSize * 0.5) / (1024 * 1024), // automatic defaults to 50% target size
        initialQuality: 0.7,
        useWebWorker: true,
        onProgress: (p: number) => {
          setProgress(Math.max(10, p))
        },
      }

      // Small file safety
      if (image.originalSize < 30 * 1024) {
        options.maxSizeMB = image.originalSize / (1024 * 1024)
      }

      const compressed = await imageCompression(image.file, options)
      const url = URL.createObjectURL(compressed)
      setResult({
        blob: compressed,
        size: compressed.size,
        url
      })
      setProgress(100)
    } catch (e: any) {
      setError(e.message || 'Compression failed. Try manual mode for exact size target.')
    } finally {
      setProcessing(false)
    }
  }

  const downloadFile = () => {
    if (!result || !image) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = 'compressed_' + image.name
    a.click()
  }

  const startOver = () => {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl)
    if (result?.url) URL.revokeObjectURL(result.url)
    setImage(null)
    setResult(null)
    setError(null)
    setProgress(0)
    setTargetSize('')
  }

  return (
    <div style={{ maxWidth: 650, margin: '0 auto' }}>
      {/* Client-side Scalability & Privacy Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 12,
        fontSize: 13, color: '#34d399', fontWeight: 500,
        marginBottom: 16, justifyContent: 'center', textAlign: 'center'
      }}>
        <span>⚡ <strong>100% Client-Side</strong>: Processed instantly in your browser. Perfect privacy, scales infinitely with zero server queues!</span>
      </div>

      {/* Upload Zone */}
      {!image && (
        <ImageDropzone onFiles={handleFiles} />
      )}

      {/* Main Tool Interface */}
      {image && (
        <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
          {/* File analysis card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 20
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              overflow: 'hidden', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src={image.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {image.name}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12, color: '#9ca3af' }}>
                <span>File Size: <strong style={{ color: '#818cf8' }}>{formatBytes(image.originalSize)}</strong></span>
                {image.width && image.height && (
                  <span>Dimensions: {image.width}×{image.height} px</span>
                )}
              </div>
            </div>
            <button onClick={startOver} className="btn-ghost" style={{ padding: '6px 8px', color: '#6b7280' }} title="Remove File">
              <Trash2 size={16} />
            </button>
          </div>

          {/* Action Settings */}
          {!result && !processing && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Select Action Mode
                </label>
                <div className="tab-bar">
                  <button
                    type="button"
                    className={`tab-btn ${mode === 'automatic' ? 'active' : ''}`}
                    onClick={() => setMode('automatic')}
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    ⚡ Automatic Optimization
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${mode === 'manual' ? 'active' : ''}`}
                    onClick={() => setMode('manual')}
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    ⚙️ Manual Target Size
                  </button>
                </div>
              </div>

              {/* Manual Input Controls */}
              {mode === 'manual' && (
                <div className="animate-in" style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                    Enter Desired Smaller Size
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="number"
                      placeholder={`e.g. ${Math.round((image.originalSize * 0.5) / 1024)}`}
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
                      style={{ width: '100px', padding: '10px' }}
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                      <option value="KG">KG</option>
                    </select>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                    {targetUnit === 'KG' ? '💡 Note: 1 KG is treated as 1000 KB.' : 'Ensure target size is less than current size.'}
                  </p>
                </div>
              )}

              {/* Start Action Button */}
              <button
                className="btn-primary"
                onClick={compressImage}
                style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 600 }}
              >
                Compress Image File Size
              </button>
            </div>
          )}

          {/* Processing / Progress State */}
          {processing && (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <RefreshCw size={24} color="#6366f1" className="spin" style={{ margin: '0 auto 12px', animation: 'spin 1.5s linear infinite' }} />
              <p style={{ fontSize: 14, color: '#f9fafb', marginBottom: 8 }}>Compressing image file size...</p>
              <div className="progress-bar" style={{ maxWidth: 300, margin: '0 auto' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex', gap: 10,
              padding: 12, background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10,
              color: '#fca5a5', fontSize: 13, marginTop: 14
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Completed Result display */}
          {result && !processing && (
            <div className="animate-in" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#10b981', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
                <CheckCircle size={18} />
                Successfully Compressed!
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Original size</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#9ca3af' }}>{formatBytes(image.originalSize)}</p>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: 12, borderRadius: 10, textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <p style={{ fontSize: 12, color: '#10b981', marginBottom: 2 }}>Compressed size</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>{formatBytes(result.size)}</p>
                </div>
              </div>

              {/* Savings banner */}
              <div style={{
                textAlign: 'center', padding: '8px 12px',
                background: 'rgba(99, 102, 241, 0.08)', borderRadius: 8,
                fontSize: 13, color: '#818cf8', fontWeight: 600, marginBottom: 20
              }}>
                Saved {getSavings(image.originalSize, result.size)}% of the file size!
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setShowPreview(true)}
                  className="btn-secondary justify-center"
                  style={{ flex: 1, padding: '10px', fontSize: 14 }}
                >
                  <Eye size={15} /> Preview
                </button>
                <button
                  onClick={downloadFile}
                  className="btn-success justify-center"
                  style={{ flex: 2, padding: '10px', fontSize: 14 }}
                >
                  <Download size={15} /> Save Image
                </button>
              </div>

              <button
                onClick={startOver}
                className="btn-ghost"
                style={{ width: '100%', marginTop: 14, fontSize: 13, color: '#6b7280' }}
              >
                Clear & Compress Another
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && image && result && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }} onClick={() => setShowPreview(false)}>
          <div className="glass-strong" style={{ padding: 24, maxWidth: 800, width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: '#f9fafb' }}>Preview: {image.name}</h3>
              <button className="btn-ghost" onClick={() => setShowPreview(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                  Original · {image.width && image.height ? `${image.width}x${image.height} px · ` : ''}{formatBytes(image.originalSize)}
                </p>
                <img src={image.previewUrl} alt="Original" style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 300 }} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#10b981', marginBottom: 8 }}>
                  Compressed · {image.width && image.height ? `${image.width}x${image.height} px · ` : ''}{formatBytes(result.size)} · -{getSavings(image.originalSize, result.size)}%
                </p>
                <img src={result.url} alt="Compressed" style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 300 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 10 }}>
              <button className="btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
              <button className="btn-success" onClick={downloadFile}>
                <Download size={15} style={{ marginRight: 6, display: 'inline' }} /> Download Compressed
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}
