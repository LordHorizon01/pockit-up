# BUG-002: Production build did not contain the app assets

## Simple explanation

After fixing the entry page, the build still did not copy the plain JavaScript, CSS, SDK, and image files into `dist`. The page could load as HTML, but its app files were missing in a real production build.

## What users saw

The deployed page could appear blank or fail to start because files such as `pdfmerger.js`, `pdfmerger.css`, and the local SDK were not available from the built output.

## What we did to fix it

- Created the Vite `public/` asset area.
- Moved the runtime JavaScript, CSS, `_sdk`, and `assets` folders into `public/`.
- Changed the HTML references to root-relative paths such as `/pdfmerger.js` and `/pdfmerger.css`.

## Verification

The build output now contains `dist/pdfmerger.js`, `dist/pdfmerger.css`, `dist/_sdk/data_sdk.js`, and `dist/assets/logo-light.png`. The preview server returned HTTP 200 for each file, and the browser completed PDF merge and ZIP creation successfully.

## How to avoid this mistake

After every production build, inspect `dist` for every file the page references. A successful build command alone does not prove that static runtime files were copied.

## Fix history

- Fixed on branch: `prathick`
- Fix commit: `cc21807`
