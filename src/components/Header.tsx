'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Zap, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/decrease-size', label: 'Compress' },
  { href: '/increase-size', label: 'Increase Img' },
  { href: '/image-converter', label: 'Convert' },
  { href: '/resize-image', label: 'Resize' },
  { href: '/scale-image', label: 'Scale' },
  { href: '/bulk-processor', label: 'Bulk' },
  { href: '/pdf-compress', label: 'PDF Compress' },
  { href: '/pdf-merge', label: 'PDF Merge' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,18,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <nav style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#f9fafb', letterSpacing: '-0.02em' }}>
            Quick<span style={{ color: '#818cf8' }}>Tools</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: '#9ca3af',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f9fafb'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = '#9ca3af'; (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/decrease-size" className="btn-primary" style={{ padding: '8px 20px', fontSize: 14, textDecoration: 'none' }}>
            Get Started Free
          </Link>
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'none' }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 16px', borderRadius: 10,
                fontSize: 15, fontWeight: 500,
                color: '#9ca3af', textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
