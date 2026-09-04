# PockitUp Bug-Fix Plan

Date: 2026-09-04
Source of truth: [`BUG_FINDINGS.md`](./BUG_FINDINGS.md)
Scope: fix the verified local findings, preserve the existing tool layout/behavior, and add regression coverage.

## Current priority order

| Order | Finding | Priority | Plan status |
| --- | --- | --- | --- |
| 1 | Production build fails and `/` returns 404 | P1 release blocker | Complete |
| 2 | User-controlled filenames reach HTML sinks | P2 security | Complete |
| 3 | Empty Instagram iframe throws on startup | P2 correctness | Complete |

No P1/P0 security issue was verified. This plan does not expand into live-target testing, authentication work, or a product redesign.

## Phase 1 — Restore the production entrypoint

Files: `index.html`, `vite.config.js`, `package.json`, `public/`

1. Make the existing application document the canonical Vite entry by renaming `pdfmerger.html` to `index.html` rather than maintaining two HTML copies.
2. Change the Vite dev open path to `/` (or `/index.html`) and confirm all existing root-relative asset paths still resolve.
3. Keep a deliberate compatibility decision for `/pdfmerger.html`: either preserve it as a generated alias or document that the canonical URL is now `/`. Do not leave both hand-maintained copies.
4. Run the release gate:

   - `node node_modules/vite/bin/vite.js build`
   - verify `dist/index.html` exists
   - serve the build and verify `/` returns HTTP 200
   - verify `/assets/logo-light.png`, `/_sdk/data_sdk.js`, and the main JS/CSS assets return HTTP 200

Acceptance: build exits 0, the root page renders the application, and direct loading of the canonical URL has no entrypoint 404.

## Phase 2 — Remove filename/content HTML injection

Files: `public/pdfmerger.js` locations currently reported at lines 702-716 and 9075-9158; related renderers around 981-991, 5812-5930, 9676-9733, and 9983-10038.

1. Add one small escaping/helper boundary for dynamic text and HTML attributes, or create the affected nodes with `textContent`; do not scatter ad-hoc replacements.
2. Remove raw interpolation of these untrusted values from markup:

   - PDF merger filename and compressor filename
   - ZIP queue filename and virtual path
   - ZIP extracted-entry filename/path/title/preview labels
   - PDF-to-Excel extracted cell text and title attributes
   - parser error messages placed into HTML

3. Keep generated trusted values such as page numbers, fixed icon names, and internal numeric indexes constrained by their existing allowlists.
4. Review the Word preview fallback separately. If Mammoth HTML is retained, sanitize it with a maintained allowlist sanitizer before insertion and block `javascript:`/data URLs where they are not required.
5. Preserve filename display, sorting, archive paths, downloads, and preview behavior.

Acceptance: the harmless crafted filename proof used in the audit renders as literal text, creates no injected element, and executes no handler in merger, compressor, ZIP queue, or extracted-entry views. Normal filenames containing quotes, ampersands, angle brackets, and Unicode still display correctly.

## Phase 3 — Fix the Instagram startup lifecycle

Files: `pdfmerger.html:1963-1972`, `pdfmerger.js:127-132`.

1. Remove the inline `onload` handler from the empty iframe.
2. Register `load` with `addEventListener` after `pdfmerger.js` is loaded, or register it during the existing startup setup.
3. Do not assign an iframe source until `instaFetch()` has accepted a valid Instagram URL.
4. Keep the loading indicator and reset behavior intact when a real embed is requested.

Acceptance: a clean page load produces no `ReferenceError`; submitting a valid URL still transitions from loading state to the iframe, and reset clears the iframe without an exception.

## Phase 4 — Add regression coverage and run the full release check

Files: add a small test/smoke-check location only if the project’s chosen test runner is kept lightweight; otherwise document the browser checks in the repository.

Required checks after implementation:

- JavaScript parse: `node --check pdfmerger.js`
- Production build and root-route HTTP 200
- Clean-browser console: zero uncaught page errors on initial load
- Merger/compressor/ZIP crafted-filename safety test
- PDF merge and ZIP creation happy paths with ordinary test files
- Invalid-file and reset flows
- Mobile-width smoke check for the main navigation and upload controls
- `git diff --check`
- Dependency audit once the broken system npm installation is repaired; record the exact tool and result

Acceptance: every verified finding is closed by a reproducible test, no unrelated layout/interaction regression is introduced, and blocked checks remain explicitly labeled rather than treated as passes.

## Deferred hardening backlog

These are not blockers for the three verified findings but should be handled before handling sensitive files in a production deployment:

- Pin or self-host third-party scripts and add integrity/Content Security Policy where compatible.
- Add explicit file size/page-count/resource limits to reduce browser exhaustion from unusually large or malformed files.
- Reassess the security model if accounts, cloud storage, analytics, or server-side conversion are added; the current P2 filename XSS severity would then need recalibration.

## Completion record

Implemented on branch `prathick`:

- `pdfmerger.html` is now the canonical `index.html` entry.
- Static runtime files are served from `public/` so Vite includes them in production output.
- Dynamic filename/path/value renderers use centralized HTML escaping.
- Instagram iframe loading is bound after script initialization.
- Production preview, browser error, XSS-safety, PDF merge, ZIP creation, syntax, and diff checks passed.

Remaining environment limitation: the system `npm` shim is broken, so the dependency audit remains pending until npm is repaired. The bundled pnpm runtime was used only to install the locked dependencies needed for local verification.

## Execution rule

Implement in the phase order above, verify each phase before moving on, preserve the existing worktree changes, and do not claim P1 security closure without a demonstrated attacker-impact path.
