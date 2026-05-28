import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'QuickTools — Free Online Image, PDF & AI Toolkit',
    template: '%s | QuickTools'
  },
  description: 'Free online image, PDF, and AI tools — compress JPG/PNG/WEBP/PDF, convert formats, resize, merge documents, and run AI generation. No signup required.',
  keywords: ['image compressor', 'image converter', 'resize image online', 'compress pdf online', 'merge pdf free', 'ai generation tools', 'pdf compressor', 'png to jpg', 'jpg to webp', 'image optimizer'],
  authors: [{ name: 'QuickTools' }],
  creator: 'QuickTools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quicktools.app',
    siteName: 'QuickTools',
    title: 'QuickTools — Free Online Image, PDF & AI Toolkit',
    description: 'Compress, convert, resize images, compress or merge PDFs, and run AI generation online — free, fast, no signup.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickTools — Free Online Image, PDF & AI Toolkit',
    description: 'Compress, convert, resize images, compress or merge PDFs, and run AI generation online — free, fast, no signup.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div>
          {children}
        </div>
      </body>
    </html>
  )
}
