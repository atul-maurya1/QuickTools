import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import IncreaseSizeTool from '@/components/IncreaseSizeTool'

export const metadata: Metadata = {
  title: 'Increase Image Size in KB — Make Photo KB Larger Online Free',
  description: 'Free online image size increaser in KB. Make JPG, PNG, and WEBP file size larger to meet minimum form upload requirements like 100KB or 200KB safely.',
  keywords: [
    'increase image size in kb',
    'make photo size larger in kb',
    'increase photo size online',
    'increase image kb online',
    'pad photo size in kb',
    'make image kb larger'
  ],
}

export default function IncreaseSizePage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'QuickTools Image Size Increaser in KB',
    'url': 'https://quicktools.app/increase-size',
    'image': 'https://quicktools.app/favicon.ico',
    'description': 'Free online image size increaser in KB. Make JPG, PNG, or WEBP images larger to meet minimum upload requirements safely.',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 Canvas support.',
    'offers': {
      '@type': 'Offer',
      'price': '0.00',
      'priceCurrency': 'USD'
    },
    'featureList': 'Increase image size in KB, set custom target KB size, automatic resolution boost, safe metadata padding, 100% private browser processing'
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Increase Image Size in KB Online',
    'description': 'Step-by-step guide to enlarge image file size to a specific target KB using QuickTools.',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Upload Image',
        'text': 'Drag and drop or select your smaller image (JPG, PNG, or WEBP) into the upload area.',
        'url': 'https://quicktools.app/increase-size#upload'
      },
      {
        '@type': 'HowToStep',
        'name': 'Choose Target KB Size',
        'text': 'Select Manual mode, enter your larger target size in KB (e.g. 200 KB), or select Automatic mode.',
        'url': 'https://quicktools.app/increase-size#settings'
      },
      {
        '@type': 'HowToStep',
        'name': 'Download Image',
        'text': 'Click Increase File Size and download your larger image instantly.',
        'url': 'https://quicktools.app/increase-size#download'
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
          <div className="section-label" style={{ display: 'inline-flex' }}>📈 Increase Img Size</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Increase Image File Size<br /><span className="gradient-text">To Target KB & MB</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Make image files larger to meet minimum form upload limits. Upload your image, see the analyzed size, and input your target size. Safe, compliant, and fast.
          </p>
        </div>

        {/* Tool */}
        <IncreaseSizeTool />

        {/* Informative block */}
        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            Why increase image file size?
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}>
              Many online registration portals, government websites, and job application forms require files to meet a <strong style={{ color: '#f9fafb' }}>minimum file size requirement</strong> (e.g. at least 100 KB or 200 KB) and will reject smaller files.
            </p>
            <p style={{ marginBottom: 12 }}>
              QuickTools solves this by letting you increase the file size of your image in two ways:
            </p>
            <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Automatic Enhancement</strong> — renders the image at a slightly higher resolution and maximizes quality headers, naturally inflating the size.</li>
              <li style={{ marginBottom: 8 }}><strong style={{ color: '#f9fafb' }}>Manual Exact Size</strong> — pads the metadata container with safe, compliant padding bytes so it matches your target KB size exactly, without changing or degrading the image itself.</li>
            </ul>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginTop: 24, marginBottom: 8 }}>
              ⚡ Infinite Scalability for a Mass Audience
            </h3>
            <p>
              Operating **100% locally in the user browser**, QuickTools distributes the workload to the client. This means that even if a mass audience of thousands of users is compressing and enlarging images concurrently, the tool operates at maximum performance without queues, processing delays, or server resource bottlenecks.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
