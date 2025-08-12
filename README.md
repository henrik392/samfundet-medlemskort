# Samfundet Medlemskort

Create, crop, and print membership card photos with exact dimensions. Upload a photo, crop to the required ratio, and export a ready‑to‑print A4 sheet or a PDF.

## Features

- Exact sizing: 25mm × 30mm (2.5cm × 3cm) per photo, laid out on A4 (8 per row)
- Drag & drop upload with enforced 2.5:3 crop ratio (high‑quality canvas output)
- Live print preview with precise mm sizing and cutting guidelines
- One‑click PDF export (via jsPDF)
- Accessible, responsive UI with light/dark theme

## Tech Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS 4 + shadcn/ui, lucide-react
- react-dropzone, react-image-crop, jsPDF
- Biome (extends Ultracite) for formatting and linting
- Bun workspaces

## Getting Started (Bun)

Prerequisites: Bun 1.2.x

```bash
bun install
bun dev
```

Then open http://localhost:3000

Common scripts:

```bash
# develop only the web app
bun run --filter web dev

# build and start for production
bun run --filter web build
bun run --filter web start

# format + lint and type-check
bun check
bun check-types
```

## Project Structure

```
apps/web/
  src/app/layout.tsx           # App shell (fonts, providers, header)
  src/app/page.tsx             # Main flow: upload → crop → print
  src/components/photo-cropper.tsx   # Upload & crop (2.5:3)
  src/components/print-preview.tsx   # A4 preview, print, PDF
  src/components/header.tsx          # Logo + GitHub button
  src/components/github-button.tsx   # Links to repo, shows star count
  public/images/logo_samf.png        # Branding
```

## Printing details

- Each photo is exactly 25mm × 30mm on the output
- Grid uses 8 photos per row with 2mm spacing and ~10mm margins
- PDF uses mm units; print preview uses CSS in mm with an 8‑column grid

## Repository

GitHub: https://github.com/henrik392/samfundet-medlemskort
