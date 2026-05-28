import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PdfMergeTool from '@/components/PdfMergeTool'

export const metadata: Metadata = {
  title: 'Merge PDF Online — Combine Multiple PDFs Free',
  description: 'Free online browser-based PDF merger. Drag and drop multiple PDF files, reorder them as desired, and merge them into a single high-quality document instantly.',
  keywords: [
    'merge pdf online',
    'combine pdf files',
    'combine multiple pdfs free',
    'pdf joiner online',
    'merge pdf files in order',
    'free online pdf merger',
    'browser pdf merge 500mb'
  ],
}

export default function PdfMergePage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'QuickTools Free PDF Merger',
    'url': 'https://quicktools.app/pdf-merge',
    'image': 'https://quicktools.app/favicon.ico',
    'description': 'Free online browser-based PDF merger. Combine multiple PDF documents into one single file, easily adjust page and file order, and merge up to 500MB.',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires modern browser with FileReader support.',
    'offers': {
      '@type': 'Offer',
      'price': '0.00',
      'priceCurrency': 'USD'
    },
    'featureList': 'Combine multiple PDFs, interactive drag and drop file reordering, fast binary merging, 100% private browser processing'
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Merge Multiple PDF Files Online',
    'description': 'Step-by-step guide to combine multiple PDF documents into a single file online using QuickTools.',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Upload PDF Files',
        'text': 'Drag and drop two or more PDF files into the upload area.',
        'url': 'https://quicktools.app/pdf-merge#upload'
      },
      {
        '@type': 'HowToStep',
        'name': 'Arrange PDF File Order',
        'text': 'Use the Up/Down buttons or layout controls to position the files in your preferred sequence.',
        'url': 'https://quicktools.app/pdf-merge#reorder'
      },
      {
        '@type': 'HowToStep',
        'name': 'Merge and Download',
        'text': 'Click the Merge PDFs button. The merged PDF will compile instantly for you to download.',
        'url': 'https://quicktools.app/pdf-merge#download'
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
          <div className="section-label" style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.25)' }}>🗂️ PDF Merger</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Merge PDF Online<br /><span className="gradient-text" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Combine Multiple PDF Files</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Merge two or more PDFs into a single file. Easily reorder files before joining them. Fast binary processing that handles massive file sizes up to 500MB.
          </p>
        </div>

        {/* Tool */}
        <PdfMergeTool />

        {/* Informative block */}
        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            How to merge PDF files with QuickTools
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}>
              Combining files into a single PDF simplifies file management, enhances readability for clients, and makes submitting multiple forms/certificates easier.
            </p>
            <ol style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Upload files</strong> — drag and drop all PDFs you want to merge (supports multiple uploads at once).</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Reorder list</strong> — Use the visual buttons to move files up or down to set the exact sequence you want.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Compile document</strong> — Click merge. The tool will process file streams and combine them in seconds.</li>
            </ol>
            
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginTop: 24, marginBottom: 8 }}>
              ⚡ Why QuickTools PDF Merger is superior
            </h3>
            <p style={{ marginBottom: 12 }}>
              Most PDF merging tools parse, extract, and rebuild the entire PDF pages structure, or worse, rasterize pages to images and compile them. This causes huge size increases, loss of text-selection capabilities, and high memory usage that crashes the browser on large documents.
            </p>
            <p>
              QuickTools operates at a **binary byte level** using `pdf-lib`. It reads the structural dictionary references of pages directly and binds them sequentially into a single container without modifying or decoding the page streams. This operates almost instantaneously, retains all vector qualities and selectable text, and easily merges 500MB documents in seconds without lag.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
