import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConverterTool from '@/components/ConverterTool'

export const metadata: Metadata = {
  title: 'Image Converter — Convert JPG PNG WEBP AVIF Online Free',
  description: 'Convert images between JPG, PNG, WEBP, AVIF, GIF formats online. Batch convert hundreds of images. Download as ZIP. Free, no signup, browser-based.',
}

const conversions = [
  { from: 'PNG', to: 'JPG', desc: 'Smaller files, wider compatibility' },
  { from: 'JPG', to: 'PNG', desc: 'Lossless with transparency support' },
  { from: 'PNG', to: 'WEBP', desc: 'Modern format, 30% smaller' },
  { from: 'WEBP', to: 'PNG', desc: 'Maximum compatibility' },
  { from: 'JPG', to: 'WEBP', desc: 'Better web performance' },
  { from: 'WEBP', to: 'JPG', desc: 'Broad device support' },
]

export default function ImageConverterPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>🔄 Format Converter</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Convert Any Image<br /><span className="gradient-text">to Any Format</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Convert between JPG, PNG, WEBP, AVIF, GIF in seconds. Batch convert hundreds of images and download as ZIP.
          </p>
        </div>

        <ConverterTool />

        {/* Conversion cards */}
        <section style={{ marginTop: 72 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f9fafb', marginBottom: 28, textAlign: 'center' }}>
            Popular conversions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {conversions.map(c => (
              <div key={c.from + c.to} className="glass" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#9ca3af' }}>{c.from}</span>
                  <span style={{ color: '#6366f1', fontSize: 18 }}>→</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#818cf8' }}>{c.to}</span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 56, maxWidth: 720, margin: '56px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>Which image format should I use?</h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}><strong style={{ color: '#f9fafb' }}>WEBP</strong> — Best for web. 25–34% smaller than JPG at same quality. Use for all modern web images.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: '#f9fafb' }}>JPG/JPEG</strong> — Best for photos. Wide compatibility, good compression. No transparency support.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: '#f9fafb' }}>PNG</strong> — Best for graphics with transparency. Lossless quality but larger files.</p>
            <p><strong style={{ color: '#f9fafb' }}>AVIF</strong> — Newest format. Up to 50% smaller than JPG. Growing browser support.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
