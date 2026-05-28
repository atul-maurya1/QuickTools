'use client'
import { useState, useCallback } from 'react'
import ImageDropzone from '@/components/ImageDropzone'
import { Download, Trash2, CheckCircle, RefreshCw, AlertCircle, Package, Lock, Unlock } from 'lucide-react'
import JSZip from 'jszip'

interface FileItem {
  id: string
  file: File
  previewUrl: string
  outputUrl?: string
  outputBlob?: Blob
  outputSize?: number
  status: 'waiting' | 'processing' | 'done' | 'error'
  error?: string
}

type Unit = 'px' | 'in' | 'cm' | 'mm'

const DPI = 96
const unitToPx: Record<Unit, number> = { px: 1, in: DPI, cm: DPI / 2.54, mm: DPI / 25.4 }

interface Preset {
  label: string
  width: number
  height: number
  icon: string
}

const PRESETS: Preset[] = [
  { label: 'Instagram Post', width: 1080, height: 1080, icon: '📸' },
  { label: 'Instagram Story', width: 1080, height: 1920, icon: '📱' },
  { label: 'YouTube Thumbnail', width: 1280, height: 720, icon: '▶️' },
  { label: 'LinkedIn Banner', width: 1584, height: 396, icon: '💼' },
  { label: 'Facebook Post', width: 1200, height: 630, icon: '👍' },
  { label: 'Twitter Header', width: 1500, height: 500, icon: '🐦' },
  { label: 'Passport Photo', width: 413, height: 531, icon: '🪪' },
  { label: 'HD (1080p)', width: 1920, height: 1080, icon: '🖥️' },
  { label: '4K UHD', width: 3840, height: 2160, icon: '✨' },
  { label: 'Mobile Wallpaper', width: 1080, height: 2340, icon: '📲' },
  { label: 'A4 Portrait', width: 2480, height: 3508, icon: '📄' },
  { label: 'Square 512', width: 512, height: 512, icon: '⬛' },
]

function formatBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
  return (b / (1024 * 1024)).toFixed(2) + ' MB'
}

async function resizeImage(file: File, targetW: number, targetH: number, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')!
      if (format === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, targetW, targetH) }
      ctx.drawImage(img, 0, 0, targetW, targetH)
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url)
        blob ? resolve(blob) : reject(new Error('Resize failed'))
      }, format, quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

export default function ResizerTool() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [width, setWidth] = useState('1920')
  const [height, setHeight] = useState('1080')
  const [unit, setUnit] = useState<Unit>('px')
  const [lockAspect, setLockAspect] = useState(true)
  const [outputFormat, setOutputFormat] = useState('image/jpeg')
  const [quality, setQuality] = useState(90)
  const [processing, setProcessing] = useState(false)

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f, previewUrl: URL.createObjectURL(f), status: 'waiting' as const,
    }))])
  }, [])

  const applyPreset = (p: Preset) => {
    setWidth(String(p.width))
    setHeight(String(p.height))
    setUnit('px')
  }

  const onWidthChange = (val: string) => {
    setWidth(val)
    if (lockAspect && files[0]) {
      const img = document.createElement('img')
      img.src = files[0].previewUrl
      img.onload = () => {
        const ratio = img.naturalHeight / img.naturalWidth
        setHeight(Math.round(parseFloat(val || '0') * ratio).toString())
      }
    }
  }

  const onHeightChange = (val: string) => {
    setHeight(val)
    if (lockAspect && files[0]) {
      const img = document.createElement('img')
      img.src = files[0].previewUrl
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight
        setWidth(Math.round(parseFloat(val || '0') * ratio).toString())
      }
    }
  }

  const resizeAll = useCallback(async () => {
    setProcessing(true)
    const mul = unitToPx[unit]
    const targetW = Math.round(parseFloat(width || '0') * mul)
    const targetH = Math.round(parseFloat(height || '0') * mul)
    if (!targetW || !targetH) { setProcessing(false); return }

    for (const item of files.filter(f => f.status !== 'done')) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f))
      try {
        const blob = await resizeImage(item.file, targetW, targetH, outputFormat, quality / 100)
        const url = URL.createObjectURL(blob)
        setFiles(prev => prev.map(f =>
          f.id === item.id ? { ...f, status: 'done', outputBlob: blob, outputUrl: url, outputSize: blob.size } : f
        ))
      } catch (e: unknown) {
        setFiles(prev => prev.map(f =>
          f.id === item.id ? { ...f, status: 'error', error: (e as Error).message } : f
        ))
      }
    }
    setProcessing(false)
  }, [files, width, height, unit, outputFormat, quality])

  const download = (item: FileItem) => {
    if (!item.outputUrl) return
    const ext = outputFormat.split('/')[1]
    const a = document.createElement('a')
    a.href = item.outputUrl
    a.download = 'resized_' + item.file.name.replace(/\.[^.]+$/, '') + '.' + ext
    a.click()
  }

  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.outputBlob)
    if (!done.length) return
    const zip = new JSZip()
    const ext = outputFormat.split('/')[1]
    done.forEach(f => zip.file('resized_' + f.file.name.replace(/\.[^.]+$/, '') + '.' + ext, f.outputBlob!))
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'quicktools_resized.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const remove = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))
  const clearAll = () => { files.forEach(f => URL.revokeObjectURL(f.previewUrl)); setFiles([]) }
  const doneCount = files.filter(f => f.status === 'done').length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Presets */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, marginBottom: 14 }}>Quick Presets</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)}
              style={{
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9ca3af', fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; (e.currentTarget as HTMLElement).style.color = '#f9fafb' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#9ca3af' }}>
              <span>{p.icon}</span>
              <span>{p.label}</span>
              <span style={{ color: '#4b5563', fontSize: 11 }}>{p.width}×{p.height}</span>
            </button>
          ))}
        </div>

        {/* Custom size */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Width</label>
            <div className="input-with-unit">
              <input type="number" value={width} onChange={e => onWidthChange(e.target.value)} min={1} />
              <span>{unit}</span>
            </div>
          </div>

          {/* Lock aspect */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 2 }}>
            <button onClick={() => setLockAspect(v => !v)} className="btn-ghost"
              style={{ flexDirection: 'column', gap: 4, padding: '8px 12px', border: `1px solid ${lockAspect ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10 }}>
              {lockAspect ? <Lock size={16} color="#818cf8" /> : <Unlock size={16} color="#6b7280" />}
              <span style={{ fontSize: 11 }}>{lockAspect ? 'Locked' : 'Free'}</span>
            </button>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Height</label>
            <div className="input-with-unit">
              <input type="number" value={height} onChange={e => onHeightChange(e.target.value)} min={1} />
              <span>{unit}</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Unit</label>
            <select className="styled-select" style={{ width: '100%' }} value={unit} onChange={e => setUnit(e.target.value as Unit)}>
              <option value="px">Pixels (px)</option>
              <option value="in">Inches (in)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="mm">Millimeters (mm)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>Output Format</label>
            <select className="styled-select" style={{ width: '100%' }} value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WEBP</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Quality: <span style={{ color: '#818cf8' }}>{quality}%</span>
            </label>
            <input type="range" className="range-slider" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Drop zone */}
      {files.length === 0 && <ImageDropzone onFiles={handleFiles} />}

      {/* Files */}
      {files.length > 0 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {files.map(item => (
              <div key={item.id} className={`file-card ${item.status}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left part: Thumb and info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={item.status === 'done' && item.outputUrl ? item.outputUrl : item.previewUrl}
                        alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.file.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                        {item.status === 'done' && item.outputSize
                          ? `→ ${width}×${height}${unit} · ${formatBytes(item.outputSize)}`
                          : item.status === 'error' ? item.error : formatBytes(item.file.size)}
                      </p>
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
                    {item.status === 'waiting' && <span style={{ fontSize: 12, color: '#6b7280' }}>Ready</span>}
                    <button className="btn-ghost" onClick={() => remove(item.id)} style={{ padding: '6px 8px', marginLeft: 'auto' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />
              <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>+ Add More</span>
            </label>

            {!processing && files.some(f => f.status !== 'done') && (
              <button className="btn-primary" onClick={resizeAll}>
                Resize {files.filter(f => f.status !== 'done').length} Image{files.filter(f => f.status !== 'done').length !== 1 ? 's' : ''} to {width}×{height}{unit}
              </button>
            )}

            {doneCount > 1 && (
              <button className="btn-success" onClick={downloadAll}><Package size={16} /> Download All as ZIP</button>
            )}

            <button className="btn-ghost" onClick={clearAll}><Trash2 size={14} /> Clear All</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
