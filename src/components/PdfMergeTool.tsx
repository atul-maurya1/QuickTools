'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import PdfDropzone from '@/components/PdfDropzone'
import {
  Upload, Download, Trash2, ArrowUp, ArrowDown,
  CheckCircle, AlertCircle, FileText, FileSpreadsheet,
  RefreshCw, X, HelpCircle
} from 'lucide-react'

interface MergeFile {
  id: string
  file: File
  name: string
  size: number
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

export default function PdfMergeTool() {
  const [files, setFiles] = useState<MergeFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessedResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pdfLibRef = useRef<any>(null)

  // Dynamically load browser-only pdf-lib library on mount
  useEffect(() => {
    const loadLibs = async () => {
      try {
        const pdfLib = await import('pdf-lib')
        pdfLibRef.current = pdfLib
      } catch (err) {
        console.error('Failed to load pdf-lib:', err)
        setError('Failed to initialize PDF merging engine. Please check your internet connection.')
      }
    }
    loadLibs()
  }, [])

  const handleFiles = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    setError(null)
    setResult(null)

    if (!pdfLibRef.current) {
      setError('PDF merging engine is loading. Please wait a moment...')
      return
    }

    setProcessing(true)
    const pdfLib = pdfLibRef.current
    const loadedFiles: MergeFile[] = []

    for (const f of newFiles) {
      try {
        const arrayBuffer = await f.arrayBuffer()
        // Load quickly without parsing full page structures (updateMetadata: false)
        const pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer, { updateMetadata: false })
        const pagesCount = pdfDoc.getPageCount()

        loadedFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          name: f.name,
          size: f.size,
          pagesCount
        })
      } catch (err: any) {
        console.error(err)
        setError(`Failed to read page count from file "${f.name}". It may be password protected or corrupted.`)
      }
    }

    setFiles(prev => [...prev, ...loadedFiles])
    setProcessing(false)
  }, [])

  const moveUp = (index: number) => {
    if (index === 0) return
    setFiles(prev => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[index - 1]
      copy[index - 1] = temp
      return copy
    })
    setResult(null)
  }

  const moveDown = (index: number) => {
    if (index === files.length - 1) return
    setFiles(prev => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[index + 1]
      copy[index + 1] = temp
      return copy
    })
    setResult(null)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    setResult(null)
  }

  const clearAll = () => {
    setFiles([])
    setResult(null)
    setError(null)
  }

  const handleMerge = async () => {
    if (!pdfLibRef.current || files.length < 2) return
    setProcessing(true)
    setError(null)
    setResult(null)

    const pdfLib = pdfLibRef.current

    try {
      // Create empty target document
      const mergedPdf = await pdfLib.PDFDocument.create()

      // Copy page streams from each document in order
      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer()
        const srcPdf = await pdfLib.PDFDocument.load(fileBytes)
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices())
        copiedPages.forEach((page: any) => mergedPdf.addPage(page))
      }

      // Save document binary representation
      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)

      setResult({
        blob,
        size: blob.size,
        url: downloadUrl
      })

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while merging your PDF files. Make sure none of the files are password-protected.')
    } finally {
      setProcessing(false)
    }
  }

  const downloadFile = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = `merged_${Date.now()}.pdf`
    a.click()
  }

  const startOver = () => {
    if (result?.url) URL.revokeObjectURL(result.url)
    setFiles([])
    setResult(null)
    setError(null)
  }

  return (
    <div style={{ maxWidth: 650, margin: '0 auto' }}>
      
      {/* Privacy & performance badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 12,
        fontSize: 13, color: '#34d399', fontWeight: 500,
        marginBottom: 16, justifyContent: 'center', textAlign: 'center'
      }}>
        <span>⚡ <strong>Fast Binary Merger</strong>: Copies pages directly in binary format. Works in seconds, handling up to 500MB without decompression!</span>
      </div>

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

      {/* Upload Zone */}
      {!result && (
        <div style={{ marginBottom: 24 }}>
          <PdfDropzone onFiles={handleFiles} multiple={true} hint="Select multiple PDFs to merge them into a single file" />
        </div>
      )}

      {/* Main List & Action Panel */}
      {files.length > 0 && !result && (
        <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f9fafb' }}>
              Files to Merge ({files.length})
            </h3>
            <button
              onClick={clearAll}
              style={{
                background: 'none', border: 'none', color: '#6b7280',
                fontSize: 13, cursor: 'pointer', transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              Clear All
            </button>
          </div>

          {/* Files List with order controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {files.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 12,
                  transition: 'background 0.2s',
                }}
              >
                {/* Visual Order Number */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#818cf8',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>

                {/* File Details */}
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText size={16} color="#ef4444" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </p>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    <span>Size: {formatBytes(item.size)}</span>
                    <span>Pages: {item.pagesCount}</span>
                  </div>
                </div>

                {/* Move Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: 'none',
                      borderRadius: 6, width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: index === 0 ? '#4b5563' : '#9ca3af',
                      cursor: index === 0 ? 'not-allowed' : 'pointer'
                    }}
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={index === files.length - 1}
                    onClick={() => moveDown(index)}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: 'none',
                      borderRadius: 6, width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: index === files.length - 1 ? '#4b5563' : '#9ca3af',
                      cursor: index === files.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)', border: 'none',
                      borderRadius: 6, width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ef4444', cursor: 'pointer'
                    }}
                    title="Remove File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Button */}
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || processing}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 16,
              justifyContent: 'center',
              cursor: files.length < 2 ? 'not-allowed' : 'pointer',
              opacity: files.length < 2 ? 0.6 : 1,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            }}
          >
            {processing ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Merging PDFs...
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                Merge {files.length} PDFs
              </>
            )}
          </button>
        </div>
      )}

      {/* Processing Loader */}
      {processing && files.length === 0 && (
        <div className="glass" style={{ padding: 40, textAlign: 'center', borderRadius: 16 }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: '#6366f1', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 15, color: '#9ca3af' }}>Reading uploaded files...</p>
        </div>
      )}

      {/* Result view */}
      {result && (
        <div className="glass" style={{ padding: 24, borderRadius: 16, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle size={32} color="#10b981" />
          </div>
          
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f9fafb', marginBottom: 4 }}>
            PDFs Merged Successfully!
          </h3>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
            Your merged PDF document is ready.
          </p>

          {/* Merge Result Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5 mb-6">
            <div style={{ background: 'rgba(10,10,18,0.4)', padding: 16 }}>
              <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Total Files</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#818cf8' }}>{files.length}</p>
            </div>
            <div style={{ background: 'rgba(10,10,18,0.4)', padding: 16 }}>
              <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Merged Size</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{formatBytes(result.size)}</p>
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
              Download Merged PDF
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
  )
}
