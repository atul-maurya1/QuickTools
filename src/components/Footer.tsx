'use client'
import Link from 'next/link'
import { Zap, ExternalLink, MessageSquare, Heart } from 'lucide-react'

const tools = [
  { href: '/decrease-size', label: 'Compress Image' },
  { href: '/increase-size', label: 'Increase Img Size' },
  { href: '/image-converter', label: 'Image Converter' },
  { href: '/resize-image', label: 'Image Resizer' },
  { href: '/scale-image', label: 'Image Scaler' },
  { href: '/bulk-processor', label: 'Bulk Processor' },
  { href: '/pdf-compress', label: 'PDF Compressor' },
  { href: '/pdf-merge', label: 'PDF Merger' },
]

const conversions = [
  { href: '/convert/jpg-to-png', label: 'JPG to PNG' },
  { href: '/convert/png-to-jpg', label: 'PNG to JPG' },
  { href: '/convert/png-to-webp', label: 'PNG to WEBP' },
  { href: '/convert/webp-to-png', label: 'WEBP to PNG' },
  { href: '/convert/jpg-to-webp', label: 'JPG to WEBP' },
  { href: '/convert/webp-to-jpg', label: 'WEBP to JPG' },
]

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px 24px 32px',
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48, marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="white" fill="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#f9fafb' }}>
                Quick<span style={{ color: '#818cf8' }}>Tools</span>
              </span>
            </Link>
            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7, maxWidth: 240 }}>
              Free online image tools. Compress, convert, and resize images instantly — no signup needed.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <a href="#" style={{ color: '#6b7280', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                <MessageSquare size={18} />
              </a>
              <a href="#" style={{ color: '#6b7280', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                <ExternalLink size={18} />

              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: '#f9fafb', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tools
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tools.map(t => (
                <li key={t.href}>
                  <Link href={t.href} style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversions */}
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: '#f9fafb', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quick Convert
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conversions.map(c => (
                <li key={c.href}>
                  <Link href={c.href} style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: '#f9fafb', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Platform
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Images Processed', value: '10M+' },
                { label: 'Monthly Users', value: '500K+' },
                { label: 'Formats Supported', value: '10+' },
                { label: 'Processing Time', value: '< 2s' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#818cf8' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            Made with <Heart size={13} fill="#ec4899" color="#ec4899" /> by QuickTools Team · {new Date().getFullYear()}
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
