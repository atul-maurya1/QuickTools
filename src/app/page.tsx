import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'QuickTools — Free Online Image, PDF & AI Toolkit',
  description: 'Free online tools for images, PDFs, and AI assets. Compress, convert, resize, merge documents, and process files instantly. No signup required.',
}

const tools = [
  {
    href: '/decrease-size',
    icon: '📉',
    title: 'Decrease KB Size',
    desc: 'Reduce image file size in KB or MB without quality loss. Set exact target sizes for email, portals, or web uploads.',
    badge: 'Most Popular',
    badgeColor: '#6366f1',
    features: ['JPG · PNG · WEBP', 'Automatic optimization', 'Target size in KB/MB/KG'],
    color: 'from-indigo-500 to-purple-600',
  },
  {
    href: '/increase-size',
    icon: '📈',
    title: 'Increase KB Size',
    desc: 'Safely increase your image file size to meet minimum form upload limits. Enter target KB size to pad files instantly.',
    badge: 'New Tool',
    badgeColor: '#10b981',
    features: ['Safe metadata padding', 'Automatic resolution boost', 'Exact target size matched'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/image-converter',
    icon: '🔄',
    title: 'Format Converter',
    desc: 'Convert between JPG, PNG, WEBP, AVIF, GIF and more. Batch convert hundreds of images to any format instantly.',
    badge: '20+ Formats',
    badgeColor: '#8b5cf6',
    features: ['PNG ↔ JPG ↔ WEBP', 'Batch conversion', 'Download as ZIP'],
    color: 'from-purple-500 to-pink-600',
  },
  {
    href: '/resize-image',
    icon: '📐',
    title: 'Image Resizer',
    desc: 'Resize to exact dimensions in pixels, inches, or centimeters. Use presets for Instagram, YouTube, Passport photos and more.',
    badge: '12 Presets',
    badgeColor: '#ec4899',
    features: ['Lock aspect ratio', 'Social media presets', 'px · in · cm · mm'],
    color: 'from-pink-500 to-red-500',
  },
  {
    href: '/scale-image',
    icon: '⚖️',
    title: 'Image Scaler',
    desc: 'Upscale or downscale image dimensions by percentage. Manually increase dimensions up to 10x or shrink image size.',
    badge: 'Scale By %',
    badgeColor: '#818cf8',
    features: ['Scale up to 1000%', 'Shrink down to 1%', 'Aspect ratio lock'],
    color: 'from-violet-500 to-indigo-600',
  },
  {
    href: '/bulk-processor',
    icon: '⚡',
    title: 'Bulk Processor',
    desc: 'Process 100+ images at once with full progress tracking. Compress, convert, or resize entire photo libraries in minutes.',
    badge: '1000+ Images',
    badgeColor: '#10b981',
    features: ['100+ images at once', 'Progress tracking', 'ZIP download'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/pdf-compress',
    icon: '📄',
    title: 'PDF Compressor',
    desc: 'Reduce PDF file size in KB automatically or to a specific size. Page-by-page rendering handles massive files up to 500MB.',
    badge: 'PDF Tool',
    badgeColor: '#ef4444',
    features: ['Auto & manual modes', 'Supports up to 500MB', '100% private browser-run'],
    color: 'from-red-500 to-orange-600',
  },
  {
    href: '/pdf-merge',
    icon: '🗂️',
    title: 'PDF Merger',
    desc: 'Combine multiple PDF files into one single document. Instantly drag-and-drop or reorder files before compiling.',
    badge: 'Fast Merge',
    badgeColor: '#6366f1',
    features: ['Reorder documents', 'Retains text & vectors', 'Super-fast client merge'],
    color: 'from-indigo-500 to-blue-600',
  },
]

const conversions = [
  ['JPG', 'PNG'], ['PNG', 'JPG'], ['PNG', 'WEBP'],
  ['WEBP', 'PNG'], ['JPG', 'WEBP'], ['WEBP', 'JPG'],
  ['AVIF', 'JPG'], ['JPG', 'AVIF'], ['SVG', 'PNG'],
]

const howItWorks = [
  { step: '01', title: 'Upload Your Images', desc: 'Drag & drop or click to browse. Supports JPG, PNG, WEBP, AVIF, GIF, SVG. Up to 50MB per file.', icon: '⬆️' },
  { step: '02', title: 'Choose Settings', desc: 'Select compression level, target format, or resize dimensions. Use presets for quick setup.', icon: '⚙️' },
  { step: '03', title: 'Download Results', desc: 'Get your optimized images instantly. Download individually or as a ZIP archive.', icon: '⬇️' },
]

const stats = [
  { value: '10M+', label: 'Images Processed' },
  { value: '500K+', label: 'Monthly Users' },
  { value: '< 2s', label: 'Avg. Processing' },
  { value: '100%', label: 'Free Forever' },
]

const faqs = [
  {
    q: 'Is QuickTools completely free?',
    a: 'Yes! All core tools are 100% free with no signup required. Process unlimited images directly in your browser.',
  },
  {
    q: 'Are my images uploaded to a server?',
    a: 'For most images under 5MB, everything happens directly in your browser — your images never leave your device. Larger files use our secure servers with automatic deletion after 1 hour.',
  },
  {
    q: 'What image formats are supported?',
    a: 'We support JPG, JPEG, PNG, WEBP, AVIF, GIF, and SVG. Convert between any of these formats in seconds.',
  },
  {
    q: 'How much can I compress an image?',
    a: 'Typically 50–90% reduction depending on the original image and quality settings. Our "High" mode achieves maximum compression while our "Low" mode preserves near-original quality.',
  },
  {
    q: 'Can I process multiple images at once?',
    a: 'Yes! All tools support batch processing. The Bulk Processor tool can handle 100+ images simultaneously with real-time progress tracking.',
  },
]

const formats = ['JPG', 'PNG', 'WEBP', 'AVIF', 'GIF', 'SVG', 'HEIC', 'BMP', 'TIFF']

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <main>
        {/* ── HERO ──────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>

          {/* Badge */}
          <div className="animate-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, fontSize: 13, color: '#818cf8', fontWeight: 600, marginBottom: 28, letterSpacing: '0.02em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-border 2s ease infinite' }} />
            Free · No Signup · 100% Browser-Based
          </div>

          {/* Headline */}
          <h1 className="animate-in-delay-1" style={{ fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
            The only image, PDF &amp; AI toolkit<br />
            <span className="gradient-text">you&apos;ll ever need</span>
          </h1>

          <p className="animate-in-delay-2" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#9ca3af', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Compress, convert &amp; resize images, process PDFs, and run AI tools instantly — free, fast, and private.
            No signup. Works right in your browser.
          </p>

          {/* CTAs */}
          <div className="animate-in-delay-3" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/decrease-size" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16, textDecoration: 'none' }}>
              📉 Decrease KB Size
            </Link>
            <Link href="/increase-size" className="btn-secondary" style={{ padding: '14px 32px', fontSize: 16, textDecoration: 'none' }}>
              📈 Increase KB Size
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-in-delay-4" style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em' }}>{s.value}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TOOL GRID ─────────────────────────────────────── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ display: 'inline-flex' }}>🛠️ Tools</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em' }}>
              Everything you need, nothing you don&apos;t
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {tools.map(tool => (
              <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                <div className="tool-card" style={{ height: '100%' }}>
                  {/* Icon */}
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{tool.icon}</div>

                  {/* Badge + Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb' }}>{tool.title}</h3>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6,
                      fontSize: 11, fontWeight: 700,
                      background: tool.badgeColor + '20',
                      color: tool.badgeColor,
                      border: `1px solid ${tool.badgeColor}30`,
                    }}>{tool.badge}</span>
                  </div>

                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.65, marginBottom: 20 }}>{tool.desc}</p>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tool.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280' }}>
                        <span style={{ color: '#10b981', fontSize: 12 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, color: '#818cf8', fontSize: 14, fontWeight: 600 }}>
                    Try Free <span style={{ fontSize: 18 }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <section style={{ padding: '64px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="section-label" style={{ display: 'inline-flex' }}>📋 How It Works</div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: '#f9fafb' }}>
                3 simple steps to perfect images
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, position: 'relative' }}>
              {howItWorks.map((step, i) => (
                <div key={step.step} style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    width: 72, height: 72,
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                    border: '2px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                    position: 'relative',
                  }}>
                    {step.icon}
                    <span style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: 'white',
                    }}>{i + 1}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK CONVERSIONS ──────────────────────────────── */}
        <section style={{ padding: '64px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-label" style={{ display: 'inline-flex' }}>⚡ Quick Convert</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#f9fafb' }}>
              Popular format conversions
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {conversions.map(([from, to]) => (
              <Link key={from + to}
                href={`/convert/${from.toLowerCase()}-to-${to.toLowerCase()}`}
                className="conversion-chip"
                style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontWeight: 700, color: '#9ca3af', fontSize: 14 }}>{from}</span>
                  <span style={{ color: '#6366f1', fontSize: 16 }}>→</span>
                  <span style={{ fontWeight: 700, color: '#818cf8', fontSize: 14 }}>{to}</span>
                </div>
              </Link>
            ))}

          </div>
        </section>

        {/* ── FORMATS ───────────────────────────────────────── */}
        <section style={{ padding: '48px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Supported Formats
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {formats.map(f => (
                <span key={f} style={{
                  padding: '8px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 14, fontWeight: 700,
                  color: '#9ca3af',
                  letterSpacing: '0.04em',
                }}>{f}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section style={{ padding: '64px 24px 80px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ display: 'inline-flex' }}>❓ FAQ</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#f9fafb' }}>
              Frequently asked questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                overflow: 'hidden',
              }}>
                <summary style={{
                  padding: '18px 24px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#f9fafb',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  userSelect: 'none',
                }}>
                  {faq.q}
                  <span style={{ color: '#818cf8', fontSize: 20, fontWeight: 300 }}>+</span>
                </summary>
                <div style={{ padding: '0 24px 18px', color: '#9ca3af', fontSize: 14, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────────────── */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{
            maxWidth: 900, margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1), rgba(236,72,153,0.08))',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 24,
            padding: '64px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent)', pointerEvents: 'none' }} />

            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#f9fafb', letterSpacing: '-0.02em', marginBottom: 16, position: 'relative' }}>
              Start optimizing your images<br />
              <span className="gradient-text">for free — right now</span>
            </h2>
            <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.6 }}>
              Join 500,000+ users who trust QuickTools to compress, convert, and resize their images every day.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/decrease-size" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16, textDecoration: 'none' }}>
                🚀 Get Started Free
              </Link>
              <Link href="/bulk-processor" className="btn-secondary" style={{ padding: '14px 32px', fontSize: 16, textDecoration: 'none' }}>
                ⚡ Bulk Process
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
