# BUG-001: Production build had no working home page

## Simple explanation

The app did not have the `index.html` file that Vite expects as its main entry point. Because of that, the production build failed and opening `/` returned a 404 page.

## What users saw

The app could be opened only through the old `pdfmerger.html` path. A normal production deployment opened the wrong page or failed to build.

## What we did to fix it

- Renamed `pdfmerger.html` to `index.html`.
- Updated Vite's automatic browser-open path to `/`.
- Updated the HTML references to use the production asset paths.

## Verification

The production build completed successfully. The preview server returned HTTP 200 for `/`, and the browser opened the PDF merger without a page error.

## How to avoid this mistake

Before deploying a Vite app, run the production build and confirm that `dist/index.html` exists. Also test the root URL `/`, not only a feature-specific HTML path.

## Fix history

- Fixed on branch: `prathick`
- Fix commit: `cc21807`
