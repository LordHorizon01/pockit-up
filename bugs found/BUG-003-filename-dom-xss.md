# BUG-003: File names were inserted into the page as HTML

## Simple explanation

The app displayed uploaded file names by placing them directly into `innerHTML`. A specially crafted local file name could therefore be treated as HTML and run JavaScript inside the app page.

## What users saw

Normal file names worked, but a malicious-looking name could add an image or other HTML element to the file list. During testing, a harmless payload proved that an event handler could execute.

This was classified as P2, not P1: the app is a local client-only tool with no account, server, or other user's data boundary. The issue was still fixed because file names must always be treated as text.

## What we did to fix it

- Added one shared `escapeHtml()` helper.
- Escaped file names, ZIP paths, preview names, error names, compressor names, PDF-to-Excel values, and progress messages before inserting them into HTML.
- Re-tested with a crafted file name and confirmed that no injected image appeared and the literal text stayed visible.

## Verification

The crafted filename test no longer executed HTML. PDF merge and ZIP creation still completed successfully with normal files.

## How to avoid this mistake

Treat every file name, path, title, error, and imported value as untrusted text. Escape it before using `innerHTML`, or prefer `textContent` and DOM creation where possible. Add a crafted-value test whenever new UI rendering is added.

## Fix history

- Fixed on branch: `prathick`
- Fix commit: `cc21807`
