# BUG-004: Instagram iframe caused a startup console error

## Simple explanation

The Instagram iframe used an inline `onload` handler that called `instaEmbedLoaded()` before the main script had finished defining that function. The page could continue working, but the browser logged a startup error.

## What users saw

Users might not notice anything visually, but the browser console showed `ReferenceError: instaEmbedLoaded is not defined` while the page loaded.

## What we did to fix it

- Removed the inline iframe `onload` attribute.
- Added the load listener from the main script after the app functions are initialized.
- Kept the existing Instagram embed behavior while making its startup order reliable.

## Verification

The production preview opened with no page errors or failed requests. The mobile smoke check also completed without a startup error.

## How to avoid this mistake

Do not depend on inline handlers calling functions that may not exist yet. Register event listeners after script initialization and test the browser console on a fresh page load.

## Fix history

- Fixed on branch: `prathick`
- Fix commit: `cc21807`
