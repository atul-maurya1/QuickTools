import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DecreaseSizeTool from '@/components/DecreaseSizeTool'

export const metadata: Metadata = {
  title: 'Image Size Reducer in KB — Reduce Photo Size Online Free',
  description: 'Free online image size reducer in KB. Compress and reduce JPG, PNG, or WEBP photo size to exactly 10KB, 20KB, 50KB, 100KB, or 200KB. 100% private, instant browser processing.',
  keywords: [
    'image size reducer in kb',
    'reduce image size in kb',
    'photo size reducer',
    'compress image to 20kb',
    'compress photo to 100kb',
    'decrease image kb',
    'jpg size reducer',
    'png size reducer'
  ],
}

export default function DecreaseSizePage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'QuickTools Image Size Reducer in KB',
    'url': 'https://quicktools.app/decrease-size',
    'image': 'https://quicktools.app/favicon.ico',
    'description': 'Free online image size reducer in KB. Compress JPG, PNG, or WEBP images to exactly 10KB, 20KB, 50KB, 100KB, or 200KB instantly.',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 Canvas support.',
    'offers': {
      '@type': 'Offer',
      'price': '0.00',
      'priceCurrency': 'USD'
    },
    'featureList': 'Reduce image size in KB, set custom target KB size, automatic optimized compression, 100% private browser processing'
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Reduce Image Size in KB Online',
    'description': 'Step-by-step guide to decrease image file size to a specific target KB using QuickTools.',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Upload Image',
        'text': 'Drag and drop or select your image (JPG, PNG, or WEBP) into the upload area.',
        'url': 'https://quicktools.app/decrease-size#upload'
      },
      {
        '@type': 'HowToStep',
        'name': 'Choose Target KB Size',
        'text': 'Select Manual mode, enter your desired size in KB (e.g. 50 KB), or select Automatic mode.',
        'url': 'https://quicktools.app/decrease-size#settings'
      },
      {
        '@type': 'HowToStep',
        'name': 'Download Image',
        'text': 'Click Compress and download your target-size image instantly.',
        'url': 'https://quicktools.app/decrease-size#download'
      }
    ]
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Schema scripts for search engine rank */}
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
          <div className="section-label" style={{ display: 'inline-flex' }}>📉 Image Size Reducer in KB</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Image Size Reducer in KB<br /><span className="gradient-text">Reduce Photo Size Online</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Quickly decrease image size in KB. Drag & drop, analyze original size instantly, and compress manually or automatically. Free, fast, private, and unlimited.
          </p>
        </div>

        {/* Tool */}
        <DecreaseSizeTool />

        {/* Informative block */}
        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            How to use this image size reducer in KB
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}>
              Reducing image size is important for fast page loads, email attachments, and online submission portals that enforce strict KB size limits.
            </p>
            <ol style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Upload an image</strong> — drag and drop or browse. Supports JPG, PNG, and WEBP formats.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>View analyzed size</strong> — our system immediately shows you the file size of your upload.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Enter target size</strong> — select manual mode to specify your target (e.g. 50 KB, 100 KB), or use automatic optimization.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Download</strong> — save your target-size image instantly.</li>
            </ol>
            
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginTop: 24, marginBottom: 8 }}>
              ⚡ Infinite Scalability for a Mass Audience
            </h3>
            <p>
              Unlike traditional image compressors that process files on slow, queue-locked servers, QuickTools operates <strong>100% client-side inside your browser</strong> using highly-optimized HTML5 Canvas rendering. 
              This means our tool can handle hundreds of thousands of users concurrently with zero lag, zero wait times, and absolute privacy (your photos never leave your device).
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
