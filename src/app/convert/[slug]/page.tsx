import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConverterTool from '@/components/ConverterTool'

const VALID_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
const FORMAT_LABELS: Record<string, string> = {
  jpg: 'JPG', jpeg: 'JPEG', png: 'PNG', webp: 'WEBP', gif: 'GIF', avif: 'AVIF',
}

// Pattern: /convert-jpg-to-png, /convert-png-to-webp, etc.
interface PageProps {
  params: Promise<{ slug: string }>
}

function parseSlug(slug: string): { from: string; to: string } | null {
  // Expected format: "jpg-to-png", "png-to-webp", etc.
  const match = slug.match(/^([a-z]+)-to-([a-z]+)$/)
  if (!match) return null
  const from = match[1], to = match[2]
  if (!VALID_FORMATS.includes(from) || !VALID_FORMATS.includes(to) || from === to) return null
  return { from, to }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) return {}
  const F = FORMAT_LABELS[parsed.from]; const T = FORMAT_LABELS[parsed.to]
  return {
    title: `${F} to ${T} Converter Online Free — QuickTools`,
    description: `Convert ${F} to ${T} online for free. No signup, no watermark. Batch convert multiple ${F} files to ${T} and download as ZIP.`,
  }
}

export function generateStaticParams() {
  const pairs: { slug: string }[] = []
  for (const f of VALID_FORMATS) {
    for (const t of VALID_FORMATS) {
      if (f !== t) pairs.push({ slug: `${f}-to-${t}` })
    }
  }
  return pairs
}

export default async function FormatConversionPage({ params }: PageProps) {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const { from, to } = parsed!
  const F = FORMAT_LABELS[from]; const T = FORMAT_LABELS[to]

  const whyConvert = T === 'WEBP'
    ? `WEBP offers 25-34% smaller file sizes than ${F} at the same visual quality, making it ideal for web performance and faster page loads.`
    : T === 'PNG'
      ? `PNG supports transparency and lossless compression, making it better than ${F} for logos, graphics, and screenshots.`
      : (T === 'JPG' || T === 'JPEG')
        ? `JPG is universally supported and produces smaller files than ${F}, making it ideal for photos and easy sharing.`
        : `Converting from ${F} to ${T} gives you better compatibility and flexibility for your use case.`

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 32, fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</a>
          <span>›</span>
          <a href="/image-converter" style={{ color: '#9ca3af', textDecoration: 'none' }}>Convert</a>
          <span>›</span>
          <span style={{ color: '#818cf8' }}>{F} to {T}</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>🔄 Convert</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Convert {F} to {T}<br /><span className="gradient-text">Online — Free</span>
          </h1>
          <p style={{ fontSize: 17, color: '#9ca3af', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Convert {F} images to {T} format instantly. No signup, no watermark.
            Batch convert and download as ZIP.
          </p>
        </div>

        <ConverterTool />

        {/* How to section */}
        <section style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { step: '1', title: `Upload ${F} files`, desc: `Drag & drop your ${F} images or click to browse. Upload up to 20 at once.` },
            { step: '2', title: `Select ${T} output`, desc: `${T} is pre-selected. Adjust quality with the slider if needed.` },
            { step: '3', title: 'Download results', desc: `Click Convert, then download each ${T} file or grab all as a ZIP.` },
          ].map(s => (
            <div key={s.step} className="glass" style={{ padding: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'white', marginBottom: 12 }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 56, maxWidth: 680, margin: '56px auto 0', color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            Why convert {F} to {T}?
          </h2>
          <p>{whyConvert}</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
