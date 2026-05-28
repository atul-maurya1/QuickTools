import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PdfCompressTool from '@/components/PdfCompressTool'

export const metadata: Metadata = {
  title: 'Compress PDF Online — Reduce PDF File Size in KB Free',
  description: 'Free online browser-based PDF compressor. Reduce PDF file size in KB automatically or enter target size. Highly optimized to compress large PDFs up to 500MB privately.',
  keywords: [
    'compress pdf online',
    'reduce pdf size in kb',
    'pdf compressor 100kb',
    'compress pdf to 200kb',
    'compress pdf to 500kb',
    'free pdf size reducer',
    'compress large pdf client side',
    'compress pdf in browser'
  ],
}

export default function PdfCompressPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'QuickTools Free PDF Compressor',
    'url': 'https://quicktools.app/pdf-compress',
    'image': 'https://quicktools.app/favicon.ico',
    'description': 'Free online browser-based PDF compressor. Reduce PDF size in KB automatically or enter custom target sizes. Supports large files up to 500MB.',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 Canvas support.',
    'offers': {
      '@type': 'Offer',
      'price': '0.00',
      'priceCurrency': 'USD'
    },
    'featureList': 'Reduce PDF size in KB, set custom target size, automatic optimized presets, 100% private browser processing, handles files up to 500MB'
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Compress PDF to Target Size in KB Online',
    'description': 'Step-by-step guide to reduce PDF file size online to a specific target KB using QuickTools.',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Upload PDF File',
        'text': 'Drag and drop or browse to select your PDF document (supports files up to 500MB).',
        'url': 'https://quicktools.app/pdf-compress#upload'
      },
      {
        '@type': 'HowToStep',
        'name': 'Select Compression Settings',
        'text': 'Choose Automatic mode for balanced compression, or select Manual mode and enter your exact target size in KB (e.g. 500 KB).',
        'url': 'https://quicktools.app/pdf-compress#settings'
      },
      {
        '@type': 'HowToStep',
        'name': 'Download Compressed PDF',
        'text': 'Click Compress PDF and download your optimized PDF document.',
        'url': 'https://quicktools.app/pdf-compress#download'
      }
    ]
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        
        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex', background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>📄 PDF Size Compressor</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Compress PDF Online<br /><span className="gradient-text" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #fca5a5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reduce PDF Size in KB</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Quickly shrink PDF document file size. Enter custom target KB or use automatic optimization. Fully client-side to handle massive files up to 500MB safely and privately.
          </p>
        </div>

        {/* Tool */}
        <PdfCompressTool />

        {/* Informative block */}
        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            How to use this browser-based PDF compressor
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}>
              Compressing PDF documents is essential for emailing attachments, uploading credentials or resumes to government portals, and publishing fast-loading eBooks.
            </p>
            <ol style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Upload a PDF</strong> — Drag and drop your file or browse. Perfect for files up to 500MB.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Choose Mode</strong> — Select <em>Automatic</em> to use recommended presets or <em>Target Size (Manual)</em> to enter your desired file size in KB.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Compress & Download</strong> — Our engine rendering processes pages sequentially, compiles them, and generates your download link immediately.</li>
            </ol>
            
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginTop: 24, marginBottom: 8 }}>
              🛡️ Private, Secure & Crash-Proof
            </h3>
            <p style={{ marginBottom: 12 }}>
              Many online PDF compressors upload your highly confidential files to external servers, creating privacy risks. With QuickTools, <strong>your documents never leave your computer</strong>. The entire parsing, rendering, and compression process is executed locally inside your web browser.
            </p>
            <p>
              Furthermore, standard client-side compilers crash when handling files over 50MB due to browser memory overflows. QuickTools resolves this using a proprietary **sequential stream pipeline**: pages are loaded, compressed to canvas, converted to optimized bytes, and appended to the target stream one-by-one. This prevents RAM build-up, ensuring absolute stability even for 500MB documents.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
