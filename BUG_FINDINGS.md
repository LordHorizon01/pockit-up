# PockitUp Bug Findings

Audit date: 2026-09-04; baseline findings recorded before the `prathick` fixes
Scope: local clone at this repository; static source review plus local Vite/browser validation
Status: no live deployment, account system, backend, or cross-user data boundary was present to test

## P1-001 — Production build and root URL are unavailable

- Priority: **P1 product/release blocker**
- Status: **Verified**
- Locations: [`vite.config.js:3-7`](./vite.config.js), [`package.json:5`](./package.json)
- Reproduction:
  1. Run `node node_modules/vite/bin/vite.js build`.
  2. Observe `Could not resolve entry module "index.html"`.
  3. Run the dev server and request `/`; it returns HTTP 404, while `/pdfmerger.html` returns HTTP 200.
- Expected: the declared Vite build should produce a deployable site and the site root should render the application.
- Observed: the production build exits non-zero because the repository has `pdfmerger.html` but no `index.html`; the root URL is also 404. The Vite `server.open` setting only changes the dev browser path and does not define the production entry.
- Impact: a normal deployment pipeline cannot build this app, and users visiting the canonical root receive no application.
- Remediation direction: make the intended document the Vite entry (for example, provide an `index.html` entry or configure a deliberate multi-page build) and verify both `vite build` and the deployed root route.
- Resolution: **Fixed on `prathick`** by making the application `index.html`, serving runtime files from `public/`, and verifying the production preview root route.

## P2-001 — Crafted local filenames execute HTML/JavaScript in the app origin

- Priority: **P2 security**; not P1 because the current app is client-only and the trigger is a user-selected local file, with no demonstrated account or server-data impact.
- Status: **Verified locally**
- Locations: [`public/pdfmerger.js:702-716`](./public/pdfmerger.js), [`public/pdfmerger.js:9075-9158`](./public/pdfmerger.js)
- Source: `File.name`, controllable by a crafted file selected or dragged into the app.
- Sink/control: the filename is interpolated directly into `innerHTML` in the PDF merger and ZIP archiver queue without HTML encoding.
- Reproduction: in a local browser, create a synthetic file named `</span><img id="xss-proof" src="x" onerror="window.__xssProof='executed'">`, pass it through the merger/ZIP queue, and dispatch the image error event. The proof variable becomes `executed` and the injected image is present in the rendered DOM.
- Impact: arbitrary script can run in the app origin when a victim handles an attacker-crafted file. In this repository that is currently self/file-triggered browser code execution; impact would increase if authentication or sensitive origin storage is later added.
- Remediation direction: render filenames with `textContent`/DOM nodes or context-appropriate escaping, and avoid inline event-handler HTML for dynamic values.
- Resolution: **Fixed on `prathick`** with centralized `escapeHtml()` coverage for dynamic filenames, paths, extracted values, preview labels, and parser errors.

## P2-002 — Empty Instagram iframe fires an uncaught startup handler error

- Priority: **P2 product correctness**
- Status: **Verified locally**
- Locations: [`index.html:1963-1972`](./index.html), [`public/pdfmerger.js:127-132`](./public/pdfmerger.js)
- Reproduction: load `/pdfmerger.html` in a clean local browser and capture page errors.
- Expected: initial page load has no uncaught JavaScript exception.
- Observed: `ReferenceError: instaEmbedLoaded is not defined` is emitted from the iframe’s `onload="instaEmbedLoaded()"`; the empty iframe loads before the bottom-of-document `pdfmerger.js` script has defined the handler.
- Impact: noisy uncaught exception on every initial load and unreliable iframe loading-state behavior. No P1 security impact was demonstrated.
- Remediation direction: bind the load listener after the script is available, or avoid loading an empty iframe until a validated Instagram URL is submitted.
- Resolution: **Fixed on `prathick`** by removing the inline handler and registering the listener after the main script loads.

## P1 security conclusion

**No verified P1/P0 security finding was identified in the current repository.** The verified security issue is the file-triggered DOM-XSS candidate above, but this static client-only app has no backend authorization boundary, account session, or sensitive server-side data path in scope; elevating it to P1 would be unsupported.

## Pre-fix verification record

- `node --check pdfmerger.js`: passed.
- Local Vite dev server: started on `http://127.0.0.1:5173`.
- `/pdfmerger.html`: HTTP 200 before the canonical-entry rename.
- `/`: HTTP 404.
- Production Vite build: failed at entry resolution (`index.html` missing).
- Controlled browser proof: both merger and ZIP filename injection paths executed the harmless `xss-proof` callback.
- `npm ci`: blocked by the machine’s broken npm shim (`C:\Users\nithy\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js` missing). Dependencies were installed with the bundled pnpm runtime for the build check.
- No live deployment, authenticated flows, or third-party target probing was performed.

## Post-fix verification on `prathick`

- `node --check public/pdfmerger.js`: passed.
- Vite production build: passed; `dist/index.html`, `dist/pdfmerger.js`, `dist/pdfmerger.css`, `dist/_sdk/data_sdk.js`, and `dist/assets/logo-light.png` were present.
- Production preview `/`: HTTP 200 with the application rendered.
- Clean-browser page errors: none.
- Controlled crafted filename test: merger and ZIP queue produced no injected element and preserved literal text.
- PDF merge happy path: completed successfully.
- ZIP creation happy path: completed successfully.
