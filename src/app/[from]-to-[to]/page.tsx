import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConverterTool from '@/components/ConverterTool'

const VALID_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
const FORMAT_LABELS: Record<string, string> = {
  jpg: 'JPG', jpeg: 'JPEG', png: 'PNG', webp: 'WEBP', gif: 'GIF', avif: 'AVIF',
}

interface PageProps {
  params: Promise<{ from: string; to: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { from, to } = await params
  const f = from.toLowerCase()
  const t = to.toLowerCase()
  if (!VALID_FORMATS.includes(f) || !VALID_FORMATS.includes(t)) return {}
  const F = FORMAT_LABELS[f]; const T = FORMAT_LABELS[t]
  return {
    title: `${F} to ${T} Converter Online Free — QuickTools`,
    description: `Convert ${F} to ${T} online for free. No signup, no watermark. Batch convert multiple ${F} files to ${T} and download as ZIP.`,
  }
}

export function generateStaticParams() {
  const pairs: { from: string; to: string }[] = []
  for (const f of VALID_FORMATS) {
    for (const t of VALID_FORMATS) {
      if (f !== t) pairs.push({ from: f, to: t })
    }
  }
  return pairs
}

export default async function FormatConversionPage({ params }: PageProps) {
  const { from, to } = await params
  const f = from.toLowerCase()
  const t = to.toLowerCase()
  if (!VALID_FORMATS.includes(f) || !VALID_FORMATS.includes(t) || f === t) notFound()
  const F = FORMAT_LABELS[f]; const T = FORMAT_LABELS[t]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>🔄 Convert</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Convert {F} to {T}<br /><span className="gradient-text">Online — Free</span>
          </h1>
          <p style={{ fontSize: 17, color: '#9ca3af', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Convert {F} images to {T} format instantly. No signup, no watermark, no upload limit.
            Batch convert and download as ZIP.
          </p>
        </div>

        <ConverterTool />

        <section style={{ marginTop: 56, maxWidth: 680, margin: '56px auto 0', color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            Why convert {F} to {T}?
          </h2>
          <p>
            {T === 'WEBP'
              ? `WEBP offers 25-34% smaller file sizes than ${F} at the same visual quality, making it ideal for web performance.`
              : T === 'PNG'
                ? `PNG supports transparency and lossless compression, making it better than ${F} for graphics and logos.`
                : T === 'JPG' || T === 'JPEG'
                  ? `JPG is universally supported and produces smaller files than ${F}, making it ideal for photos and sharing.`
                  : `Converting from ${F} to ${T} gives you better compatibility and flexibility for your use case.`
            }
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
