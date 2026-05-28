import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BulkProcessorClient from '@/components/BulkProcessorClient'

export const metadata: Metadata = {
  title: 'Bulk Image Processor — Process 100+ Images at Once Free',
  description: 'Compress, convert, or resize hundreds of images simultaneously. Real-time progress tracking, ZIP download, free and browser-based. No signup required.',
}

export default function BulkProcessorPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>⚡ Bulk Processor</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Process Hundreds of<br /><span className="gradient-text">Images at Once</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Upload up to 200 images and compress, convert, or resize them all simultaneously.
            Download results as a single ZIP file.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', marginBottom: 48 }}>
          {[
            { v: '200+', l: 'Images per batch' },
            { v: '3×', l: 'Parallel processing' },
            { v: '< 5s', l: 'Per image avg.' },
            { v: 'ZIP', l: 'Instant download' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#818cf8' }}>{s.v}</p>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{s.l}</p>
            </div>
          ))}
        </div>

        <BulkProcessorClient />

        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            About Bulk Image Processing
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}>
              The Bulk Processor runs 3 images simultaneously using your browser&apos;s processing power.
              For best performance, use Chrome or Edge with hardware acceleration enabled.
            </p>
            <p>
              All processing happens in your browser — your images are never uploaded to any server.
              Results are bundled into a ZIP file you can download with one click.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
