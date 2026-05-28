# QuickTools — Free Online Image, PDF & AI Toolkit

**QuickTools** is a premium, high-performance, and secure online suite of file manipulation utilities. The platform offers client-side tools to compress, convert, and resize images, merge or compress PDF documents, and is designed to accommodate future AI utility tools.

---

## ⚡ Key Highlights & Core Philosophy

### 1. 100% Client-Side Processing
Unlike traditional tool sites that upload confidential files to slow, queue-locked servers, QuickTools operates **entirely inside the user's web browser** using highly-optimized HTML5 Canvas rendering and WebAssembly compilation.
- **Absolute Privacy**: Files never leave the user's device.
- **Infinite Scalability**: Distributes workloads to the client side, allowing the site to scale to millions of concurrent users with zero server load or hosting cost bottlenecks.
- **Instantaneous Output**: No queues, no upload delays, and no processing queues.

### 2. Beautiful & Premium UI/UX
Designed with modern, rich aesthetics:
- Harmonious dark-mode palette, vibrant neon accent glow, and sleek glassmorphism panels.
- Micro-animations for feedback, progress loaders, and upload dropzones.
- **Fully Responsive**: Optimized for all viewports (Mobile, Tablet, and Desktop) using Tailwind CSS v4 grids, flex wrapping, and tablet-optimized breakpoints.

---

## 🛠️ Tool Features

### 📸 Image Tools
- **Decrease KB Size**: Reduce JPG/PNG/WEBP file sizes to exact targets (e.g. 50KB, 100KB) or use automatic compression ratios without quality loss.
- **Increase KB Size**: Pad image metadata safely to meet minimum size thresholds for online forms.
- **Format Converter**: Batch convert images between JPG, PNG, WEBP, AVIF, GIF, and SVG.
- **Image Resizer**: Adjust dimensions in pixels (px), inches (in), centimeters (cm), or millimeters (mm) with social media presets.
- **Image Scaler**: Percentage-based dimension upscaling (up to 10x) and downscaling with locked aspect ratios.
- **Bulk Processor**: Process up to 200 images concurrently with real-time queue progress bars and bulk download as a ZIP archive.

### 📄 PDF Tools
- **PDF Compressor**: Reduce PDF documents to exact target sizes using a custom client-side page-by-page sequential rendering pipeline to prevent browser RAM crashes on files up to 500MB.
- **PDF Merger**: Drag, drop, reorder, and merge multiple PDF documents into a single file instantaneously.

---

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + PostCSS v4
- **Libraries**:
  - `browser-image-compression` (Image compression engine)
  - `pdf-lib` & `pdfjs-dist` (PDF compilation and page rendering)
  - `jszip` (Bulk download zip generation)
  - `lucide-react` (Vector icons)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (version 18+) installed.

### 1. Install Dependencies
Run this command in the project root directory:
```bash
npm install
```

### 2. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Build Production Bundle
Compile and optimize the project for deployment:
```bash
npm run build
```

---

## 📐 Responsive Breakpoints & CSS Architecture

QuickTools uses a mobile-first responsive approach combining fluid styling and media queries:
- **Header**: Updated navigation breakpoint to `1024px` (`lg`) to ensure that nav links and action buttons transform into a clean mobile hamburger menu on all tablets and mobile devices.
- **Grids & Modals**: Stat panels and side-by-side image comparison modals wrap automatically on viewports smaller than `768px` (`md:grid-cols-2`).
- **File List Queue Cards**: Drag-and-drop lists collapse horizontally on mobile viewports (< `640px`) to put filename, progress metrics, and download actions on separate readable vertical blocks, preventing horizontal scroll or content overflow.
