'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import PdfDropzone from '@/components/PdfDropzone'
import {
  Upload, Download, Trash2, Zap,
  CheckCircle, AlertCircle, FileText, ArrowRight,
  RefreshCw, X
} from 'lucide-react'

interface PDFFileInfo {
  file: File
  name: string
  originalSize: number
  pagesCount: number
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

async function findOptimalImageBytes(
  sourceCanvas: HTMLCanvasElement,
  targetBytes: number
): Promise<{ bytes: ArrayBuffer; width: number; height: number }> {
  // Pre-check if original at high quality already fits within budget
  const initialBlob: Blob = await new Promise(resolve => {
    sourceCanvas.toBlob(b => resolve(b || new Blob()), 'image/jpeg', 0.85)
  })
  const initialBytes = await initialBlob.arrayBuffer()
  if (initialBytes.byteLength <= targetBytes) {
    return { bytes: initialBytes, width: sourceCanvas.width, height: sourceCanvas.height }
  }

  let lowScale = 0.05
  let highScale = 1.0
  let scale = 0.6
  let quality = 0.55
  
  let bestBytes: ArrayBuffer | null = null
  let bestSize = 0
  let bestWidth = sourceCanvas.width
  let bestHeight = sourceCanvas.height
  
  const maxIterations = 6
  let iterations = 0
  
  const targetCanvas = document.createElement('canvas')
  const targetCtx = targetCanvas.getContext('2d')!
  
  while (iterations < maxIterations) {
    const w = Math.max(1, Math.round(sourceCanvas.width * scale))
    const h = Math.max(1, Math.round(sourceCanvas.height * scale))
    targetCanvas.width = w
    targetCanvas.height = h
    
    targetCtx.fillStyle = '#ffffff'
    targetCtx.fillRect(0, 0, w, h)
    targetCtx.drawImage(sourceCanvas, 0, 0, w, h)
    
    const blob: Blob = await new Promise(resolve => {
      targetCanvas.toBlob(b => resolve(b || new Blob()), 'image/jpeg', quality)
    })
    
    const bytes = await blob.arrayBuffer()
    const size = bytes.byteLength
    
    if (size <= targetBytes) {
      if (!bestBytes || size > bestSize) {
        bestBytes = bytes
        bestSize = size
        bestWidth = w
        bestHeight = h
      }
      
      if (size >= targetBytes * 0.9) {
        break
      }
      
      lowScale = scale
      scale = (scale + highScale) / 2
      quality = Math.min(0.95, quality + 0.08)
    } else {
      highScale = scale
      scale = (scale + lowScale) / 2
      quality = Math.max(0.10, quality - 0.12)
    }
    
    iterations++
  }
  
  if (!bestBytes) {
    const w = Math.max(1, Math.round(sourceCanvas.width * 0.05))
    const h = Math.max(1, Math.round(sourceCanvas.height * 0.05))
    targetCanvas.width = w
    targetCanvas.height = h
    targetCtx.fillStyle = '#ffffff'
    targetCtx.fillRect(0, 0, w, h)
    targetCtx.drawImage(sourceCanvas, 0, 0, w, h)
    
    const blob: Blob = await new Promise(resolve => {
      targetCanvas.toBlob(b => resolve(b || new Blob()), 'image/jpeg', 0.10)
    })
    bestBytes = await blob.arrayBuffer()
    bestWidth = w
    bestHeight = h
  }
  
  targetCanvas.width = 0
  targetCanvas.height = 0
  
  return { bytes: bestBytes, width: bestWidth, height: bestHeight }
}

export default function PdfCompressTool() {
  const [pdfFile, setPdfFile] = useState<PDFFileInfo | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic')
  const [autoPreset, setAutoPreset] = useState<'low' | 'medium' | 'high'>('medium')
  const [targetSize, setTargetSize] = useState('') // in KB
  const [result, setResult] = useState<ProcessedResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null) // in seconds

  const pdfjsRef = useRef<any>(null)
  const pdfLibRef = useRef<any>(null)
  const cancelRef = useRef(false)
  const startTimeRef = useRef<number>(0)

  // Dynamically load browser-only libraries on mount
  useEffect(() => {
    const loadLibs = async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        // Set worker CDN path matching the exact version
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        pdfjsRef.current = pdfjs
        
        const pdfLib = await import('pdf-lib')
        pdfLibRef.current = pdfLib
      } catch (err) {
        console.error('Failed to load PDF libraries:', err)
        setError('Failed to initialize PDF compression engine. Please check your internet connection and try again.')
      }
    }
    loadLibs()
  }, [])

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return
    setError(null)
    setResult(null)
    setProgress(0)
    
    const file = files[0]
    
    // Check if libraries are loaded
    if (!pdfjsRef.current) {
      setError('PDF compression engine is loading. Please wait a moment...')
      return
    }

    try {
      setProcessing(true)
      const fileBytes = await file.arrayBuffer()
      const loadingTask = pdfjsRef.current.getDocument({ data: fileBytes })
      const pdf = await loadingTask.promise
      
      setPdfFile({
        file,
        name: file.name,
        originalSize: file.size,
        pagesCount: pdf.numPages
      })
    } catch (err: any) {
      console.error(err)
      if (err.message && err.message.includes('password')) {
        setError('This PDF is password protected. Please unlock it and try again.')
      } else {
        setError('Invalid or corrupted PDF file.')
      }
    } finally {
      setProcessing(false)
    }
  }, [])

  const handleCompress = async () => {
    if (!pdfjsRef.current || !pdfLibRef.current || !pdfFile) return

    setProcessing(true)
    setProgress(0)
    setCurrentPage(0)
    setError(null)
    cancelRef.current = false
    startTimeRef.current = Date.now()
    setEstimatedTime(null)

    const pdfjs = pdfjsRef.current
    const pdfLib = pdfLibRef.current

    try {
      const fileBytes = await pdfFile.file.arrayBuffer()
      const loadingTask = pdfjs.getDocument({ data: fileBytes })
      const pdfDoc = await loadingTask.promise
      const numPages = pdfDoc.numPages

      // Manual target size validations
      let targetBytes = 0
      if (mode === 'manual') {
        const sizeKB = parseFloat(targetSize)
        if (isNaN(sizeKB) || sizeKB <= 0) {
          throw new Error('Please enter a valid target size (in KB).')
        }
        targetBytes = sizeKB * 1024
        if (targetBytes >= pdfFile.originalSize) {
          throw new Error(`Your target size (${formatBytes(targetBytes)}) is larger than or equal to the original size. Please enter a smaller target.`)
        }
      }

      const compressedPdfDoc = await pdfLib.PDFDocument.create()

      // Calculate configuration
      let scale = 1.0
      let quality = 0.65

      if (mode === 'automatic') {
        if (autoPreset === 'low') {
          scale = 1.25
          quality = 0.8
        } else if (autoPreset === 'medium') {
          scale = 1.0
          quality = 0.65
        } else { // high
          scale = 0.75
          quality = 0.4
        }
      }

      let remainingTargetBytes = targetBytes

      // Page-by-page compression
      for (let i = 1; i <= numPages; i++) {
        if (cancelRef.current) {
          cancelRef.current = false
          setProcessing(false)
          setProgress(0)
          setCurrentPage(0)
          return
        }

        setCurrentPage(i)
        const page = await pdfDoc.getPage(i)
        
        let imgBytes: ArrayBuffer
        let drawWidth = 0
        let drawHeight = 0

        if (mode === 'automatic') {
          const viewport = page.getViewport({ scale })

          // Canvas rendering
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) throw new Error('Failed to create 2D canvas context.')

          // Fill white background for pages that might have transparency
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          await page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise

          // Re-compress canvas as compressed JPEG bytes
          const imgDataUrl = canvas.toDataURL('image/jpeg', quality)
          imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer())
          
          drawWidth = viewport.width
          drawHeight = viewport.height

          // Free memory immediately by resetting canvas dimensions
          canvas.width = 0
          canvas.height = 0
        } else {
          // Manual mode: render at high resolution (1.5x) to have good source quality
          const viewport = page.getViewport({ scale: 1.5 })

          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) throw new Error('Failed to create 2D canvas context.')

          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          await page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise

          // Calculate dynamic page budget allocating leftover bytes
          const pagesRemaining = numPages - i + 1
          const targetBytesForThisPage = Math.max(2048, remainingTargetBytes / pagesRemaining)

          // Run feedback loop to search optimal parameters for this target page size
          const optimal = await findOptimalImageBytes(canvas, targetBytesForThisPage)
          imgBytes = optimal.bytes
          
          // Deduct from remaining target bytes
          remainingTargetBytes = Math.max(0, remainingTargetBytes - imgBytes.byteLength)

          drawWidth = viewport.width
          drawHeight = viewport.height

          // Free memory immediately by resetting canvas dimensions
          canvas.width = 0
          canvas.height = 0
        }

        // Add to new document
        const embeddedImage = await compressedPdfDoc.embedJpg(imgBytes)
        const newPage = compressedPdfDoc.addPage([drawWidth, drawHeight])
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: drawWidth,
          height: drawHeight
        })

        // Calculate progress & ETA
        const pageProgress = Math.round((i / numPages) * 100)
        setProgress(pageProgress)

        const elapsed = (Date.now() - startTimeRef.current) / 1000
        const avgTimePerPage = elapsed / i
        const remainingPages = numPages - i
        setEstimatedTime(Math.round(remainingPages * avgTimePerPage))
      }

      // Save output using object stream compression
      const compressedBytes = await compressedPdfDoc.save({ useObjectStreams: true })
      const blob = new Blob([compressedBytes], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)

      setResult({
        blob,
        size: blob.size,
        url: downloadUrl
      })
      setProgress(100)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Compression failed. Please check the PDF document and settings.')
    } finally {
      setProcessing(false)
      setEstimatedTime(null)
    }
  }

  const cancelCompression = () => {
    cancelRef.current = true
  }

  const downloadFile = () => {
    if (!result || !pdfFile) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = `compressed_${pdfFile.name}`
    a.click()
  }

  const startOver = () => {
    if (result?.url) URL.revokeObjectURL(result.url)
    setPdfFile(null)
    setResult(null)
    setError(null)
    setProgress(0)
    setCurrentPage(0)
    setTargetSize('')
    setEstimatedTime(null)
  }

  return (
    <div style={{ maxWidth: 650, margin: '0 auto' }}>
      
      {/* Informational scalability badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', background: 'rgba(239, 68, 68, 0.06)',
        border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 12,
        fontSize: 13, color: '#f87171', fontWeight: 500,
        marginBottom: 16, justifyContent: 'center', textAlign: 'center'
      }}>
        <span>⚡ <strong>Ultra High-Performance</strong>: Sequential page rendering keeps memory usage ultra-low to prevent crashes, supporting files up to 500MB!</span>
      </div>

      {/* Upload Zone */}
      {!pdfFile && !processing && (
        <PdfDropzone onFiles={handleFiles} multiple={false} hint="Upload a single PDF to compress" />
      )}

      {/* Main interface */}
      {(pdfFile || processing) && (
        <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
          
          {/* File Card */}
          {pdfFile && (
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
                width: 48, height: 48, borderRadius: 8,
                background: 'rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={24} color="#ef4444" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pdfFile.name}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12, color: '#9ca3af' }}>
                  <span>Original Size: <strong style={{ color: '#ef4444' }}>{formatBytes(pdfFile.originalSize)}</strong></span>
                  <span>Pages: {pdfFile.pagesCount}</span>
                </div>
              </div>
              {!processing && !result && (
                <button onClick={startOver} className="btn-ghost" style={{ padding: '6px 8px', color: '#6b7280' }} title="Remove File">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: 20,
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 8,
              color: '#fca5a5', fontSize: 14,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Settings panel */}
          {!result && !processing && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Compression Mode
                </label>
                <div className="tab-bar">
                  <button
                    type="button"
                    className={`tab-btn ${mode === 'automatic' ? 'active' : ''}`}
                    onClick={() => setMode('automatic')}
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    ⚡ Automatic Optimizer
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${mode === 'manual' ? 'active' : ''}`}
                    onClick={() => setMode('manual')}
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    🎯 Target Size (Manual KB)
                  </button>
                </div>
              </div>

              {/* Automatic Mode Settings */}
              {mode === 'automatic' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    Select Compression Preset
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { id: 'low', label: 'Low', desc: 'Max Quality', color: '#10b981' },
                      { id: 'medium', label: 'Medium', desc: 'Balanced', color: '#6366f1' },
                      { id: 'high', label: 'High', desc: 'Smallest PDF', color: '#ef4444' }
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setAutoPreset(preset.id as any)}
                        style={{
                          background: autoPreset === preset.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                          border: autoPreset === preset.id ? `2px solid ${preset.color}` : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 12, padding: '12px 8px', color: '#f9fafb', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{preset.label}</span>
                        <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{preset.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Mode Settings */}
              {mode === 'manual' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    Enter Target PDF Size (KB)
                  </label>
                  <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={targetSize}
                        onChange={e => setTargetSize(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 48px 12px 16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 12,
                          color: '#f9fafb',
                          fontSize: 15,
                        }}
                      />
                      <span style={{
                        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                        color: '#6b7280', fontWeight: 600, fontSize: 13
                      }}>KB</span>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                    {[100, 200, 500, 1000, 2000].map(kb => {
                      const label = kb >= 1000 ? `${(kb / 1000).toFixed(0)} MB` : `${kb} KB`
                      return (
                        <button
                          key={kb}
                          onClick={() => setTargetSize(kb.toString())}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            color: '#9ca3af',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Compress trigger */}
              <button
                onClick={handleCompress}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: 16,
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #ef4444, #f59e0b)'
                }}
              >
                <Zap size={16} color="white" fill="white" />
                Compress PDF
              </button>
            </div>
          )}

          {/* Running progress view */}
          {processing && !result && currentPage > 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'inline-flex', position: 'relative', marginBottom: 20 }}>
                <div className="spinner" style={{ borderLeftColor: '#ef4444', width: 64, height: 64 }} />
                <span style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate/translate3d(-50%,-50%,0)',
                  transformOrigin: 'center',
                  fontSize: 14, fontWeight: 700, color: '#ef4444',
                  marginTop: -10, marginLeft: -12
                }}>
                  {progress}%
                </span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>
                Compressing PDF Pages
              </h3>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>
                Processing page <strong style={{ color: '#ef4444' }}>{currentPage}</strong> of <strong>{pdfFile?.pagesCount}</strong>
              </p>
              
              {/* Progress bar container */}
              <div style={{
                width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4,
                overflow: 'hidden', marginBottom: 12
              }}>
                <div style={{
                  width: `${progress}%`, height: '100%',
                  background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                  borderRadius: 4, transition: 'width 0.3s ease'
                }} />
              </div>

              {estimatedTime !== null && estimatedTime > 0 && (
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  Estimated remaining time: {estimatedTime}s
                </p>
              )}

              <button
                onClick={cancelCompression}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '8px 20px', borderRadius: 10, color: '#9ca3af',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Loading source file spinner (before processing pages starts) */}
          {processing && currentPage === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <RefreshCw size={36} className="animate-spin" style={{ color: '#ef4444', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 15, color: '#9ca3af' }}>Analyzing and initializing PDF document...</p>
            </div>
          )}

          {/* Result view */}
          {result && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f9fafb', marginBottom: 4 }}>
                Compression Successful!
              </h3>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
                Your PDF is ready for download.
              </p>

              {/* Savings Details Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5 mb-6">
                <div style={{ background: 'rgba(10,10,18,0.4)', padding: 16 }}>
                  <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Original Size</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#9ca3af' }}>{formatBytes(pdfFile?.originalSize || 0)}</p>
                </div>
                <div style={{ background: 'rgba(10,10,18,0.4)', padding: 16 }}>
                  <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Compressed Size</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#34d399' }}>
                    {formatBytes(result.size)}
                    <span style={{ fontSize: 12, marginLeft: 6, padding: '2px 6px', background: 'rgba(16,185,129,0.12)', borderRadius: 6, fontWeight: 800 }}>
                      -{getSavings(pdfFile?.originalSize || 1, result.size)}%
                    </span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={downloadFile}
                  className="btn-primary"
                  style={{
                    width: '100%', padding: '14px', fontSize: 16,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #10b981, #059669)'
                  }}
                >
                  <Download size={16} />
                  Download Compressed PDF
                </button>

                <button
                  onClick={startOver}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '12px', fontSize: 14, justifyContent: 'center' }}
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
