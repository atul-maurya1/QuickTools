import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DecreaseSizeTool from '@/components/DecreaseSizeTool'

export const metadata: Metadata = {
  title: 'Compress Image Online Free — Reduce Size Without Quality Loss',
  description: 'Compress JPG, PNG, WEBP images online for free. Reduce file size by up to 90% without visible quality loss. Set target size: 100KB, 500KB, 1MB. No upload limit.',
  openGraph: {
    title: 'Free Image Compressor — Compress Without Quality Loss | QuickTools',
    description: 'Compress JPG, PNG, WEBP, AVIF images online. Reduce file size up to 90%. Works in your browser — no signup required.',
  },
}

const features = [
  { icon: '🎯', title: 'Target File Size', desc: 'Set exact output size: 100KB, 500KB, 1MB' },
  { icon: '👁️', title: 'Preview Before/After', desc: 'Compare original vs compressed side by side' },
  { icon: '📦', title: 'Batch Compress', desc: 'Compress up to 20 images at once, download as ZIP' },
  { icon: '🔒', title: '100% Private', desc: 'Files processed in your browser, never uploaded' },
  { icon: '⚡', title: 'Instant Results', desc: 'WebAssembly processing — done in under 2 seconds' },
  { icon: '🌐', title: 'All Formats', desc: 'JPG, PNG, WEBP, AVIF, GIF, SVG supported' },
]

export default function CompressImagePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>🗜️ Image Compressor</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Compress Images<br /><span className="gradient-text">Without Losing Quality</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Reduce JPG, PNG, WEBP file sizes by up to 90% in seconds.
            Set a target file size or pick a compression level. Free, fast, private.
          </p>
        </div>

        {/* Tool */}
        <DecreaseSizeTool />

        {/* Features */}
        <section style={{ marginTop: 72 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f9fafb', marginBottom: 32, textAlign: 'center' }}>
            Why use QuickTools Compressor?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} className="glass" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO content */}
        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f9fafb', marginBottom: 16 }}>
            How to compress an image online
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 16 }}>
              Compressing images is essential for faster websites, smaller email attachments, and efficient storage.
              QuickTools uses advanced WebAssembly-based compression algorithms to reduce file sizes while maintaining visual quality.
            </p>
            <ol style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Upload your images</strong> — drag and drop or click to browse. Supports JPG, PNG, WEBP, AVIF, GIF, and SVG.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Choose compression level</strong> — Low (high quality), Medium (balanced), High (maximum compression), or Custom (set exact KB target).</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Download your results</strong> — preview the before/after comparison and download individually or as a ZIP.</li>
            </ol>
            <p>
              Our compression engine typically achieves 50–90% file size reduction with no perceptible quality loss for web use.
              For social media and web uploads, Medium compression is recommended.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
