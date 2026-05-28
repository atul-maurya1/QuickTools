import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ResizerTool from '@/components/ResizerTool'

export const metadata: Metadata = {
  title: 'Resize Image Online Free — Change Dimensions, Pixels, Inches',
  description: 'Resize images to exact dimensions in pixels, inches, or centimeters. Presets for Instagram, YouTube, LinkedIn, Passport photos. Maintain aspect ratio. Free.',
}

export default function ResizeImagePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>📐 Image Resizer</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Resize Images to<br /><span className="gradient-text">Any Dimension</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Resize in pixels, inches, centimeters, or millimeters. Use platform presets for Instagram, YouTube, LinkedIn, and more. Lock aspect ratio to prevent distortion.
          </p>
        </div>

        <ResizerTool />

        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            How to resize an image without distortion
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}>
              Enable the aspect ratio lock (🔒) to automatically calculate the matching dimension when you change width or height.
              This prevents squishing or stretching.
            </p>
            <p style={{ marginBottom: 12 }}>
              For social media images, use our presets — they reflect the official recommended dimensions for each platform
              (e.g., Instagram Posts: 1080×1080, YouTube Thumbnails: 1280×720).
            </p>
            <p>
              Use <strong style={{ color: '#f9fafb' }}>WEBP</strong> output format for the smallest file size,
              or <strong style={{ color: '#f9fafb' }}>PNG</strong> if you need transparency.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
