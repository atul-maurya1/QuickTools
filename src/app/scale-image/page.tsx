import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScalerTool from '@/components/ScalerTool'

export const metadata: Metadata = {
  title: 'Scale Image Online Free — Increase & Decrease Image Size | QuickTools',
  description: 'Manually upscale or downscale image dimensions by percentage online for free. Increase size up to 10x or shrink images. Maintains aspect ratio. Supports batch processing, JPG, PNG, WEBP.',
}

export default function ScaleImagePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ display: 'inline-flex' }}>⚖️ Image Size Scaler</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Scale Image Dimensions<br /><span className="gradient-text">Up or Down</span>
          </h1>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>
            Manually increase or decrease your image dimensions by percentage. Double the size (200%), make it half-size (50%), or upscale up to 10x (1000%) with crystal clear scaling.
          </p>
        </div>

        <ScalerTool />

        <section style={{ marginTop: 64, maxWidth: 720, margin: '64px auto 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 14 }}>
            How to increase or decrease image size by percentage
          </h2>
          <div style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15 }}>
            <p style={{ marginBottom: 12 }}>
              QuickTools&apos;s Image Size Scaler offers a simple, percentage-based interface to change the height and width of your images concurrently.
              Because it works by multiplier percentage, it automatically maintains the correct aspect ratio (no distortion).
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f9fafb', marginTop: 20, marginBottom: 8 }}>
              Upscaling Images (Increasing Dimensions)
            </h3>
            <p style={{ marginBottom: 12 }}>
              To increase image size, select presets like <strong style={{ color: '#f9fafb' }}>150%</strong>, <strong style={{ color: '#f9fafb' }}>200% (2x)</strong>, or type custom numbers like <strong style={{ color: '#f9fafb' }}>400%</strong> or <strong style={{ color: '#f9fafb' }}>800%</strong> in the custom input. 
              This is perfect for blowing up smaller graphics, expanding high-density layouts, or creating high-resolution prints.
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f9fafb', marginTop: 20, marginBottom: 8 }}>
              Downscaling Images (Decreasing Dimensions & File Size)
            </h3>
            <p style={{ marginBottom: 12 }}>
              To shrink an image, choose presets like <strong style={{ color: '#f9fafb' }}>25%</strong>, <strong style={{ color: '#f9fafb' }}>50% (Half)</strong>, or <strong style={{ color: '#f9fafb' }}>75%</strong>.
              Downscaling image dimensions is a highly effective way to reduce the file size of massive camera photos before sharing them or uploading them to websites.
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f9fafb', marginTop: 20, marginBottom: 8 }}>
              Optimizing Output Format & Quality
            </h3>
            <p>
              In addition to dimension scaling, you can choose output formats like <strong style={{ color: '#f9fafb' }}>WEBP</strong> for superior modern compression, 
              <strong style={{ color: '#f9fafb' }}>PNG</strong> to retain perfect lossless transparency, or <strong style={{ color: '#f9fafb' }}>JPG</strong> for standard photograph layouts.
              Use the quality slider to dial in the perfect file size.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
