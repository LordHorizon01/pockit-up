pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ===================== APP NAVIGATION =====================
function openTool(tool) {
  document.getElementById('home-view').classList.add('hidden');
  const targetView = document.getElementById(tool + '-view');
  if (targetView) targetView.classList.remove('hidden');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  if (tool === 'colorpicker') {
    setTimeout(colorpickerDrawSpectrum, 30);
  }
  if (tool === 'calculator') {
    setupCalculator();
  }
}

function goHome() {
  document.getElementById('merger-view').classList.add('hidden');
  document.getElementById('compressor-view').classList.add('hidden');
  document.getElementById('image-tool-view').classList.add('hidden');
  document.getElementById('img2pdf-view').classList.add('hidden');
  document.getElementById('timer-view').classList.add('hidden');
  document.getElementById('stopwatch-view').classList.add('hidden');
  document.getElementById('numword-view').classList.add('hidden');
  document.getElementById('scoreboard-view').classList.add('hidden');
  document.getElementById('roman-view').classList.add('hidden');
  document.getElementById('insta-downloader-view').classList.add('hidden');
  document.getElementById('pdfunmerger-view')?.classList.add('hidden');
  document.getElementById('protect-view')?.classList.add('hidden');
  document.getElementById('unlock-view')?.classList.add('hidden');
  document.getElementById('rotate-view')?.classList.add('hidden');
  document.getElementById('pagenumber-view')?.classList.add('hidden');
  document.getElementById('pdftoword-view')?.classList.add('hidden');
  document.getElementById('pdftoexcel-view')?.classList.add('hidden');
  document.getElementById('wordtopdf-view')?.classList.add('hidden');
  document.getElementById('passwordgen-view')?.classList.add('hidden');
  document.getElementById('colorpicker-view')?.classList.add('hidden');
  document.getElementById('ziparchiver-view')?.classList.add('hidden');
  document.getElementById('calculator-view')?.classList.add('hidden');
  document.getElementById('home-view').classList.remove('hidden');
  imgResetConverter();
  img2pdfReset();
  pauseTimer();
  stopTimerAlarm();
  swStop();
  numwordReset();
  sbResetAll();
  romanReset();
  instaReset();
  unmergerReset();
  protectReset();
  unlockReset();
  rotateReset();
  pagenumberReset();
  pdftowordReset();
  pdftoexcelReset();
  wordtopdfReset();
  passwordgenReset();
  colorpickerReset();
  ziparchiverReset();
  calcReset();
  lucide.createIcons();
}

let isScrollingFromNav = false;
let scrollspyTimeout = null;

// ===================== INSTAGRAM DOWNLOADER =====================
function instaFetch() {
  const rawUrl = (document.getElementById('insta-url-input').value || '').trim();
  const errorEl = document.getElementById('insta-error');
  const errorMsg = document.getElementById('insta-error-msg');
  const previewSection = document.getElementById('insta-preview-section');
  const infoBox = document.getElementById('insta-info-box');

  // Hide all feedback
  errorEl.classList.add('hidden');
  previewSection.classList.add('hidden');
  infoBox.classList.add('hidden');

  if (!rawUrl) {
    errorMsg.textContent = 'Please paste an Instagram post or reel URL first.';
    errorEl.classList.remove('hidden');
    return;
  }

  // Validate Instagram URL
  const instaRegex = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_\-]+)/;
  const match = rawUrl.match(instaRegex);
  if (!match) {
    errorMsg.textContent = 'This does not look like a valid Instagram post or reel URL. Make sure it contains /p/, /reel/, or /tv/.';
    errorEl.classList.remove('hidden');
    return;
  }

  const type = match[1] === 'reel' ? 'Reel' : match[1] === 'tv' ? 'IGTV' : 'Post';
  const shortcode = match[2];

  // Build the clean embed URL
  const embedUrl = `https://www.instagram.com/${match[1]}/${shortcode}/embed/`;
  const cleanUrl = `https://www.instagram.com/${match[1]}/${shortcode}/`;

  // Update post type label and open link
  document.getElementById('insta-post-type').textContent = type;
  document.getElementById('insta-open-link').href = cleanUrl;
  document.getElementById('insta-download-btn').href = cleanUrl;

  // Show loading state inside frame
  const frame = document.getElementById('insta-embed-frame');
  const loading = document.getElementById('insta-embed-loading');
  frame.classList.add('hidden');
  loading.classList.remove('hidden');

  // Set iframe src
  frame.src = embedUrl;

  // Show preview section and info notice
  previewSection.classList.remove('hidden');
  infoBox.classList.remove('hidden');

  lucide.createIcons();
}

function instaEmbedLoaded() {
  const frame = document.getElementById('insta-embed-frame');
  const loading = document.getElementById('insta-embed-loading');
  frame.classList.remove('hidden');
  loading.classList.add('hidden');
}

function instaReset() {
  const inputEl = document.getElementById('insta-url-input');
  if (inputEl) inputEl.value = '';
  const els = ['insta-error', 'insta-preview-section', 'insta-info-box'];
  els.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const frame = document.getElementById('insta-embed-frame');
  if (frame) {
    frame.src = '';
    frame.classList.add('hidden');
  }
  const loading = document.getElementById('insta-embed-loading');
  if (loading) loading.classList.remove('hidden');
}

// ===================== PDF UNMERGER =====================
let unmergerFile = null;
let unmergerPdfDoc = null;
let unmergerArrayBuffer = null;
let unmergerTotalPages = 0;
let unmergerSelectedPages = new Set();
let unmergerFormat = 'png'; // 'png' | 'jpg' | 'webp' | 'pdf'
let unmergerMode = 'zip'; // 'zip' | 'combined'
let unmergerQuality = 2; // 1 | 2 | 3

function setupUnmergerDrop() {
  const dz = document.getElementById('unmerger-drop-zone');
  const fi = document.getElementById('unmerger-file-input');
  if (!dz || !fi) return;

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });
  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('drop-active');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('drop-active'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drop-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      unmergerHandleFile(e.dataTransfer.files[0]);
    }
  });
  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      unmergerHandleFile(e.target.files[0]);
    }
  });
}

async function unmergerHandleFile(file) {
  if (!file || file.type !== 'application/pdf') {
    alert('Please select a valid PDF document.');
    return;
  }
  unmergerFile = file;
  document.getElementById('unmerger-file-name').textContent = file.name;
  document.getElementById('unmerger-file-info').textContent = `Loading PDF pages... • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

  try {
    unmergerArrayBuffer = await file.arrayBuffer();
    unmergerPdfDoc = await pdfjsLib.getDocument({ data: unmergerArrayBuffer.slice(0) }).promise;
    unmergerTotalPages = unmergerPdfDoc.numPages;

    document.getElementById('unmerger-file-info').textContent = `${unmergerTotalPages} Pages • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    // By default, select all pages
    unmergerSelectedPages = new Set(Array.from({ length: unmergerTotalPages }, (_, i) => i + 1));

    document.getElementById('unmerger-drop-zone').classList.add('hidden');
    document.getElementById('unmerger-content').classList.remove('hidden');

    unmergerUpdateUI();
    await unmergerRenderThumbnails();
  } catch (err) {
    console.error('Error loading PDF:', err);
    alert('Could not load PDF file. The file may be password protected or corrupted.');
    unmergerReset();
  }
}

async function unmergerRenderThumbnails() {
  const grid = document.getElementById('unmerger-page-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let pageNum = 1; pageNum <= unmergerTotalPages; pageNum++) {
    const isSelected = unmergerSelectedPages.has(pageNum);

    const card = document.createElement('div');
    card.id = `unmerger-page-card-${pageNum}`;
    card.className = `unmerger-page-card relative bg-white dark:bg-gray-800 border-2 rounded-xl p-2.5 cursor-pointer transition flex flex-col items-center justify-between group shadow-sm hover:shadow-md ${
      isSelected ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20' : 'border-gray-200 dark:border-gray-700'
    }`;
    card.onclick = () => unmergerTogglePage(pageNum);

    card.innerHTML = `
      <div class="relative w-full flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden p-2 mb-2 min-h-[140px] items-center">
        <div id="unmerger-thumb-spinner-${pageNum}" class="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
        <canvas id="unmerger-canvas-${pageNum}" class="hidden max-w-full h-auto shadow rounded"></canvas>
        <div id="unmerger-check-badge-${pageNum}" class="absolute top-2 right-2 w-6 h-6 rounded-full ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-transparent'} flex items-center justify-center transition">
          <i data-lucide="check" style="width:14px;height:14px"></i>
        </div>
      </div>
      <div class="text-xs font-bold text-gray-700 dark:text-gray-300">Page ${pageNum}</div>
    `;

    grid.appendChild(card);
  }
  lucide.createIcons();

  // Render canvases in background
  for (let pageNum = 1; pageNum <= unmergerTotalPages; pageNum++) {
    try {
      const page = await unmergerPdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.getElementById(`unmerger-canvas-${pageNum}`);
      const spinner = document.getElementById(`unmerger-thumb-spinner-${pageNum}`);
      if (!canvas) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      if (spinner) spinner.classList.add('hidden');
      canvas.classList.remove('hidden');
    } catch (e) {
      console.error(`Failed to render thumbnail for page ${pageNum}`, e);
    }
  }
}

function unmergerTogglePage(pageNum) {
  if (unmergerSelectedPages.has(pageNum)) {
    unmergerSelectedPages.delete(pageNum);
  } else {
    unmergerSelectedPages.add(pageNum);
  }
  unmergerUpdateCardState(pageNum);
  unmergerUpdateUI();
}

function unmergerUpdateCardState(pageNum) {
  const card = document.getElementById(`unmerger-page-card-${pageNum}`);
  const badge = document.getElementById(`unmerger-check-badge-${pageNum}`);
  const isSelected = unmergerSelectedPages.has(pageNum);

  if (card) {
    if (isSelected) {
      card.className = 'unmerger-page-card relative bg-white dark:bg-gray-800 border-2 rounded-xl p-2.5 cursor-pointer transition flex flex-col items-center justify-between group shadow-sm hover:shadow-md border-purple-500 bg-purple-50/30 dark:bg-purple-950/20';
    } else {
      card.className = 'unmerger-page-card relative bg-white dark:bg-gray-800 border-2 rounded-xl p-2.5 cursor-pointer transition flex flex-col items-center justify-between group shadow-sm hover:shadow-md border-gray-200 dark:border-gray-700';
    }
  }
  if (badge) {
    if (isSelected) {
      badge.className = 'absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center transition';
    } else {
      badge.className = 'absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-transparent flex items-center justify-center transition';
    }
  }
}

function unmergerSelectAll() {
  for (let i = 1; i <= unmergerTotalPages; i++) unmergerSelectedPages.add(i);
  for (let i = 1; i <= unmergerTotalPages; i++) unmergerUpdateCardState(i);
  unmergerUpdateUI();
}

function unmergerDeselectAll() {
  unmergerSelectedPages.clear();
  for (let i = 1; i <= unmergerTotalPages; i++) unmergerUpdateCardState(i);
  unmergerUpdateUI();
}

function unmergerSelectOdd() {
  unmergerSelectedPages.clear();
  for (let i = 1; i <= unmergerTotalPages; i += 2) unmergerSelectedPages.add(i);
  for (let i = 1; i <= unmergerTotalPages; i++) unmergerUpdateCardState(i);
  unmergerUpdateUI();
}

function unmergerSelectEven() {
  unmergerSelectedPages.clear();
  for (let i = 2; i <= unmergerTotalPages; i += 2) unmergerSelectedPages.add(i);
  for (let i = 1; i <= unmergerTotalPages; i++) unmergerUpdateCardState(i);
  unmergerUpdateUI();
}

function unmergerApplyRange() {
  const input = (document.getElementById('unmerger-range-input').value || '').trim();
  if (!input) return;

  const newSet = new Set();
  const parts = input.split(',');
  parts.forEach(part => {
    const range = part.trim().split('-');
    if (range.length === 1) {
      const p = parseInt(range[0], 10);
      if (!isNaN(p) && p >= 1 && p <= unmergerTotalPages) newSet.add(p);
    } else if (range.length === 2) {
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(unmergerTotalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) newSet.add(p);
      }
    }
  });

  unmergerSelectedPages = newSet;
  for (let i = 1; i <= unmergerTotalPages; i++) unmergerUpdateCardState(i);
  unmergerUpdateUI();
}

function unmergerSetFormat(fmt) {
  unmergerFormat = fmt;

  // Highlight format buttons
  ['png', 'jpg', 'webp', 'pdf'].forEach(f => {
    const btn = document.getElementById(`unmerger-fmt-${f}`);
    if (btn) {
      if (f === fmt) {
        btn.className = 'unmerger-fmt-btn p-3.5 rounded-xl border-2 border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-center transition';
        btn.querySelector('div').className = 'font-bold text-sm text-purple-600 dark:text-purple-400';
      } else {
        btn.className = 'unmerger-fmt-btn p-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 text-center transition';
        btn.querySelector('div').className = 'font-bold text-sm text-gray-800 dark:text-gray-200';
      }
    }
  });

  const pdfModeBox = document.getElementById('unmerger-pdf-mode-box');
  const qualityBox = document.getElementById('unmerger-quality-box');

  if (fmt === 'pdf') {
    if (pdfModeBox) pdfModeBox.classList.remove('hidden');
    if (qualityBox) qualityBox.classList.add('hidden');
  } else {
    if (pdfModeBox) pdfModeBox.classList.add('hidden');
    if (qualityBox) qualityBox.classList.remove('hidden');
  }

  unmergerUpdateUI();
}

function unmergerSetMode(mode) {
  unmergerMode = mode;
  const zipCard = document.getElementById('unmerger-mode-card-zip');
  const combCard = document.getElementById('unmerger-mode-card-combined');

  if (zipCard && combCard) {
    if (mode === 'zip') {
      zipCard.className = 'p-3.5 rounded-xl border-2 border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 text-left transition';
      combCard.className = 'p-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-left transition';
    } else {
      combCard.className = 'p-3.5 rounded-xl border-2 border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 text-left transition';
      zipCard.className = 'p-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-left transition';
    }
  }

  unmergerUpdateUI();
}

function unmergerSetQuality(q) {
  unmergerQuality = q;
  [1, 2, 3].forEach(val => {
    const btn = document.getElementById(`unmerger-q-${val}`);
    if (btn) {
      if (val === q) {
        btn.className = 'unmerger-q-btn p-2.5 rounded-xl border-2 border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-center transition';
        btn.querySelector('div').className = 'font-semibold text-xs text-purple-600 dark:text-purple-400';
      } else {
        btn.className = 'unmerger-q-btn p-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center transition';
        btn.querySelector('div').className = 'font-semibold text-xs text-gray-800 dark:text-gray-200';
      }
    }
  });
}

function unmergerUpdateUI() {
  const countEl = document.getElementById('unmerger-selected-count');
  const btnText = document.getElementById('unmerger-btn-text');
  const downloadBtn = document.getElementById('unmerger-download-btn');
  const count = unmergerSelectedPages.size;

  if (countEl) {
    countEl.textContent = `Selected: ${count} of ${unmergerTotalPages} pages`;
  }

  if (!downloadBtn || !btnText) return;

  if (count === 0) {
    downloadBtn.disabled = true;
    downloadBtn.style.opacity = '0.5';
    downloadBtn.style.cursor = 'not-allowed';
    btnText.textContent = 'Select at least 1 page';
    return;
  }

  downloadBtn.disabled = false;
  downloadBtn.style.opacity = '1';
  downloadBtn.style.cursor = 'pointer';

  if (unmergerFormat === 'pdf' && unmergerMode === 'combined') {
    btnText.textContent = `Download Combined PDF (${count} ${count === 1 ? 'Page' : 'Pages'})`;
  } else if (unmergerFormat === 'pdf') {
    btnText.textContent = `Download Single-Page PDFs ZIP (${count} ${count === 1 ? 'File' : 'Files'})`;
  } else {
    const extName = unmergerFormat.toUpperCase();
    btnText.textContent = `Download ${extName} Images ZIP (${count} ${count === 1 ? 'Image' : 'Images'})`;
  }
}

function unmergerReset() {
  unmergerFile = null;
  unmergerPdfDoc = null;
  unmergerArrayBuffer = null;
  unmergerTotalPages = 0;
  unmergerSelectedPages.clear();

  const fi = document.getElementById('unmerger-file-input');
  if (fi) fi.value = '';

  const dz = document.getElementById('unmerger-drop-zone');
  if (dz) dz.classList.remove('hidden');
  const content = document.getElementById('unmerger-content');
  if (content) content.classList.add('hidden');
  const grid = document.getElementById('unmerger-page-grid');
  if (grid) grid.innerHTML = '';
}

async function unmergerProcessDownload() {
  if (!unmergerArrayBuffer || unmergerSelectedPages.size === 0) return;

  const modal = document.getElementById('unmerger-progress-modal');
  const progressBar = document.getElementById('unmerger-progress-bar');
  const progressText = document.getElementById('unmerger-progress-text');
  const modalTitle = document.getElementById('unmerger-modal-title');
  const modalSub = document.getElementById('unmerger-modal-sub');

  if (!modal) return;
  modal.classList.remove('hidden');
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = '0%';

  const baseFileName = unmergerFile ? unmergerFile.name.replace(/\.[^/.]+$/, '') : 'document';
  const sortedPages = Array.from(unmergerSelectedPages).sort((a, b) => a - b);

  try {
    if (unmergerFormat === 'pdf' && unmergerMode === 'combined') {
      // Create single combined PDF using pdf-lib
      if (modalTitle) modalTitle.textContent = 'Generating PDF Document...';
      if (modalSub) modalSub.textContent = `Combining ${sortedPages.length} selected pages into a new PDF`;
      if (progressBar) progressBar.style.width = '30%';
      if (progressText) progressText.textContent = '30%';

      const srcPdf = await PDFLib.PDFDocument.load(unmergerArrayBuffer.slice(0));
      const newPdf = await PDFLib.PDFDocument.create();
      const pageIndices = sortedPages.map(p => p - 1);
      const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
      copiedPages.forEach(p => newPdf.addPage(p));

      if (progressBar) progressBar.style.width = '70%';
      if (progressText) progressText.textContent = '70%';

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      if (progressBar) progressBar.style.width = '100%';
      if (progressText) progressText.textContent = '100%';

      triggerDownload(blob, `${baseFileName}_extracted.pdf`);
    } else if (unmergerFormat === 'pdf' && unmergerMode === 'zip') {
      // Create individual 1-page PDFs inside a ZIP
      if (modalTitle) modalTitle.textContent = 'Generating PDF Pages...';
      if (modalSub) modalSub.textContent = `Creating ${sortedPages.length} separate single-page PDF files`;

      const zip = new JSZip();
      const srcPdf = await PDFLib.PDFDocument.load(unmergerArrayBuffer.slice(0));

      for (let i = 0; i < sortedPages.length; i++) {
        const pageNum = sortedPages[i];
        const singlePdf = await PDFLib.PDFDocument.create();
        const [copiedPage] = await singlePdf.copyPages(srcPdf, [pageNum - 1]);
        singlePdf.addPage(copiedPage);
        const singleBytes = await singlePdf.save();

        zip.file(`${baseFileName}_page_${pageNum}.pdf`, singleBytes);

        const pct = Math.round(((i + 1) / sortedPages.length) * 80);
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${pct}%`;
      }

      if (modalTitle) modalTitle.textContent = 'Packaging ZIP Archive...';
      const zipBlob = await zip.generateAsync({ type: 'blob' }, metadata => {
        const pct = Math.min(100, 80 + Math.round(metadata.percent * 0.2));
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${pct}%`;
      });

      triggerDownload(zipBlob, `${baseFileName}_pdf_pages.zip`);
    } else {
      // Render images (PNG, JPG, WEBP) and package into ZIP
      const ext = unmergerFormat;
      const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' ? 'image/jpeg' : 'image/webp';
      const qualityParam = ext === 'png' ? undefined : 0.92;

      if (modalTitle) modalTitle.textContent = `Rendering ${ext.toUpperCase()} Images...`;
      if (modalSub) modalSub.textContent = `Exporting ${sortedPages.length} pages at ${unmergerQuality}x resolution`;

      const zip = new JSZip();

      for (let i = 0; i < sortedPages.length; i++) {
        const pageNum = sortedPages[i];
        const page = await unmergerPdfDoc.getPage(pageNum);

        const viewport = page.getViewport({ scale: unmergerQuality });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, qualityParam));
        zip.file(`${baseFileName}_page_${pageNum}.${ext}`, blob);

        const pct = Math.round(((i + 1) / sortedPages.length) * 80);
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${pct}%`;
      }

      if (modalTitle) modalTitle.textContent = 'Packaging ZIP Archive...';
      const zipBlob = await zip.generateAsync({ type: 'blob' }, metadata => {
        const pct = Math.min(100, 80 + Math.round(metadata.percent * 0.2));
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${pct}%`;
      });

      triggerDownload(zipBlob, `${baseFileName}_${ext}_pages.zip`);
    }
  } catch (err) {
    console.error('Error unmerging PDF:', err);
    alert('An error occurred while unmerging the PDF file.');
  } finally {
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 500);
  }
}


function scrollToSection(sectionId, btn) {
  isScrollingFromNav = true;
  clearTimeout(scrollspyTimeout);

  // Set active tab
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  // Scroll to section
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Re-enable scrollspy after smooth scroll ends
  scrollspyTimeout = setTimeout(() => {
    isScrollingFromNav = false;
  }, 1000);
}

let _toastTimer = null;
function showComingSoon(btn, label) {
  // If triggered from a category tab, briefly highlight tab then revert
  if (btn && btn.classList.contains('cat-tab')) {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    setTimeout(() => {
      btn.classList.remove('active');
      document.getElementById('tab-pdf').classList.add('active');
    }, 800);
  }

  // Show toast
  const toast = document.getElementById('coming-toast');
  const text = document.getElementById('coming-toast-text');
  if (toast && text) {
    text.textContent = `${label} — coming soon! 🚀`;
    toast.classList.remove('hidden');
    toast.style.opacity = '1';
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2500);
  }
}

// ===================== THEME TOGGLE =====================
function initTheme() {
  const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon-light').classList.remove('hidden');
    document.getElementById('theme-icon-dark').classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('theme-icon-light').classList.add('hidden');
    document.getElementById('theme-icon-dark').classList.remove('hidden');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  const sunIcon = document.getElementById('theme-icon-light');
  const moonIcon = document.getElementById('theme-icon-dark');
  
  if (isDark) {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
  
  // Update canvas preview dark themes if required
  if (previewDoc) {
    renderPreview();
  }
}

// ===================== PDF MERGER =====================
let pdfFiles = [];
let mergedBytes = null;
let dragIdx = null;
let previewDoc = null;
let currentModalPage = 1;
let allPreviewPages = 20; // Number shown initially
let totalPDFPages = 0;
let currentLightboxPage = 1;
let currentZoom = 1.0; // Track zoom level (100% = 1.0)

const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const actions = document.getElementById('actions');

function setupMergerDrop() {
  const dz = document.getElementById('drop-zone');
  const fi = document.getElementById('file-input');
  if (!dz || !fi) return;
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drop-active'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drop-active'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drop-active'); addFiles(e.dataTransfer.files); });
  fi.addEventListener('change', e => addFiles(e.target.files));
}

function addFiles(files) {
  for (const f of files) { if (f.type === 'application/pdf') pdfFiles.push(f); }
  renderList();
}

function renderList() {
  if (!fileList) return;
  fileList.innerHTML = '';
  actions.classList.toggle('hidden', pdfFiles.length < 2);
  pdfFiles.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'file-item flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm';
    div.draggable = true;
    div.dataset.idx = i;
    div.innerHTML = `<i data-lucide="grip-vertical" style="width:16px;height:16px" class="text-gray-400"></i><span class="flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">${f.name}</span><span class="text-xs text-gray-400">${(f.size/1024).toFixed(0)} KB</span><button class="text-red-400 hover:text-red-600 dark:hover:text-red-500" onclick="removeFile(${i})"><i data-lucide="x" style="width:16px;height:16px"></i></button>`;
    div.addEventListener('dragstart', () => { dragIdx = i; div.classList.add('dragging'); });
    div.addEventListener('dragend', () => { div.classList.remove('dragging'); dragIdx = null; });
    div.addEventListener('dragover', e => e.preventDefault());
    div.addEventListener('drop', e => { e.preventDefault(); reorder(dragIdx, i); });
    fileList.appendChild(div);
  });
  lucide.createIcons();
}

function removeFile(i) { pdfFiles.splice(i, 1); renderList(); }
function reorder(from, to) { const [item] = pdfFiles.splice(from, 1); pdfFiles.splice(to, 0, item); renderList(); }

async function mergePDFs() {
  const overlay = document.createElement('div');
  overlay.id = 'processing-overlay';
  overlay.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
  overlay.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 text-center max-w-sm"><div class="spinner mx-auto mb-4"></div><p class="text-gray-700 dark:text-gray-200 font-medium">Merging your PDFs...</p></div>`;
  document.body.appendChild(overlay);
  const status = document.getElementById('status');
  status.classList.add('hidden');
  try {
    const merged = await PDFLib.PDFDocument.create();
    for (const file of pdfFiles) {
      const bytes = await file.arrayBuffer();
      const doc = await PDFLib.PDFDocument.load(bytes);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    mergedBytes = await merged.save();
    overlay.remove();
    status.classList.remove('hidden');
    status.textContent = `Merge complete! ✓ (${(mergedBytes.length/(1024*1024)).toFixed(2)} MB)`;
    status.className = 'text-center text-sm text-green-600 dark:text-green-400';
    renderPreview();
  } catch (err) {
    overlay.remove();
    status.classList.remove('hidden');
    status.className = 'text-center text-sm text-red-600 dark:text-red-400';
    status.textContent = `Merge failed: ${err.message}`;
  }
}

async function renderPreview() {
  const section = document.getElementById('preview-section');
  const grid = document.getElementById('preview-grid');
  section.classList.remove('hidden');
  grid.innerHTML = '';
  previewDoc = await pdfjsLib.getDocument({ data: mergedBytes.slice() }).promise;
  totalPDFPages = previewDoc.numPages;
  allPreviewPages = 20;
  const displayCount = Math.min(totalPDFPages, allPreviewPages);
  for (let i = 1; i <= displayCount; i++) await addPagePreview(i, grid);
  
  const expandBtn = document.getElementById('expand-preview-btn');
  if (totalPDFPages > allPreviewPages) {
    expandBtn.classList.remove('hidden');
    const remaining = totalPDFPages - allPreviewPages;
    expandBtn.querySelector('button').textContent = `+ ${remaining} more page${remaining > 1 ? 's' : ''}`;
    expandBtn.querySelector('button').onclick = () => expandPreview(grid);
  } else {
    expandBtn.classList.add('hidden');
  }
  lucide.createIcons();
}

async function expandPreview(grid) {
  const start = allPreviewPages + 1;
  const end = totalPDFPages;
  allPreviewPages = totalPDFPages;
  for (let i = start; i <= end; i++) await addPagePreview(i, grid);
  const expandBtn = document.getElementById('expand-preview-btn');
  expandBtn.classList.add('hidden');
  lucide.createIcons();
}

async function addPagePreview(pageNum, grid) {
  const page = await previewDoc.getPage(pageNum);
  const vp = page.getViewport({ scale: 0.5 });
  const canvas = document.createElement('canvas');
  canvas.width = vp.width; canvas.height = vp.height;
  canvas.className = 'rounded border border-gray-200 w-full cursor-pointer hover:shadow-lg transition';
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  const wrap = document.createElement('div');
  wrap.className = 'relative';
  wrap.innerHTML = `<span class="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">${pageNum}</span>`;
  wrap.prepend(canvas);
  wrap.addEventListener('click', () => openLightbox(pageNum));
  grid.appendChild(wrap);
}

function downloadMerged() {
  if (!mergedBytes) return;
  const modal = document.getElementById('download-modal');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  modal.classList.remove('hidden');
  let progress = 0;
  
  // Simulate download progress
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;
    
    progressBar.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';
  }, 150);
  
  // Actual download and completion
  setTimeout(() => {
    clearInterval(interval);
    progress = 100;
    progressBar.style.width = '100%';
    progressText.textContent = '100%';
    
    setTimeout(() => {
      // Create blob from merged PDF bytes
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: 'application/pdf' });
      
      // Create download link with proper attributes
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // Close modal
      modal.classList.add('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
    }, 500);
  }, 1500);
}

// ===================== LIGHTBOX VIEW =====================
function openLightbox(pageNum) {
  currentLightboxPage = pageNum;
  currentZoom = 1.0; // Reset zoom when opening lightbox
  document.getElementById('lightbox-modal').classList.remove('hidden');
  renderLightboxPage();
  document.addEventListener('keydown', handleLightboxKeyboard);
}

function closeLightbox() {
  document.getElementById('lightbox-modal').classList.add('hidden');
  document.removeEventListener('keydown', handleLightboxKeyboard);
}

function handleLightboxKeyboard(e) {
  if (e.key === 'ArrowLeft') prevLightboxPage();
  if (e.key === 'ArrowRight') nextLightboxPage();
  if (e.key === 'Escape') closeLightbox();
}

async function renderLightboxPage() {
  const canvas = document.getElementById('lightbox-canvas');
  const page = await previewDoc.getPage(currentLightboxPage);
  const baseScale = 0.8; // Start at 80% to fit full page
  const vp = page.getViewport({ scale: baseScale * currentZoom });
  canvas.width = vp.width;
  canvas.height = vp.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  
  document.getElementById('lightbox-page-info').textContent = `Page ${currentLightboxPage} of ${totalPDFPages}`;
  document.getElementById('lightbox-counter').textContent = `${currentLightboxPage} / ${totalPDFPages}`;
  document.getElementById('zoom-level').textContent = `${Math.round(currentZoom * 100)}%`;
  
  document.getElementById('lightbox-prev').disabled = currentLightboxPage === 1;
  document.getElementById('lightbox-next').disabled = currentLightboxPage === totalPDFPages;
  
  // Update zoom button states
  document.getElementById('zoom-out-btn').disabled = currentZoom <= 0.5;
  document.getElementById('zoom-in-btn').disabled = currentZoom >= 3.0;
}

function zoomIn() {
  if (currentZoom < 3.0) {
    currentZoom = Math.min(currentZoom + 0.25, 3.0);
    renderLightboxPage();
  }
}

function zoomOut() {
  if (currentZoom > 0.5) {
    currentZoom = Math.max(currentZoom - 0.25, 0.5);
    renderLightboxPage();
  }
}

function prevLightboxPage() {
  if (currentLightboxPage > 1) {
    currentLightboxPage--;
    renderLightboxPage();
  }
}

function nextLightboxPage() {
  if (currentLightboxPage < totalPDFPages) {
    currentLightboxPage++;
    renderLightboxPage();
  }
}

// ===================== PDF COMPRESSOR =====================
let compressorFile = null;
let compressedBytes = null;

function setupCompressorDrop() {
  const cdz = document.getElementById('compress-drop-zone');
  const cfi = document.getElementById('compress-file-input');
  if (!cdz || !cfi) return;
  cdz.addEventListener('dragover', e => { e.preventDefault(); cdz.classList.add('drop-active'); });
  cdz.addEventListener('dragleave', () => cdz.classList.remove('drop-active'));
  cdz.addEventListener('drop', e => { e.preventDefault(); cdz.classList.remove('drop-active'); addCompressorFile(e.dataTransfer.files); });
  cfi.addEventListener('change', e => addCompressorFile(e.target.files));
}

function addCompressorFile(files) {
  for (const f of files) {
    if (f.type === 'application/pdf') {
      compressorFile = f;
      renderCompressorFileList();
      return;
    }
  }
  // If none matched, show a brief hint
  const dz = document.getElementById('compress-drop-zone');
  if (dz) { dz.classList.add('border-red-400'); setTimeout(() => dz.classList.remove('border-red-400'), 1000); }
}

// Quality card interactivity
function initQualityCards() {
  document.querySelectorAll('.quality-opt').forEach(label => {
    label.addEventListener('click', () => {
      // Unselect all cards
      document.querySelectorAll('.quality-card').forEach(card => {
        card.classList.remove('border-emerald-500', 'dark:border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-950/30');
        card.classList.add('border-gray-200', 'dark:border-gray-700');
      });
      // Select clicked card
      const card = label.querySelector('.quality-card');
      if (card) {
        card.classList.remove('border-gray-200', 'dark:border-gray-700');
        card.classList.add('border-emerald-500', 'dark:border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-950/30');
      }
      // Check the radio
      const radio = label.querySelector('input[type=radio]');
      if (radio) radio.checked = true;
    });
  });
}

function renderCompressorFileList() {
  const compressFileList = document.getElementById('compress-file-list');
  const compressActions = document.getElementById('compress-actions');
  const qualitySection = document.getElementById('compress-quality-section');
  if (!compressFileList || !compressActions) return;
  
  compressFileList.innerHTML = '';
  compressActions.classList.toggle('hidden', !compressorFile);
  if (qualitySection) qualitySection.classList.toggle('hidden', !compressorFile);

  if (compressorFile) {
    const sizeMB = compressorFile.size / 1024 / 1024;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm';
    div.innerHTML = `<i data-lucide="file-text" style="width:20px;height:20px" class="text-emerald-500"></i><span class="flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">${compressorFile.name}</span><span class="text-xs text-gray-400 flex-shrink-0">${sizeMB.toFixed(2)} MB</span><button class="text-red-400 hover:text-red-600 dark:hover:text-red-500 flex-shrink-0 ml-1" onclick="removeCompressorFile()"><i data-lucide="x" style="width:16px;height:16px"></i></button>`;
    compressFileList.appendChild(div);
  }
  lucide.createIcons();
}

function removeCompressorFile() {
  compressorFile = null;
  compressedBytes = null;
  document.getElementById('compress-result-section')?.classList.add('hidden');
  document.getElementById('compress-quality-section')?.classList.add('hidden');
  renderCompressorFileList();
}

async function compressPDF() {
  if (!compressorFile) return;
  
  const modal = document.getElementById('compress-progress-modal');
  modal.classList.remove('hidden');
  
  const resultSection = document.getElementById('compress-result-section');
  if (resultSection) resultSection.classList.add('hidden');
  
  try {
    const originalBytes = await compressorFile.arrayBuffer();
    // Save size NOW — PDF.js transfers the ArrayBuffer to its worker,
    // which detaches it and makes byteLength = 0 afterwards.
    const originalSize = originalBytes.byteLength;
    
    // compressWithMaxQuality drives its own per-page progress
    const compressedResult = await compressWithMaxQuality(originalBytes);
    
    // Brief pause so user sees 100%
    await new Promise(r => setTimeout(r, 600));
    
    compressedBytes = compressedResult;
    modal.classList.add('hidden');
    // Reset modal state for next use
    updateCompressProgress(0, 0, 0, 'Initializing...');
    displayCompressionResults(originalSize, compressedBytes.length);
  } catch (err) {
    modal.classList.add('hidden');
    updateCompressProgress(0, 0, 0, 'Initializing...');
    
    const msg = err.message || String(err);
    // Friendly message for "already compressed" case
    if (msg.includes('already well-compressed') || msg.includes('larger than the original')) {
      showAlreadyCompressedModal(msg);
    } else {
      showErrorModal(`Compression failed: ${msg}`);
    }
  }
}

// ===================== COMPRESSION ENGINE =====================
// Quality presets: name → { jpegQuality, scale }
// IMPORTANT: scale must always be <= 1.0 — we compress, we never upscale.
// Upscaling (scale > 1) adds pixels before JPEG encoding and BLOATS the file.
const COMPRESS_PRESETS = {
  screen:   { jpegQuality: 0.40, scale: 0.70 },  // Smallest — low res + low quality
  ebook:    { jpegQuality: 0.60, scale: 0.85 },  // Balanced — slightly lower res, good quality
  printer:  { jpegQuality: 0.78, scale: 0.95 },  // Good Quality — near-native res, high quality
  prepress: { jpegQuality: 0.90, scale: 1.00 },  // High Quality — native res, very high quality
};

function getSelectedQuality() {
  const selected = document.querySelector('input[name="compress-quality"]:checked');
  return selected ? selected.value : 'ebook';
}

function updateCompressProgress(page, total, pct, statusText) {
  const bar = document.getElementById('compress-progress-bar');
  const pctEl = document.getElementById('compress-progress-percent');
  const pageInfo = document.getElementById('compress-progress-page-info');
  const statusEl = document.getElementById('compress-progress-text');
  if (bar) bar.style.width = pct + '%';
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  if (pageInfo) pageInfo.textContent = total > 0 ? `Page ${page} of ${total}` : 'Loading…';
  if (statusEl && statusText) statusEl.textContent = statusText;
}

async function compressWithMaxQuality(originalBytes) {
  const originalSize = originalBytes.byteLength;
  const presetKey = getSelectedQuality();
  const preset = COMPRESS_PRESETS[presetKey] || COMPRESS_PRESETS.ebook;
  const { jpegQuality, scale } = preset;

  // Load the source PDF with PDF.js for rendering
  updateCompressProgress(0, 0, 2, 'Loading PDF…');
  const pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(originalBytes) }).promise;
  const numPages = pdfJsDoc.numPages;

  // Create a new pdf-lib document to hold the compressed pages
  const newDoc = await PDFLib.PDFDocument.create();
  const offscreenCanvas = document.createElement('canvas');
  const ctx = offscreenCanvas.getContext('2d');

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pct = 5 + ((pageNum - 1) / numPages) * 88;
    updateCompressProgress(pageNum, numPages, pct, `Compressing page ${pageNum} of ${numPages}…`);

    // Allow the UI to breathe between pages
    await new Promise(r => setTimeout(r, 0));

    const pdfPage = await pdfJsDoc.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale });

    offscreenCanvas.width  = Math.ceil(viewport.width);
    offscreenCanvas.height = Math.ceil(viewport.height);

    // White background (PDFs can be transparent, JPEG needs a background)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Render the PDF page onto the canvas
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;

    // Encode to JPEG at the chosen quality
    const jpegDataUrl = offscreenCanvas.toDataURL('image/jpeg', jpegQuality);
    const base64 = jpegDataUrl.split(',')[1];
    const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // Embed the JPEG into the new pdf-lib document
    const jpegImage = await newDoc.embedJpg(jpegBytes);
    const { width: iw, height: ih } = jpegImage.scale(1);

    // Add a page the same size as the original page
    const newPage = newDoc.addPage([iw, ih]);
    newPage.drawImage(jpegImage, { x: 0, y: 0, width: iw, height: ih });
  }

  updateCompressProgress(numPages, numPages, 95, 'Finalising PDF…');
  await new Promise(r => setTimeout(r, 0));

  const result = await newDoc.save();
  updateCompressProgress(numPages, numPages, 100, 'Done!');

  // ── GUARD: never return a file larger than the original ──────────────────
  // This happens when the input PDF is already JPEG-compressed (e.g. a file
  // that was previously compressed by this tool). Re-rasterising it cannot
  // shrink it further — so just return the original unchanged.
  if (result.length >= originalSize) {
    throw new Error(
      'This file is already well-compressed and cannot be reduced further.\n' +
      'The re-encoded version would be ' +
      (result.length / 1024 / 1024).toFixed(2) + ' MB — larger than the original ' +
      (originalSize / 1024 / 1024).toFixed(2) + ' MB.'
    );
  }

  return result;
}



function displayCompressionResults(originalSize, compressedSize) {
  const resultSection = document.getElementById('compress-result-section');
  const originalSizeEl = document.getElementById('original-size');
  const compressedSizeEl = document.getElementById('compressed-size');
  const ratioEl = document.getElementById('compression-ratio-text');
  if (!resultSection || !originalSizeEl || !compressedSizeEl) return;
  
  function formatSize(bytes) {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  }
  
  originalSizeEl.textContent = formatSize(originalSize);
  compressedSizeEl.textContent = formatSize(compressedSize);
  
  const savedBytes = originalSize - compressedSize;
  const reduction = Math.max(0, (savedBytes / originalSize * 100));
  if (ratioEl) {
    // Plain-English savings line
    if (savedBytes > 0) {
      ratioEl.textContent = `You saved ${formatSize(savedBytes)} — ${reduction.toFixed(0)}% smaller 🎉`;
    } else {
      ratioEl.textContent = 'File re-encoded successfully.';
    }
  }
  
  resultSection.classList.remove('hidden');
  
  // Scroll to results
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function openCompressedPreview() {
  if (!compressedBytes) return;
  
  const modal = document.getElementById('lightbox-modal');
  
  // Load compressed PDF for preview
  const compressedDoc = await pdfjsLib.getDocument({ data: new Uint8Array(compressedBytes) }).promise;
  
  currentLightboxPage = 1;
  currentZoom = 1.0;
  previewDoc = compressedDoc;
  totalPDFPages = compressedDoc.numPages;
  
  modal.classList.remove('hidden');
  await renderLightboxPage();
  document.addEventListener('keydown', handleLightboxKeyboard);
}

function downloadCompressed() {
  if (!compressedBytes) return;
  
  const modal = document.getElementById('compress-download-modal');
  const progressBar = document.getElementById('compress-download-progress-bar');
  const progressText = document.getElementById('compress-download-progress-text');
  if (!modal || !progressBar || !progressText) return;
  
  modal.classList.remove('hidden');
  let progress = 0;
  
  // Simulate download progress
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;
    
    progressBar.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';
  }, 150);
  
  // Actual download and completion
  setTimeout(() => {
    clearInterval(interval);
    progress = 100;
    progressBar.style.width = '100%';
    progressText.textContent = '100%';
    
    setTimeout(() => {
      // Create blob from compressed PDF bytes
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
      
      // Create download link with proper attributes
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = compressorFile.name.replace(/\.[^.]+$/, '') + '_compressed.pdf';
      link.style.display = 'none';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // Close modal
      modal.classList.add('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
    }, 500);
  }, 1500);
}

function showErrorModal(message) {
  const errorModal = document.getElementById('error-modal');
  const errorMessage = document.getElementById('error-message');
  if (errorModal && errorMessage) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
  }
}

function closeErrorModal() {
  const errorModal = document.getElementById('error-modal');
  if (errorModal) errorModal.classList.add('hidden');
}

function showAlreadyCompressedModal(detail) {
  const modal = document.getElementById('already-compressed-modal');
  const detailEl = document.getElementById('already-compressed-detail');
  if (modal) {
    if (detailEl) detailEl.textContent = detail || '';
    modal.classList.remove('hidden');
  }
}

function closeAlreadyCompressedModal() {
  const modal = document.getElementById('already-compressed-modal');
  if (modal) modal.classList.add('hidden');
}

// ===================== IMAGE TOOLS =====================
const imgTools = {
  'png-to-jpg':  { from:'PNG', to:'JPG', mime:'image/jpeg', ext:'jpg', accept:'.png,image/png' },
  'jpg-to-png':  { from:'JPG', to:'PNG', mime:'image/png',  ext:'png', accept:'.jpg,.jpeg,image/jpeg' },
  'webp-to-png': { from:'WEBP',to:'PNG', mime:'image/png',  ext:'png', accept:'.webp,image/webp' },
  'png-to-webp': { from:'PNG', to:'WEBP',mime:'image/webp', ext:'webp', accept:'.png,image/png' },
  'jpg-to-webp': { from:'JPG', to:'WEBP',mime:'image/webp', ext:'webp', accept:'.jpg,.jpeg,image/jpeg' },
  'webp-to-jpg': { from:'WEBP',to:'JPG', mime:'image/jpeg', ext:'jpg', accept:'.webp,image/webp' },
  'png-to-svg':  { from:'PNG', to:'SVG', mime:'image/svg+xml', ext:'svg', accept:'.png,image/png' },
  'jpg-to-svg':  { from:'JPG', to:'SVG', mime:'image/svg+xml', ext:'svg', accept:'.jpg,.jpeg,image/jpeg' },
  'svg-to-png':  { from:'SVG', to:'PNG', mime:'image/png',  ext:'png', accept:'.svg,image/svg+xml' },
  'svg-to-jpg':  { from:'SVG', to:'JPG', mime:'image/jpeg', ext:'jpg', accept:'.svg,image/svg+xml' },
  'gif-to-png':  { from:'GIF', to:'PNG', mime:'image/png',  ext:'png', accept:'.gif,image/gif' },
  'bmp-to-png':  { from:'BMP', to:'PNG', mime:'image/png',  ext:'png', accept:'.bmp,image/bmp' },
  'png-to-bmp':  { from:'PNG', to:'BMP', mime:'image/bmp',  ext:'bmp', accept:'.png,image/png' },
  'jpg-to-gif':  { from:'JPG', to:'GIF', mime:'image/gif',  ext:'gif', accept:'.jpg,.jpeg,image/jpeg' },
};

let imgCurrentTool = null;
let imgUploadedFile = null;
let imgConvertedBlob = null;

function openImageTool(toolId) {
  imgCurrentTool = imgTools[toolId];
  if (!imgCurrentTool) return;
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('image-tool-view').classList.remove('hidden');
  // Update header and title
  const label = imgCurrentTool.from + ' → ' + imgCurrentTool.to;
  document.getElementById('img-tool-breadcrumb').textContent = label;
  document.getElementById('img-tool-title').textContent = label + ' Converter';
  document.getElementById('img-tool-desc').textContent =
    'Upload a ' + imgCurrentTool.from + ' image and instantly convert it to ' + imgCurrentTool.to + ' format — 100% in your browser, no upload needed.';
  document.getElementById('img-file-input').accept = imgCurrentTool.accept;
  imgResetConverter();
  lucide.createIcons();
}

function imgResetConverter() {
  imgUploadedFile = null;
  imgConvertedBlob = null;
  const convertBtn = document.getElementById('img-convert-btn');
  if (convertBtn) convertBtn.disabled = true;
  document.getElementById('img-download-btn')?.classList.add('hidden');
  document.getElementById('img-convert-btn')?.classList.remove('hidden');
  document.getElementById('img-error')?.classList.add('hidden');
  document.getElementById('img-success')?.classList.add('hidden');
  document.getElementById('img-preview-section')?.classList.add('hidden');
  const fi = document.getElementById('img-file-input');
  if (fi) fi.value = '';
}

function imgHandleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  imgUploadedFile = file;
  imgConvertedBlob = null;
  document.getElementById('img-download-btn').classList.add('hidden');
  document.getElementById('img-success').classList.add('hidden');
  document.getElementById('img-error').classList.add('hidden');
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('img-preview').src = e.target.result;
    document.getElementById('img-file-name').textContent = file.name + ' (' + (file.size/1024).toFixed(0) + ' KB)';
    document.getElementById('img-preview-section').classList.remove('hidden');
    document.getElementById('img-convert-btn').disabled = false;
  };
  reader.readAsDataURL(file);
}

function imgAnimateProgress(title, duration) {
  return new Promise(resolve => {
    const modal = document.getElementById('img-progress-modal');
    const bar   = document.getElementById('img-progress-bar');
    const pct   = document.getElementById('img-progress-percent');
    document.getElementById('img-modal-title').textContent = title;
    bar.style.width = '0%'; pct.textContent = '0%';
    modal.classList.remove('hidden');
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const v = Math.round(p * 100);
      bar.style.width = v + '%'; pct.textContent = v + '%';
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(() => { modal.classList.add('hidden'); resolve(); }, 300);
    }
    requestAnimationFrame(step);
  });
}

async function imgStartConversion() {
  if (!imgUploadedFile || !imgCurrentTool) return;
  document.getElementById('img-error').classList.add('hidden');
  try {
    let blob;
    if (imgCurrentTool.to === 'SVG') {
      // Embed raster as base64 inside an SVG
      const dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target.result); fr.readAsDataURL(imgUploadedFile); });
      const img2 = new Image();
      img2.src = dataUrl;
      await new Promise(r => img2.onload = r);
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${img2.naturalWidth}" height="${img2.naturalHeight}"><image href="${dataUrl}" width="${img2.naturalWidth}" height="${img2.naturalHeight}"/></svg>`;
      blob = new Blob([svgStr], { type: 'image/svg+xml' });
    } else {
      const img2 = new Image();
      img2.src = URL.createObjectURL(imgUploadedFile);
      await new Promise(r => img2.onload = r);
      const convPromise = new Promise((res, rej) => {
        try {
          const c = document.createElement('canvas');
          c.width = img2.naturalWidth; c.height = img2.naturalHeight;
          const ctx = c.getContext('2d');
          if (imgCurrentTool.mime === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,c.height); }
          ctx.drawImage(img2, 0, 0);
          c.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), imgCurrentTool.mime, 0.92);
        } catch(e) { rej(e); }
      });
      await imgAnimateProgress('Converting ' + imgCurrentTool.from + ' → ' + imgCurrentTool.to + '…', 1800);
      blob = await convPromise;
    }
    if (!blob) throw new Error('No blob produced');
    imgConvertedBlob = blob;
    const name = imgUploadedFile.name.replace(/\.[^.]+$/, '') + '.' + imgCurrentTool.ext;
    document.getElementById('img-convert-btn').classList.add('hidden');
    document.getElementById('img-download-btn').classList.remove('hidden');
    document.getElementById('img-success-text').textContent = 'Converted to ' + imgCurrentTool.to + ' successfully!';
    document.getElementById('img-converted-name').textContent = name;
    document.getElementById('img-preview-btn').onclick = () => openImgPreview(imgConvertedBlob, name);
    document.getElementById('img-success').classList.remove('hidden');
    lucide.createIcons();
  } catch (err) {
    imgConvertedBlob = null;
    document.getElementById('img-error').classList.remove('hidden');
  }
}

async function imgStartDownload() {
  if (!imgConvertedBlob) return;
  await imgAnimateProgress('Preparing download…', 1000);
  const name = imgUploadedFile.name.replace(/\.[^.]+$/, '') + '.' + imgCurrentTool.ext;
  const url = URL.createObjectURL(imgConvertedBlob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function openImgPreview(blob, title) {
  document.getElementById('img-preview-modal-title').textContent = title;
  document.getElementById('img-preview-modal-img').src = URL.createObjectURL(blob);
  document.getElementById('img-preview-modal').classList.remove('hidden');
}

function closeImgPreview() {
  document.getElementById('img-preview-modal').classList.add('hidden');
}

// ===================== STOPWATCH =====================
let swInterval = null;
let swElapsedMs = 0;          // total elapsed milliseconds
let swLapStartMs = 0;         // ms at last lap start
let swIsRunning = false;
let swLaps = [];              // array of { lapNum, splitMs, totalMs }
let swLastTickTime = null;    // for accurate timing

// Format milliseconds → "HH:MM:SS"
function swFmtTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// Format centiseconds (0-99)
function swFmtMs(ms) {
  return '.' + String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
}

// Update DOM displays
function swUpdateDisplay() {
  const disp = document.getElementById('sw-display');
  const msDisp = document.getElementById('sw-ms-display');
  if (disp) disp.textContent = swFmtTime(swElapsedMs);
  if (msDisp) msDisp.textContent = swFmtMs(swElapsedMs);
}

// Render the laps list
function swRenderLaps() {
  const list = document.getElementById('sw-laps-list');
  const empty = document.getElementById('sw-laps-empty');
  if (!list) return;

  if (swLaps.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = swLaps.slice().reverse().map((lap) => {
    return `
      <div class="flex items-center justify-between px-6 py-3">
        <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 w-16">Lap ${lap.lapNum}</span>
        <span class="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1 text-center">${swFmtTime(lap.splitMs)}${swFmtMs(lap.splitMs)}</span>
        <span class="font-mono text-xs text-gray-400 dark:text-gray-500 w-24 text-right">${swFmtTime(lap.totalMs)}${swFmtMs(lap.totalMs)}</span>
      </div>`;
  }).join('');
  // Always show the newest lap at the top
  list.scrollTop = 0;
}

// Start stopwatch
function swStart() {
  if (swIsRunning) return;
  swIsRunning = true;
  swLastTickTime = performance.now();

  swInterval = setInterval(() => {
    const now = performance.now();
    swElapsedMs += now - swLastTickTime;
    swLastTickTime = now;
    swUpdateDisplay();
  }, 10); // update every 10ms for smooth centiseconds

  // Toggle buttons
  document.getElementById('sw-start-btn').classList.add('hidden');
  document.getElementById('sw-pause-btn').classList.remove('hidden');
  document.getElementById('sw-lap-btn').removeAttribute('disabled');
  lucide.createIcons();
}

// Pause stopwatch
function swPause() {
  if (!swIsRunning) return;
  swIsRunning = false;
  clearInterval(swInterval);
  swInterval = null;

  // Show Resume instead of Start
  const startBtn = document.getElementById('sw-start-btn');
  if (startBtn) {
    startBtn.textContent = 'Resume';
    startBtn.classList.remove('hidden');
  }
  document.getElementById('sw-pause-btn').classList.add('hidden');
}

// Stop (internal helper, called by goHome)
function swStop() {
  swIsRunning = false;
  if (swInterval) {
    clearInterval(swInterval);
    swInterval = null;
  }
}

// Reset stopwatch
function swReset() {
  swStop();
  swElapsedMs = 0;
  swLapStartMs = 0;
  swLaps = [];
  swUpdateDisplay();
  swRenderLaps();

  // Restore buttons
  const startBtn = document.getElementById('sw-start-btn');
  if (startBtn) {
    startBtn.textContent = 'Start';
    startBtn.classList.remove('hidden');
  }
  const pauseBtn = document.getElementById('sw-pause-btn');
  if (pauseBtn) pauseBtn.classList.add('hidden');
  const lapBtn = document.getElementById('sw-lap-btn');
  if (lapBtn) lapBtn.setAttribute('disabled', '');
  lucide.createIcons();
}

// Record a lap
function swLap() {
  if (!swIsRunning) return;
  const splitMs = swElapsedMs - swLapStartMs;
  swLapStartMs = swElapsedMs;
  swLaps.push({
    lapNum: swLaps.length + 1,
    splitMs,
    totalMs: swElapsedMs
  });
  swRenderLaps();
}

// ===================== COUNTDOWN TIMER =====================
let timerInterval = null;
let timerTotalSeconds = 60; // default 1 minute (00:01:00)
let timerRemainingSeconds = 60;
let timerIsRunning = false;

// Format seconds into HH:MM:SS
function formatTimerTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0')
  ].join(':');
}

// Update the visual display and progress ring
function updateTimerDisplay() {
  const display = document.getElementById('timer-time-display');
  if (display) {
    display.textContent = formatTimerTime(timerRemainingSeconds);
  }
  
  const settingBox = document.getElementById('timer-time-setting-box');
  if (settingBox) {
    settingBox.textContent = formatTimerTime(timerTotalSeconds);
  }
  
  const ring = document.getElementById('timer-progress-ring');
  if (ring) {
    const totalCircumference = 854.5;
    const fraction = timerTotalSeconds > 0 ? (timerRemainingSeconds / timerTotalSeconds) : 0;
    const offset = totalCircumference * (1 - fraction);
    ring.style.strokeDashoffset = offset;
  }
}

// Pad inputs on edit modal (limit validation)
function padTimerInput(input, maxVal) {
  let val = parseInt(input.value) || 0;
  if (val < 0) val = 0;
  if (val > maxVal) val = maxVal;
  input.value = String(val).padStart(2, '0');
}

// Open settings picker modal
function openTimerSettings() {
  // If timer is running, pause it first
  if (timerIsRunning) {
    pauseTimer();
  }
  
  const h = Math.floor(timerTotalSeconds / 3600);
  const m = Math.floor((timerTotalSeconds % 3600) / 60);
  const s = timerTotalSeconds % 60;
  
  document.getElementById('timer-input-hours').value = String(h).padStart(2, '0');
  document.getElementById('timer-input-minutes').value = String(m).padStart(2, '0');
  document.getElementById('timer-input-seconds').value = String(s).padStart(2, '0');
  
  document.getElementById('timer-settings-modal').classList.remove('hidden');
  lucide.createIcons();
}

function closeTimerSettings() {
  document.getElementById('timer-settings-modal').classList.add('hidden');
}

function saveTimerSettings() {
  const h = parseInt(document.getElementById('timer-input-hours').value) || 0;
  const m = parseInt(document.getElementById('timer-input-minutes').value) || 0;
  const s = parseInt(document.getElementById('timer-input-seconds').value) || 0;
  
  const newTotal = h * 3600 + m * 60 + s;
  
  if (newTotal <= 0) {
    // Timer must be at least 1 second
    timerTotalSeconds = 1;
  } else {
    timerTotalSeconds = Math.min(newTotal, 86399); // max 23:59:59
  }
  
  timerRemainingSeconds = timerTotalSeconds;
  updateTimerDisplay();
  closeTimerSettings();
  
  // Make sure reset is hidden since we set a new duration
  const resetBtn = document.getElementById('timer-reset-btn');
  if (resetBtn) {
    resetBtn.classList.add('opacity-0', 'pointer-events-none');
  }
}

// Play oscillator beep alarm
let timerAlarmInterval = null;
let timerAlarmCount = 0;

function playTimerAlarm() {
  // Use Web Audio API
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    timerAlarmCount = 0;
    
    // Beep 4 times
    timerAlarmInterval = setInterval(() => {
      if (timerAlarmCount >= 4) {
        clearInterval(timerAlarmInterval);
        timerAlarmInterval = null;
        return;
      }
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 880; // clear high pitch beep
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
      timerAlarmCount++;
    }, 600);
  } catch (e) {
    console.error('AudioContext alarm playing failed:', e);
  }
}

// Stop any active alarm audio context/intervals
function stopTimerAlarm() {
  if (timerAlarmInterval) {
    clearInterval(timerAlarmInterval);
    timerAlarmInterval = null;
  }
}

// Start countdown
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  stopTimerAlarm();
  
  timerIsRunning = true;
  
  // Change Play button icon to Stop (square)
  const playBtnIcon = document.getElementById('timer-btn-icon');
  if (playBtnIcon) {
    playBtnIcon.setAttribute('data-lucide', 'square');
    playBtnIcon.style.marginLeft = '0px'; // center the square icon
  }
  
  // Show reset button inside circle
  const resetBtn = document.getElementById('timer-reset-btn');
  if (resetBtn) {
    resetBtn.classList.remove('opacity-0', 'pointer-events-none');
  }
  
  lucide.createIcons();
  
  timerInterval = setInterval(() => {
    if (timerRemainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerIsRunning = false;
      playTimerAlarm();
      
      // Reset play button
      const pIcon = document.getElementById('timer-btn-icon');
      if (pIcon) {
        pIcon.setAttribute('data-lucide', 'play');
        pIcon.style.marginLeft = '4px';
      }
      
      // Hide reset button
      const rBtn = document.getElementById('timer-reset-btn');
      if (rBtn) {
        rBtn.classList.add('opacity-0', 'pointer-events-none');
      }
      
      timerRemainingSeconds = timerTotalSeconds;
      updateTimerDisplay();
      lucide.createIcons();
      return;
    }
    
    timerRemainingSeconds--;
    updateTimerDisplay();
  }, 1000);
}

// Pause/Stop countdown
function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerIsRunning = false;
  
  // Revert icon to Play (triangle)
  const playBtnIcon = document.getElementById('timer-btn-icon');
  if (playBtnIcon) {
    playBtnIcon.setAttribute('data-lucide', 'play');
    playBtnIcon.style.marginLeft = '4px';
  }
  lucide.createIcons();
}

// Toggle play/pause
function toggleTimer() {
  if (timerIsRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

// Reset timer to original duration
function resetTimer() {
  pauseTimer();
  stopTimerAlarm();
  timerRemainingSeconds = timerTotalSeconds;
  updateTimerDisplay();
  
  // Hide reset button
  const resetBtn = document.getElementById('timer-reset-btn');
  if (resetBtn) {
    resetBtn.classList.add('opacity-0', 'pointer-events-none');
  }
}

// ===================== NUMBER TO WORD CONVERTER =====================
function numwordOnModeChange() {
  const mode = document.getElementById('numword-mode').value;
  const inputLabel = document.getElementById('numword-input-label');
  const inputField = document.getElementById('numword-input');
  const outputLabel = document.getElementById('numword-output-label');
  const outputField = document.getElementById('numword-output');

  if (!inputLabel || !inputField || !outputLabel || !outputField) return;

  if (mode === 'num2word') {
    inputLabel.textContent = 'Enter Number';
    inputField.placeholder = 'e.g. 1234';
    outputLabel.textContent = 'Result';
    outputField.placeholder = 'Result will appear here...';
  } else {
    inputLabel.textContent = 'Enter Words';
    inputField.placeholder = 'e.g. one thousand two hundred thirty-four';
    outputLabel.textContent = 'Result';
    outputField.placeholder = 'Result will appear here...';
  }
  inputField.value = '';
  outputField.value = '';
}

function numwordReset() {
  const modeSelect = document.getElementById('numword-mode');
  if (modeSelect) modeSelect.value = 'num2word';
  numwordOnModeChange();
}

function numwordCopy() {
  const outputField = document.getElementById('numword-output');
  if (!outputField || !outputField.value) return;
  outputField.select();
  outputField.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(outputField.value).then(() => {
    const toast = document.getElementById('coming-toast');
    if (toast) {
      document.getElementById('coming-toast-text').textContent = 'Result copied to clipboard! 📋';
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 2000);
    }
  });
}

function numberToWords(numStr) {
  numStr = numStr.trim();
  if (numStr === '') return 'Please enter a valid number.';
  
  let cleanStr = numStr.replace(/,/g, '');
  if (!/^-?\d*(\.\d+)?$/.test(cleanStr) || cleanStr === '.' || cleanStr === '-.' || cleanStr === '-') {
    return 'Invalid number format.';
  }
  
  let prefix = '';
  if (cleanStr.startsWith('-')) {
    prefix = 'minus ';
    cleanStr = cleanStr.slice(1);
  }
  
  const parts = cleanStr.split('.');
  let integerPartStr = parts[0] || '0';
  let decimalPartStr = parts[1] || '';
  
  integerPartStr = integerPartStr.replace(/^0+/, '');
  if (integerPartStr === '') {
    integerPartStr = '0';
  }
  
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const scales = [
    '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion',
    'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion',
    'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
    'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion',
    'novemdecillion', 'vigintillion'
  ];
  
  let integerWords = '';
  
  if (integerPartStr === '0') {
    integerWords = 'zero';
  } else {
    const padLen = (3 - (integerPartStr.length % 3)) % 3;
    integerPartStr = '0'.repeat(padLen) + integerPartStr;
    
    const chunks = [];
    for (let i = 0; i < integerPartStr.length; i += 3) {
      chunks.push(integerPartStr.slice(i, i + 3));
    }
    
    const scaleCount = chunks.length;
    if (scaleCount > scales.length) {
      return `Number too large. Maximum supported scale is vigintillion (66 digits).`;
    }
    
    const wordsArr = [];
    for (let i = 0; i < scaleCount; i++) {
      const chunkStr = chunks[i];
      const hundredDigit = parseInt(chunkStr[0], 10);
      const remainder = parseInt(chunkStr.slice(1), 10);
      
      let chunkWords = '';
      if (hundredDigit > 0) {
        chunkWords += ones[hundredDigit] + ' hundred';
        if (remainder > 0) chunkWords += ' ';
      }
      
      if (remainder > 0) {
        if (remainder < 20) {
          chunkWords += ones[remainder];
        } else {
          const tenDigit = Math.floor(remainder / 10);
          const oneDigit = remainder % 10;
          chunkWords += tens[tenDigit];
          if (oneDigit > 0) {
            chunkWords += '-' + ones[oneDigit];
          }
        }
      }
      
      if (chunkWords !== '') {
        const scaleWord = scales[scaleCount - 1 - i];
        if (scaleWord !== '') {
          chunkWords += ' ' + scaleWord;
        }
        wordsArr.push(chunkWords);
      }
    }
    integerWords = wordsArr.join(' ');
  }
  
  let result = prefix + integerWords;
  
  if (decimalPartStr && decimalPartStr.length > 0) {
    const decimalWords = [];
    for (let i = 0; i < decimalPartStr.length; i++) {
      const digit = parseInt(decimalPartStr[i], 10);
      if (digit === 0) {
        decimalWords.push('zero');
      } else {
        decimalWords.push(ones[digit]);
      }
    }
    result += ' point ' + decimalWords.join(' ');
  }
  
  return result;
}

function wordsToNumber(wordsStr) {
  wordsStr = wordsStr.toLowerCase().trim();
  if (wordsStr === '') return 'Please enter words to convert.';

  wordsStr = wordsStr.replace(/and/g, ' ');
  wordsStr = wordsStr.replace(/-/g, ' ');
  wordsStr = wordsStr.replace(/,/g, ' ');
  const tokens = wordsStr.split(/\s+/).filter(t => t !== '');

  if (tokens.length === 0) return 'Invalid input.';

  const numberMap = {
    'zero': 0n, 'one': 1n, 'two': 2n, 'three': 3n, 'four': 4n, 'five': 5n, 'six': 6n, 'seven': 7n, 'eight': 8n, 'nine': 9n, 'ten': 10n,
    'eleven': 11n, 'twelve': 12n, 'thirteen': 13n, 'fourteen': 14n, 'fifteen': 15n, 'sixteen': 16n, 'seventeen': 17n, 'eighteen': 18n, 'nineteen': 19n,
    'twenty': 20n, 'thirty': 30n, 'forty': 40n, 'fifty': 50n, 'sixty': 60n, 'seventy': 70n, 'eighty': 80n, 'ninety': 90n
  };

  const scaleMap = {
    'hundred': 100n,
    'thousand': 1000n,
    'million': 1000000n,
    'billion': 1000000000n,
    'trillion': 1000000000000n,
    'quadrillion': 1000000000000000n,
    'quintillion': 1000000000000000000n,
    'sextillion': 1000000000000000000000n,
    'septillion': 1000000000000000000000000n,
    'octillion': 1000000000000000000000000000n,
    'nonillion': 1000000000000000000000000000000n,
    'decillion': 100000000000000000000000000000000n,
    'undecillion': 10000000000000000000000000000000000n,
    'duodecillion': 1000000000000000000000000000000000000n,
    'tredecillion': 100000000000000000000000000000000000000n,
    'quattuordecillion': 10000000000000000000000000000000000000000n,
    'quindecillion': 1000000000000000000000000000000000000000000n,
    'sexdecillion': 100000000000000000000000000000000000000000000n,
    'septendecillion': 10000000000000000000000000000000000000000000000n,
    'octodecillion': 1000000000000000000000000000000000000000000000000n,
    'novemdecillion': 100000000000000000000000000000000000000000000000000n,
    'vigintillion': 1000000000000000000000000000000000000000000000000000n
  };

  let totalSum = 0n;
  let currentGroupSum = 0n;
  let hasValidToken = false;
  let isNegative = false;

  let decimalIdx = tokens.indexOf('point');
  let decimalValString = '';

  let searchLimit = tokens.length;
  if (decimalIdx !== -1) {
    searchLimit = decimalIdx;
    for (let i = decimalIdx + 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === 'zero') {
        decimalValString += '0';
        hasValidToken = true;
      } else {
        const val = numberMap[token];
        if (val !== undefined && val < 10n) {
          decimalValString += val.toString();
          hasValidToken = true;
        } else {
          return `Unsupported or invalid decimal word: "${token}"`;
        }
      }
    }
  }

  for (let i = 0; i < searchLimit; i++) {
    const token = tokens[i];

    if (token === 'minus' || token === 'negative') {
      isNegative = true;
      hasValidToken = true;
      continue;
    }

    if (numberMap[token] !== undefined) {
      currentGroupSum += numberMap[token];
      hasValidToken = true;
    } else if (scaleMap[token] !== undefined) {
      hasValidToken = true;
      const scale = scaleMap[token];
      if (scale === 100n) {
        if (currentGroupSum === 0n) currentGroupSum = 1n;
        currentGroupSum *= 100n;
      } else {
        if (currentGroupSum === 0n) currentGroupSum = 1n;
        totalSum += currentGroupSum * scale;
        currentGroupSum = 0n;
      }
    } else {
      return `Unsupported or invalid word: "${token}"`;
    }
  }

  if (!hasValidToken) {
    return 'Could not recognize any numerical words.';
  }

  totalSum += currentGroupSum;
  
  let finalResult = totalSum.toString();
  if (isNegative) {
    finalResult = '-' + finalResult;
  }
  if (decimalValString !== '') {
    finalResult = finalResult + '.' + decimalValString;
  }

  return finalResult;
}

function numwordConvert() {
  const mode = document.getElementById('numword-mode').value;
  const input = document.getElementById('numword-input').value;
  const outputField = document.getElementById('numword-output');
  if (!outputField) return;

  if (mode === 'num2word') {
    outputField.value = numberToWords(input);
  } else {
    outputField.value = wordsToNumber(input);
  }
}

// ===================== SCOREBOARD =====================
let sbScore1 = 0;
let sbScore2 = 0;

function sbToggleCustom() {
  const toggle = document.getElementById('sb-custom-toggle');
  const wrapper = document.getElementById('sb-custom-input-wrapper');
  if (!toggle || !wrapper) return;

  if (toggle.checked) {
    wrapper.classList.remove('opacity-50', 'pointer-events-none');
  } else {
    wrapper.classList.add('opacity-50', 'pointer-events-none');
  }
}

function sbAdjustScore(teamNum, direction) {
  const toggle = document.getElementById('sb-custom-toggle');
  let interval = 1;

  if (toggle && toggle.checked) {
    const valInput = document.getElementById('sb-custom-val');
    const customVal = valInput ? parseInt(valInput.value, 10) : 1;
    interval = isNaN(customVal) ? 1 : customVal;
  }

  if (teamNum === 1) {
    sbScore1 += direction * interval;
    const scoreEl = document.getElementById('sb-score1');
    if (scoreEl) scoreEl.textContent = sbScore1;
  } else if (teamNum === 2) {
    sbScore2 += direction * interval;
    const scoreEl = document.getElementById('sb-score2');
    if (scoreEl) scoreEl.textContent = sbScore2;
  }
}

function sbReset() {
  sbScore1 = 0;
  sbScore2 = 0;

  const score1El = document.getElementById('sb-score1');
  const score2El = document.getElementById('sb-score2');
  if (score1El) score1El.textContent = '0';
  if (score2El) score2El.textContent = '0';
}

function sbResetAll() {
  sbReset();

  const team1Input = document.getElementById('sb-team1-name');
  const team2Input = document.getElementById('sb-team2-name');
  if (team1Input) team1Input.value = 'Team 1';
  if (team2Input) team2Input.value = 'Team 2';

  const toggle = document.getElementById('sb-custom-toggle');
  if (toggle) toggle.checked = false;

  const valInput = document.getElementById('sb-custom-val');
  if (valInput) valInput.value = '1';

  sbToggleCustom();
}

// ===================== ROMAN NUMERALS CONVERTER =====================
function romanOnModeChange() {
  const mode = document.getElementById('roman-mode').value;
  const inputLabel = document.getElementById('roman-input-label');
  const inputField = document.getElementById('roman-input');
  const outputLabel = document.getElementById('roman-output-label');
  const outputField = document.getElementById('roman-output');

  if (!inputLabel || !inputField || !outputLabel || !outputField) return;

  if (mode === 'num2roman') {
    inputLabel.textContent = 'Enter Number';
    inputField.placeholder = 'e.g. 10';
    outputLabel.textContent = 'Result';
    outputField.placeholder = 'Result will appear here...';
  } else {
    inputLabel.textContent = 'Enter Roman Numeral';
    inputField.placeholder = 'e.g. X';
    outputLabel.textContent = 'Result';
    outputField.placeholder = 'Result will appear here...';
  }
  inputField.value = '';
  outputField.value = '';
}

function romanReset() {
  const modeSelect = document.getElementById('roman-mode');
  if (modeSelect) modeSelect.value = 'num2roman';
  romanOnModeChange();
}

function romanCopy() {
  const outputField = document.getElementById('roman-output');
  if (!outputField || !outputField.value) return;
  outputField.select();
  outputField.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(outputField.value).then(() => {
    const toast = document.getElementById('coming-toast');
    if (toast) {
      document.getElementById('coming-toast-text').textContent = 'Result copied to clipboard! 📋';
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 2000);
    }
  });
}

function arabicToRoman(numStr) {
  const val = parseInt(numStr.trim(), 10);
  if (isNaN(val)) return 'Please enter a valid integer.';
  if (val < 1 || val > 3999) return 'There is a problem! Please check entry.';

  const lookup = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90,
    L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let roman = '';
  let n = val;
  for (let key in lookup) {
    while (n >= lookup[key]) {
      roman += key;
      n -= lookup[key];
    }
  }
  return roman;
}

function romanToArabic(romanStr) {
  const str = romanStr.trim().toUpperCase();
  if (str === '') return 'Please enter a Roman numeral.';

  const validator = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  if (!validator.test(str)) {
    return 'Invalid Roman numeral format.';
  }

  const lookup = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const currentVal = lookup[str[i]];
    const nextVal = lookup[str[i + 1]];

    if (nextVal && currentVal < nextVal) {
      num -= currentVal;
    } else {
      num += currentVal;
    }
  }
  return num.toString();
}

function romanConvert() {
  const mode = document.getElementById('roman-mode').value;
  const input = document.getElementById('roman-input').value;
  const outputField = document.getElementById('roman-output');
  if (!outputField) return;

  if (mode === 'num2roman') {
    outputField.value = arabicToRoman(input);
  } else {
    outputField.value = romanToArabic(input);
  }
}

// ===================== IMAGES TO PDF =====================
let img2pdfFiles = [];
let img2pdfBytes = null;
let img2pdfPreviewDoc = null;
let img2pdfDragIdx = null;
let img2pdfTotalPages = 0;
let img2pdfAllPreviewPages = 20;

function img2pdfReset() {
  img2pdfFiles = [];
  img2pdfBytes = null;
  img2pdfPreviewDoc = null;
  img2pdfDragIdx = null;
  img2pdfTotalPages = 0;
  img2pdfAllPreviewPages = 20;
  const fileList = document.getElementById('img2pdf-file-list');
  if (fileList) fileList.innerHTML = '';
  document.getElementById('img2pdf-actions')?.classList.add('hidden');
  document.getElementById('img2pdf-pagesize-section')?.classList.add('hidden');
  document.getElementById('img2pdf-status')?.classList.add('hidden');
  document.getElementById('img2pdf-preview-section')?.classList.add('hidden');
}

function setupImg2pdfDrop() {
  const dz = document.getElementById('img2pdf-drop-zone');
  const fi = document.getElementById('img2pdf-file-input');
  if (!dz || !fi) return;
  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drop-active'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drop-active'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drop-active'); img2pdfAddFiles(e.dataTransfer.files); });
  fi.addEventListener('change', e => img2pdfAddFiles(e.target.files));
}

function img2pdfAddFiles(files) {
  for (const f of files) {
    if (f.type.startsWith('image/')) img2pdfFiles.push(f);
  }
  img2pdfRenderList();
}

function img2pdfRenderList() {
  const fileList = document.getElementById('img2pdf-file-list');
  const actions = document.getElementById('img2pdf-actions');
  const pageSizeSection = document.getElementById('img2pdf-pagesize-section');
  if (!fileList) return;
  fileList.innerHTML = '';
  const hasFiles = img2pdfFiles.length >= 1;
  actions.classList.toggle('hidden', !hasFiles);
  if (pageSizeSection) pageSizeSection.classList.toggle('hidden', !hasFiles);

  img2pdfFiles.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'file-item flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm';
    div.draggable = true;
    div.dataset.idx = i;

    // Create thumbnail
    const thumb = document.createElement('img');
    thumb.className = 'w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-700 flex-shrink-0';
    thumb.alt = f.name;
    const reader = new FileReader();
    reader.onload = e => { thumb.src = e.target.result; };
    reader.readAsDataURL(f);

    div.innerHTML = `<i data-lucide="grip-vertical" style="width:16px;height:16px" class="text-gray-400 flex-shrink-0"></i>`;
    div.appendChild(thumb);

    const info = document.createElement('span');
    info.className = 'flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200';
    info.textContent = f.name;
    div.appendChild(info);

    const size = document.createElement('span');
    size.className = 'text-xs text-gray-400 flex-shrink-0';
    size.textContent = (f.size / 1024).toFixed(0) + ' KB';
    div.appendChild(size);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'text-red-400 hover:text-red-600 dark:hover:text-red-500 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="x" style="width:16px;height:16px"></i>';
    removeBtn.onclick = () => img2pdfRemoveFile(i);
    div.appendChild(removeBtn);

    div.addEventListener('dragstart', () => { img2pdfDragIdx = i; div.classList.add('dragging'); });
    div.addEventListener('dragend', () => { div.classList.remove('dragging'); img2pdfDragIdx = null; });
    div.addEventListener('dragover', e => e.preventDefault());
    div.addEventListener('drop', e => { e.preventDefault(); img2pdfReorder(img2pdfDragIdx, i); });
    fileList.appendChild(div);
  });
  lucide.createIcons();
}

function img2pdfRemoveFile(i) { img2pdfFiles.splice(i, 1); img2pdfRenderList(); }
function img2pdfReorder(from, to) {
  if (from === null || from === undefined) return;
  const [item] = img2pdfFiles.splice(from, 1);
  img2pdfFiles.splice(to, 0, item);
  img2pdfRenderList();
}

function img2pdfGetPageSize() {
  const selected = document.querySelector('input[name="img2pdf-pagesize"]:checked');
  return selected ? selected.value : 'fit';
}

function initImg2pdfSizeCards() {
  document.querySelectorAll('.img2pdf-size-opt').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.img2pdf-size-card').forEach(card => {
        card.classList.remove('border-sky-500', 'dark:border-sky-500', 'bg-sky-50/50', 'dark:bg-sky-950/30');
        card.classList.add('border-gray-200', 'dark:border-gray-700');
      });
      const card = label.querySelector('.img2pdf-size-card');
      if (card) {
        card.classList.remove('border-gray-200', 'dark:border-gray-700');
        card.classList.add('border-sky-500', 'dark:border-sky-500', 'bg-sky-50/50', 'dark:bg-sky-950/30');
      }
      const radio = label.querySelector('input[type=radio]');
      if (radio) radio.checked = true;
    });
  });
}

// Load an image file into an HTMLImageElement
function img2pdfLoadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image: ' + file.name));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file: ' + file.name));
    reader.readAsDataURL(file);
  });
}

// Convert any image to PNG bytes via canvas (for formats pdf-lib can't embed directly)
function img2pdfToPngBytes(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// Convert any image to JPG bytes via canvas
function img2pdfToJpgBytes(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const base64 = dataUrl.split(',')[1];
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function img2pdfCreate() {
  if (img2pdfFiles.length === 0) return;

  // Show processing overlay
  const overlay = document.createElement('div');
  overlay.id = 'img2pdf-processing-overlay';
  overlay.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
  overlay.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 text-center max-w-sm"><div class="spinner mx-auto mb-4"></div><p id="img2pdf-overlay-text" class="text-gray-700 dark:text-gray-200 font-medium">Creating your PDF...</p></div>`;
  document.body.appendChild(overlay);

  const status = document.getElementById('img2pdf-status');
  status.classList.add('hidden');

  try {
    const pageSize = img2pdfGetPageSize();
    const pdfDoc = await PDFLib.PDFDocument.create();

    // Page dimensions in points (72 dpi)
    const PAGE_SIZES = {
      a4: { width: 595.28, height: 841.89 },
      letter: { width: 612, height: 792 },
      legal: { width: 612, height: 1008 },
      a3: { width: 841.89, height: 1190.55 },
      a5: { width: 419.53, height: 595.28 }
    };
    const MARGIN = 36; // 0.5 inch margin for fixed page sizes

    for (let i = 0; i < img2pdfFiles.length; i++) {
      const file = img2pdfFiles[i];
      const overlayText = document.getElementById('img2pdf-overlay-text');
      if (overlayText) overlayText.textContent = `Processing image ${i + 1} of ${img2pdfFiles.length}...`;

      // Allow UI to breathe
      await new Promise(r => setTimeout(r, 0));

      const img = await img2pdfLoadImage(file);
      let embeddedImage;

      // pdf-lib natively supports PNG and JPG; convert others via canvas
      const type = file.type.toLowerCase();
      if (type === 'image/png') {
        const bytes = await file.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(new Uint8Array(bytes));
      } else if (type === 'image/jpeg' || type === 'image/jpg') {
        const bytes = await file.arrayBuffer();
        embeddedImage = await pdfDoc.embedJpg(new Uint8Array(bytes));
      } else {
        // WEBP, GIF, BMP, SVG, etc. → convert to PNG via canvas
        const pngBytes = img2pdfToPngBytes(img);
        embeddedImage = await pdfDoc.embedPng(pngBytes);
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      let pageW, pageH, drawX, drawY, drawW, drawH;

      if (pageSize === 'fit') {
        // Page matches image dimensions
        pageW = imgWidth;
        pageH = imgHeight;
        drawX = 0;
        drawY = 0;
        drawW = imgWidth;
        drawH = imgHeight;
      } else {
        // Fixed page size — scale image to fit within margins
        const ps = PAGE_SIZES[pageSize];
        pageW = ps.width;
        pageH = ps.height;
        const maxW = pageW - MARGIN * 2;
        const maxH = pageH - MARGIN * 2;
        const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
        drawW = imgWidth * scale;
        drawH = imgHeight * scale;
        // Center on page
        drawX = (pageW - drawW) / 2;
        drawY = (pageH - drawH) / 2;
      }

      const page = pdfDoc.addPage([pageW, pageH]);
      page.drawImage(embeddedImage, { x: drawX, y: drawY, width: drawW, height: drawH });
    }

    img2pdfBytes = await pdfDoc.save();
    overlay.remove();

    status.classList.remove('hidden');
    status.textContent = `PDF created! ✓ (${img2pdfFiles.length} image${img2pdfFiles.length > 1 ? 's' : ''}, ${(img2pdfBytes.length / (1024 * 1024)).toFixed(2)} MB)`;
    status.className = 'text-center text-sm text-green-600 dark:text-green-400';

    await img2pdfRenderPreview();
  } catch (err) {
    overlay.remove();
    status.classList.remove('hidden');
    status.className = 'text-center text-sm text-red-600 dark:text-red-400';
    status.textContent = `Failed: ${err.message}`;
  }
}

async function img2pdfRenderPreview() {
  const section = document.getElementById('img2pdf-preview-section');
  const grid = document.getElementById('img2pdf-preview-grid');
  section.classList.remove('hidden');
  grid.innerHTML = '';
  img2pdfPreviewDoc = await pdfjsLib.getDocument({ data: img2pdfBytes.slice() }).promise;
  img2pdfTotalPages = img2pdfPreviewDoc.numPages;
  img2pdfAllPreviewPages = 20;
  const displayCount = Math.min(img2pdfTotalPages, img2pdfAllPreviewPages);
  for (let i = 1; i <= displayCount; i++) await img2pdfAddPagePreview(i, grid);

  const expandBtn = document.getElementById('img2pdf-expand-preview-btn');
  if (img2pdfTotalPages > img2pdfAllPreviewPages) {
    expandBtn.classList.remove('hidden');
    const remaining = img2pdfTotalPages - img2pdfAllPreviewPages;
    expandBtn.querySelector('button').textContent = `+ ${remaining} more page${remaining > 1 ? 's' : ''}`;
    expandBtn.querySelector('button').onclick = () => img2pdfExpandPreview(grid);
  } else {
    expandBtn.classList.add('hidden');
  }
  lucide.createIcons();
}

async function img2pdfExpandPreview(grid) {
  const start = img2pdfAllPreviewPages + 1;
  const end = img2pdfTotalPages;
  img2pdfAllPreviewPages = img2pdfTotalPages;
  for (let i = start; i <= end; i++) await img2pdfAddPagePreview(i, grid);
  document.getElementById('img2pdf-expand-preview-btn').classList.add('hidden');
  lucide.createIcons();
}

async function img2pdfAddPagePreview(pageNum, grid) {
  const page = await img2pdfPreviewDoc.getPage(pageNum);
  const vp = page.getViewport({ scale: 0.5 });
  const canvas = document.createElement('canvas');
  canvas.width = vp.width; canvas.height = vp.height;
  canvas.className = 'rounded border border-gray-200 w-full cursor-pointer hover:shadow-lg transition';
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  const wrap = document.createElement('div');
  wrap.className = 'relative';
  wrap.innerHTML = `<span class="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">${pageNum}</span>`;
  wrap.prepend(canvas);
  wrap.addEventListener('click', () => img2pdfOpenLightbox(pageNum));
  grid.appendChild(wrap);
}

function img2pdfOpenLightbox(pageNum) {
  // Reuse the global lightbox from the merger
  previewDoc = img2pdfPreviewDoc;
  totalPDFPages = img2pdfTotalPages;
  openLightbox(pageNum);
}

function img2pdfDownload() {
  if (!img2pdfBytes) return;
  const modal = document.getElementById('img2pdf-download-modal');
  const progressBar = document.getElementById('img2pdf-progress-bar');
  const progressText = document.getElementById('img2pdf-progress-text');

  modal.classList.remove('hidden');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;
    progressBar.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';
  }, 150);

  setTimeout(() => {
    clearInterval(interval);
    progress = 100;
    progressBar.style.width = '100%';
    progressText.textContent = '100%';

    setTimeout(() => {
      const blob = new Blob([new Uint8Array(img2pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);

      modal.classList.add('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
    }, 500);
  }, 1500);
}

// ===================== NAVIGATION DRAWER =====================
function openSidebar() {
  const overlay = document.getElementById('sidebar-overlay');
  const drawer = document.getElementById('sidebar-drawer');
  if (!overlay || !drawer) return;
  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.style.opacity = '1';
    drawer.style.transform = 'translateX(0)';
  }, 10);
}

function closeSidebar() {
  const overlay = document.getElementById('sidebar-overlay');
  const drawer = document.getElementById('sidebar-drawer');
  if (!overlay || !drawer) return;
  overlay.style.opacity = '0';
  drawer.style.transform = 'translateX(-100%)';
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 300);
}

function scrollToSectionFromSidebar(sectionId) {
  closeSidebar();
  if (document.getElementById('home-view').classList.contains('hidden')) {
    goHome();
    setTimeout(() => {
      const tabBtn = document.querySelector(`.cat-tab[onclick*="${sectionId}"]`);
      scrollToSection(sectionId, tabBtn);
    }, 150);
  } else {
    const tabBtn = document.querySelector(`.cat-tab[onclick*="${sectionId}"]`);
    scrollToSection(sectionId, tabBtn);
  }
}

// ===================== DOM EVENT SETUP =====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupMergerDrop();
  setupCompressorDrop();
  initQualityCards();
  
  // Compress drop zone click to browse
  const cdz = document.getElementById('compress-drop-zone');
  const cfi = document.getElementById('compress-file-input');
  if (cdz && cfi) {
    cdz.addEventListener('click', e => {
      // Don't trigger if clicking the label inside
      if (!e.target.closest('label')) cfi.click();
    });
  }

  // Setup image drop zone
  const imgDz = document.getElementById('img-drop-zone');
  const imgFi = document.getElementById('img-file-input');
  if (imgDz && imgFi) {
    imgDz.addEventListener('click', () => imgFi.click());
    imgDz.addEventListener('dragover', e => { e.preventDefault(); imgDz.classList.add('drop-active'); });
    imgDz.addEventListener('dragleave', () => imgDz.classList.remove('drop-active'));
    imgDz.addEventListener('drop', e => { e.preventDefault(); imgDz.classList.remove('drop-active'); imgHandleFile(e.dataTransfer.files[0]); });
    imgFi.addEventListener('change', e => { if (e.target.files[0]) imgHandleFile(e.target.files[0]); });
  }
  
  lucide.createIcons();

  // Setup Images to PDF
  setupImg2pdfDrop();
  initImg2pdfSizeCards();

  // Setup PDF Unmerger
  setupUnmergerDrop();

  // Setup Protect PDF
  setupProtectDrop();

  // Setup Unlock PDF
  setupUnlockDrop();

  // Setup Rotate PDF
  setupRotateDrop();

  // Setup Add Page Numbers
  setupPageNumberDrop();

  // Setup PDF to Word
  setupPdfToWordDrop();

  // Setup PDF to Excel
  setupPdfToExcelDrop();

  // Setup Word to PDF
  setupWordToPdfDrop();

  // Setup Password Generator
  setupPasswordGen();

  // Setup Color Picker & Palette Studio
  setupColorPicker();

  // Scroll listener to toggle scrolled class for fixed elements like theme toggle
  window.addEventListener('scroll', () => {
    if (window.scrollY > 150) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });

  // ScrollSpy to highlight and scroll tabs when scrolling the page
  const sections = document.querySelectorAll('#home-view main section');
  const navTabs = document.querySelectorAll('.cat-tab');
  
  const observerOptions = {
    root: null,
    rootMargin: '-120px 0px -70% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    if (isScrollingFromNav) return; // Skip updating if scrolling is triggered by navigation click
    
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const activeTab = document.querySelector(`.cat-tab[onclick*="${id}"]`);
        if (activeTab) {
          navTabs.forEach(t => t.classList.remove('active'));
          activeTab.classList.add('active');
          activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    if (section.getAttribute('id')) {
      observer.observe(section);
    }
  });
});

// Utility for formatting file sizes
function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===================== PROTECT PDF =====================
let protectFile = null;
let protectArrayBuffer = null;
let protectEncryptedBytes = null;
let protectPdfDoc = null;
let protectCurrentPreset = 'max';

function setupProtectDrop() {
  const dz = document.getElementById('protect-drop-zone');
  const fi = document.getElementById('protect-file-input');
  if (!dz || !fi) return;

  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
  });

  dz.addEventListener('dragleave', () => {
    dz.classList.remove('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
  });

  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      protectHandleFile(e.dataTransfer.files[0]);
    }
  });

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });

  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      protectHandleFile(e.target.files[0]);
    }
  });
}

async function protectHandleFile(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Please select a valid PDF file.');
    return;
  }

  protectFile = file;
  protectEncryptedBytes = null;

  try {
    protectArrayBuffer = await file.arrayBuffer();

    // Render preview thumbnail & get page count with PDF.js (using copy of buffer to prevent detachment)
    const typedarray = new Uint8Array(protectArrayBuffer.slice(0));
    const loadingTask = pdfjsLib.getDocument({ data: typedarray });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Render page 1 preview
    const canvas = document.getElementById('protect-thumb-canvas');
    if (canvas) {
      try {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      } catch (thumbErr) {
        console.warn('Could not render thumbnail preview:', thumbErr);
      }
    }

    // Populate file info
    document.getElementById('protect-filename').textContent = file.name;
    document.getElementById('protect-filesize').textContent = formatBytes(file.size);
    document.getElementById('protect-pagecount').textContent = `${numPages} page${numPages > 1 ? 's' : ''}`;

    // Switch view sections
    document.getElementById('protect-drop-zone').classList.add('hidden');
    document.getElementById('protect-config-section').classList.remove('hidden');
    document.getElementById('protect-result-section').classList.add('hidden');

    // Reset password & inputs
    document.getElementById('protect-user-pass').value = '';
    document.getElementById('protect-user-confirm').value = '';
    document.getElementById('protect-owner-pass').value = '';
    document.getElementById('protect-enable-permissions').checked = false;
    document.getElementById('protect-owner-body').classList.add('hidden');
    protectCheckStrength();
    protectSetPreset('max');

    lucide.createIcons();
  } catch (err) {
    console.error('Error loading PDF in protect tool:', err);
    alert('Failed to load this PDF: ' + (err.message || err));
  }
}

function protectTogglePassVis(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  if (btn) {
    btn.innerHTML = `<i data-lucide="${isPass ? 'eye-off' : 'eye'}" style="width:16px;height:16px"></i>`;
    lucide.createIcons();
  }
}

function protectCheckStrength() {
  const pass = (document.getElementById('protect-user-pass')?.value || '');
  const lenEl = document.getElementById('req-len');
  const upperEl = document.getElementById('req-upper');
  const lowerEl = document.getElementById('req-lower');
  const numEl = document.getElementById('req-num');
  const symEl = document.getElementById('req-sym');

  const hasLen = pass.length >= 6;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNum = /[0-9]/.test(pass);
  const hasSym = /[^A-Za-z0-9]/.test(pass);

  const updateTag = (el, valid) => {
    if (!el) return;
    if (valid) {
      el.className = 'px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1';
      el.innerHTML = `✓ ${el.textContent.replace(/^[•✓]\s*/, '')}`;
    } else {
      el.className = 'px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 flex items-center gap-1';
      el.innerHTML = `• ${el.textContent.replace(/^[•✓]\s*/, '')}`;
    }
  };

  updateTag(lenEl, hasLen);
  updateTag(upperEl, hasUpper);
  updateTag(lowerEl, hasLower);
  updateTag(numEl, hasNum);
  updateTag(symEl, hasSym);

  // Score calculation
  let score = 0;
  if (pass.length > 0) {
    if (hasLen) score++;
    if (hasUpper && hasLower) score++;
    if (hasNum) score++;
    if (hasSym || pass.length >= 12) score++;
  }

  const b1 = document.getElementById('str-bar-1');
  const b2 = document.getElementById('str-bar-2');
  const b3 = document.getElementById('str-bar-3');
  const b4 = document.getElementById('str-bar-4');
  const label = document.getElementById('protect-strength-label');

  const resetBars = () => {
    [b1, b2, b3, b4].forEach(b => {
      if (b) b.className = 'rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300';
    });
  };
  resetBars();

  if (pass.length === 0) {
    if (label) { label.textContent = 'None'; label.className = 'font-bold text-gray-400'; }
  } else if (score === 1) {
    if (b1) b1.className = 'rounded-full bg-red-500 transition-all duration-300';
    if (label) { label.textContent = 'Weak'; label.className = 'font-bold text-red-500'; }
  } else if (score === 2) {
    if (b1) b1.className = 'rounded-full bg-amber-500 transition-all duration-300';
    if (b2) b2.className = 'rounded-full bg-amber-500 transition-all duration-300';
    if (label) { label.textContent = 'Fair'; label.className = 'font-bold text-amber-500'; }
  } else if (score === 3) {
    if (b1) b1.className = 'rounded-full bg-yellow-500 transition-all duration-300';
    if (b2) b2.className = 'rounded-full bg-yellow-500 transition-all duration-300';
    if (b3) b3.className = 'rounded-full bg-yellow-500 transition-all duration-300';
    if (label) { label.textContent = 'Good'; label.className = 'font-bold text-yellow-500'; }
  } else if (score >= 4) {
    [b1, b2, b3, b4].forEach(b => {
      if (b) b.className = 'rounded-full bg-emerald-500 transition-all duration-300';
    });
    if (label) { label.textContent = 'Strong & Secure'; label.className = 'font-bold text-emerald-500'; }
  }

  protectCheckMatch();
}

function protectCheckMatch() {
  const pass = (document.getElementById('protect-user-pass')?.value || '');
  const confirm = (document.getElementById('protect-user-confirm')?.value || '');
  const msg = document.getElementById('protect-match-msg');
  if (!msg) return;

  if (!confirm) {
    msg.classList.add('hidden');
    return;
  }

  msg.classList.remove('hidden');
  if (pass === confirm) {
    msg.className = 'text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1';
    msg.textContent = '✓ Passwords match';
  } else {
    msg.className = 'text-xs mt-1 text-red-500 dark:text-red-400 font-medium flex items-center gap-1';
    msg.textContent = '✗ Passwords do not match';
  }
}

function protectGeneratePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-';
  let gen = '';
  const cryptoObj = window.crypto || window.msCrypto;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const arr = new Uint32Array(16);
    cryptoObj.getRandomValues(arr);
    for (let i = 0; i < 16; i++) {
      gen += chars[arr[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 16; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  const userPass = document.getElementById('protect-user-pass');
  const userConfirm = document.getElementById('protect-user-confirm');
  if (userPass) userPass.value = gen;
  if (userConfirm) userConfirm.value = gen;

  // Reveal password momentarily
  if (userPass) userPass.type = 'text';
  if (userConfirm) userConfirm.type = 'text';

  protectCheckStrength();

  // Copy to clipboard
  navigator.clipboard?.writeText(gen).catch(() => {});

  // Show Toast
  const toast = document.getElementById('coming-toast');
  const text = document.getElementById('coming-toast-text');
  if (toast && text) {
    text.textContent = 'Strong password generated & copied to clipboard! 📋';
    toast.classList.remove('hidden');
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2500);
  }
}

function protectToggleOwnerSection() {
  const isEnabled = document.getElementById('protect-enable-permissions').checked;
  const body = document.getElementById('protect-owner-body');
  if (body) {
    if (isEnabled) {
      body.classList.remove('hidden');
    } else {
      body.classList.add('hidden');
    }
  }
  lucide.createIcons();
}

function protectSetPreset(preset) {
  protectCurrentPreset = preset;

  // Update button active states
  ['max', 'read-print', 'forms', 'custom'].forEach(p => {
    const btn = document.getElementById(`preset-${p}`);
    if (btn) {
      if (p === preset) {
        btn.className = 'preset-btn p-3 rounded-xl border border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-left transition';
        const title = btn.querySelector('div:first-child');
        if (title) title.className = 'font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1';
      } else {
        btn.className = 'preset-btn p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-left hover:border-gray-300 dark:hover:border-gray-600 transition';
        const title = btn.querySelector('div:first-child');
        if (title) title.className = 'font-bold text-xs text-gray-700 dark:text-gray-200 flex items-center gap-1';
      }
    }
  });

  const setCheckbox = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = val;
  };
  const setSelect = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  if (preset === 'max') {
    setSelect('perm-printing', 'none');
    setCheckbox('perm-copying', false);
    setCheckbox('perm-modifying', false);
    setCheckbox('perm-annotating', false);
    setCheckbox('perm-fillingForms', false);
    setCheckbox('perm-contentAccessibility', true);
    setCheckbox('perm-documentAssembly', false);
  } else if (preset === 'read-print') {
    setSelect('perm-printing', 'highResolution');
    setCheckbox('perm-copying', false);
    setCheckbox('perm-modifying', false);
    setCheckbox('perm-annotating', false);
    setCheckbox('perm-fillingForms', false);
    setCheckbox('perm-contentAccessibility', true);
    setCheckbox('perm-documentAssembly', false);
  } else if (preset === 'forms') {
    setSelect('perm-printing', 'highResolution');
    setCheckbox('perm-copying', false);
    setCheckbox('perm-modifying', false);
    setCheckbox('perm-annotating', true);
    setCheckbox('perm-fillingForms', true);
    setCheckbox('perm-contentAccessibility', true);
    setCheckbox('perm-documentAssembly', false);
  }
}

function protectOnCustomChange() {
  protectSetPreset('custom');
}

async function protectProcess() {
  if (!protectArrayBuffer) {
    alert('Please upload a PDF file first.');
    return;
  }

  const userPass = (document.getElementById('protect-user-pass')?.value || '').trim();
  const userConfirm = (document.getElementById('protect-user-confirm')?.value || '').trim();

  if (!userPass) {
    alert('Please enter an Open Password for this PDF.');
    document.getElementById('protect-user-pass').focus();
    return;
  }

  if (userPass !== userConfirm) {
    alert('The confirm password does not match the set password. Please double check.');
    document.getElementById('protect-user-confirm').focus();
    return;
  }

  // Show progress modal
  const modal = document.getElementById('protect-progress-modal');
  const bar = document.getElementById('protect-progress-bar');
  const txt = document.getElementById('protect-progress-text');
  modal.classList.remove('hidden');
  bar.style.width = '20%';
  txt.textContent = '20%';

  try {
    // Load with PDFDocument from window.PDFLib
    bar.style.width = '40%';
    txt.textContent = '40%';
    await new Promise(r => setTimeout(r, 100));

    const pdfDoc = await window.PDFLib.PDFDocument.load(protectArrayBuffer);

    bar.style.width = '60%';
    txt.textContent = '60%';
    await new Promise(r => setTimeout(r, 100));

    // Encryption settings
    const algoEl = document.querySelector('input[name="protect-algo"]:checked');
    const algo = algoEl ? algoEl.value : 'AES-256';

    const enablePerms = document.getElementById('protect-enable-permissions').checked;
    let ownerPass = (document.getElementById('protect-owner-pass')?.value || '').trim();

    const secOptions = {
      userPassword: userPass,
      algorithm: algo
    };

    if (enablePerms) {
      if (!ownerPass) {
        // Auto-generate secure owner pass if not supplied
        ownerPass = 'Owner_' + Math.random().toString(36).substring(2, 12) + '!';
      }
      secOptions.ownerPassword = ownerPass;

      const printingVal = document.getElementById('perm-printing').value;
      secOptions.permissions = {
        printing: printingVal === 'none' ? false : printingVal,
        copying: document.getElementById('perm-copying').checked,
        modifying: document.getElementById('perm-modifying').checked,
        annotating: document.getElementById('perm-annotating').checked,
        fillingForms: document.getElementById('perm-fillingForms').checked,
        contentAccessibility: document.getElementById('perm-contentAccessibility').checked,
        documentAssembly: document.getElementById('perm-documentAssembly').checked
      };
    } else if (ownerPass) {
      secOptions.ownerPassword = ownerPass;
    }

    // Encrypt doc
    pdfDoc.encrypt(secOptions);

    bar.style.width = '85%';
    txt.textContent = '85%';
    await new Promise(r => setTimeout(r, 150));

    protectEncryptedBytes = await pdfDoc.save();

    bar.style.width = '100%';
    txt.textContent = '100%';
    await new Promise(r => setTimeout(r, 200));

    // Hide progress modal
    modal.classList.add('hidden');

    // Populate result view
    const baseName = protectFile.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_protected.pdf`;
    document.getElementById('res-protect-name').textContent = outName;
    document.getElementById('res-protect-cipher').textContent = algo;
    document.getElementById('res-protect-size').textContent = `${formatBytes(protectFile.size)} → ${formatBytes(protectEncryptedBytes.length)}`;
    document.getElementById('res-protect-pass').textContent = userPass;

    // Switch view
    document.getElementById('protect-config-section').classList.add('hidden');
    document.getElementById('protect-result-section').classList.remove('hidden');

    lucide.createIcons();
  } catch (err) {
    console.error('Error encrypting PDF:', err);
    modal.classList.add('hidden');
    alert('Failed to encrypt PDF: ' + err.message);
  }
}

function protectDownload() {
  if (!protectEncryptedBytes) return;
  const baseName = protectFile ? protectFile.name.replace(/\.[^/.]+$/, '') : 'document';
  const outName = `${baseName}_protected.pdf`;

  const blob = new Blob([protectEncryptedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function protectCopyPassword() {
  const pass = document.getElementById('res-protect-pass')?.textContent;
  if (!pass || pass === '••••••••') return;
  navigator.clipboard?.writeText(pass).then(() => {
    const toast = document.getElementById('coming-toast');
    const text = document.getElementById('coming-toast-text');
    if (toast && text) {
      text.textContent = 'Password copied to clipboard! 📋';
      toast.classList.remove('hidden');
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.classList.add('hidden'), 300);
      }, 2500);
    }
  });
}

function protectResetFile() {
  protectFile = null;
  protectArrayBuffer = null;
  protectEncryptedBytes = null;
  const fi = document.getElementById('protect-file-input');
  if (fi) fi.value = '';
  document.getElementById('protect-drop-zone')?.classList.remove('hidden');
  document.getElementById('protect-config-section')?.classList.add('hidden');
  document.getElementById('protect-result-section')?.classList.add('hidden');
  lucide.createIcons();
}

function protectReset() {
  protectResetFile();
  const up = document.getElementById('protect-user-pass');
  const uc = document.getElementById('protect-user-confirm');
  const op = document.getElementById('protect-owner-pass');
  if (up) up.value = '';
  if (uc) uc.value = '';
  if (op) op.value = '';
  const ep = document.getElementById('protect-enable-permissions');
  if (ep) ep.checked = false;
  const ob = document.getElementById('protect-owner-body');
  if (ob) ob.classList.add('hidden');
  protectCheckStrength();
}

// ===================== UNLOCK PDF =====================
let unlockFile = null;
let unlockArrayBuffer = null;
let unlockDecryptedBytes = null;
let unlockTotalPages = 0;
let unlockIsEncrypted = false;

function setupUnlockDrop() {
  const dz = document.getElementById('unlock-drop-zone');
  const fi = document.getElementById('unlock-file-input');
  const passInput = document.getElementById('unlock-pass-input');
  if (!dz || !fi) return;

  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('border-emerald-500', 'bg-emerald-50/40', 'dark:bg-emerald-950/30');
  });

  dz.addEventListener('dragleave', () => {
    dz.classList.remove('border-emerald-500', 'bg-emerald-50/40', 'dark:bg-emerald-950/30');
  });

  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('border-emerald-500', 'bg-emerald-50/40', 'dark:bg-emerald-950/30');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      unlockHandleFile(e.dataTransfer.files[0]);
    }
  });

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });

  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      unlockHandleFile(e.target.files[0]);
    }
  });

  if (passInput) {
    passInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') unlockProcess();
    });
  }
}

async function unlockHandleFile(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Please select a valid PDF file.');
    return;
  }

  unlockFile = file;
  unlockDecryptedBytes = null;
  unlockTotalPages = 0;

  try {
    unlockArrayBuffer = await file.arrayBuffer();

    // Test whether the PDF is password-protected or encrypted
    let isEncrypted = false;
    let numPages = 0;

    try {
      // Test with PDFLib without password
      const testDoc = await window.PDFLib.PDFDocument.load(unlockArrayBuffer.slice(0));
      numPages = testDoc.getPageCount();
      isEncrypted = false;
    } catch (testErr) {
      // If error mentions encrypted/password, it is protected
      isEncrypted = true;
    }

    unlockIsEncrypted = isEncrypted;

    if (isEncrypted) {
      // Show Password-Locked Section
      document.getElementById('unlock-locked-filename').textContent = file.name;
      document.getElementById('unlock-locked-filesize').textContent = formatBytes(file.size);

      document.getElementById('unlock-drop-zone').classList.add('hidden');
      document.getElementById('unlock-password-section').classList.remove('hidden');
      document.getElementById('unlock-unprotected-section').classList.add('hidden');
      document.getElementById('unlock-result-section').classList.add('hidden');

      const passInput = document.getElementById('unlock-pass-input');
      if (passInput) {
        passInput.value = '';
        passInput.focus();
      }
      document.getElementById('unlock-error-msg')?.classList.add('hidden');
    } else {
      // Document is NOT locked — show clean info card
      document.getElementById('unlock-unprot-filename').textContent = file.name;
      document.getElementById('unlock-unprot-filesize').textContent = formatBytes(file.size);
      document.getElementById('unlock-unprot-pagecount').textContent = `${numPages} page${numPages > 1 ? 's' : ''}`;

      // Render thumbnail preview with PDF.js
      try {
        const typedarray = new Uint8Array(unlockArrayBuffer.slice(0));
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        const page = await pdf.getPage(1);
        const canvas = document.getElementById('unlock-thumb-canvas');
        if (canvas) {
          const viewport = page.getViewport({ scale: 0.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        }
      } catch (thumbErr) {
        console.warn('Could not render unlocked thumbnail:', thumbErr);
      }

      document.getElementById('unlock-drop-zone').classList.add('hidden');
      document.getElementById('unlock-password-section').classList.add('hidden');
      document.getElementById('unlock-unprotected-section').classList.remove('hidden');
      document.getElementById('unlock-result-section').classList.add('hidden');
    }

    lucide.createIcons();
  } catch (err) {
    console.error('Error reading PDF in unlock tool:', err);
    alert('Failed to read this PDF: ' + (err.message || err));
  }
}

async function unlockProcess() {
  if (!unlockArrayBuffer) {
    alert('Please upload a PDF file first.');
    return;
  }

  const passInput = document.getElementById('unlock-pass-input');
  const errorMsg = document.getElementById('unlock-error-msg');
  const enteredPass = (passInput?.value || '').trim();

  if (!enteredPass) {
    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      errorMsg.querySelector('span').textContent = 'Please enter the PDF password.';
    }
    passInput?.focus();
    return;
  }

  if (errorMsg) errorMsg.classList.add('hidden');

  // Show progress modal
  const modal = document.getElementById('unlock-progress-modal');
  const bar = document.getElementById('unlock-progress-bar');
  const txt = document.getElementById('unlock-progress-text');
  modal.classList.remove('hidden');
  bar.style.width = '25%';
  txt.textContent = '25%';

  try {
    bar.style.width = '50%';
    txt.textContent = '50%';
    await new Promise(r => setTimeout(r, 100));

    // Decrypt using PDFLib with entered password
    const loadedDoc = await window.PDFLib.PDFDocument.load(unlockArrayBuffer.slice(0), { password: enteredPass });

    bar.style.width = '75%';
    txt.textContent = '75%';
    await new Promise(r => setTimeout(r, 100));

    // Strip all encryption & restrictions cleanly by copying into a fresh PDFDocument
    const cleanDoc = await window.PDFLib.PDFDocument.create();
    const pageIndices = loadedDoc.getPageIndices();
    const copiedPages = await cleanDoc.copyPages(loadedDoc, pageIndices);
    copiedPages.forEach(p => cleanDoc.addPage(p));

    unlockTotalPages = cleanDoc.getPageCount();
    unlockDecryptedBytes = await cleanDoc.save();

    bar.style.width = '100%';
    txt.textContent = '100%';
    await new Promise(r => setTimeout(r, 150));

    modal.classList.add('hidden');

    // Populate result view
    const baseName = unlockFile.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_unlocked.pdf`;
    document.getElementById('res-unlock-name').textContent = outName;
    document.getElementById('res-unlock-size').textContent = `${formatBytes(unlockFile.size)} → ${formatBytes(unlockDecryptedBytes.length)}`;
    document.getElementById('res-unlock-pages').textContent = `${unlockTotalPages} page${unlockTotalPages > 1 ? 's' : ''}`;

    // Switch view
    document.getElementById('unlock-password-section').classList.add('hidden');
    document.getElementById('unlock-result-section').classList.remove('hidden');

    lucide.createIcons();
  } catch (err) {
    console.error('Error unlocking PDF:', err);
    modal.classList.add('hidden');

    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      errorMsg.querySelector('span').textContent = 'Incorrect password. Please try again.';
    }
    if (passInput) {
      passInput.focus();
      passInput.select();
    }
  }
}

function unlockDownload() {
  if (!unlockDecryptedBytes) return;
  const baseName = unlockFile ? unlockFile.name.replace(/\.[^/.]+$/, '') : 'document';
  const outName = `${baseName}_unlocked.pdf`;

  const blob = new Blob([unlockDecryptedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function unlockResetFile() {
  unlockFile = null;
  unlockArrayBuffer = null;
  unlockDecryptedBytes = null;
  unlockTotalPages = 0;
  unlockIsEncrypted = false;
  const fi = document.getElementById('unlock-file-input');
  if (fi) fi.value = '';
  const passInput = document.getElementById('unlock-pass-input');
  if (passInput) passInput.value = '';
  document.getElementById('unlock-error-msg')?.classList.add('hidden');
  document.getElementById('unlock-drop-zone')?.classList.remove('hidden');
  document.getElementById('unlock-password-section')?.classList.add('hidden');
  document.getElementById('unlock-unprotected-section')?.classList.add('hidden');
  document.getElementById('unlock-result-section')?.classList.add('hidden');
  lucide.createIcons();
}

function unlockReset() {
  unlockResetFile();
}

// ===================== ROTATE PDF =====================
let rotateFile = null;
let rotateArrayBuffer = null;
let rotateRotatedBytes = null;
let rotatePdfJsDoc = null;
let rotateTotalPages = 0;
let rotatePageStates = []; // { pageNum, currentDelta, isPortrait, selected }

function setupRotateDrop() {
  const dz = document.getElementById('rotate-drop-zone');
  const fi = document.getElementById('rotate-file-input');
  if (!dz || !fi) return;

  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
  });

  dz.addEventListener('dragleave', () => {
    dz.classList.remove('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
  });

  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      rotateHandleFile(e.dataTransfer.files[0]);
    }
  });

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });

  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      rotateHandleFile(e.target.files[0]);
    }
  });
}

async function rotateHandleFile(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Please select a valid PDF file.');
    return;
  }

  rotateFile = file;
  rotateRotatedBytes = null;
  rotateTotalPages = 0;
  rotatePageStates = [];

  try {
    rotateArrayBuffer = await file.arrayBuffer();

    const typedarray = new Uint8Array(rotateArrayBuffer.slice(0));
    rotatePdfJsDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
    rotateTotalPages = rotatePdfJsDoc.numPages;

    // Initialize page states
    for (let i = 1; i <= rotateTotalPages; i++) {
      rotatePageStates.push({
        pageNum: i,
        currentDelta: 0,
        isPortrait: true,
        selected: false
      });
    }

    // Populate header info
    document.getElementById('rotate-filename').textContent = file.name;
    document.getElementById('rotate-filesize').textContent = formatBytes(file.size);
    document.getElementById('rotate-pagecount').textContent = `${rotateTotalPages} page${rotateTotalPages > 1 ? 's' : ''}`;

    // Switch view
    document.getElementById('rotate-drop-zone').classList.add('hidden');
    document.getElementById('rotate-workspace-section').classList.remove('hidden');
    document.getElementById('rotate-result-section').classList.add('hidden');

    await rotateRenderPageGrid();
    rotateUpdateSelectionToolbar();
    rotateUpdateStatusHint();

    lucide.createIcons();
  } catch (err) {
    console.error('Error loading PDF in rotate tool:', err);
    alert('Failed to load this PDF: ' + (err.message || err));
  }
}

async function rotateRenderPageGrid() {
  const grid = document.getElementById('rotate-page-grid');
  if (!grid || !rotatePdfJsDoc) return;
  grid.innerHTML = '';

  for (let i = 0; i < rotateTotalPages; i++) {
    const pageNum = i + 1;
    const state = rotatePageStates[i];

    const card = document.createElement('div');
    card.className = 'group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between';
    card.id = `rotate-card-${i}`;

    // Card Header (Checkbox + Page Number + Angle Badge)
    const header = document.createElement('div');
    header.className = 'p-2.5 bg-gray-50/80 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between';
    header.innerHTML = `
      <label class="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-200" onclick="event.stopPropagation()">
        <input type="checkbox" id="rotate-cb-${i}" onchange="rotateTogglePageSelect(${i})" class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800 border-gray-300 dark:border-gray-600 w-3.5 h-3.5">
        <span>Page ${pageNum}</span>
      </label>
      <span id="rotate-badge-${i}" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition">0°</span>
    `;
    card.appendChild(header);

    // Canvas Preview Wrapper (with overflow hidden and square aspect)
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'p-3 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/40 min-h-[160px] relative overflow-hidden';
    
    const canvas = document.createElement('canvas');
    canvas.id = `rotate-canvas-${i}`;
    canvas.className = 'max-h-[140px] max-w-full object-contain rounded shadow-sm transition-transform duration-200';
    canvas.style.transform = `rotate(${state.currentDelta}deg)`;
    canvasWrap.appendChild(canvas);
    card.appendChild(canvasWrap);

    // Render Page on Canvas
    try {
      const page = await rotatePdfJsDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.35 });
      state.isPortrait = viewport.height >= viewport.width;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    } catch (renderErr) {
      console.warn(`Could not render preview for page ${pageNum}:`, renderErr);
    }

    // Controls Footer (Rotate Left, Rotate Right, Flip 180)
    const footer = document.createElement('div');
    footer.className = 'p-2 border-t border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 flex items-center justify-center gap-1.5';
    footer.innerHTML = `
      <button type="button" onclick="rotatePage(${i}, -90)" class="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition" title="Rotate Left (-90°)">
        <i data-lucide="rotate-ccw" style="width:14px;height:14px"></i>
      </button>
      <button type="button" onclick="rotatePage(${i}, 90)" class="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition" title="Rotate Right (+90°)">
        <i data-lucide="rotate-cw" style="width:14px;height:14px"></i>
      </button>
      <button type="button" onclick="rotatePage(${i}, 180)" class="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg text-gray-600 dark:text-gray-300 hover:text-purple-600 transition" title="Flip 180°">
        <i data-lucide="refresh-cw" style="width:14px;height:14px"></i>
      </button>
    `;
    card.appendChild(footer);

    grid.appendChild(card);
  }
}

function rotatePage(index, delta) {
  if (!rotatePageStates[index]) return;
  const state = rotatePageStates[index];
  
  // Normalize angle between 0, 90, 180, 270
  let newAngle = (state.currentDelta + delta) % 360;
  if (newAngle < 0) newAngle += 360;
  state.currentDelta = newAngle;

  // Update canvas transform
  const canvas = document.getElementById(`rotate-canvas-${index}`);
  if (canvas) {
    canvas.style.transform = `rotate(${state.currentDelta}deg)`;
  }

  // Update badge
  const badge = document.getElementById(`rotate-badge-${index}`);
  if (badge) {
    badge.textContent = `${state.currentDelta}°`;
    if (state.currentDelta === 0) {
      badge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition';
    } else {
      badge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition';
    }
  }

  rotateUpdateStatusHint();
}

function rotateAll(delta) {
  for (let i = 0; i < rotateTotalPages; i++) {
    rotatePage(i, delta);
  }
}

function rotateResetAll() {
  for (let i = 0; i < rotateTotalPages; i++) {
    const state = rotatePageStates[i];
    if (state) {
      state.currentDelta = 0;
      const canvas = document.getElementById(`rotate-canvas-${i}`);
      if (canvas) canvas.style.transform = 'rotate(0deg)';
      const badge = document.getElementById(`rotate-badge-${i}`);
      if (badge) {
        badge.textContent = '0°';
        badge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition';
      }
    }
  }
  rotateUpdateStatusHint();
}

function rotateSelected(delta) {
  for (let i = 0; i < rotateTotalPages; i++) {
    if (rotatePageStates[i]?.selected) {
      rotatePage(i, delta);
    }
  }
}

function rotateTogglePageSelect(index) {
  if (!rotatePageStates[index]) return;
  const cb = document.getElementById(`rotate-cb-${index}`);
  rotatePageStates[index].selected = cb ? cb.checked : false;
  rotateUpdateSelectionToolbar();
}

function rotateSelectFilter(type) {
  for (let i = 0; i < rotateTotalPages; i++) {
    const state = rotatePageStates[i];
    if (!state) continue;

    let shouldSelect = false;
    if (type === 'all') shouldSelect = true;
    else if (type === 'none') shouldSelect = false;
    else if (type === 'odd') shouldSelect = (state.pageNum % 2 !== 0);
    else if (type === 'even') shouldSelect = (state.pageNum % 2 === 0);
    else if (type === 'portrait') shouldSelect = state.isPortrait;
    else if (type === 'landscape') shouldSelect = !state.isPortrait;

    state.selected = shouldSelect;
    const cb = document.getElementById(`rotate-cb-${i}`);
    if (cb) cb.checked = shouldSelect;
  }
  rotateUpdateSelectionToolbar();
}

function rotateUpdateSelectionToolbar() {
  const selectedCount = rotatePageStates.filter(s => s.selected).length;
  const bar = document.getElementById('rotate-selected-bar');
  const countEl = document.getElementById('rotate-selected-count');

  if (bar && countEl) {
    if (selectedCount > 0) {
      bar.classList.remove('hidden');
      countEl.textContent = `${selectedCount} page${selectedCount > 1 ? 's' : ''} selected`;
    } else {
      bar.classList.add('hidden');
    }
  }
  lucide.createIcons();
}

function rotateUpdateStatusHint() {
  const changedCount = rotatePageStates.filter(s => s.currentDelta !== 0).length;
  const hint = document.getElementById('rotate-status-hint');
  const btnText = document.getElementById('rotate-apply-btn-text');

  if (hint && btnText) {
    if (changedCount > 0) {
      hint.textContent = `${changedCount} page${changedCount > 1 ? 's' : ''} modified. Click below to save with new orientations.`;
      btnText.textContent = `Apply & Save (${changedCount} page${changedCount > 1 ? 's' : ''} rotated)`;
    } else {
      hint.textContent = 'All pages currently at 0° (original orientation). Click arrows to rotate.';
      btnText.textContent = 'Apply Rotations & Save PDF';
    }
  }
}

async function rotateProcess() {
  if (!rotateArrayBuffer) {
    alert('Please upload a PDF file first.');
    return;
  }

  // Show progress modal
  const modal = document.getElementById('rotate-progress-modal');
  const bar = document.getElementById('rotate-progress-bar');
  const txt = document.getElementById('rotate-progress-text');
  modal.classList.remove('hidden');
  bar.style.width = '25%';
  txt.textContent = '25%';

  try {
    bar.style.width = '50%';
    txt.textContent = '50%';
    await new Promise(r => setTimeout(r, 100));

    // Load PDF with PDFLib
    const pdfDoc = await window.PDFLib.PDFDocument.load(rotateArrayBuffer.slice(0));
    const pages = pdfDoc.getPages();

    bar.style.width = '75%';
    txt.textContent = '75%';
    await new Promise(r => setTimeout(r, 100));

    // Apply rotation for each page
    let rotatedCount = 0;
    for (let i = 0; i < pages.length; i++) {
      const state = rotatePageStates[i];
      if (state && state.currentDelta !== 0) {
        rotatedCount++;
      }
      const currentAngle = pages[i].getRotation().angle || 0;
      const delta = state ? state.currentDelta : 0;
      let finalAngle = (currentAngle + delta) % 360;
      if (finalAngle < 0) finalAngle += 360;
      pages[i].setRotation(window.PDFLib.degrees(finalAngle));
    }

    rotateRotatedBytes = await pdfDoc.save();

    bar.style.width = '100%';
    txt.textContent = '100%';
    await new Promise(r => setTimeout(r, 150));

    modal.classList.add('hidden');

    // Populate result view
    const baseName = rotateFile.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_rotated.pdf`;
    document.getElementById('res-rotate-name').textContent = outName;
    document.getElementById('res-rotate-pages').textContent = `${pages.length} total pages (${rotatedCount} rotated)`;
    document.getElementById('res-rotate-size').textContent = formatBytes(rotateRotatedBytes.length);

    // Switch view
    document.getElementById('rotate-workspace-section').classList.add('hidden');
    document.getElementById('rotate-result-section').classList.remove('hidden');

    lucide.createIcons();
  } catch (err) {
    console.error('Error saving rotated PDF:', err);
    modal.classList.add('hidden');
    alert('Failed to rotate PDF: ' + (err.message || err));
  }
}

function rotateDownload() {
  if (!rotateRotatedBytes) return;
  const baseName = rotateFile ? rotateFile.name.replace(/\.[^/.]+$/, '') : 'document';
  const outName = `${baseName}_rotated.pdf`;

  const blob = new Blob([rotateRotatedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function rotateResetFile() {
  rotateFile = null;
  rotateArrayBuffer = null;
  rotateRotatedBytes = null;
  rotatePdfJsDoc = null;
  rotateTotalPages = 0;
  rotatePageStates = [];
  const fi = document.getElementById('rotate-file-input');
  if (fi) fi.value = '';
  const grid = document.getElementById('rotate-page-grid');
  if (grid) grid.innerHTML = '';
  document.getElementById('rotate-drop-zone')?.classList.remove('hidden');
  document.getElementById('rotate-workspace-section')?.classList.add('hidden');
  document.getElementById('rotate-result-section')?.classList.add('hidden');
  lucide.createIcons();
}

function rotateReset() {
  rotateResetFile();
}

// ===================== ADD / EDIT / REMOVE PAGE NUMBERS =====================
let pageNumFile = null;
let pageNumArrayBuffer = null;
let pageNumNumberedBytes = null;
let pageNumPdfJsDoc = null;
let pageNumTotalPages = 0;
let pageNumCurrentPreviewIndex = 1;
let pageNumPosition = 'bottom-center';
let pageNumIsBold = false;
let pageNumIsItalic = false;
let pageNumOperationMode = 'add'; // 'add' | 'replace' | 'remove'

function setupPageNumberDrop() {
  const dz = document.getElementById('pagenumber-drop-zone');
  const fi = document.getElementById('pagenumber-file-input');
  const colorPicker = document.getElementById('pagenumber-color');
  const eraseColorPicker = document.getElementById('pagenumber-erase-color');
  if (!dz || !fi) return;

  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
  });

  dz.addEventListener('dragleave', () => {
    dz.classList.remove('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
  });

  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('border-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      pagenumberHandleFile(e.dataTransfer.files[0]);
    }
  });

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });

  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      pagenumberHandleFile(e.target.files[0]);
    }
  });

  if (colorPicker) {
    colorPicker.addEventListener('input', e => {
      const hexEl = document.getElementById('pagenumber-color-hex');
      if (hexEl) hexEl.textContent = e.target.value;
      pagenumberUpdatePreview();
    });
  }

  if (eraseColorPicker) {
    eraseColorPicker.addEventListener('input', e => {
      const hexEl = document.getElementById('pagenumber-erase-color-hex');
      if (hexEl) hexEl.textContent = e.target.value;
      pagenumberUpdatePreview();
    });
  }
}

function pagenumberSetMode(mode) {
  pageNumOperationMode = mode;

  const btnAdd = document.getElementById('pnum-mode-add');
  const btnReplace = document.getElementById('pnum-mode-replace');
  const btnRemove = document.getElementById('pnum-mode-remove');
  const eraserCard = document.getElementById('pagenumber-eraser-card');
  const posCard = document.getElementById('pagenumber-position-card');
  const formatCard = document.getElementById('pagenumber-format-card');
  const typoCard = document.getElementById('pagenumber-typography-card');
  const applyBtn = document.getElementById('pagenumber-apply-btn');
  const applyBtnText = document.getElementById('pagenumber-apply-btn-text');

  // Reset tab button states
  [btnAdd, btnReplace, btnRemove].forEach(btn => {
    if (btn) btn.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50';
  });

  if (mode === 'add') {
    if (btnAdd) btnAdd.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm';
    eraserCard?.classList.add('hidden');
    posCard?.classList.remove('hidden');
    formatCard?.classList.remove('hidden');
    typoCard?.classList.remove('hidden');
    if (applyBtn) applyBtn.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
    if (applyBtnText) applyBtnText.textContent = 'Insert Page Numbers & Save PDF';
  } else if (mode === 'replace') {
    if (btnReplace) btnReplace.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm';
    eraserCard?.classList.remove('hidden');
    posCard?.classList.remove('hidden');
    formatCard?.classList.remove('hidden');
    typoCard?.classList.remove('hidden');
    if (applyBtn) applyBtn.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
    if (applyBtnText) applyBtnText.textContent = 'Replace Page Numbers & Save PDF';
  } else if (mode === 'remove') {
    if (btnRemove) btnRemove.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm';
    eraserCard?.classList.remove('hidden');
    posCard?.classList.add('hidden');
    formatCard?.classList.remove('hidden'); // keep page range options
    typoCard?.classList.add('hidden');
    if (applyBtn) applyBtn.style.background = 'linear-gradient(135deg, #d97706, #b45309)';
    if (applyBtnText) applyBtnText.textContent = 'Erase & Remove Existing Page Numbers';
  }

  pagenumberUpdatePreview();
  lucide.createIcons();
}

function pagenumberToggleBold() {
  pageNumIsBold = !pageNumIsBold;
  const btn = document.getElementById('pagenumber-btn-bold');
  if (btn) {
    if (pageNumIsBold) {
      btn.className = 'w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition border border-indigo-500 bg-indigo-600 text-white shadow-sm';
    } else {
      btn.className = 'w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition border border-transparent text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600';
    }
  }
  pagenumberUpdatePreview();
}

function pagenumberToggleItalic() {
  pageNumIsItalic = !pageNumIsItalic;
  const btn = document.getElementById('pagenumber-btn-italic');
  if (btn) {
    if (pageNumIsItalic) {
      btn.className = 'w-7 h-7 rounded-lg italic font-serif text-xs flex items-center justify-center transition border border-indigo-500 bg-indigo-600 text-white shadow-sm';
    } else {
      btn.className = 'w-7 h-7 rounded-lg italic font-serif text-xs flex items-center justify-center transition border border-transparent text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600';
    }
  }
  pagenumberUpdatePreview();
}

const PAGE_NUMBER_FONT_DEFS = {
  'Helvetica': {
    isStandard: true,
    cssFamily: 'Helvetica, Arial, sans-serif'
  },
  'TimesRoman': {
    isStandard: true,
    cssFamily: '"Times New Roman", Times, serif'
  },
  'Courier': {
    isStandard: true,
    cssFamily: '"Courier New", Courier, monospace'
  },
  'Roboto': {
    cssFamily: '"Roboto", sans-serif',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-normal.ttf',
    italic: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-italic.ttf',
    boldItalic: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-italic.ttf'
  },
  'Poppins': {
    cssFamily: '"Poppins", sans-serif',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf'
  },
  'Montserrat': {
    cssFamily: '"Montserrat", sans-serif',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-700-normal.ttf',
    italic: 'https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-400-italic.ttf'
  },
  'OpenSans': {
    cssFamily: '"Open Sans", sans-serif',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-normal.ttf',
    italic: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-italic.ttf'
  },
  'Playfair': {
    cssFamily: '"Playfair Display", serif',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf',
    italic: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-italic.ttf'
  },
  'Merriweather': {
    cssFamily: '"Merriweather", serif',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/merriweather@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/merriweather@latest/latin-700-normal.ttf',
    italic: 'https://cdn.jsdelivr.net/fontsource/fonts/merriweather@latest/latin-400-italic.ttf'
  },
  'Lora': {
    cssFamily: '"Lora", serif',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf',
    italic: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-italic.ttf'
  },
  'FiraCode': {
    cssFamily: '"Fira Code", monospace',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/fira-code@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/fira-code@latest/latin-700-normal.ttf'
  },
  'DancingScript': {
    cssFamily: '"Dancing Script", cursive',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/dancing-script@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/dancing-script@latest/latin-700-normal.ttf'
  },
  'Caveat': {
    cssFamily: '"Caveat", cursive',
    regular: 'https://cdn.jsdelivr.net/fontsource/fonts/caveat@latest/latin-400-normal.ttf',
    bold: 'https://cdn.jsdelivr.net/fontsource/fonts/caveat@latest/latin-700-normal.ttf'
  }
};

const pageNumFontBufferCache = new Map();

async function pagenumberFetchFontBytes(url) {
  if (pageNumFontBufferCache.has(url)) {
    return pageNumFontBufferCache.get(url);
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Could not fetch font: ${resp.statusText}`);
  const buf = await resp.arrayBuffer();
  pageNumFontBufferCache.set(url, buf);
  return buf;
}

async function pagenumberEmbedFont(pdfDoc, fontFamName, isBold, isItalic) {
  if (window.fontkit && typeof pdfDoc.registerFontkit === 'function') {
    try {
      pdfDoc.registerFontkit(window.fontkit);
    } catch (e) {
      // Already registered or ignore
    }
  }

  const def = PAGE_NUMBER_FONT_DEFS[fontFamName] || PAGE_NUMBER_FONT_DEFS['Helvetica'];

  if (def.isStandard) {
    const SF = window.PDFLib.StandardFonts;
    let stdFont = SF.Helvetica;
    if (fontFamName === 'TimesRoman') {
      if (isBold && isItalic) stdFont = SF.TimesRomanBoldItalic;
      else if (isBold) stdFont = SF.TimesRomanBold;
      else if (isItalic) stdFont = SF.TimesRomanItalic;
      else stdFont = SF.TimesRoman;
    } else if (fontFamName === 'Courier') {
      if (isBold && isItalic) stdFont = SF.CourierBoldOblique;
      else if (isBold) stdFont = SF.CourierBold;
      else if (isItalic) stdFont = SF.CourierOblique;
      else stdFont = SF.Courier;
    } else {
      if (isBold && isItalic) stdFont = SF.HelveticaBoldOblique;
      else if (isBold) stdFont = SF.HelveticaBold;
      else if (isItalic) stdFont = SF.HelveticaOblique;
      else stdFont = SF.Helvetica;
    }
    return await pdfDoc.embedFont(stdFont);
  }

  // Custom TTF Web Font
  try {
    let fontUrl = def.regular;
    if (isBold && isItalic && def.boldItalic) fontUrl = def.boldItalic;
    else if (isBold && def.bold) fontUrl = def.bold;
    else if (isItalic && def.italic) fontUrl = def.italic;
    else fontUrl = def.regular;

    const fontBytes = await pagenumberFetchFontBytes(fontUrl);
    return await pdfDoc.embedFont(fontBytes);
  } catch (fontErr) {
    console.warn(`Could not embed custom font ${fontFamName}, falling back to standard Helvetica:`, fontErr);
    const SF = window.PDFLib.StandardFonts;
    const stdFont = isBold ? SF.HelveticaBold : (isItalic ? SF.HelveticaOblique : SF.Helvetica);
    return await pdfDoc.embedFont(stdFont);
  }
}

async function pagenumberHandleFile(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Please select a valid PDF file.');
    return;
  }

  pageNumFile = file;
  pageNumNumberedBytes = null;
  pageNumTotalPages = 0;
  pageNumCurrentPreviewIndex = 1;

  try {
    pageNumArrayBuffer = await file.arrayBuffer();

    const typedarray = new Uint8Array(pageNumArrayBuffer.slice(0));
    pageNumPdfJsDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
    pageNumTotalPages = pageNumPdfJsDoc.numPages;

    // Populate header info
    document.getElementById('pagenumber-filename').textContent = file.name;
    document.getElementById('pagenumber-filesize').textContent = formatBytes(file.size);
    document.getElementById('pagenumber-pagecount').textContent = `${pageNumTotalPages} page${pageNumTotalPages > 1 ? 's' : ''}`;

    // Switch view
    document.getElementById('pagenumber-drop-zone').classList.add('hidden');
    document.getElementById('pagenumber-workspace-section').classList.remove('hidden');
    document.getElementById('pagenumber-result-section').classList.add('hidden');

    await pagenumberRenderPreviewPage(1);
    pagenumberUpdatePreview();

    lucide.createIcons();
  } catch (err) {
    console.error('Error loading PDF in page number tool:', err);
    alert('Failed to load this PDF: ' + (err.message || err));
  }
}

function pagenumberSetPos(pos) {
  pageNumPosition = pos;

  const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
  positions.forEach(p => {
    const btn = document.getElementById(`pos-${p}`);
    if (btn) {
      if (p === pos) {
        btn.className = 'pos-btn p-2 rounded-lg text-[11px] font-bold border transition text-center border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300';
      } else {
        btn.className = 'pos-btn p-2 rounded-lg text-[11px] font-semibold border transition text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-indigo-400';
      }
    }
  });

  pagenumberUpdatePreview();
}

function pagenumberToggleRangeInputs() {
  const rangeType = document.querySelector('input[name="pagenumber-range-type"]:checked')?.value || 'all';
  const customWrap = document.getElementById('pagenumber-range-custom-wrap');
  if (customWrap) {
    if (rangeType === 'custom') {
      customWrap.classList.remove('hidden');
    } else {
      customWrap.classList.add('hidden');
    }
  }
  pagenumberUpdatePreview();
}

async function pagenumberRenderPreviewPage(pageNum) {
  if (!pageNumPdfJsDoc) return;
  if (pageNum < 1) pageNum = 1;
  if (pageNum > pageNumTotalPages) pageNum = pageNumTotalPages;
  pageNumCurrentPreviewIndex = pageNum;

  const indicator = document.getElementById('pagenumber-preview-page-indicator');
  if (indicator) {
    indicator.textContent = `Page ${pageNum} / ${pageNumTotalPages}`;
  }

  const canvas = document.getElementById('pagenumber-preview-canvas');
  if (!canvas) return;

  try {
    const page = await pageNumPdfJsDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    pagenumberUpdatePreview();
  } catch (err) {
    console.warn('Error rendering preview canvas:', err);
  }
}

function pagenumberPrevPreviewPage() {
  if (pageNumCurrentPreviewIndex > 1) {
    pagenumberRenderPreviewPage(pageNumCurrentPreviewIndex - 1);
  }
}

function pagenumberNextPreviewPage() {
  if (pageNumCurrentPreviewIndex < pageNumTotalPages) {
    pagenumberRenderPreviewPage(pageNumCurrentPreviewIndex + 1);
  }
}

function pagenumberGetFormattedText(pageIndex, totalPages) {
  const formatStyle = document.getElementById('pagenumber-format')?.value || 'page_of';
  const startNum = parseInt(document.getElementById('pagenumber-start-num')?.value || '1', 10);
  const n = pageIndex + startNum;

  let text = '';
  switch (formatStyle) {
    case 'num':
      text = `${n}`;
      break;
    case 'page_of':
      text = `Page ${n} of ${totalPages}`;
      break;
    case 'slash':
      text = `${n} / ${totalPages}`;
      break;
    case 'page_num':
      text = `Page ${n}`;
      break;
    case 'hyphen':
      text = `- ${n} -`;
      break;
    case 'custom':
      const pattern = document.getElementById('pagenumber-custom-pattern')?.value || '{n}';
      text = pattern.replace(/{n}/g, n).replace(/{total}/g, totalPages);
      break;
    default:
      text = `Page ${n} of ${totalPages}`;
  }
  return text;
}

function pagenumberIsPageIncluded(pageIndex, totalPages) {
  const rangeType = document.querySelector('input[name="pagenumber-range-type"]:checked')?.value || 'all';
  if (rangeType === 'all') return true;
  if (rangeType === 'skip-first') return pageIndex > 0;
  if (rangeType === 'custom') {
    const customStr = document.getElementById('pagenumber-custom-range')?.value || '';
    const validPages = pagenumberParseRange(customStr, totalPages);
    return validPages.has(pageIndex);
  }
  return true;
}

function pagenumberParseRange(rangeStr, totalPages) {
  const set = new Set();
  if (!rangeStr || !rangeStr.trim()) {
    for (let i = 0; i < totalPages; i++) set.add(i);
    return set;
  }
  const parts = rangeStr.split(',');
  parts.forEach(part => {
    const p = part.trim();
    if (p.includes('-')) {
      const [start, end] = p.split('-').map(x => parseInt(x.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          set.add(i - 1);
        }
      }
    } else {
      const num = parseInt(p, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        set.add(num - 1);
      }
    }
  });
  return set;
}

function pagenumberUpdatePreview() {
  const formatStyle = document.getElementById('pagenumber-format')?.value || 'page_of';
  const customWrap = document.getElementById('pagenumber-custom-wrap');
  if (customWrap) {
    if (formatStyle === 'custom') customWrap.classList.remove('hidden');
    else customWrap.classList.add('hidden');
  }

  const overlay = document.getElementById('pagenumber-overlay-text');
  const canvas = document.getElementById('pagenumber-preview-canvas');
  const eraseTop = document.getElementById('pagenumber-preview-erase-top');
  const eraseBottom = document.getElementById('pagenumber-preview-erase-bottom');
  if (!overlay || !canvas) return;

  const pageIdx = pageNumCurrentPreviewIndex - 1;
  const isIncluded = pagenumberIsPageIncluded(pageIdx, pageNumTotalPages);

  // 1. Eraser Preview Overlay (Visual mask band)
  if (pageNumOperationMode === 'replace' || pageNumOperationMode === 'remove') {
    const eraseZone = document.getElementById('pagenumber-erase-zone')?.value || 'bottom';
    const eraseHeightPt = parseInt(document.getElementById('pagenumber-erase-height')?.value || '45', 10);
    const eraseHeightPx = Math.round(eraseHeightPt * 0.38);

    if (eraseTop) {
      if ((eraseZone === 'top' || eraseZone === 'both') && isIncluded) {
        eraseTop.classList.remove('hidden');
        eraseTop.style.height = `${eraseHeightPx}px`;
      } else {
        eraseTop.classList.add('hidden');
      }
    }

    if (eraseBottom) {
      if ((eraseZone === 'bottom' || eraseZone === 'both') && isIncluded) {
        eraseBottom.classList.remove('hidden');
        eraseBottom.style.height = `${eraseHeightPx}px`;
      } else {
        eraseBottom.classList.add('hidden');
      }
    }
  } else {
    eraseTop?.classList.add('hidden');
    eraseBottom?.classList.add('hidden');
  }

  // 2. Page Number Text Overlay
  if (pageNumOperationMode === 'remove') {
    overlay.classList.add('hidden');
    return;
  } else {
    overlay.classList.remove('hidden');
  }

  if (!isIncluded) {
    overlay.textContent = '(No number on this page)';
    overlay.style.opacity = '0.35';
    overlay.style.fontStyle = 'italic';
  } else {
    overlay.textContent = pagenumberGetFormattedText(pageIdx, pageNumTotalPages);
    overlay.style.opacity = '1';
    overlay.style.fontStyle = pageNumIsItalic ? 'italic' : 'normal';
  }

  // Apply Typography
  const fontFam = document.getElementById('pagenumber-font')?.value || 'Helvetica';
  const fontDef = PAGE_NUMBER_FONT_DEFS[fontFam] || PAGE_NUMBER_FONT_DEFS['Helvetica'];
  const fontSize = parseInt(document.getElementById('pagenumber-size')?.value || '11', 10);
  const color = document.getElementById('pagenumber-color')?.value || '#333333';
  const marginPt = parseInt(document.getElementById('pagenumber-margin')?.value || '36', 10);

  overlay.style.color = color;
  overlay.style.fontWeight = pageNumIsBold ? 'bold' : 'normal';
  if (isIncluded) {
    overlay.style.fontStyle = pageNumIsItalic ? 'italic' : 'normal';
  }
  overlay.style.fontFamily = fontDef.cssFamily;
  
  // Scale font size proportionally for preview canvas (roughly 50% scale factor)
  const scaledPx = Math.max(6, Math.round(fontSize * 0.7));
  overlay.style.fontSize = `${scaledPx}px`;

  // Apply Position & Offsets
  const marginPx = Math.round(marginPt * 0.35); // scale to preview
  overlay.style.top = '';
  overlay.style.bottom = '';
  overlay.style.left = '';
  overlay.style.right = '';
  overlay.style.transform = '';

  switch (pageNumPosition) {
    case 'top-left':
      overlay.style.top = `${marginPx}px`;
      overlay.style.left = `${marginPx}px`;
      break;
    case 'top-center':
      overlay.style.top = `${marginPx}px`;
      overlay.style.left = '50%';
      overlay.style.transform = 'translateX(-50%)';
      break;
    case 'top-right':
      overlay.style.top = `${marginPx}px`;
      overlay.style.right = `${marginPx}px`;
      break;
    case 'bottom-left':
      overlay.style.bottom = `${marginPx}px`;
      overlay.style.left = `${marginPx}px`;
      break;
    case 'bottom-center':
      overlay.style.bottom = `${marginPx}px`;
      overlay.style.left = '50%';
      overlay.style.transform = 'translateX(-50%)';
      break;
    case 'bottom-right':
      overlay.style.bottom = `${marginPx}px`;
      overlay.style.right = `${marginPx}px`;
      break;
  }
}

async function pagenumberProcess() {
  if (!pageNumArrayBuffer) {
    alert('Please upload a PDF file first.');
    return;
  }

  // Show progress modal
  const modal = document.getElementById('pagenumber-progress-modal');
  const bar = document.getElementById('pagenumber-progress-bar');
  const txt = document.getElementById('pagenumber-progress-text');
  const modalTitle = document.getElementById('pagenumber-modal-title');
  const modalSub = document.getElementById('pagenumber-modal-sub');
  
  modal.classList.remove('hidden');
  bar.style.width = '20%';
  txt.textContent = '20%';

  if (pageNumOperationMode === 'remove') {
    if (modalTitle) modalTitle.textContent = 'Erasing Page Numbers...';
    if (modalSub) modalSub.textContent = 'Applying clean background masks to remove existing numbers';
  } else if (pageNumOperationMode === 'replace') {
    if (modalTitle) modalTitle.textContent = 'Replacing Page Numbers...';
    if (modalSub) modalSub.textContent = 'Erasing old headers/footers and applying new typography';
  } else {
    if (modalTitle) modalTitle.textContent = 'Adding Page Numbers...';
    if (modalSub) modalSub.textContent = 'Calculating page coordinates and embedding font typography';
  }

  try {
    bar.style.width = '40%';
    txt.textContent = '40%';
    await new Promise(r => setTimeout(r, 100));

    // Load PDF with PDFLib
    const pdfDoc = await window.PDFLib.PDFDocument.load(pageNumArrayBuffer.slice(0));
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    // 1. Prepare Font (if adding or replacing)
    let font = null;
    let fontSize = 11;
    let margin = 36;
    let textColor = window.PDFLib.rgb(0.2, 0.2, 0.2);

    if (pageNumOperationMode === 'add' || pageNumOperationMode === 'replace') {
      const fontFamName = document.getElementById('pagenumber-font')?.value || 'Helvetica';
      font = await pagenumberEmbedFont(pdfDoc, fontFamName, pageNumIsBold, pageNumIsItalic);

      fontSize = parseInt(document.getElementById('pagenumber-size')?.value || '11', 10);
      margin = parseInt(document.getElementById('pagenumber-margin')?.value || '36', 10);
      const hexColor = document.getElementById('pagenumber-color')?.value || '#333333';

      let r = 0.2, g = 0.2, b = 0.2;
      if (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hexColor)) {
        const parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        r = parseInt(parts[1], 16) / 255;
        g = parseInt(parts[2], 16) / 255;
        b = parseInt(parts[3], 16) / 255;
      }
      textColor = window.PDFLib.rgb(r, g, b);
    }

    // 2. Prepare Eraser Mask Options (if replacing or removing)
    const eraseZone = document.getElementById('pagenumber-erase-zone')?.value || 'bottom';
    const eraseHeightPt = parseInt(document.getElementById('pagenumber-erase-height')?.value || '45', 10);
    const eraseHexColor = document.getElementById('pagenumber-erase-color')?.value || '#ffffff';

    let mr = 1, mg = 1, mb = 1;
    if (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(eraseHexColor)) {
      const parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(eraseHexColor);
      mr = parseInt(parts[1], 16) / 255;
      mg = parseInt(parts[2], 16) / 255;
      mb = parseInt(parts[3], 16) / 255;
    }
    const maskColor = window.PDFLib.rgb(mr, mg, mb);

    bar.style.width = '65%';
    txt.textContent = '65%';
    await new Promise(r => setTimeout(r, 100));

    let processedCount = 0;

    for (let i = 0; i < totalPages; i++) {
      if (!pagenumberIsPageIncluded(i, totalPages)) continue;

      processedCount++;
      const page = pages[i];
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle || 0;

      // STEP A: Clean / Erase Existing Page Numbers (if Replace or Remove mode)
      if (pageNumOperationMode === 'replace' || pageNumOperationMode === 'remove') {
        if (eraseZone === 'bottom' || eraseZone === 'both') {
          // Bottom Footer mask
          page.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: eraseHeightPt,
            color: maskColor,
            opacity: 1
          });
        }
        if (eraseZone === 'top' || eraseZone === 'both') {
          // Top Header mask
          page.drawRectangle({
            x: 0,
            y: height - eraseHeightPt,
            width: width,
            height: eraseHeightPt,
            color: maskColor,
            opacity: 1
          });
        }
      }

      // STEP B: Stamp New Page Numbers (if Add or Replace mode)
      if (pageNumOperationMode === 'add' || pageNumOperationMode === 'replace') {
        const text = pagenumberGetFormattedText(i, totalPages);
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = 0, y = 0;

        if (rotation === 0) {
          switch (pageNumPosition) {
            case 'top-left':
              x = margin;
              y = height - margin - textHeight;
              break;
            case 'top-center':
              x = (width - textWidth) / 2;
              y = height - margin - textHeight;
              break;
            case 'top-right':
              x = width - margin - textWidth;
              y = height - margin - textHeight;
              break;
            case 'bottom-left':
              x = margin;
              y = margin;
              break;
            case 'bottom-center':
              x = (width - textWidth) / 2;
              y = margin;
              break;
            case 'bottom-right':
              x = width - margin - textWidth;
              y = margin;
              break;
          }

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: textColor
          });
        } else if (rotation === 90) {
          switch (pageNumPosition) {
            case 'top-left':
              x = margin + textHeight;
              y = height - margin - textWidth;
              break;
            case 'top-center':
              x = margin + textHeight;
              y = (height - textWidth) / 2;
              break;
            case 'top-right':
              x = margin + textHeight;
              y = margin;
              break;
            case 'bottom-left':
              x = width - margin;
              y = height - margin - textWidth;
              break;
            case 'bottom-center':
              x = width - margin;
              y = (height - textWidth) / 2;
              break;
            case 'bottom-right':
              x = width - margin;
              y = margin;
              break;
          }

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: textColor,
            rotate: window.PDFLib.degrees(90)
          });
        } else if (rotation === 180) {
          switch (pageNumPosition) {
            case 'bottom-center':
              x = (width + textWidth) / 2;
              y = height - margin;
              break;
            case 'bottom-right':
              x = margin + textWidth;
              y = height - margin;
              break;
            case 'bottom-left':
              x = width - margin;
              y = height - margin;
              break;
            case 'top-center':
              x = (width + textWidth) / 2;
              y = margin + textHeight;
              break;
            case 'top-right':
              x = margin + textWidth;
              y = margin + textHeight;
              break;
            case 'top-left':
              x = width - margin;
              y = margin + textHeight;
              break;
          }

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: textColor,
            rotate: window.PDFLib.degrees(180)
          });
        } else {
          page.drawText(text, {
            x: margin,
            y: margin,
            size: fontSize,
            font,
            color: textColor
          });
        }
      }
    }

    pageNumNumberedBytes = await pdfDoc.save();

    bar.style.width = '100%';
    txt.textContent = '100%';
    await new Promise(r => setTimeout(r, 150));

    modal.classList.add('hidden');

    // Populate result view
    const baseName = pageNumFile.name.replace(/\.[^/.]+$/, '');
    let outSuffix = '_numbered.pdf';
    let summaryText = `${processedCount} of ${totalPages} pages numbered`;

    if (pageNumOperationMode === 'replace') {
      outSuffix = '_edited_numbers.pdf';
      summaryText = `${processedCount} of ${totalPages} pages replaced & updated`;
    } else if (pageNumOperationMode === 'remove') {
      outSuffix = '_numbers_removed.pdf';
      summaryText = `${processedCount} of ${totalPages} pages cleaned & stripped`;
    }

    const outName = `${baseName}${outSuffix}`;
    document.getElementById('res-pagenumber-name').textContent = outName;
    document.getElementById('res-pagenumber-count').textContent = summaryText;
    document.getElementById('res-pagenumber-size').textContent = formatBytes(pageNumNumberedBytes.length);

    // Switch view
    document.getElementById('pagenumber-workspace-section').classList.add('hidden');
    document.getElementById('pagenumber-result-section').classList.remove('hidden');

    lucide.createIcons();
  } catch (err) {
    console.error('Error processing PDF in page number tool:', err);
    modal.classList.add('hidden');
    alert('Failed to process PDF: ' + (err.message || err));
  }
}

function pagenumberDownload() {
  if (!pageNumNumberedBytes) return;
  const baseName = pageNumFile ? pageNumFile.name.replace(/\.[^/.]+$/, '') : 'document';
  let outSuffix = '_numbered.pdf';
  if (pageNumOperationMode === 'replace') outSuffix = '_edited_numbers.pdf';
  else if (pageNumOperationMode === 'remove') outSuffix = '_numbers_removed.pdf';

  const outName = `${baseName}${outSuffix}`;

  const blob = new Blob([pageNumNumberedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function pagenumberResetFile() {
  pageNumFile = null;
  pageNumArrayBuffer = null;
  pageNumNumberedBytes = null;
  pageNumPdfJsDoc = null;
  pageNumTotalPages = 0;
  pageNumCurrentPreviewIndex = 1;
  pageNumIsBold = false;
  pageNumIsItalic = false;
  pageNumOperationMode = 'add';

  const btnB = document.getElementById('pagenumber-btn-bold');
  if (btnB) btnB.className = 'w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition border border-transparent text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600';
  const btnI = document.getElementById('pagenumber-btn-italic');
  if (btnI) btnI.className = 'w-7 h-7 rounded-lg italic font-serif text-xs flex items-center justify-center transition border border-transparent text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600';

  const eraseTop = document.getElementById('pagenumber-preview-erase-top');
  const eraseBottom = document.getElementById('pagenumber-preview-erase-bottom');
  eraseTop?.classList.add('hidden');
  eraseBottom?.classList.add('hidden');

  const fi = document.getElementById('pagenumber-file-input');
  if (fi) fi.value = '';
  document.getElementById('pagenumber-drop-zone')?.classList.remove('hidden');
  document.getElementById('pagenumber-workspace-section')?.classList.add('hidden');
  document.getElementById('pagenumber-result-section')?.classList.add('hidden');
  pagenumberSetMode('add');
  lucide.createIcons();
}

function pagenumberReset() {
  pagenumberResetFile();
}


// ===================== PDF TO WORD (.DOCX) =====================
let pdfToWordFile = null;
let pdfToWordArrayBuffer = null;
let pdfToWordDocxBlob = null;
let pdfToWordPdfJsDoc = null;
let pdfToWordTotalPages = 0;
let pdfToWordCurrentPreviewIndex = 1;
let pdfToWordExtractedPages = []; // [{ pageNum, paragraphs: [], text: '', wordCount, charCount }]

function setupPdfToWordDrop() {
  const dz = document.getElementById('pdftoword-drop-zone');
  const fi = document.getElementById('pdftoword-file-input');
  if (!dz || !fi) return;

  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('border-blue-500', 'bg-blue-50/40', 'dark:bg-blue-950/30');
  });

  dz.addEventListener('dragleave', () => {
    dz.classList.remove('border-blue-500', 'bg-blue-50/40', 'dark:bg-blue-950/30');
  });

  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('border-blue-500', 'bg-blue-50/40', 'dark:bg-blue-950/30');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      pdftowordHandleFile(e.dataTransfer.files[0]);
    }
  });

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });

  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      pdftowordHandleFile(e.target.files[0]);
    }
  });
}

function pdftowordToggleRangeInputs() {
  const rangeType = document.querySelector('input[name="pdftoword-range-type"]:checked')?.value || 'all';
  const customWrap = document.getElementById('pdftoword-range-custom-wrap');
  if (customWrap) {
    if (rangeType === 'custom') customWrap.classList.remove('hidden');
    else customWrap.classList.add('hidden');
  }
}

function pdftowordEscapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function pdftowordHandleFile(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Please select a valid PDF file.');
    return;
  }

  pdfToWordFile = file;
  pdfToWordDocxBlob = null;
  pdfToWordTotalPages = 0;
  pdfToWordCurrentPreviewIndex = 1;
  pdfToWordExtractedPages = [];

  try {
    pdfToWordArrayBuffer = await file.arrayBuffer();

    const typedarray = new Uint8Array(pdfToWordArrayBuffer.slice(0));
    pdfToWordPdfJsDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
    pdfToWordTotalPages = pdfToWordPdfJsDoc.numPages;

    // Set file info in header
    document.getElementById('pdftoword-filename').textContent = file.name;
    document.getElementById('pdftoword-filesize').textContent = formatBytes(file.size);
    document.getElementById('pdftoword-pagecount').textContent = `${pdfToWordTotalPages} page${pdfToWordTotalPages > 1 ? 's' : ''}`;

    // Switch view
    document.getElementById('pdftoword-drop-zone').classList.add('hidden');
    document.getElementById('pdftoword-workspace-section').classList.remove('hidden');
    document.getElementById('pdftoword-result-section').classList.add('hidden');

    // Extract first page immediately for live preview
    await pdftowordExtractPage(1);
    pdftowordRenderDocMockup(1);

    lucide.createIcons();
  } catch (err) {
    console.error('Error loading PDF in PDF to Word tool:', err);
    alert('Failed to load this PDF: ' + (err.message || err));
  }
}

async function pdftowordExtractPage(pageNum) {
  if (!pdfToWordPdfJsDoc) return null;
  if (pdfToWordExtractedPages[pageNum - 1]) {
    return pdfToWordExtractedPages[pageNum - 1];
  }

  try {
    const page = await pdfToWordPdfJsDoc.getPage(pageNum);
    const textContent = await page.getTextContent({ normalizeWhitespace: true });
    const items = textContent.items || [];

    if (items.length === 0) {
      const emptyPage = {
        pageNum,
        paragraphs: [{ type: 'paragraph', text: '(Blank or Scanned Image Page)', runs: [{ text: '(Blank or Scanned Image Page)' }] }],
        fullText: '',
        wordCount: 0,
        charCount: 0
      };
      pdfToWordExtractedPages[pageNum - 1] = emptyPage;
      return emptyPage;
    }

    // Cluster text items by Y coordinate into lines
    const lineMap = new Map(); // rounded Y -> array of items
    const fontSizes = [];

    items.forEach(it => {
      if (!it.str || !it.str.trim()) return;
      const y = Math.round(it.transform[5]);
      const x = Math.round(it.transform[4]);
      const fontSize = Math.abs(Math.round(it.transform[0] || it.height || 11));
      const fontName = (it.fontName || '').toLowerCase();
      const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy') || fontName.includes('700') || fontName.includes('800') || fontName.includes('900');
      const isItalic = fontName.includes('italic') || fontName.includes('oblique');

      fontSizes.push(fontSize);

      // Find closest existing line within 4 points
      let matchedY = null;
      for (const existingY of lineMap.keys()) {
        if (Math.abs(existingY - y) <= 4) {
          matchedY = existingY;
          break;
        }
      }

      const targetY = matchedY !== null ? matchedY : y;
      if (!lineMap.has(targetY)) {
        lineMap.set(targetY, []);
      }
      lineMap.get(targetY).push({
        x,
        y,
        str: it.str,
        fontSize,
        isBold,
        isItalic
      });
    });

    // Compute median font size for body text baseline
    fontSizes.sort((a, b) => a - b);
    const medianFontSize = fontSizes.length > 0 ? fontSizes[Math.floor(fontSizes.length / 2)] : 11;

    // Sort lines from top of page to bottom (Y descending)
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const rawLines = [];

    sortedYs.forEach(y => {
      const lineItems = lineMap.get(y);
      lineItems.sort((a, b) => a.x - b.x);

      // Combine item runs on the same line
      let lineText = '';
      const runs = [];
      let maxFontSize = 0;
      let isLineBold = true;

      lineItems.forEach((it, idx) => {
        if (idx > 0 && it.x > lineItems[idx - 1].x + 5) {
          lineText += ' ';
        }
        lineText += it.str;
        runs.push({
          text: it.str,
          bold: it.isBold,
          italic: it.isItalic,
          fontSize: it.fontSize
        });
        if (it.fontSize > maxFontSize) maxFontSize = it.fontSize;
        if (!it.isBold) isLineBold = false;
      });

      rawLines.push({
        y,
        text: lineText.trim(),
        runs,
        maxFontSize,
        isBold: isLineBold
      });
    });

    // De-hyphenate line endings if enabled
    const dehyphen = document.getElementById('pdftoword-opt-dehyphen')?.checked ?? true;
    if (dehyphen) {
      for (let i = 0; i < rawLines.length - 1; i++) {
        const curr = rawLines[i];
        const next = rawLines[i + 1];
        if (curr.text.endsWith('-') && next.text.length > 0) {
          curr.text = curr.text.slice(0, -1);
          if (curr.runs.length > 0) {
            const lastRun = curr.runs[curr.runs.length - 1];
            if (lastRun.text.endsWith('-')) {
              lastRun.text = lastRun.text.slice(0, -1);
            }
          }
        }
      }
    }

    // Group lines into semantic paragraphs, headings, and lists
    const paragraphs = [];
    let currentPara = null;

    rawLines.forEach((line, idx) => {
      if (!line.text) return;

      const isBullet = /^[\u2022\u25cf\u25cb\u25a0\-\*]\s+/.test(line.text) || /^\d+[\.\)]\s+/.test(line.text);
      const isHeading1 = line.maxFontSize >= medianFontSize * 1.35 || (line.isBold && line.maxFontSize >= 16);
      const isHeading2 = !isHeading1 && (line.maxFontSize >= medianFontSize * 1.18 || (line.isBold && line.maxFontSize >= 13));

      let paraType = 'paragraph';
      if (isHeading1) paraType = 'heading1';
      else if (isHeading2) paraType = 'heading2';
      else if (isBullet) paraType = 'bullet';

      // Check vertical gap from previous line
      const prevLine = idx > 0 ? rawLines[idx - 1] : null;
      const verticalGap = prevLine ? prevLine.y - line.y : 0;
      const isNewBlock = !prevLine || verticalGap > (line.maxFontSize * 1.6) || paraType !== 'paragraph' || (currentPara && currentPara.type !== 'paragraph');

      if (isNewBlock || !currentPara) {
        if (currentPara) paragraphs.push(currentPara);
        currentPara = {
          type: paraType,
          text: line.text,
          runs: [...line.runs]
        };
      } else {
        // Append to current paragraph
        currentPara.text += ' ' + line.text;
        if (currentPara.runs.length > 0) {
          currentPara.runs.push({ text: ' ' });
        }
        currentPara.runs.push(...line.runs);
      }
    });

    if (currentPara) paragraphs.push(currentPara);

    // Compute stats
    let fullText = paragraphs.map(p => p.text).join('\n\n');
    const words = fullText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = fullText.length;

    const pageData = {
      pageNum,
      paragraphs,
      fullText,
      wordCount,
      charCount
    };

    pdfToWordExtractedPages[pageNum - 1] = pageData;
    return pageData;
  } catch (extractErr) {
    console.error(`Error extracting page ${pageNum}:`, extractErr);
    return null;
  }
}

async function pdftowordRenderDocMockup(pageNum) {
  if (pageNum < 1) pageNum = 1;
  if (pageNum > pdfToWordTotalPages) pageNum = pdfToWordTotalPages;
  pdfToWordCurrentPreviewIndex = pageNum;

  const indicator = document.getElementById('pdftoword-preview-page-indicator');
  if (indicator) {
    indicator.textContent = `Page ${pageNum} / ${pdfToWordTotalPages}`;
  }

  const pageData = await pdftowordExtractPage(pageNum);
  const mockup = document.getElementById('pdftoword-doc-mockup');
  if (!mockup || !pageData) return;

  // Update Stats Pills
  document.getElementById('pdftoword-stat-words').textContent = pageData.wordCount.toLocaleString();
  document.getElementById('pdftoword-stat-chars').textContent = pageData.charCount.toLocaleString();
  document.getElementById('pdftoword-stat-paras').textContent = pageData.paragraphs.length.toLocaleString();

  // Apply chosen font theme & size to preview
  const fontFam = document.getElementById('pdftoword-font')?.value || 'Calibri';
  const baseSize = parseInt(document.getElementById('pdftoword-size')?.value || '11', 10);
  
  mockup.style.fontFamily = fontFam === 'Times New Roman' ? '"Times New Roman", Times, serif' : (fontFam === 'Georgia' ? 'Georgia, serif' : (fontFam === 'Arial' ? 'Arial, sans-serif' : 'Calibri, sans-serif'));
  mockup.style.fontSize = `${baseSize}px`;

  // Render paragraphs
  mockup.innerHTML = '';

  if (pageData.paragraphs.length === 0) {
    mockup.innerHTML = '<p class="text-gray-400 italic text-center py-8">No text extracted on this page.</p>';
    return;
  }

  pageData.paragraphs.forEach(p => {
    const el = document.createElement(p.type === 'heading1' ? 'h1' : (p.type === 'heading2' ? 'h2' : (p.type === 'bullet' ? 'li' : 'p')));
    
    if (p.type === 'heading1') {
      el.className = 'text-base sm:text-lg font-bold text-blue-900 dark:text-blue-200 mt-3 mb-1.5 border-b border-blue-100 dark:border-blue-900/40 pb-1';
    } else if (p.type === 'heading2') {
      el.className = 'text-sm font-bold text-blue-700 dark:text-blue-300 mt-2 mb-1';
    } else if (p.type === 'bullet') {
      el.className = 'ml-4 list-disc text-gray-700 dark:text-gray-200 my-0.5 leading-relaxed';
    } else {
      el.className = 'text-gray-800 dark:text-gray-200 my-1.5 leading-relaxed';
    }

    if (p.runs && p.runs.length > 0) {
      p.runs.forEach(r => {
        const span = document.createElement('span');
        span.textContent = r.text;
        if (r.bold) span.style.fontWeight = 'bold';
        if (r.italic) span.style.fontStyle = 'italic';
        el.appendChild(span);
      });
    } else {
      el.textContent = p.text;
    }

    mockup.appendChild(el);
  });
}

function pdftowordPrevPreviewPage() {
  if (pdfToWordCurrentPreviewIndex > 1) {
    pdftowordRenderDocMockup(pdfToWordCurrentPreviewIndex - 1);
  }
}

function pdftowordNextPreviewPage() {
  if (pdfToWordCurrentPreviewIndex < pdfToWordTotalPages) {
    pdftowordRenderDocMockup(pdfToWordCurrentPreviewIndex + 1);
  }
}

function pdftowordUpdatePreview() {
  pdftowordRenderDocMockup(pdfToWordCurrentPreviewIndex);
}

function pdftowordGetTargetPages() {
  const rangeType = document.querySelector('input[name="pdftoword-range-type"]:checked')?.value || 'all';
  const pages = [];
  if (rangeType === 'all') {
    for (let i = 1; i <= pdfToWordTotalPages; i++) pages.push(i);
  } else if (rangeType === 'skip-first') {
    for (let i = 2; i <= pdfToWordTotalPages; i++) pages.push(i);
  } else if (rangeType === 'custom') {
    const str = document.getElementById('pdftoword-custom-range')?.value || '';
    const parts = str.split(',');
    const set = new Set();
    parts.forEach(p => {
      const part = p.trim();
      if (part.includes('-')) {
        const [s, e] = part.split('-').map(x => parseInt(x.trim(), 10));
        if (!isNaN(s) && !isNaN(e)) {
          for (let i = Math.max(1, s); i <= Math.min(pdfToWordTotalPages, e); i++) set.add(i);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= pdfToWordTotalPages) set.add(num);
      }
    });
    if (set.size === 0) {
      for (let i = 1; i <= pdfToWordTotalPages; i++) pages.push(i);
    } else {
      pages.push(...Array.from(set).sort((a, b) => a - b));
    }
  }
  return pages;
}

async function pdftowordProcess() {
  if (!pdfToWordArrayBuffer) {
    alert('Please upload a PDF file first.');
    return;
  }

  // Show progress modal
  const modal = document.getElementById('pdftoword-progress-modal');
  const bar = document.getElementById('pdftoword-progress-bar');
  const txt = document.getElementById('pdftoword-progress-text');
  const sub = document.getElementById('pdftoword-modal-sub');
  
  modal.classList.remove('hidden');
  bar.style.width = '15%';
  txt.textContent = '15%';
  if (sub) sub.textContent = 'Parsing PDF pages and analyzing typography...';

  try {
    const targetPages = pdftowordGetTargetPages();
    const mode = document.querySelector('input[name="pdftoword-mode"]:checked')?.value || 'flowable';
    const fontTheme = document.getElementById('pdftoword-font')?.value || 'Calibri';
    const baseFontSize = parseInt(document.getElementById('pdftoword-size')?.value || '11', 10);
    const lineSpacingVal = document.getElementById('pdftoword-spacing')?.value || '1.15';
    const optPageBreaks = document.getElementById('pdftoword-opt-pagebreaks')?.checked ?? true;

    // 1. Extract all target pages
    const pagesData = [];
    let totalWordCount = 0;

    for (let i = 0; i < targetPages.length; i++) {
      const pageNum = targetPages[i];
      const percent = Math.round(15 + ((i + 1) / targetPages.length) * 45);
      bar.style.width = `${percent}%`;
      txt.textContent = `${percent}%`;
      if (sub) sub.textContent = `Extracting text & paragraphs from page ${i + 1} of ${targetPages.length}...`;

      const pData = await pdftowordExtractPage(pageNum);
      if (pData) {
        pagesData.push(pData);
        totalWordCount += pData.wordCount;
      }
      await new Promise(r => setTimeout(r, 20));
    }

    bar.style.width = '70%';
    txt.textContent = '70%';
    if (sub) sub.textContent = 'Building OpenXML Microsoft Word package...';
    await new Promise(r => setTimeout(r, 100));

    // 2. Build OpenXML DOCX Package with JSZip
    const zip = new JSZip();

    // A. [Content_Types].xml
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
</Types>`);

    // B. _rels/.rels
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    // C. word/_rels/document.xml.rels
    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
</Relationships>`);

    // D. word/styles.xml
    const baseHalfPt = baseFontSize * 2;
    let lineSpacingTwips = 276;
    if (lineSpacingVal === '1.0') lineSpacingTwips = 240;
    else if (lineSpacingVal === '1.5') lineSpacingTwips = 360;

    zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="${fontTheme}" w:hAnsi="${fontTheme}" w:cs="${fontTheme}"/>
        <w:sz w:val="${baseHalfPt}"/>
        <w:szCs w:val="${baseHalfPt}"/>
        <w:color w:val="222222"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="140" w:line="${lineSpacingTwips}" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Normal" w:default="1">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="280" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${fontTheme}" w:hAnsi="${fontTheme}"/>
      <w:b/>
      <w:color w:val="1F497D"/>
      <w:sz w:val="${Math.round(baseHalfPt * 1.45)}"/>
      <w:szCs w:val="${Math.round(baseHalfPt * 1.45)}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr>
      <w:spacing w:before="200" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${fontTheme}" w:hAnsi="${fontTheme}"/>
      <w:b/>
      <w:color w:val="2E74B5"/>
      <w:sz w:val="${Math.round(baseHalfPt * 1.2)}"/>
      <w:szCs w:val="${Math.round(baseHalfPt * 1.2)}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListBullet">
    <w:name w:val="List Bullet"/>
    <w:pPr>
      <w:spacing w:after="80"/>
      <w:ind w:left="480" w:hanging="240"/>
    </w:pPr>
  </w:style>
</w:styles>`);

    // E. word/settings.xml
    zip.file('word/settings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
</w:settings>`);

    // F. word/fontTable.xml
    zip.file('word/fontTable.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fontTable xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="${fontTheme}"><w:pitch w:val="variable"/><w:family w:val="swiss"/></w:font>
</w:fontTable>`);

    // G. word/document.xml
    let docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>`;

    pagesData.forEach((pData, pIdx) => {
      if (pIdx > 0 && optPageBreaks) {
        docXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
      }

      pData.paragraphs.forEach(p => {
        let pStyle = '';
        let bulletPrefix = '';

        if (mode === 'clean') {
          // Clean mode: just normal paragraphs
          pStyle = '';
        } else {
          if (p.type === 'heading1') pStyle = '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>';
          else if (p.type === 'heading2') pStyle = '<w:pPr><w:pStyle w:val="Heading2"/></w:pPr>';
          else if (p.type === 'bullet') {
            pStyle = '<w:pPr><w:pStyle w:val="ListBullet"/></w:pPr>';
            bulletPrefix = '•  ';
          }
        }

        docXml += `<w:p>${pStyle}`;
        if (bulletPrefix) {
          docXml += `<w:r><w:t xml:space="preserve">${pdftowordEscapeXml(bulletPrefix)}</w:t></w:r>`;
        }

        if (p.runs && p.runs.length > 0) {
          p.runs.forEach(run => {
            let rPr = '';
            if (mode !== 'clean' && (run.bold || run.italic)) {
              rPr = `<w:rPr>${run.bold ? '<w:b/>' : ''}${run.italic ? '<w:i/>' : ''}</w:rPr>`;
            }
            docXml += `<w:r>${rPr}<w:t xml:space="preserve">${pdftowordEscapeXml(run.text)}</w:t></w:r>`;
          });
        } else {
          docXml += `<w:r><w:t xml:space="preserve">${pdftowordEscapeXml(p.text)}</w:t></w:r>`;
        }
        docXml += `</w:p>`;
      });
    });

    // Page setup (Standard Letter / A4 margins)
    docXml += `
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    zip.file('word/document.xml', docXml);

    bar.style.width = '90%';
    txt.textContent = '90%';
    if (sub) sub.textContent = 'Compressing DOCX archive...';
    await new Promise(r => setTimeout(r, 100));

    // Generate Blob
    pdfToWordDocxBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    bar.style.width = '100%';
    txt.textContent = '100%';
    await new Promise(r => setTimeout(r, 150));

    modal.classList.add('hidden');

    // Populate Results Screen
    const baseName = pdfToWordFile.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}.docx`;
    document.getElementById('res-pdftoword-name').textContent = outName;
    document.getElementById('res-pdftoword-count').textContent = `${pagesData.length} of ${pdfToWordTotalPages} pages`;
    document.getElementById('res-pdftoword-words').textContent = `${totalWordCount.toLocaleString()} words`;
    document.getElementById('res-pdftoword-size').textContent = formatBytes(pdfToWordDocxBlob.size);

    // Switch view
    document.getElementById('pdftoword-workspace-section').classList.add('hidden');
    document.getElementById('pdftoword-result-section').classList.remove('hidden');

    lucide.createIcons();
  } catch (err) {
    console.error('Error converting PDF to Word:', err);
    modal.classList.add('hidden');
    alert('Failed to convert PDF to Word: ' + (err.message || err));
  }
}

function pdftowordDownload() {
  if (!pdfToWordDocxBlob) return;
  const baseName = pdfToWordFile ? pdfToWordFile.name.replace(/\.[^/.]+$/, '') : 'document';
  const outName = `${baseName}.docx`;

  const url = URL.createObjectURL(pdfToWordDocxBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function pdftowordResetFile() {
  pdfToWordFile = null;
  pdfToWordArrayBuffer = null;
  pdfToWordDocxBlob = null;
  pdfToWordPdfJsDoc = null;
  pdfToWordTotalPages = 0;
  pdfToWordCurrentPreviewIndex = 1;
  pdfToWordExtractedPages = [];

  const fi = document.getElementById('pdftoword-file-input');
  if (fi) fi.value = '';
  document.getElementById('pdftoword-drop-zone')?.classList.remove('hidden');
  document.getElementById('pdftoword-workspace-section')?.classList.add('hidden');
  document.getElementById('pdftoword-result-section')?.classList.add('hidden');
  lucide.createIcons();
}

function pdftowordReset() {
  pdftowordResetFile();
}

// ===================== PDF TO EXCEL (.XLSX) CONVERTER =====================
let pdfToExcelFile = null;
let pdfToExcelArrayBuffer = null;
let pdfToExcelPdfJsDoc = null;
let pdfToExcelTotalPages = 0;
let pdfToExcelCurrentPreviewSheet = 0;
let pdfToExcelExtractedSheets = []; // Array of { name: 'Page 1', pageNum: 1, grid: [[]], colCount: N, rowCount: N, cellCount: N, numCount: N }
let pdfToExcelLayout = 'multisheet'; // 'multisheet' | 'single'

function setupPdfToExcelDrop() {
  const dz = document.getElementById('pdftoexcel-drop-zone');
  const fi = document.getElementById('pdftoexcel-file-input');
  if (!dz || !fi) return;

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });
  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('drop-active');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('drop-active'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drop-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      pdftoexcelHandleFile(e.dataTransfer.files[0]);
    }
  });
  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      pdftoexcelHandleFile(e.target.files[0]);
    }
  });
}

function getExcelColumnLetter(colIndex) {
  let dividend = colIndex + 1;
  let columnName = '';
  while (dividend > 0) {
    let modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return columnName;
}

async function pdftoexcelHandleFile(file) {
  if (!file || file.type !== 'application/pdf') {
    alert('Please select a valid PDF document.');
    return;
  }
  pdfToExcelFile = file;

  const fileNameEl = document.getElementById('pdftoexcel-file-name');
  const fileMetaEl = document.getElementById('pdftoexcel-file-meta');
  if (fileNameEl) fileNameEl.textContent = file.name;
  if (fileMetaEl) fileMetaEl.textContent = `Loading & analyzing PDF tables... • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

  document.getElementById('pdftoexcel-drop-zone')?.classList.add('hidden');
  document.getElementById('pdftoexcel-workspace-section')?.classList.remove('hidden');

  try {
    pdfToExcelArrayBuffer = await file.arrayBuffer();
    pdfToExcelPdfJsDoc = await pdfjsLib.getDocument({ data: pdfToExcelArrayBuffer.slice(0) }).promise;
    pdfToExcelTotalPages = pdfToExcelPdfJsDoc.numPages;

    if (fileMetaEl) {
      fileMetaEl.textContent = `${pdfToExcelTotalPages} Page${pdfToExcelTotalPages > 1 ? 's' : ''} • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    }

    // Extract tables across all pages
    await pdftoexcelExtractAllPages();
    pdftoexcelRenderSpreadsheetMockup(0);
    lucide.createIcons();
  } catch (err) {
    console.error('Error loading PDF for Excel conversion:', err);
    alert('Failed to read PDF file. Please ensure the document is not password-protected or corrupted.');
    pdftoexcelResetFile();
  }
}

async function pdftoexcelExtractAllPages() {
  if (!pdfToExcelPdfJsDoc) return;
  pdfToExcelExtractedSheets = [];

  const parseNumbers = document.getElementById('pdftoexcel-opt-numbers')?.checked !== false;
  const trimEmpty = document.getElementById('pdftoexcel-opt-clean-empty')?.checked !== false;

  for (let pageNum = 1; pageNum <= pdfToExcelTotalPages; pageNum++) {
    const sheetData = await pdftoexcelExtractPage(pageNum, { parseNumbers, trimEmpty });
    pdfToExcelExtractedSheets.push(sheetData);
  }
}

async function pdftoexcelExtractPage(pageNum, options = {}) {
  const page = await pdfToExcelPdfJsDoc.getPage(pageNum);
  const textContent = await page.getTextContent();
  const items = textContent.items || [];

  const yTolerance = 4.5;
  const xColTolerance = 14;
  const parseNumbers = options.parseNumbers !== false;
  const trimEmpty = options.trimEmpty !== false;

  // Filter and sort items descending by Y (top of page first), ascending by X (left to right)
  const sorted = items
    .filter(it => it.str && it.str.trim() !== '')
    .map(it => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      width: it.width || 0,
      height: it.height || 0
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  if (sorted.length === 0) {
    return {
      name: `Page ${pageNum}`,
      pageNum,
      grid: [['(Empty Page)']],
      colCount: 1,
      rowCount: 1,
      cellCount: 0,
      numCount: 0
    };
  }

  // 1. Group items into Y rows
  const rawRows = [];
  let currentRow = null;

  for (const item of sorted) {
    if (!currentRow) {
      currentRow = { y: item.y, items: [item] };
    } else if (Math.abs(currentRow.y - item.y) <= yTolerance) {
      currentRow.items.push(item);
      currentRow.y = (currentRow.y * (currentRow.items.length - 1) + item.y) / currentRow.items.length;
    } else {
      rawRows.push(currentRow);
      currentRow = { y: item.y, items: [item] };
    }
  }
  if (currentRow) rawRows.push(currentRow);

  // 2. Sort items in each row left-to-right & merge adjacent word pieces
  const processedRows = [];
  const colXPositions = [];

  for (const row of rawRows) {
    row.items.sort((a, b) => a.x - b.x);

    const mergedItems = [];
    let curCell = null;

    for (const item of row.items) {
      if (!curCell) {
        curCell = { ...item };
      } else {
        const gap = item.x - (curCell.x + curCell.width);
        // Small horizontal gap (< 6pt): combine into same cell text
        if (gap < 6 && gap >= -2) {
          curCell.str += (curCell.str.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
          curCell.width = (item.x + item.width) - curCell.x;
        } else {
          mergedItems.push(curCell);
          curCell = { ...item };
        }
      }
    }
    if (curCell) mergedItems.push(curCell);

    processedRows.push({ y: row.y, items: mergedItems });

    for (const cell of mergedItems) {
      colXPositions.push(cell.x);
    }
  }

  // 3. Cluster distinct column X coordinates
  colXPositions.sort((a, b) => a - b);
  const columnBands = [];
  for (const x of colXPositions) {
    const existing = columnBands.find(band => Math.abs(band.center - x) <= xColTolerance);
    if (existing) {
      existing.positions.push(x);
      existing.center = existing.positions.reduce((s, v) => s + v, 0) / existing.positions.length;
    } else {
      columnBands.push({ center: x, positions: [x] });
    }
  }
  columnBands.sort((a, b) => a.center - b.center);

  const colCount = Math.max(1, columnBands.length);

  // 4. Build 2D grid matrix
  let numCount = 0;
  let cellCount = 0;
  let grid = [];

  for (const row of processedRows) {
    const gridRow = new Array(colCount).fill('');

    for (const cell of row.items) {
      let bestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < columnBands.length; i++) {
        const diff = Math.abs(columnBands[i].center - cell.x);
        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = i;
        }
      }

      let cellValue = cell.str.trim();

      // Smart numeric parsing
      if (parseNumbers) {
        const cleanNum = cellValue.replace(/,/g, '');
        const currencyMatch = cellValue.match(/^[$€£¥₹]\s*([0-9]+(\.[0-9]+)?)$/);
        const percentMatch = cellValue.match(/^([+-]?[0-9]+(\.[0-9]+)?)\s*%$/);

        if (currencyMatch) {
          const num = parseFloat(currencyMatch[1]);
          if (!isNaN(num)) {
            cellValue = num;
            numCount++;
          }
        } else if (percentMatch) {
          const num = parseFloat(percentMatch[1]) / 100;
          if (!isNaN(num)) {
            cellValue = num;
            numCount++;
          }
        } else if (/^[+-]?[0-9]+(\.[0-9]+)?$/.test(cleanNum) && !/^0[0-9]+/.test(cleanNum)) {
          const num = parseFloat(cleanNum);
          if (!isNaN(num)) {
            cellValue = num;
            numCount++;
          }
        }
      }

      if (gridRow[bestIdx] === '') {
        gridRow[bestIdx] = cellValue;
        if (cellValue !== '') cellCount++;
      } else {
        gridRow[bestIdx] = gridRow[bestIdx] + ' ' + cellValue;
      }
    }
    grid.push(gridRow);
  }

  // 5. Optionally trim trailing blank rows / blank columns
  if (trimEmpty && grid.length > 0) {
    // Remove rows where all cells are empty
    grid = grid.filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined));

    // Remove columns where all rows are empty
    if (grid.length > 0) {
      const activeCols = [];
      for (let c = 0; c < colCount; c++) {
        const hasContent = grid.some(row => row[c] !== '' && row[c] !== null && row[c] !== undefined);
        if (hasContent) activeCols.push(c);
      }

      if (activeCols.length > 0 && activeCols.length < colCount) {
        grid = grid.map(row => activeCols.map(c => row[c]));
      }
    }
  }

  const finalColCount = grid.length > 0 ? grid[0].length : 1;
  const finalRowCount = grid.length;

  return {
    name: `Page ${pageNum}`,
    pageNum,
    grid: grid.length > 0 ? grid : [['']],
    colCount: finalColCount,
    rowCount: finalRowCount,
    cellCount,
    numCount
  };
}

function pdftoexcelRenderSpreadsheetMockup(sheetIndex = 0) {
  const tabsContainer = document.getElementById('pdftoexcel-sheet-tabs');
  const tableContainer = document.getElementById('pdftoexcel-table-container');
  if (!tableContainer || pdfToExcelExtractedSheets.length === 0) return;

  pdfToExcelCurrentPreviewSheet = Math.max(0, Math.min(sheetIndex, pdfToExcelExtractedSheets.length - 1));

  // 1. Render Sheet Tabs
  if (tabsContainer) {
    let tabsHtml = '';
    if (pdfToExcelLayout === 'single') {
      tabsHtml = `
        <button class="px-3.5 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 text-white shadow-sm flex items-center gap-1.5">
          <i data-lucide="sheet" style="width:13px;height:13px"></i>
          <span>Consolidated Sheet</span>
        </button>
      `;
    } else {
      tabsHtml = pdfToExcelExtractedSheets.map((sh, idx) => {
        const isActive = idx === pdfToExcelCurrentPreviewSheet;
        return `
          <button onclick="pdftoexcelRenderSpreadsheetMockup(${idx})" class="px-3 py-1.5 rounded-lg font-medium text-xs transition flex items-center gap-1.5 flex-shrink-0 ${
            isActive
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }">
            <i data-lucide="sheet" style="width:13px;height:13px"></i>
            <span>${sh.name}</span>
          </button>
        `;
      }).join('');
    }
    tabsContainer.innerHTML = tabsHtml;
  }

  // 2. Resolve Grid to display
  let currentGrid = [];
  let totalRows = 0;
  let totalCols = 0;
  let totalCells = 0;

  if (pdfToExcelLayout === 'single') {
    // Merge all sheets into one preview
    pdfToExcelExtractedSheets.forEach((sh, sIdx) => {
      if (sIdx > 0) {
        // Optional visual separator row between pages
        currentGrid.push(new Array(Math.max(1, sh.colCount)).fill('---'));
      }
      currentGrid = currentGrid.concat(sh.grid);
      totalRows += sh.rowCount;
      totalCells += sh.cellCount;
      if (sh.colCount > totalCols) totalCols = sh.colCount;
    });
  } else {
    const sh = pdfToExcelExtractedSheets[pdfToExcelCurrentPreviewSheet] || { grid: [[]], rowCount: 0, colCount: 0, cellCount: 0 };
    currentGrid = sh.grid;
    totalRows = sh.rowCount;
    totalCols = sh.colCount;
    totalCells = sh.cellCount;
  }

  // Update stat badges
  const statRows = document.getElementById('pdftoexcel-stat-rows');
  const statCols = document.getElementById('pdftoexcel-stat-cols');
  const statCells = document.getElementById('pdftoexcel-stat-cells');
  if (statRows) statRows.textContent = `${totalRows} Rows`;
  if (statCols) statCols.textContent = `${totalCols} Cols`;
  if (statCells) statCells.textContent = `${totalCells} Cells`;

  // 3. Render HTML Table Grid Mockup
  if (!currentGrid || currentGrid.length === 0) {
    tableContainer.innerHTML = `<div class="p-8 text-center text-gray-400">No tabular data detected.</div>`;
    return;
  }

  const maxCols = Math.max(1, ...currentGrid.map(r => r.length));

  let tableHtml = `
    <table class="w-full border-collapse border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 select-text">
      <thead>
        <tr class="bg-gray-100 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <th class="w-12 py-2 px-2 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-200/70 dark:bg-gray-700 text-[10px] text-gray-600 dark:text-gray-300 font-bold">fx</th>
  `;

  for (let c = 0; c < maxCols; c++) {
    tableHtml += `
      <th class="py-2 px-3 text-center border-r border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 text-xs min-w-[90px]">
        ${getExcelColumnLetter(c)}
      </th>
    `;
  }
  tableHtml += `</tr></thead><tbody>`;

  // Render Rows (show up to 100 rows in preview for snappy DOM performance)
  const previewLimit = Math.min(currentGrid.length, 100);

  for (let r = 0; r < previewLimit; r++) {
    const row = currentGrid[r];
    const isFirstRow = r === 0;
    const isSeparator = row.length === 1 && row[0] === '---';

    if (isSeparator) {
      tableHtml += `
        <tr class="bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
          <td class="py-1 px-2 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50">#</td>
          <td colspan="${maxCols}" class="py-1 px-3 border-b border-gray-200 dark:border-gray-700 uppercase tracking-widest text-center">Next Page Table</td>
        </tr>
      `;
      continue;
    }

    tableHtml += `
      <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-colors ${
        isFirstRow ? 'bg-gray-50/70 dark:bg-gray-800/80 font-bold' : ''
      }">
        <td class="py-1.5 px-2 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-400 dark:text-gray-500 text-[10px] select-none font-semibold">
          ${r + 1}
        </td>
    `;

    for (let c = 0; c < maxCols; c++) {
      const val = row[c] !== undefined && row[c] !== null ? row[c] : '';
      const isNum = typeof val === 'number';

      tableHtml += `
        <td class="py-2 px-3 border-r border-gray-100 dark:border-gray-700/40 truncate max-w-[200px] ${
          isNum
            ? 'text-right font-mono text-emerald-600 dark:text-emerald-400'
            : isFirstRow
            ? 'text-left text-gray-900 dark:text-gray-100 font-semibold'
            : 'text-left text-gray-700 dark:text-gray-300'
        }" title="${typeof val === 'string' ? val.replace(/"/g, '&quot;') : val}">
          ${val !== '' ? val : '<span class="text-gray-300 dark:text-gray-600">-</span>'}
        </td>
      `;
    }
    tableHtml += `</tr>`;
  }

  if (currentGrid.length > previewLimit) {
    tableHtml += `
      <tr class="bg-gray-50 dark:bg-gray-900 text-center text-xs text-gray-400">
        <td colspan="${maxCols + 1}" class="py-3 font-medium">
          + ${currentGrid.length - previewLimit} more rows in the full Excel export...
        </td>
      </tr>
    `;
  }

  tableHtml += `</tbody></table>`;
  tableContainer.innerHTML = tableHtml;
  lucide.createIcons();
}

function pdftoexcelSelectLayout(layout, el) {
  pdfToExcelLayout = layout;
  document.querySelectorAll('.pdftoexcel-layout-card').forEach(card => {
    card.classList.remove('border-emerald-500', 'bg-emerald-50/40', 'dark:bg-emerald-950/30');
    card.classList.add('border-gray-200', 'dark:border-gray-700', 'bg-white', 'dark:bg-gray-800/40');
  });
  if (el) {
    el.classList.remove('border-gray-200', 'dark:border-gray-700', 'bg-white', 'dark:bg-gray-800/40');
    el.classList.add('border-emerald-500', 'bg-emerald-50/40', 'dark:bg-emerald-950/30');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
  pdftoexcelRenderSpreadsheetMockup(0);
}

function pdftoexcelTogglePageRangeInput(isCustom) {
  const wrapper = document.getElementById('pdftoexcel-custom-range-wrapper');
  if (wrapper) {
    if (isCustom) wrapper.classList.remove('hidden');
    else wrapper.classList.add('hidden');
  }
}

async function pdftoexcelOnOptionChange() {
  if (!pdfToExcelPdfJsDoc) return;
  await pdftoexcelExtractAllPages();
  pdftoexcelRenderSpreadsheetMockup(pdfToExcelCurrentPreviewSheet);
}

function pdftoexcelParsePageRange(rangeStr, maxPages) {
  if (!rangeStr || !rangeStr.trim()) return Array.from({ length: maxPages }, (_, i) => i + 1);
  const result = new Set();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let p = Math.max(1, start); p <= Math.min(maxPages, end); p++) {
          result.add(p);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        result.add(p);
      }
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

async function pdftoexcelProcess(exportFormat = 'xlsx') {
  if (!pdfToExcelFile || !pdfToExcelPdfJsDoc || pdfToExcelExtractedSheets.length === 0) {
    alert('Please upload a PDF file first.');
    return;
  }

  if (typeof XLSX === 'undefined') {
    alert('Spreadsheet engine (SheetJS) is loading. Please try again in a few seconds.');
    return;
  }

  const modal = document.getElementById('pdftoexcel-progress-modal');
  const modalTitle = document.getElementById('pdftoexcel-modal-title');
  const modalSub = document.getElementById('pdftoexcel-modal-sub');
  const progressBar = document.getElementById('pdftoexcel-progress-bar');
  const progressText = document.getElementById('pdftoexcel-progress-text');

  if (modal) modal.classList.remove('hidden');
  if (progressBar) progressBar.style.width = '15%';
  if (progressText) progressText.textContent = '15%';
  if (modalTitle) modalTitle.textContent = 'Analyzing PDF Tables...';
  if (modalSub) modalSub.textContent = 'Extracting rows, columns and cell values';

  try {
    // 1. Determine which pages to export
    const isCustomRange = document.querySelector('input[name="pdftoexcel-pagerange-mode"]:checked')?.value === 'custom';
    const rangeInput = document.getElementById('pdftoexcel-custom-range-input')?.value || '';
    const selectedPageNumbers = isCustomRange
      ? pdftoexcelParsePageRange(rangeInput, pdfToExcelTotalPages)
      : Array.from({ length: pdfToExcelTotalPages }, (_, i) => i + 1);

    if (selectedPageNumbers.length === 0) {
      alert('No valid pages found in the specified page range.');
      if (modal) modal.classList.add('hidden');
      return;
    }

    const autoWidth = document.getElementById('pdftoexcel-opt-autowidth')?.checked !== false;

    if (progressBar) progressBar.style.width = '45%';
    if (progressText) progressText.textContent = '45%';
    if (modalTitle) modalTitle.textContent = 'Constructing Spreadsheet...';
    if (modalSub) modalSub.textContent = 'Building Microsoft Excel workbook structure';

    // 2. Create XLSX Workbook
    const wb = XLSX.utils.book_new();

    if (pdfToExcelLayout === 'single' || exportFormat === 'csv') {
      // Single master sheet
      let consolidatedGrid = [];
      for (const pageNum of selectedPageNumbers) {
        const sheetObj = pdfToExcelExtractedSheets[pageNum - 1];
        if (sheetObj && sheetObj.grid && sheetObj.grid.length > 0) {
          consolidatedGrid = consolidatedGrid.concat(sheetObj.grid);
        }
      }

      if (consolidatedGrid.length === 0) consolidatedGrid = [['']];

      const ws = XLSX.utils.aoa_to_sheet(consolidatedGrid);

      if (autoWidth) {
        const colCount = Math.max(1, ...consolidatedGrid.map(r => r.length));
        const colWidths = [];
        for (let c = 0; c < colCount; c++) {
          let maxLen = 0;
          for (let r = 0; r < consolidatedGrid.length; r++) {
            const val = consolidatedGrid[r][c];
            if (val !== undefined && val !== null) {
              const str = String(val);
              if (str.length > maxLen) maxLen = str.length;
            }
          }
          colWidths.push({ wch: Math.max(maxLen + 3, 10) });
        }
        ws['!cols'] = colWidths;
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
    } else {
      // Multi-sheet: 1 sheet per PDF page
      for (const pageNum of selectedPageNumbers) {
        const sheetObj = pdfToExcelExtractedSheets[pageNum - 1];
        if (sheetObj && sheetObj.grid && sheetObj.grid.length > 0) {
          const ws = XLSX.utils.aoa_to_sheet(sheetObj.grid);

          if (autoWidth) {
            const colCount = Math.max(1, ...sheetObj.grid.map(r => r.length));
            const colWidths = [];
            for (let c = 0; c < colCount; c++) {
              let maxLen = 0;
              for (let r = 0; r < sheetObj.grid.length; r++) {
                const val = sheetObj.grid[r][c];
                if (val !== undefined && val !== null) {
                  const str = String(val);
                  if (str.length > maxLen) maxLen = str.length;
                }
              }
              colWidths.push({ wch: Math.max(maxLen + 3, 10) });
            }
            ws['!cols'] = colWidths;
          }

          XLSX.utils.book_append_sheet(wb, ws, `Page ${pageNum}`);
        }
      }
    }

    if (progressBar) progressBar.style.width = '80%';
    if (progressText) progressText.textContent = '80%';
    if (modalTitle) modalTitle.textContent = `Packaging ${exportFormat.toUpperCase()} File...`;
    if (modalSub) modalSub.textContent = 'Writing native Excel binary OpenXML package';

    await new Promise(r => setTimeout(r, 200));

    const baseName = pdfToExcelFile.name.replace(/\.[^/.]+$/, '');

    if (exportFormat === 'csv') {
      const firstSheetName = wb.SheetNames[0];
      const csvStr = XLSX.utils.sheet_to_csv(wb.Sheets[firstSheetName]);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      pdftoexcelTriggerDownload(blob, `${baseName}.csv`);
    } else {
      // Generate genuine XLSX binary OpenXML package
      const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      pdftoexcelTriggerDownload(blob, `${baseName}.xlsx`);
    }

    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = '100%';
    if (modalTitle) modalTitle.textContent = 'Complete!';
    if (modalSub) modalSub.textContent = 'Your editable spreadsheet is ready!';
  } catch (err) {
    console.error('Error generating Excel file:', err);
    alert('An error occurred during Excel conversion: ' + err.message);
  } finally {
    setTimeout(() => {
      if (modal) modal.classList.add('hidden');
    }, 600);
  }
}

function pdftoexcelTriggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function pdftoexcelResetFile() {
  pdfToExcelFile = null;
  pdfToExcelArrayBuffer = null;
  pdfToExcelPdfJsDoc = null;
  pdfToExcelTotalPages = 0;
  pdfToExcelCurrentPreviewSheet = 0;
  pdfToExcelExtractedSheets = [];

  const fi = document.getElementById('pdftoexcel-file-input');
  if (fi) fi.value = '';

  document.getElementById('pdftoexcel-drop-zone')?.classList.remove('hidden');
  document.getElementById('pdftoexcel-workspace-section')?.classList.add('hidden');
  lucide.createIcons();
}

function pdftoexcelReset() {
  pdftoexcelResetFile();
}

// ===================== WORD TO PDF CONVERTER =====================
let wordToPdfFile = null;
let wordToPdfArrayBuffer = null;
let wordToPdfPageCount = 0;
let wordToPdfWordCount = 0;
let wordToPdfCharCount = 0;
let wordToPdfOrientation = 'auto'; // 'auto' | 'portrait' | 'landscape'
let wordToPdfDpi = 2; // 2 (150 DPI) | 3 (300 DPI)

function setupWordToPdfDrop() {
  const dz = document.getElementById('wordtopdf-drop-zone');
  const fi = document.getElementById('wordtopdf-file-input');
  if (!dz || !fi) return;

  dz.addEventListener('click', e => {
    if (!e.target.closest('label')) fi.click();
  });
  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('drop-active');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('drop-active'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drop-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      wordtopdfHandleFile(e.dataTransfer.files[0]);
    }
  });
  fi.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      wordtopdfHandleFile(e.target.files[0]);
    }
  });
}

function wordtopdfSelectOrient(orient, el) {
  wordToPdfOrientation = orient;
  document.querySelectorAll('.wordtopdf-orient-btn').forEach(btn => {
    btn.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/40', 'font-semibold', 'text-blue-700', 'dark:text-blue-300');
    btn.classList.add('border-gray-200', 'dark:border-gray-700', 'bg-gray-50', 'dark:bg-gray-900/40', 'font-medium', 'text-gray-700', 'dark:text-gray-300');
  });
  if (el) {
    el.classList.remove('border-gray-200', 'dark:border-gray-700', 'bg-gray-50', 'dark:bg-gray-900/40', 'font-medium', 'text-gray-700', 'dark:text-gray-300');
    el.classList.add('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/40', 'font-semibold', 'text-blue-700', 'dark:text-blue-300');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
}

function wordtopdfSelectDpi(dpi, el) {
  wordToPdfDpi = parseInt(dpi, 10) || 2;
  document.querySelectorAll('.wordtopdf-dpi-card').forEach(card => {
    card.classList.remove('border-blue-500', 'bg-blue-50/40', 'dark:bg-blue-950/30');
    card.classList.add('border-gray-200', 'dark:border-gray-700', 'bg-gray-50', 'dark:bg-gray-900/40');
  });
  if (el) {
    el.classList.remove('border-gray-200', 'dark:border-gray-700', 'bg-gray-50', 'dark:bg-gray-900/40');
    el.classList.add('border-blue-500', 'bg-blue-50/40', 'dark:bg-blue-950/30');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
}

function wordtopdfToggleRangeInput(isCustom) {
  const box = document.getElementById('wordtopdf-custom-range-box');
  if (box) {
    if (isCustom) box.classList.remove('hidden');
    else box.classList.add('hidden');
  }
}

async function wordtopdfHandleFile(file) {
  if (!file) return;

  const validExts = ['.docx', '.doc'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExts.includes(ext) && !file.type.includes('word') && !file.type.includes('document')) {
    alert('Please select a valid Microsoft Word document (.docx or .doc).');
    return;
  }

  wordToPdfFile = file;

  const fileNameEl = document.getElementById('wordtopdf-file-name');
  const fileMetaEl = document.getElementById('wordtopdf-file-meta');
  if (fileNameEl) fileNameEl.textContent = file.name;
  if (fileMetaEl) fileMetaEl.textContent = `Reading Word document... • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

  document.getElementById('wordtopdf-drop-zone')?.classList.add('hidden');
  document.getElementById('wordtopdf-workspace-section')?.classList.remove('hidden');

  try {
    wordToPdfArrayBuffer = await file.arrayBuffer();

    // 1. Extract raw text & metrics via Mammoth if available
    let rawText = '';
    if (typeof mammoth !== 'undefined') {
      try {
        const textResult = await mammoth.extractRawText({ arrayBuffer: wordToPdfArrayBuffer.slice(0) });
        rawText = textResult.value || '';
      } catch (mErr) {
        console.warn('Mammoth raw text extraction notice:', mErr);
      }
    }

    wordToPdfWordCount = (rawText.match(/\S+/g) || []).length;
    wordToPdfCharCount = rawText.length;

    // 2. Render Document Preview via docx-preview or semantic HTML
    await wordtopdfRenderPreview();

    if (fileMetaEl) {
      fileMetaEl.textContent = `${wordToPdfPageCount} Page${wordToPdfPageCount > 1 ? 's' : ''} • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    }

    lucide.createIcons();
  } catch (err) {
    console.error('Error handling Word document:', err);
    alert('Failed to load Word document: ' + err.message);
    wordtopdfResetFile();
  }
}

async function wordtopdfRenderPreview() {
  const container = document.getElementById('wordtopdf-rendered-container');
  if (!container || !wordToPdfArrayBuffer) return;

  container.innerHTML = `
    <div class="text-center py-20 text-gray-400 text-xs">
      <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      Rendering Word pages & styles...
    </div>
  `;

  try {
    container.innerHTML = '';
    let renderedSuccessfully = false;

    // Method A: docx-preview (renders complete Word XML pagination & layout)
    if (typeof docx !== 'undefined' && docx.renderAsync) {
      try {
        await docx.renderAsync(wordToPdfArrayBuffer.slice(0), container, null, {
          className: 'docx-preview-root',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          useBase64URL: true
        });
        renderedSuccessfully = true;
      } catch (renderErr) {
        console.warn('docx-preview render notice:', renderErr);
      }
    }

    // Method B: Mammoth HTML fallback if docx-preview is unavailable or failed
    if (!renderedSuccessfully && typeof mammoth !== 'undefined') {
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer: wordToPdfArrayBuffer.slice(0) });
      const htmlContent = htmlResult.value || '<p>No readable content</p>';

      const pageSection = document.createElement('section');
      pageSection.className = 'docx bg-white shadow-md p-10 max-w-[800px] w-full min-h-[1050px] my-4 rounded-sm text-gray-900 border border-gray-200';
      pageSection.style.fontFamily = "'Calibri', 'Segoe UI', Arial, sans-serif";
      pageSection.style.fontSize = '12pt';
      pageSection.style.lineHeight = '1.5';
      pageSection.innerHTML = htmlContent;
      container.appendChild(pageSection);
      renderedSuccessfully = true;
    }

    // Count pages in container
    const sections = container.querySelectorAll('section.docx') || container.querySelectorAll('.docx');
    wordToPdfPageCount = sections.length > 0 ? sections.length : 1;

    // Update Stats Badges
    const pagesBadge = document.getElementById('wordtopdf-stat-pages');
    const wordsBadge = document.getElementById('wordtopdf-stat-words');
    const charsBadge = document.getElementById('wordtopdf-stat-chars');
    if (pagesBadge) pagesBadge.textContent = `${wordToPdfPageCount} Page${wordToPdfPageCount > 1 ? 's' : ''}`;
    if (wordsBadge) wordsBadge.textContent = `${wordToPdfWordCount} Words`;
    if (charsBadge) charsBadge.textContent = `${wordToPdfCharCount} Chars`;
  } catch (err) {
    console.error('Error rendering preview:', err);
    container.innerHTML = `<div class="p-8 text-center text-red-500 text-xs">Failed to render preview: ${err.message}</div>`;
  }
}

function wordtopdfParsePageRange(rangeStr, maxPages) {
  if (!rangeStr || !rangeStr.trim()) return Array.from({ length: maxPages }, (_, i) => i + 1);
  const result = new Set();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let p = Math.max(1, start); p <= Math.min(maxPages, end); p++) {
          result.add(p);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        result.add(p);
      }
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

async function wordtopdfProcess() {
  if (!wordToPdfFile || !wordToPdfArrayBuffer) {
    alert('Please upload a Word document first.');
    return;
  }

  const modal = document.getElementById('wordtopdf-progress-modal');
  const modalTitle = document.getElementById('wordtopdf-modal-title');
  const modalSub = document.getElementById('wordtopdf-modal-sub');
  const progressBar = document.getElementById('wordtopdf-progress-bar');
  const progressText = document.getElementById('wordtopdf-progress-text');

  if (modal) modal.classList.remove('hidden');
  if (progressBar) progressBar.style.width = '15%';
  if (progressText) progressText.textContent = '15%';
  if (modalTitle) modalTitle.textContent = 'Preparing Document Pages...';
  if (modalSub) modalSub.textContent = 'Analyzing Word layout and typography';

  try {
    const container = document.getElementById('wordtopdf-rendered-container');
    let pageElements = [];
    if (container) {
      const docxSections = container.querySelectorAll('section.docx, .docx-wrapper > section, section');
      if (docxSections.length > 0) {
        pageElements = Array.from(docxSections);
      } else {
        const wrappers = container.querySelectorAll('.docx-wrapper, .docx');
        if (wrappers.length > 0) {
          pageElements = Array.from(wrappers);
        } else if (container.children.length > 0) {
          pageElements = Array.from(container.children);
        } else {
          pageElements = [container];
        }
      }
    }
    if (pageElements.length === 0) {
      throw new Error('No document page elements found to convert.');
    }

    const totalPages = pageElements.length;
    const isCustomRange = document.querySelector('input[name="wordtopdf-range-mode"]:checked')?.value === 'custom';
    const customRangeVal = document.getElementById('wordtopdf-custom-range-val')?.value || '';
    const selectedPageNums = isCustomRange
      ? wordtopdfParsePageRange(customRangeVal, totalPages)
      : Array.from({ length: totalPages }, (_, i) => i + 1);

    if (selectedPageNums.length === 0) {
      alert('No valid pages found in the specified range.');
      if (modal) modal.classList.add('hidden');
      return;
    }

    // Resolve Target Dimensions (Standard PDF 72 pt/in)
    const pageSizeKey = document.getElementById('wordtopdf-pagesize')?.value || 'a4';
    const sizeMap = {
      a4: [595.28, 841.89],
      letter: [612.0, 792.0],
      legal: [612.0, 1008.0],
      a3: [841.89, 1190.55],
      a5: [419.53, 595.28]
    };

    let baseDimensions = sizeMap[pageSizeKey] || sizeMap.a4;
    const isGrayscale = document.querySelector('input[name="wordtopdf-color"]:checked')?.value === 'grayscale';

    // Create target PDF document
    const pdfDoc = await PDFLib.PDFDocument.create();

    // Embed metadata
    pdfDoc.setTitle(wordToPdfFile.name.replace(/\.[^/.]+$/, ''));
    pdfDoc.setCreator('PockitUp Word to PDF Converter');
    pdfDoc.setProducer('PockitUp (Client-Side Engine)');

    for (let i = 0; i < selectedPageNums.length; i++) {
      const pageIndex = selectedPageNums[i] - 1;
      const pageEl = pageElements[pageIndex];
      if (!pageEl) continue;

      const pct = Math.round(20 + ((i + 1) / selectedPageNums.length) * 65);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `${pct}%`;
      if (modalTitle) modalTitle.textContent = `Converting Page ${i + 1} of ${selectedPageNums.length}...`;
      if (modalSub) modalSub.textContent = 'Rendering high-resolution vector and font layers';

      const scaleFactor = wordToPdfDpi || 2;

      // 1. Clone element into off-screen host to guarantee exact CSS layout and positive dimensions
      const offscreenHost = document.createElement('div');
      offscreenHost.style.position = 'fixed';
      offscreenHost.style.left = '-99999px';
      offscreenHost.style.top = '0';
      offscreenHost.style.width = '794px';
      offscreenHost.style.backgroundColor = '#ffffff';
      offscreenHost.style.zIndex = '-9999';
      offscreenHost.style.overflow = 'visible';

      const clone = pageEl.cloneNode(true);
      clone.style.width = '794px';
      clone.style.minHeight = '1123px';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.backgroundColor = '#ffffff';
      clone.style.display = 'block';
      clone.style.visibility = 'visible';

      offscreenHost.appendChild(clone);
      document.body.appendChild(offscreenHost);

      let canvas;
      try {
        const renderHeight = Math.max(clone.offsetHeight || 0, clone.scrollHeight || 0, 1123);
        canvas = await html2canvas(clone, {
          scale: scaleFactor,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          height: renderHeight,
          windowWidth: 1200
        });
      } catch (cErr) {
        console.warn('html2canvas render error, falling back:', cErr);
      } finally {
        if (offscreenHost.parentNode) {
          document.body.removeChild(offscreenHost);
        }
      }

      // Safe fallback if canvas is missing or 0-dimension
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        canvas = document.createElement('canvas');
        canvas.width = 794 * scaleFactor;
        canvas.height = 1123 * scaleFactor;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#111827';
        ctx.font = '24px sans-serif';
        ctx.fillText(pageEl.innerText || 'Document Page', 60, 100);
      }

      // 2. Grayscale filter if selected
      if (isGrayscale && canvas.width > 0 && canvas.height > 0) {
        try {
          const ctx = canvas.getContext('2d');
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let p = 0; p < data.length; p += 4) {
            const luma = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
            data[p] = luma;
            data[p + 1] = luma;
            data[p + 2] = luma;
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (grayErr) {
          console.warn('Grayscale filter notice:', grayErr);
        }
      }

      // 3. Convert canvas to PNG bytes
      const imgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
      const imgArrayBuffer = await imgBlob.arrayBuffer();
      const embeddedImage = await pdfDoc.embedPng(imgArrayBuffer);

      // 4. Determine page dimensions and orientation
      let targetW, targetH;
      if (pageSizeKey === 'auto') {
        const naturalRatio = canvas.width / canvas.height;
        targetW = 595.28;
        targetH = targetW / naturalRatio;
      } else {
        targetW = baseDimensions[0];
        targetH = baseDimensions[1];
      }

      // Apply Orientation
      if (wordToPdfOrientation === 'landscape' || (wordToPdfOrientation === 'auto' && canvas.width > canvas.height)) {
        if (targetW < targetH) {
          const tmp = targetW;
          targetW = targetH;
          targetH = tmp;
        }
      } else if (wordToPdfOrientation === 'portrait') {
        if (targetW > targetH) {
          const tmp = targetW;
          targetW = targetH;
          targetH = tmp;
        }
      }

      const pdfPage = pdfDoc.addPage([targetW, targetH]);

      // Calculate proportional fit
      const imgAspect = embeddedImage.width / embeddedImage.height;
      const pageAspect = targetW / targetH;

      let drawW, drawH, drawX, drawY;
      if (imgAspect > pageAspect) {
        drawW = targetW;
        drawH = targetW / imgAspect;
        drawX = 0;
        drawY = (targetH - drawH) / 2;
      } else {
        drawH = targetH;
        drawW = targetH * imgAspect;
        drawX = (targetW - drawW) / 2;
        drawY = 0;
      }

      pdfPage.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });
    }

    if (progressBar) progressBar.style.width = '95%';
    if (progressText) progressText.textContent = '95%';
    if (modalTitle) modalTitle.textContent = 'Assembling PDF Document...';
    if (modalSub) modalSub.textContent = 'Finalizing OpenXML conversion';

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    const baseName = wordToPdfFile.name.replace(/\.[^/.]+$/, '');
    wordtopdfTriggerDownload(pdfBlob, `${baseName}.pdf`);

    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = '100%';
    if (modalTitle) modalTitle.textContent = 'Conversion Complete!';
    if (modalSub) modalSub.textContent = 'Your PDF is downloading...';
  } catch (err) {
    console.error('Error during Word to PDF conversion:', err);
    alert('An error occurred during Word to PDF conversion: ' + err.message);
  } finally {
    setTimeout(() => {
      if (modal) modal.classList.add('hidden');
    }, 600);
  }
}

function wordtopdfTriggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function wordtopdfResetFile() {
  wordToPdfFile = null;
  wordToPdfArrayBuffer = null;
  wordToPdfPageCount = 0;
  wordToPdfWordCount = 0;
  wordToPdfCharCount = 0;

  const fi = document.getElementById('wordtopdf-file-input');
  if (fi) fi.value = '';

  const container = document.getElementById('wordtopdf-rendered-container');
  if (container) {
    container.innerHTML = `
      <div class="text-center py-20 text-gray-400 text-xs">
        <i data-lucide="file-text" style="width:36px;height:36px" class="mx-auto mb-2 opacity-50"></i>
        Loading document preview...
      </div>
    `;
  }

  document.getElementById('wordtopdf-drop-zone')?.classList.remove('hidden');
  document.getElementById('wordtopdf-workspace-section')?.classList.add('hidden');
  lucide.createIcons();
}

function wordtopdfReset() {
  wordtopdfResetFile();
}

// ===================== SECURE PASSWORD GENERATOR =====================
let passwordgenCurrentMode = 'char'; // 'char' | 'phrase' | 'pin' | 'bulk'
let passwordgenCurrentPassword = '';
let passwordgenIsMasked = false;
let passwordgenHistory = [];

const PASSWORDGEN_DICTIONARY = [
  'ability', 'absorb', 'abstract', 'academy', 'accent', 'access', 'accord', 'account', 'acoustic', 'acquire', 'across', 'action', 'active', 'actor', 'actual', 'adapt', 'addition', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'affair', 'afford', 'afraid', 'agent', 'agree', 'ahead', 'airline', 'airport', 'alarm', 'album', 'alert', 'alien', 'allied', 'almond', 'almost', 'alpha', 'alpine', 'alter', 'amber', 'amuse', 'anchor', 'ancient', 'angel', 'animal', 'annual', 'answer', 'antenna', 'antique', 'anvil', 'apology', 'appeal', 'apple', 'apron', 'arcade', 'arch', 'arctic', 'arena', 'armor', 'aroma', 'arrow', 'artist', 'aspect', 'asset', 'assume', 'athlete', 'atlas', 'atom', 'attach', 'attack', 'attend', 'attic', 'attitude', 'auction', 'audio', 'audit', 'august', 'autumn', 'avenue', 'average', 'avocado', 'awake', 'award', 'aware', 'axiom', 'azure',
  'badge', 'badger', 'balance', 'balcony', 'bamboo', 'banana', 'banner', 'baron', 'barrel', 'barrier', 'basket', 'battery', 'battle', 'beacon', 'beam', 'beast', 'beauty', 'beaver', 'beetle', 'behind', 'belfry', 'belong', 'bench', 'benefit', 'berry', 'better', 'beyond', 'bicycle', 'binary', 'biology', 'biscuit', 'bishop', 'bison', 'blade', 'blanket', 'blast', 'blaze', 'blend', 'bless', 'blimp', 'blizzard', 'block', 'blossom', 'blue', 'board', 'boast', 'bobcat', 'boiler', 'bold', 'bolster', 'bolt', 'bombay', 'bonanza', 'bond', 'bonfire', 'bonus', 'border', 'botany', 'bottle', 'bounce', 'boundary', 'bounty', 'bowler', 'bracket', 'bramble', 'branch', 'brave', 'bread', 'break', 'breeze', 'brick', 'bridge', 'brief', 'bright', 'brisk', 'broad', 'bronze', 'brook', 'broom', 'bubble', 'bucket', 'budget', 'buffalo', 'buffer', 'builder', 'bullet', 'bundle', 'bunker', 'burden', 'bureau', 'butter', 'button',
  'cabin', 'cable', 'cactus', 'cadet', 'cavern', 'celery', 'cement', 'census', 'cereal', 'chalk', 'champion', 'chance', 'channel', 'chapter', 'charcoal', 'charge', 'chariot', 'charity', 'charm', 'charter', 'chasm', 'cheese', 'cherry', 'chest', 'chevron', 'chimney', 'chrome', 'chunk', 'cider', 'cigar', 'cinema', 'cipher', 'circle', 'circus', 'citrus', 'civic', 'civil', 'claim', 'clarity', 'classic', 'clause', 'clean', 'clear', 'clever', 'climate', 'climb', 'clinic', 'cloak', 'clock', 'clover', 'cluster', 'clutch', 'coach', 'coastal', 'cobalt', 'cobra', 'coconut', 'coffee', 'cohesion', 'cohort', 'colony', 'column', 'combat', 'comet', 'comfort', 'comic', 'command', 'compact', 'company', 'compass', 'complex', 'compose', 'comrade', 'concept', 'concert', 'concord', 'condor', 'conduit', 'confer', 'conifer', 'connect', 'consent', 'consul', 'context', 'contour', 'control', 'convex', 'copper', 'coral', 'cordon', 'corridor', 'cosmic', 'costume', 'cottage', 'cotton', 'cougar', 'council', 'counsel', 'counter', 'country', 'courage', 'cousin', 'cradle', 'craft', 'crane', 'crater', 'crayon', 'credit', 'creek', 'crescent', 'crest', 'cricket', 'crimson', 'crisis', 'critic', 'crocus', 'cross', 'crowd', 'crown', 'crucial', 'cruise', 'crusade', 'crush', 'crystal', 'cube', 'cubic', 'culture', 'cupola', 'curator', 'curious', 'currant', 'current', 'curtain', 'cushion', 'custom', 'cyclone', 'cylinder',
  'dagger', 'dairy', 'daisy', 'damage', 'dance', 'danger', 'daring', 'database', 'dawn', 'daylight', 'dazzle', 'dealer', 'debate', 'debris', 'decade', 'decimal', 'declare', 'decor', 'decoy', 'decree', 'defense', 'delight', 'delta', 'demand', 'demise', 'density', 'dentist', 'deposit', 'depth', 'deputy', 'derive', 'desert', 'design', 'desktop', 'dessert', 'detail', 'detect', 'develop', 'device', 'devote', 'diagram', 'dial', 'diamond', 'diary', 'diesel', 'diet', 'differ', 'digest', 'digital', 'dignity', 'diligent', 'dimple', 'dinner', 'dinosaur', 'diploma', 'direct', 'disaster', 'disciple', 'discord', 'disease', 'dish', 'dismiss', 'display', 'dispute', 'distant', 'distort', 'diver', 'diverse', 'divide', 'divine', 'doctor', 'document', 'domain', 'dolphin', 'domino', 'donor', 'doorway', 'dormant', 'double', 'dragon', 'drain', 'drama', 'drawer', 'dream', 'drift', 'drill', 'driver', 'drone', 'drop', 'drum', 'dryer', 'duckling', 'duet', 'dune', 'durable', 'duration', 'dusk', 'dust', 'duty', 'dwarf', 'dynamic', 'dynamo',
  'eager', 'eagle', 'early', 'earth', 'easel', 'echo', 'eclipse', 'ecology', 'economy', 'edition', 'editor', 'educate', 'effort', 'elastic', 'elbow', 'elder', 'electric', 'element', 'elephant', 'elevator', 'elite', 'ellipse', 'elm', 'embargo', 'embark', 'emblem', 'emerald', 'emission', 'emotion', 'empire', 'employ', 'empower', 'enact', 'enclave', 'encore', 'endless', 'endorse', 'endure', 'energy', 'enforce', 'engine', 'enhance', 'enigma', 'enjoy', 'enlist', 'enough', 'enrich', 'ensemble', 'ensign', 'ensure', 'entail', 'enter', 'entity', 'entrance', 'entry', 'envelope', 'envoy', 'enzyme', 'epic', 'epoch', 'equal', 'equation', 'equator', 'equity', 'era', 'erase', 'ermine', 'erosion', 'error', 'erupt', 'escape', 'essay', 'essence', 'estate', 'esteem', 'eternal', 'ether', 'ethics', 'ethnic', 'evaluate', 'evening', 'event', 'evolve', 'exact', 'example', 'exceed', 'excel', 'excerpt', 'exchange', 'excite', 'exclude', 'execute', 'exempt', 'exert', 'exhale', 'exhaust', 'exhibit', 'exile', 'exist', 'exit', 'exotic', 'expand', 'expect', 'expert', 'explain', 'explore', 'export', 'expose', 'express', 'extend', 'extent', 'extra', 'extreme',
  'fabric', 'facade', 'facet', 'factory', 'faculty', 'falcon', 'fame', 'family', 'famous', 'fantasy', 'farmer', 'fashion', 'father', 'fatigue', 'fault', 'fauna', 'favor', 'feast', 'feature', 'federal', 'feedback', 'felony', 'feline', 'fellow', 'female', 'fender', 'fern', 'ferry', 'festival', 'fiber', 'fiction', 'field', 'fiesta', 'figure', 'filament', 'filter', 'final', 'finance', 'finch', 'finder', 'finger', 'finish', 'firefly', 'firewall', 'firm', 'fiscal', 'fission', 'fitness', 'fixture', 'flag', 'flame', 'flange', 'flare', 'flash', 'flask', 'flavor', 'fleet', 'flight', 'flint', 'flock', 'flora', 'flourish', 'flower', 'fluid', 'flute', 'flyer', 'focus', 'folklore', 'fondue', 'footing', 'forage', 'force', 'forecast', 'forest', 'forge', 'formal', 'formula', 'fortress', 'fortune', 'forum', 'fossil', 'foster', 'founder', 'fountain', 'fractal', 'fragment', 'frame', 'freedom', 'freeway', 'freeze', 'frequent', 'fresco', 'fresh', 'friction', 'frigate', 'frontier', 'frost', 'frugal', 'fruit', 'fuel', 'fulfill', 'full', 'function', 'fund', 'fungus', 'funnel', 'furious', 'furnace', 'fusion', 'future',
  'gadget', 'galaxy', 'gallery', 'galley', 'gamble', 'game', 'gamma', 'garage', 'garden', 'garlic', 'garnet', 'garrison', 'gasoline', 'gateway', 'gather', 'gauge', 'gazelle', 'gear', 'gemini', 'general', 'genesis', 'genius', 'genre', 'gentle', 'genuine', 'geology', 'geyser', 'ghost', 'giant', 'gibbon', 'gift', 'giggle', 'ginger', 'giraffe', 'glacier', 'glamour', 'glance', 'glass', 'glide', 'glimmer', 'glimpse', 'glitter', 'global', 'globe', 'glorious', 'glory', 'glossary', 'glove', 'glow', 'glucose', 'gnome', 'goblet', 'goddess', 'gold', 'golden', 'gondola', 'goodness', 'gopher', 'gorge', 'gorilla', 'gospel', 'gothic', 'govern', 'grace', 'gradient', 'graduate', 'grain', 'grammar', 'granite', 'grant', 'grape', 'graph', 'grasp', 'grass', 'grateful', 'gravity', 'greed', 'green', 'greet', 'grenade', 'grid', 'grief', 'griffin', 'grill', 'grind', 'grit', 'grizzly', 'grocery', 'ground', 'grove', 'growth', 'guard', 'guava', 'guess', 'guest', 'guide', 'guild', 'guitar', 'gulf', 'gull', 'gulp', 'guru', 'gust', 'gyro',
  'habitat', 'hack', 'hail', 'haircut', 'halcyon', 'half', 'hallmark', 'halo', 'halogen', 'halt', 'hamlet', 'hammer', 'hammock', 'handful', 'handle', 'hangar', 'happen', 'harbor', 'hardship', 'hardware', 'harmony', 'harness', 'harp', 'harpoon', 'harvest', 'haven', 'hawk', 'hazard', 'headline', 'health', 'heart', 'hearth', 'heat', 'heaven', 'heavy', 'hedge', 'height', 'helium', 'helix', 'helmet', 'helper', 'herald', 'herb', 'heritage', 'hero', 'heron', 'herring', 'hexagon', 'hideout', 'highland', 'highway', 'hiking', 'hilarious', 'hilltop', 'hint', 'historian', 'history', 'hive', 'hockey', 'holding', 'holiday', 'holly', 'home', 'homeland', 'honest', 'honey', 'honor', 'horizon', 'hormone', 'hornet', 'hospital', 'host', 'hostel', 'hotel', 'hound', 'hourly', 'house', 'hover', 'hubcap', 'huddle', 'hull', 'human', 'humble', 'humor', 'hunter', 'hurdle', 'hurricane', 'husky', 'hybrid', 'hydrant', 'hydraulic', 'hydro', 'hyena', 'hymn', 'hyper', 'hyphen',
  'iceberg', 'icon', 'ideal', 'identify', 'identity', 'ideology', 'idiom', 'idle', 'igloo', 'ignition', 'ignore', 'iguana', 'illusion', 'image', 'imagery', 'imagine', 'impact', 'impair', 'impala', 'impartial', 'impasse', 'imperial', 'impetus', 'implicit', 'import', 'impose', 'impress', 'improve', 'impulse', 'incident', 'income', 'increase', 'index', 'indigo', 'infinite', 'inform', 'infuse', 'ingot', 'inherit', 'initial', 'injure', 'inkwell', 'inland', 'inlet', 'inmate', 'inner', 'input', 'inquiry', 'insect', 'insert', 'inside', 'insight', 'insignia', 'inspect', 'inspire', 'install', 'instance', 'instant', 'instead', 'instinct', 'instruct', 'insulate', 'insure', 'intact', 'integer', 'integral', 'intend', 'intense', 'intent', 'interact', 'interest', 'interior', 'interim', 'intern', 'interval', 'intimate', 'into', 'intrigue', 'intro', 'intrude', 'invade', 'invent', 'inverse', 'invest', 'invite', 'invoke', 'involve', 'inward', 'iodine', 'ion', 'iris', 'iron', 'ironic', 'irony', 'island', 'isolate', 'isotope', 'issue', 'italic', 'ivory', 'ivy',
  'jackal', 'jacket', 'jaguar', 'jamboree', 'jasmine', 'jasper', 'javelin', 'jawbone', 'jeans', 'jeep', 'jelly', 'jest', 'jet', 'jewel', 'jigsaw', 'jingle', 'jockey', 'jogger', 'join', 'joint', 'joker', 'jolly', 'jolt', 'journal', 'journey', 'jovial', 'joyful', 'jubilee', 'judge', 'judicial', 'judo', 'juggle', 'juice', 'july', 'jumble', 'jumbo', 'jump', 'junction', 'june', 'jungle', 'junior', 'jupiter', 'jury', 'justice', 'justify', 'juvenile'
];

function setupPasswordGen() {
  // Listen for Spacebar shortcut when on Password Generator view
  window.addEventListener('keydown', e => {
    const view = document.getElementById('passwordgen-view');
    if (view && !view.classList.contains('hidden')) {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
        if (e.code === 'Space') {
          e.preventDefault();
          passwordgenGenerate();
        }
      }
    }
  });

  // Generate initial password on first load
  passwordgenGenerate();
}

function passwordgenSecureRandomInt(min, max) {
  if (min >= max) return min;
  const range = max - min + 1;
  const maxSafe = Math.floor(4294967296 / range) * range;
  const arr = new Uint32Array(1);
  let rand;
  do {
    window.crypto.getRandomValues(arr);
    rand = arr[0];
  } while (rand >= maxSafe);
  return min + (rand % range);
}

function passwordgenSetMode(mode) {
  passwordgenCurrentMode = mode;

  // Update tabs UI
  ['char', 'phrase', 'pin', 'bulk'].forEach(m => {
    const tabBtn = document.getElementById(`passwordgen-tab-${m}`);
    const panel = document.getElementById(`passwordgen-panel-${m}`);
    if (tabBtn) {
      if (m === mode) {
        tabBtn.className = 'flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition whitespace-nowrap bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm';
      } else {
        tabBtn.className = 'flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white';
      }
    }
    if (panel) {
      if (m === mode) panel.classList.remove('hidden');
      else panel.classList.add('hidden');
    }
  });

  if (mode === 'bulk') {
    passwordgenRunBulk();
  } else {
    passwordgenGenerate();
  }
}

function passwordgenSetLength(len) {
  const slider = document.getElementById('passwordgen-char-len-slider');
  if (slider) {
    slider.value = len;
    passwordgenOnLengthInput(len);
  }
}

function passwordgenOnLengthInput(val) {
  const lbl = document.getElementById('passwordgen-char-len-val');
  if (lbl) lbl.textContent = val;
  passwordgenGenerate();
}

function passwordgenSetWordCount(cnt) {
  const slider = document.getElementById('passwordgen-phrase-slider');
  if (slider) {
    slider.value = cnt;
    passwordgenOnWordCountInput(cnt);
  }
}

function passwordgenOnWordCountInput(val) {
  const lbl = document.getElementById('passwordgen-phrase-count-val');
  if (lbl) lbl.textContent = val;
  passwordgenGenerate();
}

function passwordgenSetPinLength(len) {
  const slider = document.getElementById('passwordgen-pin-slider');
  if (slider) {
    slider.value = len;
    passwordgenOnPinLengthInput(len);
  }
}

function passwordgenOnPinLengthInput(val) {
  const lbl = document.getElementById('passwordgen-pin-len-val');
  if (lbl) lbl.textContent = val;
  passwordgenGenerate();
}

function passwordgenGenerate() {
  let result = '';

  if (passwordgenCurrentMode === 'char') {
    const length = parseInt(document.getElementById('passwordgen-char-len-slider')?.value || '16', 10);
    const upper = document.getElementById('passwordgen-opt-upper')?.checked ?? true;
    const lower = document.getElementById('passwordgen-opt-lower')?.checked ?? true;
    const num = document.getElementById('passwordgen-opt-num')?.checked ?? true;
    const sym = document.getElementById('passwordgen-opt-sym')?.checked ?? true;
    const noAmbiguous = document.getElementById('passwordgen-opt-exclude-ambiguous')?.checked ?? false;
    const noSimilarSym = document.getElementById('passwordgen-opt-exclude-similar-sym')?.checked ?? false;

    result = passwordgenGenerateChar(length, upper, lower, num, sym, noAmbiguous, noSimilarSym);
  } else if (passwordgenCurrentMode === 'phrase') {
    const count = parseInt(document.getElementById('passwordgen-phrase-slider')?.value || '4', 10);
    const sep = document.getElementById('passwordgen-phrase-sep')?.value ?? '-';
    const casing = document.getElementById('passwordgen-phrase-case')?.value || 'title';
    const addNum = document.getElementById('passwordgen-phrase-add-num')?.checked ?? true;
    const addSym = document.getElementById('passwordgen-phrase-add-sym')?.checked ?? true;

    result = passwordgenGeneratePhrase(count, sep, casing, addNum, addSym);
  } else if (passwordgenCurrentMode === 'pin') {
    const length = parseInt(document.getElementById('passwordgen-pin-slider')?.value || '6', 10);
    const noSeq = document.getElementById('passwordgen-pin-no-seq')?.checked ?? true;
    const noRep = document.getElementById('passwordgen-pin-no-rep')?.checked ?? true;

    result = passwordgenGeneratePin(length, noSeq, noRep);
  } else if (passwordgenCurrentMode === 'bulk') {
    passwordgenRunBulk();
    return;
  }

  passwordgenCurrentPassword = result;
  passwordgenRenderColored(result);

  const { entropy, crackTime, strengthLevel } = passwordgenCalculateEntropy(result, passwordgenCurrentMode);
  passwordgenUpdateStrengthUI(entropy, crackTime, strengthLevel, result);
  passwordgenAddHistory(result);
}

function passwordgenGenerateChar(length, upper, lower, num, sym, noAmbiguous, noSimilarSym) {
  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let numChars = '0123456789';
  let symChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (noAmbiguous) {
    upperChars = upperChars.replace(/[O|I]/g, '');
    lowerChars = lowerChars.replace(/[o|l]/g, '');
    numChars = numChars.replace(/[0|1]/g, '');
    symChars = symChars.replace(/[|]/g, '');
  }

  if (noSimilarSym) {
    symChars = symChars.replace(/[{}\[\]()\/\\'"`~,;:]/g, '');
  }

  const pools = [];
  if (upper && upperChars.length > 0) pools.push(upperChars);
  if (lower && lowerChars.length > 0) pools.push(lowerChars);
  if (num && numChars.length > 0) pools.push(numChars);
  if (sym && symChars.length > 0) pools.push(symChars);

  if (pools.length === 0) {
    pools.push(lowerChars || 'abcdefghijklmnopqrstuvwxyz');
  }

  const allChars = pools.join('');
  const passwordArr = [];

  // Guarantee at least one character from each active pool
  pools.forEach(pool => {
    const rIdx = passwordgenSecureRandomInt(0, pool.length - 1);
    passwordArr.push(pool[rIdx]);
  });

  // Fill remainder
  while (passwordArr.length < length) {
    const rIdx = passwordgenSecureRandomInt(0, allChars.length - 1);
    passwordArr.push(allChars[rIdx]);
  }

  // Fisher-Yates CSPRNG shuffle
  for (let i = passwordArr.length - 1; i > 0; i--) {
    const j = passwordgenSecureRandomInt(0, i);
    const tmp = passwordArr[i];
    passwordArr[i] = passwordArr[j];
    passwordArr[j] = tmp;
  }

  return passwordArr.slice(0, length).join('');
}

function passwordgenGeneratePhrase(count, sep, casing, addNum, addSym) {
  const chosenWords = [];
  const dictLen = PASSWORDGEN_DICTIONARY.length;

  for (let i = 0; i < count; i++) {
    const idx = passwordgenSecureRandomInt(0, dictLen - 1);
    let word = PASSWORDGEN_DICTIONARY[idx];

    if (casing === 'title') {
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else if (casing === 'upper') {
      word = word.toUpperCase();
    } else if (casing === 'lower') {
      word = word.toLowerCase();
    } else if (casing === 'camel') {
      if (i === 0) word = word.toLowerCase();
      else word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    chosenWords.push(word);
  }

  let phrase = chosenWords.join(sep);

  if (addNum) {
    const randNum = passwordgenSecureRandomInt(10, 99);
    phrase += (sep || '') + randNum;
  }

  if (addSym) {
    const safeSymbols = ['!', '@', '#', '$', '%', '*', '?', '+', '='];
    const randSym = safeSymbols[passwordgenSecureRandomInt(0, safeSymbols.length - 1)];
    phrase += randSym;
  }

  return phrase;
}

function passwordgenGeneratePin(length, noSeq, noRep) {
  let attempts = 0;
  while (attempts < 200) {
    attempts++;
    const digits = [];
    for (let i = 0; i < length; i++) {
      digits.push(passwordgenSecureRandomInt(0, 9));
    }

    const pinStr = digits.join('');

    // Check repeated (e.g. 1111, 0000)
    if (noRep && digits.every(d => d === digits[0])) {
      continue;
    }

    // Check sequential (e.g. 1234, 4321)
    if (noSeq && length >= 3) {
      let isAscending = true;
      let isDescending = true;
      for (let i = 0; i < digits.length - 1; i++) {
        if (digits[i + 1] !== (digits[i] + 1) % 10) isAscending = false;
        if (digits[i + 1] !== (digits[i] - 1 + 10) % 10) isDescending = false;
      }
      if (isAscending || isDescending) continue;
    }

    return pinStr;
  }

  // Fallback direct generation
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += passwordgenSecureRandomInt(0, 9);
  }
  return pin;
}

function passwordgenCalculateEntropy(pwd, mode) {
  if (!pwd) return { entropy: 0, crackTime: 'Instant', strengthLevel: 0 };

  let poolSize = 0;
  if (mode === 'pin') {
    poolSize = 10;
  } else if (mode === 'phrase') {
    // Diceware word pool entropy
    const words = pwd.split(/[-_.\s/#]/).filter(Boolean);
    const hasNum = /\d/.test(pwd);
    const hasSym = /[^a-zA-Z0-9-_.\s/#]/.test(pwd);
    let entropy = words.length * Math.log2(PASSWORDGEN_DICTIONARY.length);
    if (hasNum) entropy += Math.log2(100);
    if (hasSym) entropy += Math.log2(10);
    entropy = Math.round(entropy * 10) / 10;

    return {
      entropy,
      crackTime: passwordgenFormatCrackTime(entropy),
      strengthLevel: passwordgenEntropyToLevel(entropy)
    };
  } else {
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;
  }

  if (poolSize === 0) poolSize = 26;

  const entropy = Math.round(pwd.length * Math.log2(poolSize) * 10) / 10;
  const crackTime = passwordgenFormatCrackTime(entropy);
  const strengthLevel = passwordgenEntropyToLevel(entropy);

  return { entropy, crackTime, strengthLevel };
}

function passwordgenEntropyToLevel(entropy) {
  if (entropy < 36) return 0; // Very Weak
  if (entropy < 55) return 1; // Weak
  if (entropy < 75) return 2; // Fair
  if (entropy < 95) return 3; // Strong
  return 4; // Ultra Secure
}

function passwordgenFormatCrackTime(entropy) {
  // Assume offline GPU cluster crack speed: 100 Billion guesses/sec (10^11)
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / (2 * 100000000000);

  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  
  const years = seconds / 31536000;
  if (years < 1000) return `~${Math.round(years)} years`;
  if (years < 1000000) return `~${(years / 1000).toFixed(1)}k years`;
  if (years < 1000000000) return `~${(years / 1000000).toFixed(1)} Million years`;
  if (years < 1000000000000) return `~${(years / 1000000000).toFixed(1)} Billion years`;
  return 'Trillions of years (Uncrackable)';
}

function passwordgenUpdateStrengthUI(entropy, crackTime, level, pwd) {
  const labelEl = document.getElementById('passwordgen-strength-label');
  const entropyEl = document.getElementById('passwordgen-entropy-label');
  const crackTimeEl = document.getElementById('passwordgen-crack-time');

  const strengthNames = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Ultra Secure'];
  const strengthColors = [
    'text-red-600 dark:text-red-400',
    'text-orange-500 dark:text-orange-400',
    'text-yellow-500 dark:text-yellow-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-teal-600 dark:text-teal-300 font-extrabold'
  ];

  if (labelEl) {
    labelEl.textContent = strengthNames[level];
    labelEl.className = `font-bold ${strengthColors[level]}`;
  }
  if (entropyEl) entropyEl.textContent = `${entropy} bits entropy`;
  if (crackTimeEl) crackTimeEl.textContent = `Crack Time: ${crackTime}`;

  // Update 5 segments
  const barColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-emerald-500',
    'bg-teal-500'
  ];

  for (let s = 1; s <= 5; s++) {
    const seg = document.getElementById(`passwordgen-seg-${s}`);
    if (seg) {
      if (s <= level + 1) {
        seg.className = `h-full rounded-full transition-colors duration-300 ${barColors[level]}`;
      } else {
        seg.className = 'h-full rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300';
      }
    }
  }

  // Update Checklist Pills
  const chkLen = document.getElementById('passwordgen-chk-len');
  const chkUpper = document.getElementById('passwordgen-chk-upper');
  const chkLower = document.getElementById('passwordgen-chk-lower');
  const chkNum = document.getElementById('passwordgen-chk-num');
  const chkSym = document.getElementById('passwordgen-chk-sym');

  const activePill = 'px-2 py-0.5 rounded-md font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1';
  const inactivePill = 'px-2 py-0.5 rounded-md font-medium bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 flex items-center gap-1 opacity-60';

  if (chkLen) {
    chkLen.className = pwd.length >= 16 ? activePill : inactivePill;
    chkLen.innerHTML = `<i data-lucide="${pwd.length >= 16 ? 'check' : 'x'}" style="width:12px;height:12px"></i> 16+ Chars`;
  }
  if (chkUpper) {
    const hasUpper = /[A-Z]/.test(pwd);
    chkUpper.className = hasUpper ? activePill : inactivePill;
    chkUpper.innerHTML = `<i data-lucide="${hasUpper ? 'check' : 'x'}" style="width:12px;height:12px"></i> Uppercase`;
  }
  if (chkLower) {
    const hasLower = /[a-z]/.test(pwd);
    chkLower.className = hasLower ? activePill : inactivePill;
    chkLower.innerHTML = `<i data-lucide="${hasLower ? 'check' : 'x'}" style="width:12px;height:12px"></i> Lowercase`;
  }
  if (chkNum) {
    const hasNum = /[0-9]/.test(pwd);
    chkNum.className = hasNum ? activePill : inactivePill;
    chkNum.innerHTML = `<i data-lucide="${hasNum ? 'check' : 'x'}" style="width:12px;height:12px"></i> Numbers`;
  }
  if (chkSym) {
    const hasSym = /[^a-zA-Z0-9]/.test(pwd);
    chkSym.className = hasSym ? activePill : inactivePill;
    chkSym.innerHTML = `<i data-lucide="${hasSym ? 'check' : 'x'}" style="width:12px;height:12px"></i> Symbols`;
  }

  lucide.createIcons();
}

function passwordgenRenderColored(pwd) {
  const displayEl = document.getElementById('passwordgen-display');
  if (!displayEl) return;

  if (passwordgenIsMasked) {
    displayEl.innerHTML = `<span class="text-gray-400 select-none tracking-widest font-mono">${'•'.repeat(Math.min(pwd.length, 32))}</span>`;
    return;
  }

  let html = '';
  for (let i = 0; i < pwd.length; i++) {
    const ch = pwd[i];
    if (/[0-9]/.test(ch)) {
      html += `<span class="text-amber-500 dark:text-amber-400 font-bold">${ch}</span>`;
    } else if (/[A-Z]/.test(ch)) {
      html += `<span class="text-blue-600 dark:text-blue-400 font-bold">${ch}</span>`;
    } else if (/[a-z]/.test(ch)) {
      html += `<span class="text-gray-800 dark:text-gray-100">${ch}</span>`;
    } else if (ch === ' ' || ch === '-' || ch === '_' || ch === '.') {
      html += `<span class="text-red-500 dark:text-red-400 font-bold">${ch}</span>`;
    } else {
      html += `<span class="text-emerald-600 dark:text-emerald-400 font-bold">${ch}</span>`;
    }
  }

  displayEl.innerHTML = html;
}

function passwordgenToggleMask() {
  passwordgenIsMasked = !passwordgenIsMasked;
  const icon = document.getElementById('passwordgen-mask-icon');
  if (icon) {
    icon.setAttribute('data-lucide', passwordgenIsMasked ? 'eye-off' : 'eye');
    lucide.createIcons();
  }
  passwordgenRenderColored(passwordgenCurrentPassword);
}

function passwordgenCopy() {
  if (!passwordgenCurrentPassword) return;

  navigator.clipboard.writeText(passwordgenCurrentPassword).then(() => {
    const btn = document.getElementById('passwordgen-copy-btn');
    const textEl = document.getElementById('passwordgen-copy-text');
    const icon = document.getElementById('passwordgen-copy-icon');

    if (btn && textEl && icon) {
      const origBg = btn.className;
      textEl.textContent = 'Copied!';
      icon.setAttribute('data-lucide', 'check');
      btn.className = 'px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 active:scale-95';
      lucide.createIcons();

      setTimeout(() => {
        textEl.textContent = 'Copy';
        icon.setAttribute('data-lucide', 'copy');
        btn.className = 'px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 active:scale-95';
        lucide.createIcons();
      }, 1500);
    }
  }).catch(err => {
    console.error('Clipboard copy failed:', err);
  });
}

function passwordgenAddHistory(pwd) {
  if (!pwd) return;
  if (passwordgenHistory.includes(pwd)) return;

  passwordgenHistory.unshift(pwd);
  if (passwordgenHistory.length > 15) {
    passwordgenHistory.pop();
  }

  passwordgenRenderHistory();
}

function passwordgenRenderHistory() {
  const listEl = document.getElementById('passwordgen-history-list');
  const badgeEl = document.getElementById('passwordgen-history-badge');
  if (!listEl) return;

  if (badgeEl) badgeEl.textContent = passwordgenHistory.length;

  if (passwordgenHistory.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-6 text-xs text-gray-400">
        Generated passwords in this session will appear here for quick recall.
      </div>
    `;
    return;
  }

  let html = '';
  passwordgenHistory.forEach((pwd, idx) => {
    const { entropy, strengthLevel } = passwordgenCalculateEntropy(pwd, 'char');
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-teal-500'];
    const names = ['Weak', 'Weak', 'Fair', 'Strong', 'Ultra'];

    html += `
      <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <div class="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <span class="w-2 h-2 rounded-full ${colors[strengthLevel]} flex-shrink-0"></span>
          <span class="font-mono text-xs text-gray-800 dark:text-gray-200 truncate select-all">${pwd}</span>
          <span class="text-[10px] text-gray-400 font-semibold px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0">${names[strengthLevel]}</span>
        </div>
        <button onclick="passwordgenCopyHistoryItem('${pwd.replace(/'/g, "\\'")}', this)" class="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition" title="Copy to clipboard">
          <i data-lucide="copy" style="width:14px;height:14px"></i>
        </button>
      </div>
    `;
  });

  listEl.innerHTML = html;
  lucide.createIcons();
}

function passwordgenCopyHistoryItem(pwd, btn) {
  navigator.clipboard.writeText(pwd).then(() => {
    if (btn) {
      btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px" class="text-emerald-500"></i>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" style="width:14px;height:14px"></i>';
        lucide.createIcons();
      }, 1200);
    }
  });
}

function passwordgenClearHistory() {
  passwordgenHistory = [];
  passwordgenRenderHistory();
}

function passwordgenRunBulk() {
  const count = parseInt(document.getElementById('passwordgen-bulk-count')?.value || '10', 10);
  const outputEl = document.getElementById('passwordgen-bulk-output');
  if (!outputEl) return;

  const passwords = [];
  for (let i = 0; i < count; i++) {
    // Generate according to active character / phrase settings
    const length = parseInt(document.getElementById('passwordgen-char-len-slider')?.value || '16', 10);
    const upper = document.getElementById('passwordgen-opt-upper')?.checked ?? true;
    const lower = document.getElementById('passwordgen-opt-lower')?.checked ?? true;
    const num = document.getElementById('passwordgen-opt-num')?.checked ?? true;
    const sym = document.getElementById('passwordgen-opt-sym')?.checked ?? true;
    const noAmbiguous = document.getElementById('passwordgen-opt-exclude-ambiguous')?.checked ?? false;
    const noSimilarSym = document.getElementById('passwordgen-opt-exclude-similar-sym')?.checked ?? false;

    const pwd = passwordgenGenerateChar(length, upper, lower, num, sym, noAmbiguous, noSimilarSym);
    passwords.push(pwd);
  }

  outputEl.value = passwords.join('\n');
}

function passwordgenCopyBulk() {
  const outputEl = document.getElementById('passwordgen-bulk-output');
  if (!outputEl || !outputEl.value.trim()) return;

  navigator.clipboard.writeText(outputEl.value).then(() => {
    alert('All bulk passwords copied to clipboard!');
  });
}

function passwordgenDownloadBulk(format) {
  const outputEl = document.getElementById('passwordgen-bulk-output');
  if (!outputEl || !outputEl.value.trim()) {
    passwordgenRunBulk();
  }
  const lines = outputEl.value.split('\n').filter(Boolean);
  if (lines.length === 0) return;

  let content = '';
  let filename = `passwords_${Date.now()}.${format}`;
  let mimeType = 'text/plain';

  if (format === 'csv') {
    mimeType = 'text/csv';
    content = 'Index,Password,Length,Entropy(Bits),Strength\n';
    lines.forEach((p, idx) => {
      const { entropy, strengthLevel } = passwordgenCalculateEntropy(p, 'char');
      const names = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Ultra Secure'];
      content += `${idx + 1},"${p}",${p.length},${entropy},"${names[strengthLevel]}"\n`;
    });
  } else {
    content = lines.join('\n');
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function passwordgenReset() {
  passwordgenCurrentMode = 'char';
  passwordgenSetMode('char');
}

// ===================== COLOR PICKER & PALETTE STUDIO =====================
let colorpickerCurrentTab = 'picker';
let colorpickerCurrentHue = 217;
let colorpickerCurrentSat = 0.76;
let colorpickerCurrentVal = 0.96;
let colorpickerCurrentAlpha = 1.0;
let colorpickerCurrentHex = '#3B82F6';
let colorpickerPaletteCategory = 'web';
let colorpickerActivePalette = null;
let colorpickerGradientType = 'linear';
let colorpickerGradientAngle = 135;
let colorpickerGradientStops = [
  { color: '#3b82f6', pos: 0 },
  { color: '#ec4899', pos: 100 }
];
let colorpickerExtractedColors = [];
let colorpickerIsDraggingSpectrum = false;

let colorpickerVisibleCounts = { web: 14, android: 12, ios: 12, aesthetic: 14 };

// Curated UI Palettes Dataset (Expansive base catalog + procedural generation)
const COLORPICKER_PALETTES = {
  web: [
    {
      name: 'Modern SaaS Indigo',
      desc: 'Clean & high-converting tech interface palette',
      roles: { primary: '#4F46E5', secondary: '#06B6D4', accent: '#F59E0B', surface: '#F8FAFC', background: '#0F172A' },
      colors: ['#4F46E5', '#06B6D4', '#F59E0B', '#F8FAFC', '#0F172A']
    },
    {
      name: 'Fintech Emerald',
      desc: 'Trustworthy, balanced banking & finance styling',
      roles: { primary: '#059669', secondary: '#10B981', accent: '#FBBF24', surface: '#F0FDF4', background: '#064E3B' },
      colors: ['#059669', '#10B981', '#FBBF24', '#F0FDF4', '#064E3B']
    },
    {
      name: 'Modern Coral Startup',
      desc: 'Energetic, warm consumer app and SaaS theme',
      roles: { primary: '#F43F5E', secondary: '#FB7185', accent: '#38BDF8', surface: '#FFF1F2', background: '#881337' },
      colors: ['#F43F5E', '#FB7185', '#38BDF8', '#FFF1F2', '#881337']
    },
    {
      name: 'Minimal Slate Tech',
      desc: 'Ultra clean monochromatic developer dashboard',
      roles: { primary: '#334155', secondary: '#64748B', accent: '#38BDF8', surface: '#F8FAFC', background: '#0F172A' },
      colors: ['#334155', '#64748B', '#38BDF8', '#F8FAFC', '#0F172A']
    },
    {
      name: 'Neon Cyber Agency',
      desc: 'Bold, punchy digital creative studio styling',
      roles: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#06B6D4', surface: '#1E1B4B', background: '#090514' },
      colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#1E1B4B', '#090514']
    },
    {
      name: 'Warm Terracotta Brand',
      desc: 'Inviting, organic lifestyle & e-commerce theme',
      roles: { primary: '#C2410C', secondary: '#EA580C', accent: '#FDE047', surface: '#FFF7ED', background: '#431407' },
      colors: ['#C2410C', '#EA580C', '#FDE047', '#FFF7ED', '#431407']
    },
    {
      name: 'Violet AI Cloud',
      desc: 'Next-gen artificial intelligence & cloud platform styling',
      roles: { primary: '#7C3AED', secondary: '#A855F7', accent: '#22D3EE', surface: '#FAF5FF', background: '#2E1065' },
      colors: ['#7C3AED', '#A855F7', '#22D3EE', '#FAF5FF', '#2E1065']
    },
    {
      name: 'Electric Sapphire Pro',
      desc: 'High-contrast enterprise SaaS and data visualization',
      roles: { primary: '#2563EB', secondary: '#38BDF8', accent: '#F97316', surface: '#EFF6FF', background: '#1E3A8A' },
      colors: ['#2563EB', '#38BDF8', '#F97316', '#EFF6FF', '#1E3A8A']
    },
    {
      name: 'Mint & Obsidian Web',
      desc: 'Sleek dark-mode Web3 and crypto application theme',
      roles: { primary: '#10B981', secondary: '#34D399', accent: '#A855F7', surface: '#18181B', background: '#09090B' },
      colors: ['#10B981', '#34D399', '#A855F7', '#18181B', '#09090B']
    },
    {
      name: 'Solar Flare Fintech',
      desc: 'Golden warm accents with deep navy authority',
      roles: { primary: '#D97706', secondary: '#F59E0B', accent: '#3B82F6', surface: '#FFFBEB', background: '#1E293B' },
      colors: ['#D97706', '#F59E0B', '#3B82F6', '#FFFBEB', '#1E293B']
    },
    {
      name: 'Crimson Peak Dev',
      desc: 'Sharp, aggressive code documentation and developer tooling',
      roles: { primary: '#E11D48', secondary: '#FB7185', accent: '#F59E0B', surface: '#FFF1F2', background: '#1E1E24' },
      colors: ['#E11D48', '#FB7185', '#F59E0B', '#FFF1F2', '#1E1E24']
    },
    {
      name: 'Oceanic Wave Corporate',
      desc: 'Refreshing cyan and deep maritime blue authority',
      roles: { primary: '#0284C7', secondary: '#06B6D4', accent: '#10B981', surface: '#F0F9FF', background: '#0C4A6E' },
      colors: ['#0284C7', '#06B6D4', '#10B981', '#F0F9FF', '#0C4A6E']
    },
    {
      name: 'Monochrome Matrix',
      desc: 'Pure grayscale minimalism with electric lime focal point',
      roles: { primary: '#18181B', secondary: '#71717A', accent: '#84CC16', surface: '#FAFAFA', background: '#09090B' },
      colors: ['#18181B', '#71717A', '#84CC16', '#FAFAFA', '#09090B']
    },
    {
      name: 'Teal & Amber Studio',
      desc: 'Cinematic color grading for design agencies and portfolios',
      roles: { primary: '#0D9488', secondary: '#2DD4BF', accent: '#F59E0B', surface: '#F0FDFA', background: '#134E4A' },
      colors: ['#0D9488', '#2DD4BF', '#F59E0B', '#F0FDFA', '#134E4A']
    }
  ],
  android: [
    {
      name: 'Material 3 Dynamic Blue',
      desc: 'Official Android M3 tonal baseline color role system',
      roles: { primary: '#0061A4', onPrimary: '#FFFFFF', container: '#D1E4FF', secondary: '#535F70', surface: '#FDFBFF', error: '#BA1A1A' },
      colors: ['#0061A4', '#D1E4FF', '#535F70', '#FDFBFF', '#BA1A1A']
    },
    {
      name: 'Material 3 Forest Green',
      desc: 'Eco & productivity Android M3 palette',
      roles: { primary: '#2E6A38', onPrimary: '#FFFFFF', container: '#B1F2B3', secondary: '#52634F', surface: '#FCFDF6', error: '#BA1A1A' },
      colors: ['#2E6A38', '#B1F2B3', '#52634F', '#FCFDF6', '#BA1A1A']
    },
    {
      name: 'Material 3 Sunset Terracotta',
      desc: 'Warm expressive Android M3 theme',
      roles: { primary: '#8F4C38', onPrimary: '#FFFFFF', container: '#FFDBD1', secondary: '#77574E', surface: '#FFF8F6', error: '#BA1A1A' },
      colors: ['#8F4C38', '#FFDBD1', '#77574E', '#FFF8F6', '#BA1A1A']
    },
    {
      name: 'Material 3 Plum Berry',
      desc: 'Creative & social Android application theme',
      roles: { primary: '#824B77', onPrimary: '#FFFFFF', container: '#FFD7F3', secondary: '#6E5868', surface: '#FFF7FA', error: '#BA1A1A' },
      colors: ['#824B77', '#FFD7F3', '#6E5868', '#FFF7FA', '#BA1A1A']
    },
    {
      name: 'Material 3 Ocean Teal',
      desc: 'Crisp medical, utility & health app scheme',
      roles: { primary: '#006A6A', onPrimary: '#FFFFFF', container: '#70F7F6', secondary: '#4A6363', surface: '#FAFDFD', error: '#BA1A1A' },
      colors: ['#006A6A', '#70F7F6', '#4A6363', '#FAFDFD', '#BA1A1A']
    },
    {
      name: 'Material 3 Golden Amber',
      desc: 'Sunlit warmth and high-visibility Android M3 theme',
      roles: { primary: '#795900', onPrimary: '#FFFFFF', container: '#FFE088', secondary: '#6B5D3F', surface: '#FFFBFF', error: '#BA1A1A' },
      colors: ['#795900', '#FFE088', '#6B5D3F', '#FFFBFF', '#BA1A1A']
    },
    {
      name: 'Material 3 Rose Velvet',
      desc: 'Elegant lifestyle and content creator Android theme',
      roles: { primary: '#9B4061', onPrimary: '#FFFFFF', container: '#FFD9E2', secondary: '#74565F', surface: '#FFFBFF', error: '#BA1A1A' },
      colors: ['#9B4061', '#FFD9E2', '#74565F', '#FFFBFF', '#BA1A1A']
    },
    {
      name: 'Material 3 Cosmic Violet',
      desc: 'Mystic deep purple Android M3 gaming and media scheme',
      roles: { primary: '#6750A4', onPrimary: '#FFFFFF', container: '#EADDFF', secondary: '#625B71', surface: '#FFFBFE', error: '#BA1A1A' },
      colors: ['#6750A4', '#EADDFF', '#625B71', '#FFFBFE', '#BA1A1A']
    },
    {
      name: 'Material 3 Sage Minimal',
      desc: 'Soft muted botanical productivity and note-taking theme',
      roles: { primary: '#4C662B', onPrimary: '#FFFFFF', container: '#CDEDA3', secondary: '#586249', surface: '#F9FAEF', error: '#BA1A1A' },
      colors: ['#4C662B', '#CDEDA3', '#586249', '#F9FAEF', '#BA1A1A']
    },
    {
      name: 'Material 3 Coral Flame',
      desc: 'Vivid high-energy fitness and sports tracking theme',
      roles: { primary: '#A23F16', onPrimary: '#FFFFFF', container: '#FFDBD0', secondary: '#77574D', surface: '#FFF8F6', error: '#BA1A1A' },
      colors: ['#A23F16', '#FFDBD0', '#77574D', '#FFF8F6', '#BA1A1A']
    },
    {
      name: 'Material 3 Sky Blue',
      desc: 'Open atmospheric travel and navigation Android theme',
      roles: { primary: '#006590', onPrimary: '#FFFFFF', container: '#C8E6FF', secondary: '#4F606E', surface: '#FCFCFF', error: '#BA1A1A' },
      colors: ['#006590', '#C8E6FF', '#4F606E', '#FCFCFF', '#BA1A1A']
    },
    {
      name: 'Material 3 Charcoal Dark',
      desc: 'Refined AMOLED dark mode Android M3 system theme',
      roles: { primary: '#D0BCFF', onPrimary: '#381E72', container: '#4F378B', secondary: '#CCC2DC', surface: '#141218', error: '#F2B8B5' },
      colors: ['#D0BCFF', '#4F378B', '#CCC2DC', '#141218', '#F2B8B5']
    }
  ],
  ios: [
    {
      name: 'Cupertino System Baseline',
      desc: 'Native Apple Human Interface Guidelines system colors',
      roles: { systemBlue: '#007AFF', systemGreen: '#34C759', systemIndigo: '#5856D6', label: '#000000', systemBackground: '#FFFFFF', secondaryBackground: '#F2F2F7' },
      colors: ['#007AFF', '#34C759', '#5856D6', '#000000', '#FFFFFF', '#F2F2F7']
    },
    {
      name: 'Apple Music Crimson',
      desc: 'Vibrant media player & streaming audio theme',
      roles: { accent: '#FA2D48', secondary: '#FF375F', purple: '#BF5AF2', label: '#000000', background: '#FFFFFF', groupedBg: '#F2F2F7' },
      colors: ['#FA2D48', '#FF375F', '#BF5AF2', '#000000', '#FFFFFF', '#F2F2F7']
    },
    {
      name: 'Apple Health Orange',
      desc: 'Warm biometric metrics & tracking iOS theme',
      roles: { accent: '#FF9500', alert: '#FF3B30', gold: '#FFCC00', label: '#000000', background: '#FFFFFF', groupedBg: '#F2F2F7' },
      colors: ['#FF9500', '#FF3B30', '#FFCC00', '#000000', '#FFFFFF', '#F2F2F7']
    },
    {
      name: 'Apple Fitness Activity',
      desc: 'High-contrast neon activity rings styling',
      roles: { moveRed: '#FF2D55', exerciseGreen: '#A4E000', standCyan: '#00F0FF', label: '#FFFFFF', darkBg: '#000000', cardBg: '#1C1C1E' },
      colors: ['#FF2D55', '#A4E000', '#00F0FF', '#FFFFFF', '#000000', '#1C1C1E']
    },
    {
      name: 'Cupertino Dark Midnight',
      desc: 'Refined iOS Dark Mode system tint palette',
      roles: { systemBlue: '#0A84FF', systemGreen: '#30D158', systemIndigo: '#5E5CE6', label: '#FFFFFF', systemBackground: '#000000', secondaryBackground: '#1C1C1E' },
      colors: ['#0A84FF', '#30D158', '#5E5CE6', '#FFFFFF', '#000000', '#1C1C1E']
    },
    {
      name: 'Apple Podcasts Purple',
      desc: 'Deep purple broadcast studio & audio show styling',
      roles: { accent: '#8E44AD', secondary: '#9B59B6', tint: '#E056FD', label: '#000000', background: '#FFFFFF', groupedBg: '#F2F2F7' },
      colors: ['#8E44AD', '#9B59B6', '#E056FD', '#000000', '#FFFFFF', '#F2F2F7']
    },
    {
      name: 'Apple News Crimson',
      desc: 'Editorial typography and journalistic accents',
      roles: { accent: '#FF2D55', secondary: '#5856D6', gold: '#FF9500', label: '#000000', background: '#FFFFFF', groupedBg: '#F2F2F7' },
      colors: ['#FF2D55', '#5856D6', '#FF9500', '#000000', '#FFFFFF', '#F2F2F7']
    },
    {
      name: 'Apple Arcade Sunset',
      desc: 'Playful high-saturation iOS gaming catalog theme',
      roles: { primary: '#FF5E3A', secondary: '#FF2A68', cyan: '#54E346', label: '#FFFFFF', background: '#121212', groupedBg: '#242426' },
      colors: ['#FF5E3A', '#FF2A68', '#54E346', '#FFFFFF', '#121212', '#242426']
    },
    {
      name: 'Apple Maps Teal',
      desc: 'Geographic and urban transit navigation system palette',
      roles: { primary: '#30B0C7', secondary: '#34C759', route: '#007AFF', label: '#000000', background: '#FFFFFF', groupedBg: '#F2F2F7' },
      colors: ['#30B0C7', '#34C759', '#007AFF', '#000000', '#FFFFFF', '#F2F2F7']
    },
    {
      name: 'Cupertino Graphite Pro',
      desc: 'Monochrome slate iOS camera and pro tool interface',
      roles: { primary: '#8E8E93', secondary: '#636366', accent: '#FFD60A', label: '#FFFFFF', background: '#000000', groupedBg: '#1C1C1E' },
      colors: ['#8E8E93', '#636366', '#FFD60A', '#FFFFFF', '#000000', '#1C1C1E']
    },
    {
      name: 'Apple Books Sepia',
      desc: 'Eye-friendly warm reading and typography layout',
      roles: { primary: '#8C6239', secondary: '#C69C6D', accent: '#D97706', label: '#3C2A1E', background: '#F8F1E7', groupedBg: '#EDE4D8' },
      colors: ['#8C6239', '#C69C6D', '#D97706', '#3C2A1E', '#F8F1E7', '#EDE4D8']
    },
    {
      name: 'Apple TV Dark Cyan',
      desc: 'Immersive cinematic backdrop with glowing cyan focal points',
      roles: { primary: '#64D2FF', secondary: '#5E5CE6', accent: '#FF375F', label: '#FFFFFF', background: '#0B0D17', groupedBg: '#16192B' },
      colors: ['#64D2FF', '#5E5CE6', '#FF375F', '#FFFFFF', '#0B0D17', '#16192B']
    }
  ],
  aesthetic: [
    {
      name: 'Cyberpunk 2077',
      desc: 'High-voltage neon yellow, cyan, and deep asphalt',
      colors: ['#FFE600', '#00F0FF', '#FF003C', '#000000', '#2A2A2A']
    },
    {
      name: 'Pastel Dream',
      desc: 'Soft cotton candy, lavender, and sky tints',
      colors: ['#FBCFE8', '#C7D2FE', '#BAE6FD', '#F0FDF4', '#475569']
    },
    {
      name: 'Retro 80s Synthwave',
      desc: 'Electric magenta, neon violet, and laser cyan',
      colors: ['#FF007F', '#7928CA', '#00DFD8', '#120024', '#2D006B']
    },
    {
      name: 'Nordic Minimal Frost',
      desc: 'Crisp scandinavian ice blue and slate minimalism',
      colors: ['#38BDF8', '#0284C7', '#E2E8F0', '#F8FAFC', '#0F172A']
    },
    {
      name: 'Matcha Cafe',
      desc: 'Calm botanical sage, moss, and warm oatmilk',
      colors: ['#84A98C', '#52796F', '#354F52', '#CAD2C5', '#2F3E46']
    },
    {
      name: 'Warm Coffee Roaster',
      desc: 'Rich espresso, caramel froth, and toasted bean',
      colors: ['#6F4E37', '#A67B5B', '#ECB176', '#FED8B1', '#3E2723']
    },
    {
      name: 'Tokyo Neon Nights',
      desc: 'Electric violet, cherry blossom pink, and rain-slicked tarmac',
      colors: ['#A855F7', '#EC4899', '#06B6D4', '#0F172A', '#020617']
    },
    {
      name: 'Sunset Boulevard',
      desc: 'Golden hour amber, deep crimson, and dusky purple',
      colors: ['#F59E0B', '#EF4444', '#7C3AED', '#FFFBEB', '#1E1B4B']
    },
    {
      name: 'Vintage 70s Warmth',
      desc: 'Mustard gold, burnt sienna, avocado, and cream',
      colors: ['#D97706', '#C2410C', '#65A30D', '#FEF3C7', '#451A03']
    },
    {
      name: 'Desert Mirage',
      desc: 'Sand dune beige, terracotta clay, and turquoise oasis',
      colors: ['#D97706', '#EA580C', '#0D9488', '#FFFBEB', '#292524']
    },
    {
      name: 'Lavender Haze',
      desc: 'Dreamy soft amethyst, periwinkle, and misty cloud',
      colors: ['#C084FC', '#818CF8', '#38BDF8', '#FAF5FF', '#312E81']
    },
    {
      name: 'Deep Ocean Abyss',
      desc: 'Bioluminescent cyan, deep navy depth, and seafoam',
      colors: ['#06B6D4', '#0284C7', '#10B981', '#F0FDFA', '#082F49']
    },
    {
      name: 'Citrus Burst',
      desc: 'Energizing blood orange, lime zest, and radiant lemon',
      colors: ['#F97316', '#84CC16', '#FACC15', '#FFF7ED', '#1C1917']
    },
    {
      name: 'Gothic Noir Luxury',
      desc: 'Deep obsidian, rich gold metallic, and crimson wine',
      colors: ['#EAB308', '#991B1B', '#4B5563', '#18181B', '#000000']
    }
  ]
};

// Procedural AI Palette Generator for Infinite Discovery
function colorpickerGenerateProceduralPalette(cat) {
  const baseHues = [210, 160, 280, 15, 45, 340, 190, 260, 120];
  const randHue = (baseHues[Math.floor(Math.random() * baseHues.length)] + Math.floor(Math.random() * 40 - 20) + 360) % 360;
  const randId = Math.floor(100 + Math.random() * 900);

  const priRgb = hslToRgb(randHue, 80, 50);
  const priHex = rgbToHex(priRgb.r, priRgb.g, priRgb.b);

  const secRgb = hslToRgb((randHue + 40) % 360, 75, 55);
  const secHex = rgbToHex(secRgb.r, secRgb.g, secRgb.b);

  const accRgb = hslToRgb((randHue + 180) % 360, 85, 52);
  const accHex = rgbToHex(accRgb.r, accRgb.g, accRgb.b);

  if (cat === 'web') {
    const surRgb = hslToRgb(randHue, 20, 97);
    const surHex = rgbToHex(surRgb.r, surRgb.g, surRgb.b);
    const bgRgb = hslToRgb((randHue + 20) % 360, 45, 10);
    const bgHex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);

    const prefixes = ['Hyper', 'Quantum', 'Nexus', 'Pulse', 'Vertex', 'Apex', 'Aero', 'Prism', 'Orbit'];
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} SaaS #${randId}`;

    return {
      name,
      desc: 'Dynamically harmonized 60-30-10 web interface scheme',
      roles: { primary: priHex, secondary: secHex, accent: accHex, surface: surHex, background: bgHex },
      colors: [priHex, secHex, accHex, surHex, bgHex]
    };
  } else if (cat === 'android') {
    const contRgb = hslToRgb(randHue, 80, 90);
    const contHex = rgbToHex(contRgb.r, contRgb.g, contRgb.b);
    const secM3Rgb = hslToRgb((randHue + 20) % 360, 25, 40);
    const secM3Hex = rgbToHex(secM3Rgb.r, secM3Rgb.g, secM3Rgb.b);
    const surM3Rgb = hslToRgb(randHue, 20, 98);
    const surM3Hex = rgbToHex(surM3Rgb.r, surM3Rgb.g, surM3Rgb.b);

    const prefixes = ['Material', 'Tonal', 'Dynamic', 'Android', 'Expressive', 'Adaptive'];
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} #${randId}`;

    return {
      name,
      desc: 'Algorithmic Material 3 tonal elevation and color roles',
      roles: { primary: priHex, onPrimary: '#FFFFFF', container: contHex, secondary: secM3Hex, surface: surM3Hex, error: '#BA1A1A' },
      colors: [priHex, contHex, secM3Hex, surM3Hex, '#BA1A1A']
    };
  } else if (cat === 'ios') {
    const sysIndigoRgb = hslToRgb((randHue + 30) % 360, 75, 55);
    const sysIndigoHex = rgbToHex(sysIndigoRgb.r, sysIndigoRgb.g, sysIndigoRgb.b);

    const prefixes = ['Cupertino', 'iOS Dynamic', 'Swift', 'HIG Accent', 'Apple Studio'];
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} #${randId}`;

    return {
      name,
      desc: 'Apple Human Interface Guidelines system color styling',
      roles: { systemBlue: priHex, systemGreen: secHex, systemIndigo: sysIndigoHex, label: '#000000', systemBackground: '#FFFFFF', secondaryBackground: '#F2F2F7' },
      colors: [priHex, secHex, sysIndigoHex, '#000000', '#FFFFFF', '#F2F2F7']
    };
  } else {
    const surAestRgb = hslToRgb((randHue + 180) % 360, 40, 96);
    const surAestHex = rgbToHex(surAestRgb.r, surAestRgb.g, surAestRgb.b);
    const bgAestRgb = hslToRgb(randHue, 50, 8);
    const bgAestHex = rgbToHex(bgAestRgb.r, bgAestRgb.g, bgAestRgb.b);

    const prefixes = ['Ethereal', 'Velvet', 'Aurora', 'Celestial', 'Chroma', 'Eclipse', 'Luminous'];
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} #${randId}`;

    return {
      name,
      desc: 'Harmonic aesthetic color scheme generated on demand',
      colors: [priHex, secHex, accHex, surAestHex, bgAestHex]
    };
  }
}

function colorpickerSetPaletteCategory(cat) {
  colorpickerPaletteCategory = cat;
  ['web', 'android', 'ios', 'aesthetic'].forEach(c => {
    const btn = document.getElementById(`colorpicker-cat-${c}`);
    if (btn) {
      if (c === cat) {
        btn.className = 'py-2 px-4 rounded-xl text-xs font-bold bg-yellow-500 text-white shadow-sm transition whitespace-nowrap';
      } else {
        btn.className = 'py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 transition whitespace-nowrap';
      }
    }
  });

  colorpickerRenderPalettes();
}

function colorpickerRenderPalettes() {
  const grid = document.getElementById('colorpicker-palettes-grid');
  const countBadge = document.getElementById('colorpicker-palettes-count-badge');
  if (!grid) return;

  const list = COLORPICKER_PALETTES[colorpickerPaletteCategory] || COLORPICKER_PALETTES.web;
  const visibleLimit = colorpickerVisibleCounts[colorpickerPaletteCategory] || 6;
  const displayedList = list.slice(0, visibleLimit);

  if (countBadge) {
    countBadge.textContent = `Showing ${displayedList.length} Palettes`;
  }

  if (!colorpickerActivePalette && displayedList.length > 0) {
    colorpickerActivePalette = displayedList[0];
  }

  colorpickerUpdateMockupBoard(colorpickerActivePalette || displayedList[0]);

  let html = '';
  displayedList.forEach((pal, idx) => {
    html += `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-4 hover:border-yellow-300 dark:hover:border-yellow-700 transition">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100">${pal.name}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${pal.desc || ''}</p>
          </div>
          <button onclick="colorpickerSelectPalette(${idx})" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 transition">
            Preview UI
          </button>
        </div>

        <!-- Swatches Bar -->
        <div class="flex rounded-xl overflow-hidden h-12 shadow-sm border border-gray-200 dark:border-gray-700">
    `;

    pal.colors.forEach(hex => {
      html += `
        <button onclick="colorpickerOnNativeChange('${hex}')" class="flex-1 h-full transition hover:opacity-90 relative group" style="background-color: ${hex};" title="Click to load into picker: ${hex}">
          <span class="opacity-0 group-hover:opacity-100 text-[8px] font-mono font-bold text-white drop-shadow bg-black/60 px-1 py-0.5 rounded absolute inset-x-0 bottom-1 mx-auto block text-center">${hex}</span>
        </button>
      `;
    });

    html += `
        </div>

        <!-- Export Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-semibold">
          <button onclick="colorpickerExportPalette(${idx}, 'tailwind')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">Tailwind</button>
          <button onclick="colorpickerExportPalette(${idx}, 'css')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">CSS Vars</button>
          <button onclick="colorpickerExportPalette(${idx}, 'android-xml')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">XML</button>
          <button onclick="colorpickerExportPalette(${idx}, 'swiftui')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">SwiftUI</button>
          <button onclick="colorpickerExportPalette(${idx}, 'json')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">JSON</button>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function colorpickerExploreMorePalettes() {
  const cat = colorpickerPaletteCategory;
  const list = COLORPICKER_PALETTES[cat] || COLORPICKER_PALETTES.web;

  colorpickerVisibleCounts[cat] = (colorpickerVisibleCounts[cat] || 6) + 6;

  // If visible count exceeds existing catalog, generate fresh procedural palettes
  while (list.length < colorpickerVisibleCounts[cat]) {
    const newPal = colorpickerGenerateProceduralPalette(cat);
    list.push(newPal);
  }

  // Render palettes — this updates the badge via colorpickerRenderPalettes
  colorpickerRenderPalettes();

  // Explicitly force the badge to the correct count (guaranteed update)
  const badge = document.getElementById('colorpicker-palettes-count-badge');
  if (badge) {
    const shown = Math.min(colorpickerVisibleCounts[cat], list.length);
    badge.textContent = `Showing ${shown} Palettes`;
  }

  // Brief button feedback — only animate the button, do NOT touch the badge
  const btn = document.getElementById('colorpicker-explore-more-btn');
  if (btn) {
    btn.style.opacity = '0.7';
    btn.style.transform = 'scale(0.97)';
    setTimeout(() => {
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    }, 300);
  }
}

function colorpickerGenerateCustomPalette() {
  const cat = colorpickerPaletteCategory;
  const list = COLORPICKER_PALETTES[cat] || COLORPICKER_PALETTES.web;

  const newPal = colorpickerGenerateProceduralPalette(cat);
  newPal.name = `✨ Custom ${newPal.name}`;
  list.unshift(newPal);
  colorpickerVisibleCounts[cat] = (colorpickerVisibleCounts[cat] || 6) + 1;

  colorpickerActivePalette = newPal;
  colorpickerRenderPalettes();

  // Explicitly force the badge to the correct count (guaranteed update)
  const badge = document.getElementById('colorpicker-palettes-count-badge');
  if (badge) {
    const shown = Math.min(colorpickerVisibleCounts[cat], list.length);
    badge.textContent = `Showing ${shown} Palettes`;
  }

  // Scroll smoothly to top of palette grid to see newly generated palette
  document.getElementById('colorpicker-mockup-board')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function colorpickerSelectPalette(idx) {
  const list = COLORPICKER_PALETTES[colorpickerPaletteCategory] || COLORPICKER_PALETTES.web;
  const pal = list[idx];
  if (!pal) return;

  colorpickerActivePalette = pal;
  colorpickerUpdateMockupBoard(pal);
}

function colorpickerUpdateMockupBoard(pal) {
  if (!pal) return;
  const titleEl = document.getElementById('colorpicker-mockup-palette-name');
  if (titleEl) titleEl.textContent = pal.name;

  const colors = pal.colors;
  const pri = colors[0] || '#4f46e5';
  const sec = colors[1] || '#06b6d4';
  const acc = colors[2] || '#f59e0b';
  const sur = colors[3] || '#f8fafc';
  const bg = colors[4] || '#0f172a';

  const board = document.getElementById('colorpicker-mockup-board');
  const avatar = document.getElementById('colorpicker-mockup-avatar');
  const title = document.getElementById('colorpicker-mockup-title');
  const badge = document.getElementById('colorpicker-mockup-badge');
  const card = document.getElementById('colorpicker-mockup-card');
  const btnPri = document.getElementById('colorpicker-mockup-btn-pri');
  const btnSec = document.getElementById('colorpicker-mockup-btn-sec');
  const accent = document.getElementById('colorpicker-mockup-accent');

  if (board) board.style.backgroundColor = sur;
  if (avatar) avatar.style.backgroundColor = pri;
  if (title) title.style.color = bg;
  if (badge) {
    badge.style.backgroundColor = sec + '25';
    badge.style.color = sec;
  }
  if (card) {
    card.style.backgroundColor = '#ffffff';
    card.style.borderColor = sec + '30';
  }
  if (btnPri) btnPri.style.backgroundColor = pri;
  if (btnSec) {
    btnSec.style.backgroundColor = sur;
    btnSec.style.color = pri;
    btnSec.style.borderColor = pri + '50';
  }
  if (accent) accent.style.color = acc;
}

function colorpickerExportPalette(idx, format) {
  const list = COLORPICKER_PALETTES[colorpickerPaletteCategory] || COLORPICKER_PALETTES.web;
  const pal = list[idx];
  if (!pal) return;

  let code = '';
  const colors = pal.colors;

  if (format === 'tailwind') {
    code = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: '${colors[0]}',\n        secondary: '${colors[1]}',\n        accent: '${colors[2]}',\n        surface: '${colors[3]}',\n        dark: '${colors[4]}'\n      }\n    }\n  }\n};`;
  } else if (format === 'css') {
    code = `:root {\n  --color-primary: ${colors[0]};\n  --color-secondary: ${colors[1]};\n  --color-accent: ${colors[2]};\n  --color-surface: ${colors[3]};\n  --color-background: ${colors[4]};\n}`;
  } else if (format === 'android-xml') {
    code = `<!-- res/values/colors.xml -->\n<resources>\n    <color name="primary">${colors[0]}</color>\n    <color name="secondary">${colors[1]}</color>\n    <color name="accent">${colors[2]}</color>\n    <color name="surface">${colors[3]}</color>\n    <color name="background">${colors[4]}</color>\n</resources>`;
  } else if (format === 'swiftui') {
    code = `// Colors.swift\nimport SwiftUI\n\nextension Color {\n    static let primaryBrand = Color(hex: "${colors[0]}")\n    static let secondaryBrand = Color(hex: "${colors[1]}")\n    static let accentBrand = Color(hex: "${colors[2]}")\n}`;
  } else if (format === 'json') {
    code = JSON.stringify(pal, null, 2);
  }

  navigator.clipboard.writeText(code).then(() => {
    alert(`Copied ${pal.name} as ${format.toUpperCase()}!`);
  });
}


// Curated Gradient Presets
const COLORPICKER_GRADIENT_PRESETS = [
  { name: 'Instagram Vibe', css: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', stops: [{ color: '#833ab4', pos: 0 }, { color: '#fd1d1d', pos: 50 }, { color: '#fcb045', pos: 100 }] },
  { name: 'Sunset Bloom', css: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', stops: [{ color: '#ff0844', pos: 0 }, { color: '#ffb199', pos: 100 }] },
  { name: 'Hyper Neon', css: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)', stops: [{ color: '#3b82f6', pos: 0 }, { color: '#ec4899', pos: 100 }] },
  { name: 'Ocean Breeze', css: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)', stops: [{ color: '#2af598', pos: 0 }, { color: '#009efd', pos: 100 }] },
  { name: 'Emerald Sky', css: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', stops: [{ color: '#0ba360', pos: 0 }, { color: '#3cba92', pos: 100 }] },
  { name: 'Midnight Purple', css: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)', stops: [{ color: '#654ea3', pos: 0 }, { color: '#eaafc8', pos: 100 }] },
  { name: 'Warm Peach', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', stops: [{ color: '#ff9a9e', pos: 0 }, { color: '#fecfef', pos: 100 }] },
  { name: 'Electric Violet', css: 'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)', stops: [{ color: '#4776e6', pos: 0 }, { color: '#8e54e9', pos: 100 }] },
  { name: 'Cosmic Fusion', css: 'linear-gradient(135deg, #ff007f 0%, #7928ca 50%, #00dfd8 100%)', stops: [{ color: '#ff007f', pos: 0 }, { color: '#7928ca', pos: 50 }, { color: '#00dfd8', pos: 100 }] },
  { name: 'Flamingo Lush', css: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', stops: [{ color: '#f857a6', pos: 0 }, { color: '#ff5858', pos: 100 }] },
  { name: 'Sublime Light', css: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)', stops: [{ color: '#fc5c7d', pos: 0 }, { color: '#6a82fb', pos: 100 }] },
  { name: 'Dark Cyber', css: 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)', stops: [{ color: '#182848', pos: 0 }, { color: '#4b6cb7', pos: 100 }] }
];

function setupColorPicker() {
  setupSpectrumEvents();
  colorpickerSetColorFromHsv(217, 0.76, 0.96, 1.0);
  colorpickerRenderPalettes();
  colorpickerRenderGradientPresets();
  colorpickerUpdateGradient();
}

function colorpickerSetTab(tab) {
  colorpickerCurrentTab = tab;
  ['picker', 'palettes', 'gradients', 'extractor'].forEach(t => {
    const tabBtn = document.getElementById(`colorpicker-tab-${t}`);
    const panel = document.getElementById(`colorpicker-panel-${t}`);
    if (tabBtn) {
      if (t === tab) {
        tabBtn.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap bg-yellow-500 text-white shadow-sm flex items-center justify-center gap-1.5';
      } else {
        tabBtn.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5';
      }
    }
    if (panel) {
      if (t === tab) panel.classList.remove('hidden');
      else panel.classList.add('hidden');
    }
  });

  if (tab === 'picker') {
    setTimeout(colorpickerDrawSpectrum, 50);
  }
}

// ===================== SPECTRUM 2D CANVAS =====================
function setupSpectrumEvents() {
  const box = document.getElementById('colorpicker-spectrum-box');
  const canvas = document.getElementById('colorpicker-spectrum-canvas');
  if (!box || !canvas) return;

  function handlePoint(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    let y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    colorpickerCurrentSat = x / rect.width;
    colorpickerCurrentVal = 1 - (y / rect.height);

    colorpickerSetColorFromHsv(colorpickerCurrentHue, colorpickerCurrentSat, colorpickerCurrentVal, colorpickerCurrentAlpha);
  }

  box.addEventListener('mousedown', e => {
    colorpickerIsDraggingSpectrum = true;
    handlePoint(e);
  });

  window.addEventListener('mousemove', e => {
    if (colorpickerIsDraggingSpectrum) handlePoint(e);
  });

  window.addEventListener('mouseup', () => {
    colorpickerIsDraggingSpectrum = false;
  });

  box.addEventListener('touchstart', e => {
    colorpickerIsDraggingSpectrum = true;
    handlePoint(e);
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    if (colorpickerIsDraggingSpectrum) handlePoint(e);
  }, { passive: false });

  window.addEventListener('touchend', () => {
    colorpickerIsDraggingSpectrum = false;
  });

  window.addEventListener('resize', () => {
    if (colorpickerCurrentTab === 'picker') colorpickerDrawSpectrum();
  });
}

function colorpickerDrawSpectrum() {
  const canvas = document.getElementById('colorpicker-spectrum-canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width || 300;
  canvas.height = rect.height || 208;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Base hue color
  const baseRgb = hslToRgb(colorpickerCurrentHue, 100, 50);

  // 2. Horizontal gradient (White -> Hue)
  const gradH = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradH.addColorStop(0, '#ffffff');
  gradH.addColorStop(1, `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`);
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Vertical gradient (Transparent -> Black)
  const gradV = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradV.addColorStop(0, 'rgba(0,0,0,0)');
  gradV.addColorStop(1, '#000000');
  ctx.fillStyle = gradV;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update handle position
  const handle = document.getElementById('colorpicker-spectrum-handle');
  if (handle) {
    handle.style.left = `${colorpickerCurrentSat * 100}%`;
    handle.style.top = `${(1 - colorpickerCurrentVal) * 100}%`;
    handle.style.backgroundColor = colorpickerCurrentHex;
  }
}

function colorpickerOnHueInput(val) {
  colorpickerCurrentHue = parseInt(val, 10);
  document.getElementById('colorpicker-hue-val').textContent = `${colorpickerCurrentHue}°`;
  colorpickerDrawSpectrum();
  colorpickerSetColorFromHsv(colorpickerCurrentHue, colorpickerCurrentSat, colorpickerCurrentVal, colorpickerCurrentAlpha);
}

function colorpickerOnAlphaInput(val) {
  colorpickerCurrentAlpha = parseInt(val, 10) / 100;
  document.getElementById('colorpicker-alpha-val').textContent = `${Math.round(colorpickerCurrentAlpha * 100)}%`;
  colorpickerSetColorFromHsv(colorpickerCurrentHue, colorpickerCurrentSat, colorpickerCurrentVal, colorpickerCurrentAlpha);
}

function colorpickerOnNativeChange(hex) {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  colorpickerCurrentHue = Math.round(hsv.h);
  colorpickerCurrentSat = hsv.s;
  colorpickerCurrentVal = hsv.v;

  document.getElementById('colorpicker-hue-slider').value = colorpickerCurrentHue;
  document.getElementById('colorpicker-hue-val').textContent = `${colorpickerCurrentHue}°`;

  colorpickerDrawSpectrum();
  colorpickerSetColorFromHsv(colorpickerCurrentHue, colorpickerCurrentSat, colorpickerCurrentVal, colorpickerCurrentAlpha);
}

async function colorpickerUseEyeDropper() {
  if (window.EyeDropper) {
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        colorpickerOnNativeChange(result.sRGBHex);
      }
    } catch (e) {
      console.log('EyeDropper closed or cancelled');
    }
  } else {
    alert('The EyeDropper API is available in Chromium-based browsers (Chrome, Edge, Opera). You can also paste any HEX/RGB color or pick from the spectrum.');
  }
}

// ===================== COLOR MATH & DISPATCHER =====================
function colorpickerSetColorFromHsv(h, s, v, a) {
  const rgb = hsvToRgb(h, s, v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  colorpickerCurrentHex = hex;

  // Swatch box
  const swatchBox = document.getElementById('colorpicker-swatch-box');
  const swatchText = document.getElementById('colorpicker-swatch-text');
  const nativeInput = document.getElementById('colorpicker-native-input');
  const nativeHex = document.getElementById('colorpicker-native-hex');
  const alphaSlider = document.getElementById('colorpicker-alpha-slider');

  if (swatchBox) {
    swatchBox.style.backgroundColor = a < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})` : hex;
  }
  if (swatchText) {
    swatchText.textContent = hex;
    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    swatchText.style.color = lum > 0.4 ? '#0f172a' : '#ffffff';
  }
  if (nativeInput) nativeInput.value = hex;
  if (nativeHex) nativeHex.textContent = hex;
  if (alphaSlider) {
    alphaSlider.style.background = `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))`;
  }

  // Handle color in spectrum
  const handle = document.getElementById('colorpicker-spectrum-handle');
  if (handle) handle.style.backgroundColor = hex;

  // Update Formats Values
  setTextContent('colorpicker-val-hex', hex);
  setTextContent('colorpicker-val-rgb', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  setTextContent('colorpicker-val-rgba', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a.toFixed(2).replace(/\.?0+$/, '')})`);
  setTextContent('colorpicker-val-hsl', `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`);
  setTextContent('colorpicker-val-hsla', `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${a.toFixed(2).replace(/\.?0+$/, '')})`);
  setTextContent('colorpicker-val-hsv', `hsv(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`);
  setTextContent('colorpicker-val-cmyk', `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`);
  setTextContent('colorpicker-val-css', `--color-primary: ${hex.toLowerCase()};`);

  // Contrast Scores vs White & Black
  const lumCurrent = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWhite = getContrastRatio(1.0, lumCurrent);
  const contrastBlack = getContrastRatio(lumCurrent, 0.0);

  setTextContent('colorpicker-contrast-white-score', `${contrastWhite.toFixed(2)}:1`);
  setBadge('colorpicker-contrast-white-badge', contrastWhite);

  setTextContent('colorpicker-contrast-black-score', `${contrastBlack.toFixed(2)}:1`);
  setBadge('colorpicker-contrast-black-badge', contrastBlack);

  // Update Harmonies & Tints
  colorpickerRenderHarmonies(h, s, v);
  colorpickerRenderTintsAndShades(rgb.r, rgb.g, rgb.b);
}

function setTextContent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setBadge(id, ratio) {
  const badge = document.getElementById(id);
  if (!badge) return;
  if (ratio >= 7.0) {
    badge.textContent = 'AAA Pass';
    badge.className = 'px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  } else if (ratio >= 4.5) {
    badge.textContent = 'AA Pass';
    badge.className = 'px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300';
  } else if (ratio >= 3.0) {
    badge.textContent = 'AA Large';
    badge.className = 'px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  } else {
    badge.textContent = 'Fail';
    badge.className = 'px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
  }
}

function colorpickerToggleSwatchMode(mode) {
  const box = document.getElementById('colorpicker-swatch-box');
  if (!box) return;
  if (mode === 'dark') {
    box.style.border = '4px solid #0f172a';
  } else {
    box.style.border = '4px solid #ffffff';
  }
}

// ===================== HARMONIES & TINTS =====================
function colorpickerRenderHarmonies(h, s, v) {
  const container = document.getElementById('colorpicker-harmonies-container');
  if (!container) return;

  const harmonies = [
    { name: 'Complementary', hues: [h, (h + 180) % 360] },
    { name: 'Analogous', hues: [(h + 330) % 360, h, (h + 30) % 360] },
    { name: 'Triadic', hues: [h, (h + 120) % 360, (h + 240) % 360] },
    { name: 'Tetradic', hues: [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360] },
    { name: 'Split-Complementary', hues: [h, (h + 150) % 360, (h + 210) % 360] },
    { name: 'Monochromatic', hues: [h], monoSteps: [0.3, 0.6, 0.9] }
  ];

  let html = '';
  harmonies.forEach(hm => {
    html += `
      <div class="p-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 space-y-2">
        <div class="text-xs font-bold text-gray-700 dark:text-gray-300">${hm.name}</div>
        <div class="flex items-center gap-1.5 h-10">
    `;

    if (hm.monoSteps) {
      hm.monoSteps.forEach(valMult => {
        const rgb = hsvToRgb(h, s, Math.min(1, Math.max(0.1, valMult)));
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        html += `
          <button onclick="colorpickerOnNativeChange('${hex}')" class="flex-1 h-full rounded-lg transition-transform hover:scale-105 shadow-sm relative group" style="background-color: ${hex};" title="${hex}">
            <span class="opacity-0 group-hover:opacity-100 text-[9px] font-mono font-bold text-white drop-shadow bg-black/60 px-1 py-0.5 rounded absolute inset-x-0 bottom-1 mx-auto block text-center">${hex}</span>
          </button>
        `;
      });
    } else {
      hm.hues.forEach(hueVal => {
        const rgb = hsvToRgb(hueVal, s, v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        html += `
          <button onclick="colorpickerOnNativeChange('${hex}')" class="flex-1 h-full rounded-lg transition-transform hover:scale-105 shadow-sm relative group" style="background-color: ${hex};" title="${hex}">
            <span class="opacity-0 group-hover:opacity-100 text-[9px] font-mono font-bold text-white drop-shadow bg-black/60 px-1 py-0.5 rounded absolute inset-x-0 bottom-1 mx-auto block text-center">${hex}</span>
          </button>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function colorpickerRenderTintsAndShades(r, g, b) {
  const container = document.getElementById('colorpicker-tints-shades-container');
  if (!container) return;

  const steps = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9, 1.0, 1.15, 1.3, 1.5];
  let html = '';

  steps.forEach(factor => {
    let nr, ng, nb;
    if (factor <= 1.0) {
      // Shade (darker)
      nr = Math.round(r * factor);
      ng = Math.round(g * factor);
      nb = Math.round(b * factor);
    } else {
      // Tint (lighter)
      const t = factor - 1.0;
      nr = Math.round(r + (255 - r) * (t / 0.5));
      ng = Math.round(g + (255 - g) * (t / 0.5));
      nb = Math.round(b + (255 - b) * (t / 0.5));
    }
    nr = Math.min(255, Math.max(0, nr));
    ng = Math.min(255, Math.max(0, ng));
    nb = Math.min(255, Math.max(0, nb));

    const hex = rgbToHex(nr, ng, nb);
    html += `
      <button onclick="colorpickerOnNativeChange('${hex}')" class="flex-1 h-full transition hover:opacity-80 relative group" style="background-color: ${hex};" title="${hex}">
        <span class="opacity-0 group-hover:opacity-100 text-[8px] font-mono font-bold text-white drop-shadow bg-black/60 px-0.5 py-0.5 rounded absolute inset-x-0 bottom-1 mx-auto block text-center">${hex}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

// ===================== UI PALETTES STUDIO =====================
function colorpickerSetPaletteCategory(cat) {
  colorpickerPaletteCategory = cat;
  ['web', 'android', 'ios', 'aesthetic'].forEach(c => {
    const btn = document.getElementById(`colorpicker-cat-${c}`);
    if (btn) {
      if (c === cat) {
        btn.className = 'py-2 px-4 rounded-xl text-xs font-bold bg-yellow-500 text-white shadow-sm transition whitespace-nowrap';
      } else {
        btn.className = 'py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 transition whitespace-nowrap';
      }
    }
  });

  colorpickerRenderPalettes();
}

function colorpickerRenderPalettes() {
  const grid = document.getElementById('colorpicker-palettes-grid');
  if (!grid) return;

  const list = COLORPICKER_PALETTES[colorpickerPaletteCategory] || COLORPICKER_PALETTES.web;
  if (!colorpickerActivePalette && list.length > 0) {
    colorpickerActivePalette = list[0];
  }

  colorpickerUpdateMockupBoard(colorpickerActivePalette || list[0]);

  let html = '';
  list.forEach((pal, idx) => {
    html += `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-4 hover:border-yellow-300 dark:hover:border-yellow-700 transition">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100">${pal.name}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${pal.desc || ''}</p>
          </div>
          <button onclick="colorpickerSelectPalette(${idx})" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 transition">
            Preview UI
          </button>
        </div>

        <!-- Swatches Bar -->
        <div class="flex rounded-xl overflow-hidden h-12 shadow-sm border border-gray-200 dark:border-gray-700">
    `;

    pal.colors.forEach(hex => {
      html += `
        <button onclick="colorpickerOnNativeChange('${hex}')" class="flex-1 h-full transition hover:opacity-90 relative group" style="background-color: ${hex};" title="Click to load into picker: ${hex}">
          <span class="opacity-0 group-hover:opacity-100 text-[8px] font-mono font-bold text-white drop-shadow bg-black/60 px-1 py-0.5 rounded absolute inset-x-0 bottom-1 mx-auto block text-center">${hex}</span>
        </button>
      `;
    });

    html += `
        </div>

        <!-- Export Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-semibold">
          <button onclick="colorpickerExportPalette(${idx}, 'tailwind')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">Tailwind</button>
          <button onclick="colorpickerExportPalette(${idx}, 'css')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">CSS Vars</button>
          <button onclick="colorpickerExportPalette(${idx}, 'android-xml')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">XML</button>
          <button onclick="colorpickerExportPalette(${idx}, 'swiftui')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">SwiftUI</button>
          <button onclick="colorpickerExportPalette(${idx}, 'json')" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">JSON</button>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function colorpickerSelectPalette(idx) {
  const list = COLORPICKER_PALETTES[colorpickerPaletteCategory] || COLORPICKER_PALETTES.web;
  const pal = list[idx];
  if (!pal) return;

  colorpickerActivePalette = pal;
  colorpickerUpdateMockupBoard(pal);
}

function colorpickerUpdateMockupBoard(pal) {
  if (!pal) return;
  const titleEl = document.getElementById('colorpicker-mockup-palette-name');
  if (titleEl) titleEl.textContent = pal.name;

  const colors = pal.colors;
  const pri = colors[0] || '#4f46e5';
  const sec = colors[1] || '#06b6d4';
  const acc = colors[2] || '#f59e0b';
  const sur = colors[3] || '#f8fafc';
  const bg = colors[4] || '#0f172a';

  const board = document.getElementById('colorpicker-mockup-board');
  const avatar = document.getElementById('colorpicker-mockup-avatar');
  const title = document.getElementById('colorpicker-mockup-title');
  const badge = document.getElementById('colorpicker-mockup-badge');
  const card = document.getElementById('colorpicker-mockup-card');
  const btnPri = document.getElementById('colorpicker-mockup-btn-pri');
  const btnSec = document.getElementById('colorpicker-mockup-btn-sec');
  const accent = document.getElementById('colorpicker-mockup-accent');

  if (board) board.style.backgroundColor = sur;
  if (avatar) avatar.style.backgroundColor = pri;
  if (title) title.style.color = bg;
  if (badge) {
    badge.style.backgroundColor = sec + '25';
    badge.style.color = sec;
  }
  if (card) {
    card.style.backgroundColor = '#ffffff';
    card.style.borderColor = sec + '30';
  }
  if (btnPri) btnPri.style.backgroundColor = pri;
  if (btnSec) {
    btnSec.style.backgroundColor = sur;
    btnSec.style.color = pri;
    btnSec.style.borderColor = pri + '50';
  }
  if (accent) accent.style.color = acc;
}

function colorpickerExportPalette(idx, format) {
  const list = COLORPICKER_PALETTES[colorpickerPaletteCategory] || COLORPICKER_PALETTES.web;
  const pal = list[idx];
  if (!pal) return;

  let code = '';
  const colors = pal.colors;

  if (format === 'tailwind') {
    code = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: '${colors[0]}',\n        secondary: '${colors[1]}',\n        accent: '${colors[2]}',\n        surface: '${colors[3]}',\n        dark: '${colors[4]}'\n      }\n    }\n  }\n};`;
  } else if (format === 'css') {
    code = `:root {\n  --color-primary: ${colors[0]};\n  --color-secondary: ${colors[1]};\n  --color-accent: ${colors[2]};\n  --color-surface: ${colors[3]};\n  --color-background: ${colors[4]};\n}`;
  } else if (format === 'android-xml') {
    code = `<!-- res/values/colors.xml -->\n<resources>\n    <color name="primary">${colors[0]}</color>\n    <color name="secondary">${colors[1]}</color>\n    <color name="accent">${colors[2]}</color>\n    <color name="surface">${colors[3]}</color>\n    <color name="background">${colors[4]}</color>\n</resources>`;
  } else if (format === 'swiftui') {
    code = `// Colors.swift\nimport SwiftUI\n\nextension Color {\n    static let primaryBrand = Color(hex: "${colors[0]}")\n    static let secondaryBrand = Color(hex: "${colors[1]}")\n    static let accentBrand = Color(hex: "${colors[2]}")\n}`;
  } else if (format === 'json') {
    code = JSON.stringify(pal, null, 2);
  }

  navigator.clipboard.writeText(code).then(() => {
    alert(`Copied ${pal.name} as ${format.toUpperCase()}!`);
  });
}

// ===================== GRADIENT STUDIO =====================
function colorpickerSetGradientType(type) {
  colorpickerGradientType = type;
  const btnLin = document.getElementById('colorpicker-grad-type-linear');
  const btnRad = document.getElementById('colorpicker-grad-type-radial');
  const angleBox = document.getElementById('colorpicker-grad-angle-box');

  if (type === 'linear') {
    if (btnLin) btnLin.className = 'py-2 px-3 rounded-xl border border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 text-xs font-bold';
    if (btnRad) btnRad.className = 'py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 text-xs font-semibold';
    if (angleBox) angleBox.classList.remove('hidden');
  } else {
    if (btnRad) btnRad.className = 'py-2 px-3 rounded-xl border border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 text-xs font-bold';
    if (btnLin) btnLin.className = 'py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 text-xs font-semibold';
    if (angleBox) angleBox.classList.add('hidden');
  }

  colorpickerUpdateGradient();
}

function colorpickerSetGradAngle(deg) {
  colorpickerGradientAngle = deg;
  const slider = document.getElementById('colorpicker-grad-angle-slider');
  const label = document.getElementById('colorpicker-grad-angle-val');
  if (slider) slider.value = deg;
  if (label) label.textContent = `${deg}°`;
  colorpickerUpdateGradient();
}

function colorpickerOnGradAngleInput(val) {
  colorpickerGradientAngle = parseInt(val, 10);
  const label = document.getElementById('colorpicker-grad-angle-val');
  if (label) label.textContent = `${colorpickerGradientAngle}°`;
  colorpickerUpdateGradient();
}

function colorpickerRenderGradientStops() {
  const container = document.getElementById('colorpicker-grad-stops-list');
  if (!container) return;

  let html = '';
  colorpickerGradientStops.forEach((st, idx) => {
    html += `
      <div class="flex items-center gap-2 p-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40">
        <input type="color" value="${st.color}" onchange="colorpickerUpdateGradientStopColor(${idx}, this.value)" class="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent flex-shrink-0">
        <span class="font-mono text-xs font-bold text-gray-700 dark:text-gray-300 w-16">${st.color.toUpperCase()}</span>
        <input type="range" min="0" max="100" value="${st.pos}" oninput="colorpickerUpdateGradientStopPos(${idx}, this.value)" class="flex-1 accent-yellow-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer">
        <span class="text-xs font-mono text-gray-500 w-8 text-right">${st.pos}%</span>
        ${colorpickerGradientStops.length > 2 ? `
          <button onclick="colorpickerRemoveGradientStop(${idx})" class="p-1 text-gray-400 hover:text-red-500 transition">
            <i data-lucide="trash-2" style="width:14px;height:14px"></i>
          </button>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

function colorpickerAddGradientStop() {
  if (colorpickerGradientStops.length >= 6) {
    alert('Maximum 6 color stops supported.');
    return;
  }
  colorpickerGradientStops.push({ color: '#f59e0b', pos: 50 });
  colorpickerGradientStops.sort((a, b) => a.pos - b.pos);
  colorpickerRenderGradientStops();
  colorpickerUpdateGradient();
}

function colorpickerRemoveGradientStop(idx) {
  if (colorpickerGradientStops.length <= 2) return;
  colorpickerGradientStops.splice(idx, 1);
  colorpickerRenderGradientStops();
  colorpickerUpdateGradient();
}

function colorpickerUpdateGradientStopColor(idx, col) {
  if (colorpickerGradientStops[idx]) {
    colorpickerGradientStops[idx].color = col;
    colorpickerUpdateGradient();
  }
}

function colorpickerUpdateGradientStopPos(idx, pos) {
  if (colorpickerGradientStops[idx]) {
    colorpickerGradientStops[idx].pos = parseInt(pos, 10);
    colorpickerRenderGradientStops();
    colorpickerUpdateGradient();
  }
}

function colorpickerUpdateGradient() {
  const stopsStr = colorpickerGradientStops.map(s => `${s.color} ${s.pos}%`).join(', ');
  let cssValue = '';

  if (colorpickerGradientType === 'linear') {
    cssValue = `linear-gradient(${colorpickerGradientAngle}deg, ${stopsStr})`;
  } else {
    cssValue = `radial-gradient(circle, ${stopsStr})`;
  }

  const preview = document.getElementById('colorpicker-grad-preview');
  const codeBox = document.getElementById('colorpicker-grad-css-code');

  if (preview) preview.style.background = cssValue;
  if (codeBox) codeBox.textContent = `background: ${cssValue};`;

  colorpickerRenderGradientStops();
}

function colorpickerRenderGradientPresets() {
  const grid = document.getElementById('colorpicker-gradient-presets-grid');
  if (!grid) return;

  let html = '';
  COLORPICKER_GRADIENT_PRESETS.forEach((preset, idx) => {
    html += `
      <button onclick="colorpickerApplyGradientPreset(${idx})" class="h-20 rounded-2xl p-2.5 flex flex-col justify-end text-left shadow-sm border border-black/10 transition hover:scale-105 relative group overflow-hidden" style="background: ${preset.css};">
        <span class="text-[10px] font-bold text-white drop-shadow bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm truncate block">${preset.name}</span>
      </button>
    `;
  });

  grid.innerHTML = html;
}

function colorpickerApplyGradientPreset(idx) {
  const p = COLORPICKER_GRADIENT_PRESETS[idx];
  if (!p) return;

  colorpickerGradientStops = JSON.parse(JSON.stringify(p.stops));
  colorpickerGradientType = 'linear';
  colorpickerUpdateGradient();
}

function colorpickerDownloadGradientPng() {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  let grad;
  if (colorpickerGradientType === 'linear') {
    const rad = (colorpickerGradientAngle - 90) * (Math.PI / 180);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const len = Math.sqrt(cx * cx + cy * cy);
    const x0 = cx - Math.cos(rad) * len;
    const y0 = cy - Math.sin(rad) * len;
    const x1 = cx + Math.cos(rad) * len;
    const y1 = cy + Math.sin(rad) * len;
    grad = ctx.createLinearGradient(x0, y0, x1, y1);
  } else {
    grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
  }

  colorpickerGradientStops.forEach(s => {
    grad.addColorStop(s.pos / 100, s.color);
  });

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pockitup_gradient_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// ===================== IMAGE COLOR EXTRACTOR =====================
function colorpickerHandleImageUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      document.getElementById('colorpicker-img-drop-zone')?.classList.add('hidden');
      document.getElementById('colorpicker-img-results')?.classList.remove('hidden');
      document.getElementById('colorpicker-extracted-img-preview').src = img.src;

      colorpickerExtractColorsFromImage(img);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function colorpickerExtractColorsFromImage(img) {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 120, 120);

  const imgData = ctx.getImageData(0, 0, 120, 120).data;
  const colorMap = {};

  for (let i = 0; i < imgData.length; i += 16) {
    const r = Math.round(imgData[i] / 24) * 24;
    const g = Math.round(imgData[i + 1] / 24) * 24;
    const b = Math.round(imgData[i + 2] / 24) * 24;
    const hex = rgbToHex(Math.min(255, r), Math.min(255, g), Math.min(255, b));
    colorMap[hex] = (colorMap[hex] || 0) + 1;
  }

  const sortedColors = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(entry => entry[0]);

  colorpickerExtractedColors = sortedColors;

  const container = document.getElementById('colorpicker-extracted-swatches-grid');
  if (!container) return;

  let html = '';
  sortedColors.forEach(hex => {
    html += `
      <div class="flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
        <button onclick="colorpickerOnNativeChange('${hex}')" class="w-8 h-8 rounded-lg shadow-sm flex-shrink-0 transition hover:scale-105" style="background-color: ${hex};" title="Load into picker"></button>
        <span class="font-mono text-xs font-bold text-gray-800 dark:text-gray-200 truncate select-all">${hex}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

function colorpickerExportExtractedPalette() {
  if (colorpickerExtractedColors.length === 0) return;
  navigator.clipboard.writeText(colorpickerExtractedColors.join(', ')).then(() => {
    alert(`Copied palette: ${colorpickerExtractedColors.join(', ')}`);
  });
}

// ===================== UTILITY & CONVERSION HELPERS =====================
function colorpickerCopyText(elementId, btn) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent || el.innerText;

  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px" class="text-emerald-500"></i>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = origHtml;
        lucide.createIcons();
      }, 1200);
    }
  });
}

function colorpickerReset() {
  colorpickerSetTab('picker');
}

// Color Space Math Functions
function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor((h / 60) % 6);
  const f = (h / 60) - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
}

function rgbToHex(r, g, b) {
  const toHex = c => ('0' + Math.round(c).toString(16)).slice(-2).toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToCmyk(r, g, b) {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, Math.min(m, y));

  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  c = Math.round(((c - k) / (1 - k)) * 100);
  m = Math.round(((m - k) / (1 - k)) * 100);
  y = Math.round(((y - k) / (1 - k)) * 100);
  k = Math.round(k * 100);

  return { c, m, y, k };
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1, l2) {
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}


// =========================================================================
// ==================== ZIP ARCHIVER & EXTRACTOR STUDIO ====================
// =========================================================================

let ziparchiverCurrentTab = 'create';
let ziparchiverQueue = []; // [{ id, file, name, virtualPath, size, type, lastModified, category, ext }]
let ziparchiverEditingQueueId = null;
let ziparchiverCreatedBlob = null;
let ziparchiverCreatedFilename = 'archive.zip';
let ziparchiverExtractedEntries = []; // [{ id, path, name, dir, size, compressedSize, date, comment, isSelected, category, ext, encrypted, zipEntryObj }]
let ziparchiverCurrentFilter = 'all';
let ziparchiverSearchQuery = '';
let ziparchiverCurrentPreviewEntry = null;
let ziparchiverCurrentPreviewUrl = null;
let ziparchiverAppliedPassword = '';
let ziparchiverPendingAction = null; // callback when password modal succeeds

// Helper: Determine category, extension & icon by file extension
function ziparchiverGetFileInfo(filename) {
  const parts = filename.split('.');
  const ext = (parts.length > 1 ? parts.pop() : '').toLowerCase();
  
  if (['pdf'].includes(ext)) {
    return { ext, category: 'docs', icon: 'file-text', colorClass: 'text-red-500 bg-red-50 dark:bg-red-950/50' };
  }
  if (['doc', 'docx', 'odt', 'rtf', 'txt', 'pages'].includes(ext)) {
    return { ext, category: 'docs', icon: 'file-text', colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50' };
  }
  if (['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(ext)) {
    return { ext, category: 'docs', icon: 'file-spreadsheet', colorClass: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' };
  }
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) {
    return { ext, category: 'docs', icon: 'presentation', colorClass: 'text-orange-500 bg-orange-50 dark:bg-orange-950/50' };
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif', 'tiff'].includes(ext)) {
    return { ext, category: 'images', icon: 'image', colorClass: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' };
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) {
    return { ext, category: 'media', icon: 'music', colorClass: 'text-pink-500 bg-pink-50 dark:bg-pink-950/50' };
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'].includes(ext)) {
    return { ext, category: 'media', icon: 'video', colorClass: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' };
  }
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'json', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'sql', 'sh', 'xml', 'yaml', 'yml', 'md'].includes(ext)) {
    return { ext, category: 'code', icon: 'code', colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'].includes(ext)) {
    return { ext, category: 'archives', icon: 'archive', colorClass: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' };
  }
  return { ext, category: 'other', icon: 'file', colorClass: 'text-gray-500 bg-gray-50 dark:bg-gray-800' };
}

function ziparchiverSetTab(tab) {
  ziparchiverCurrentTab = tab;
  const tabCreate = document.getElementById('ziparchiver-tab-create');
  const tabExtract = document.getElementById('ziparchiver-tab-extract');
  const panelCreate = document.getElementById('ziparchiver-panel-create');
  const panelExtract = document.getElementById('ziparchiver-panel-extract');

  if (tab === 'create') {
    if (tabCreate) tabCreate.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5';
    if (tabExtract) tabExtract.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5';
    if (panelCreate) panelCreate.classList.remove('hidden');
    if (panelExtract) panelExtract.classList.add('hidden');
  } else {
    if (tabCreate) tabCreate.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5';
    if (tabExtract) tabExtract.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5';
    if (panelCreate) panelCreate.classList.add('hidden');
    if (panelExtract) panelExtract.classList.remove('hidden');
  }
  lucide.createIcons();
}

// Password UI Helpers
function ziparchiverCheckPasswordStrength(pwd) {
  const container = document.getElementById('ziparchiver-pwd-strength-container');
  const bar = document.getElementById('ziparchiver-pwd-strength-bar');
  const text = document.getElementById('ziparchiver-pwd-strength-text');

  if (!pwd || pwd.length === 0) {
    if (container) container.classList.add('hidden');
    return;
  }

  if (container) container.classList.remove('hidden');

  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) {
    if (bar) { bar.style.width = '25%'; bar.style.backgroundColor = '#ef4444'; }
    if (text) { text.textContent = 'Weak'; text.className = 'font-bold text-red-500'; }
  } else if (score === 3) {
    if (bar) { bar.style.width = '50%'; bar.style.backgroundColor = '#f59e0b'; }
    if (text) { text.textContent = 'Fair'; text.className = 'font-bold text-amber-500'; }
  } else if (score === 4) {
    if (bar) { bar.style.width = '75%'; bar.style.backgroundColor = '#3b82f6'; }
    if (text) { text.textContent = 'Good'; text.className = 'font-bold text-blue-500'; }
  } else {
    if (bar) { bar.style.width = '100%'; bar.style.backgroundColor = '#10b981'; }
    if (text) { text.textContent = 'Strong & Secure'; text.className = 'font-bold text-emerald-500'; }
  }
}

function ziparchiverToggleCreatePasswordVisibility() {
  const input = document.getElementById('ziparchiver-create-password');
  const icon = document.getElementById('ziparchiver-create-pwd-icon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function ziparchiverToggleExtractPasswordVisibility() {
  const input = document.getElementById('ziparchiver-extract-password');
  const icon = document.getElementById('ziparchiver-extract-pwd-icon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function ziparchiverToggleModalPasswordVisibility() {
  const input = document.getElementById('ziparchiver-modal-password-input');
  const icon = document.getElementById('ziparchiver-modal-pwd-icon');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

// ===================== CREATE ARCHIVE LOGIC =====================

function ziparchiverOnDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('ziparchiver-dropzone')?.classList.add('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/20');
}

function ziparchiverOnDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('ziparchiver-dropzone')?.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/20');
}

async function ziparchiverOnDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('ziparchiver-dropzone')?.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/20');

  const items = e.dataTransfer.items;
  if (items && items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await ziparchiverTraverseFileTree(entry, '');
          continue;
        }
      }
      const file = item.getAsFile();
      if (file) ziparchiverAddFileToQueue(file, '');
    }
  } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    Array.from(e.dataTransfer.files).forEach(f => ziparchiverAddFileToQueue(f, ''));
  }

  ziparchiverRenderQueue();
}

async function ziparchiverTraverseFileTree(item, path) {
  path = path || '';
  if (item.isFile) {
    return new Promise((resolve) => {
      item.file(file => {
        ziparchiverAddFileToQueue(file, path);
        resolve();
      });
    });
  } else if (item.isDirectory) {
    const dirReader = item.createReader();
    return new Promise((resolve) => {
      dirReader.readEntries(async (entries) => {
        for (let i = 0; i < entries.length; i++) {
          await ziparchiverTraverseFileTree(entries[i], path + item.name + '/');
        }
        resolve();
      });
    });
  }
}

function ziparchiverHandleFilesSelect(e) {
  if (!e.target.files) return;
  Array.from(e.target.files).forEach(f => ziparchiverAddFileToQueue(f, ''));
  e.target.value = '';
  ziparchiverRenderQueue();
}

function ziparchiverHandleFolderSelect(e) {
  if (!e.target.files) return;
  Array.from(e.target.files).forEach(f => {
    let relPath = f.webkitRelativePath || '';
    let dirPath = '';
    if (relPath.includes('/')) {
      const parts = relPath.split('/');
      parts.pop(); // remove filename
      dirPath = parts.join('/') + '/';
    }
    ziparchiverAddFileToQueue(f, dirPath);
  });
  e.target.value = '';
  ziparchiverRenderQueue();
}

function ziparchiverAddFileToQueue(file, virtualPath) {
  const info = ziparchiverGetFileInfo(file.name);
  const id = 'zip_f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  ziparchiverQueue.push({
    id,
    file,
    name: file.name,
    virtualPath: virtualPath || '',
    size: file.size,
    type: file.type || 'application/octet-stream',
    lastModified: file.lastModified || Date.now(),
    category: info.category,
    ext: info.ext
  });
}

function ziparchiverRenderQueue() {
  const queueSec = document.getElementById('ziparchiver-queue-section');
  const countBadge = document.getElementById('ziparchiver-queue-count-badge');
  const sizeBadge = document.getElementById('ziparchiver-queue-size-badge');
  const foldersBadge = document.getElementById('ziparchiver-queue-folders-badge');
  const listEl = document.getElementById('ziparchiver-file-list');
  const createBtn = document.getElementById('ziparchiver-create-btn');

  if (ziparchiverQueue.length === 0) {
    if (queueSec) queueSec.classList.add('hidden');
    if (createBtn) createBtn.disabled = true;
    return;
  }

  if (queueSec) queueSec.classList.remove('hidden');
  if (createBtn) createBtn.disabled = false;

  const totalSize = ziparchiverQueue.reduce((acc, item) => acc + item.size, 0);
  const uniqueFolders = new Set(ziparchiverQueue.map(i => i.virtualPath).filter(p => p && p.trim() !== ''));

  if (countBadge) countBadge.textContent = `${ziparchiverQueue.length} File${ziparchiverQueue.length > 1 ? 's' : ''}`;
  if (sizeBadge) sizeBadge.textContent = formatBytes(totalSize);
  if (foldersBadge) {
    if (uniqueFolders.size > 0) {
      foldersBadge.classList.remove('hidden');
      foldersBadge.textContent = `${uniqueFolders.size} Folder${uniqueFolders.size > 1 ? 's' : ''}`;
    } else {
      foldersBadge.classList.add('hidden');
    }
  }

  let html = '';
  ziparchiverQueue.forEach((item, idx) => {
    const info = ziparchiverGetFileInfo(item.name);

    html += `
      <div class="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${info.colorClass}">
            <i data-lucide="${info.icon}" style="width:16px;height:16px"></i>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">${item.name}</span>
              ${item.virtualPath ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate" title="Virtual path: ${item.virtualPath}">📁 ${item.virtualPath}</span>` : ''}
            </div>
            <div class="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
              <span>${formatBytes(item.size)}</span>
              <span>•</span>
              <span class="uppercase">${item.ext || 'FILE'}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button onclick="ziparchiverOpenPathModal('${item.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg transition" title="Edit folder path in archive">
            <i data-lucide="folder-tree" style="width:14px;height:14px"></i>
          </button>
          <button onclick="ziparchiverRemoveQueueItem('${item.id}')" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-lg transition" title="Remove file">
            <i data-lucide="trash-2" style="width:14px;height:14px"></i>
          </button>
        </div>
      </div>
    `;
  });

  if (listEl) listEl.innerHTML = html;
  lucide.createIcons();
}

function ziparchiverRemoveQueueItem(id) {
  ziparchiverQueue = ziparchiverQueue.filter(i => i.id !== id);
  ziparchiverRenderQueue();
}

function ziparchiverClearQueue() {
  ziparchiverQueue = [];
  ziparchiverRenderQueue();
}

function ziparchiverSortQueue(criterion) {
  if (criterion === 'name-asc') {
    ziparchiverQueue.sort((a, b) => a.name.localeCompare(b.name));
  } else if (criterion === 'name-desc') {
    ziparchiverQueue.sort((a, b) => b.name.localeCompare(a.name));
  } else if (criterion === 'size-desc') {
    ziparchiverQueue.sort((a, b) => b.size - a.size);
  } else if (criterion === 'size-asc') {
    ziparchiverQueue.sort((a, b) => a.size - b.size);
  } else if (criterion === 'type') {
    ziparchiverQueue.sort((a, b) => (a.ext || '').localeCompare(b.ext || ''));
  }
  ziparchiverRenderQueue();
}

function ziparchiverOpenPathModal(id) {
  const item = ziparchiverQueue.find(i => i.id === id);
  if (!item) return;

  ziparchiverEditingQueueId = id;
  const input = document.getElementById('ziparchiver-path-input');
  if (input) input.value = item.virtualPath || '';

  const modal = document.getElementById('ziparchiver-path-modal');
  if (modal) modal.classList.remove('hidden');
}

function ziparchiverClosePathModal() {
  ziparchiverEditingQueueId = null;
  const modal = document.getElementById('ziparchiver-path-modal');
  if (modal) modal.classList.add('hidden');
}

function ziparchiverSavePathModal() {
  if (!ziparchiverEditingQueueId) return;
  const item = ziparchiverQueue.find(i => i.id === ziparchiverEditingQueueId);
  const input = document.getElementById('ziparchiver-path-input');
  if (item && input) {
    let p = input.value.trim().replace(/^[\/\\]+|[\/\\]+$/g, '');
    item.virtualPath = p ? p + '/' : '';
  }
  ziparchiverClosePathModal();
  ziparchiverRenderQueue();
}

function ziparchiverAppendToken(token) {
  const input = document.getElementById('ziparchiver-out-filename');
  if (!input) return;

  const now = new Date();
  const dStr = now.toISOString().slice(0, 10);
  const tStr = now.toTimeString().slice(0, 8).replace(/:/g, '');

  if (token === 'date') {
    input.value += `_${dStr}`;
  } else if (token === 'time') {
    input.value += `_${tStr}`;
  } else if (token === 'backup') {
    input.value += `_backup`;
  }
}

async function ziparchiverCreateZip() {
  if (ziparchiverQueue.length === 0) return;

  const rawFilename = (document.getElementById('ziparchiver-out-filename')?.value || 'archive').trim();
  const outName = (rawFilename.replace(/\.zip$/i, '') || 'archive') + '.zip';
  const compLevel = parseInt(document.getElementById('ziparchiver-compression-level')?.value || '6', 10);
  const folderMode = document.getElementById('ziparchiver-folder-mode')?.value || 'preserve';
  const comment = (document.getElementById('ziparchiver-comment')?.value || '').trim();
  const userPassword = (document.getElementById('ziparchiver-create-password')?.value || '').trim();
  const encryptionAlgo = document.getElementById('ziparchiver-encryption-algo')?.value || 'aes256';

  const createBtn = document.getElementById('ziparchiver-create-btn');
  const progressContainer = document.getElementById('ziparchiver-create-progress-container');
  const progressBar = document.getElementById('ziparchiver-create-progress-bar');
  const percentText = document.getElementById('ziparchiver-create-percent-text');
  const statusText = document.getElementById('ziparchiver-create-status-text');
  const resultCard = document.getElementById('ziparchiver-create-result');

  if (createBtn) createBtn.disabled = true;
  if (progressContainer) progressContainer.classList.remove('hidden');
  if (resultCard) resultCard.classList.add('hidden');

  try {
    let zipBlob;

    // If password encryption is requested and zip.js is available
    if (userPassword && typeof zip !== 'undefined' && zip.ZipWriter) {
      const zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'), {
        password: userPassword,
        encryptionStrength: encryptionAlgo === 'aes256' ? 3 : 1,
        bufferedWrite: true
      });

      for (let i = 0; i < ziparchiverQueue.length; i++) {
        const item = ziparchiverQueue[i];
        let targetPath = item.name;
        if (folderMode === 'preserve' && item.virtualPath) {
          targetPath = item.virtualPath + item.name;
        }

        const percent = Math.round(((i + 1) / ziparchiverQueue.length) * 85);
        if (progressBar) progressBar.style.width = percent + '%';
        if (percentText) percentText.textContent = percent + '%';
        if (statusText) {
          statusText.innerHTML = `<i data-lucide="lock" style="width:14px;height:14px" class="text-blue-500"></i> Encrypting ${item.name}...`;
          lucide.createIcons();
        }

        await zipWriter.add(targetPath, new zip.BlobReader(item.file), {
          password: userPassword,
          level: compLevel,
          lastModDate: new Date(item.lastModified)
        });
      }

      if (comment) {
        zipWriter.comment = comment;
      }

      if (progressBar) progressBar.style.width = '95%';
      if (percentText) percentText.textContent = '95%';
      if (statusText) statusText.textContent = 'Finalizing encrypted archive...';

      zipBlob = await zipWriter.close();

    } else {
      // Standard JSZip Packaging
      const jszip = new JSZip();

      for (let i = 0; i < ziparchiverQueue.length; i++) {
        const item = ziparchiverQueue[i];
        let targetPath = item.name;
        if (folderMode === 'preserve' && item.virtualPath) {
          targetPath = item.virtualPath + item.name;
        }

        jszip.file(targetPath, item.file, {
          date: new Date(item.lastModified)
        });
      }

      if (comment) {
        jszip.comment = comment;
      }

      const compressionMethod = compLevel === 0 ? 'STORE' : 'DEFLATE';
      const compressionOptions = compLevel > 0 ? { level: compLevel } : undefined;

      zipBlob = await jszip.generateAsync(
        {
          type: 'blob',
          compression: compressionMethod,
          compressionOptions: compressionOptions,
          comment: comment || undefined
        },
        (metadata) => {
          const percent = Math.round(metadata.percent);
          if (progressBar) progressBar.style.width = percent + '%';
          if (percentText) percentText.textContent = percent + '%';
          if (statusText && metadata.currentFile) {
            statusText.innerHTML = `<i data-lucide="loader-2" style="width:14px;height:14px" class="animate-spin"></i> Compressing ${metadata.currentFile}...`;
            lucide.createIcons();
          }
        }
      );
    }

    ziparchiverCreatedBlob = zipBlob;
    ziparchiverCreatedFilename = outName;

    // Display statistics
    const totalOrigSize = ziparchiverQueue.reduce((acc, i) => acc + i.size, 0);
    const compressedSize = zipBlob.size;
    const savingsPercent = totalOrigSize > 0 ? Math.max(0, Math.round(((totalOrigSize - compressedSize) / totalOrigSize) * 100)) : 0;

    document.getElementById('ziparchiver-result-files-count').textContent = ziparchiverQueue.length;
    document.getElementById('ziparchiver-result-orig-size').textContent = formatBytes(totalOrigSize);
    document.getElementById('ziparchiver-result-zip-size').textContent = formatBytes(compressedSize);
    document.getElementById('ziparchiver-result-savings').textContent = `${savingsPercent}% Saved`;

    const encBadge = userPassword ? ' 🔒 Encrypted' : '';
    document.getElementById('ziparchiver-result-subtext').textContent = `Ready for instant download${encBadge}`;
    document.getElementById('ziparchiver-download-btn-text').textContent = `Download ${outName} (${formatBytes(compressedSize)})`;

    if (resultCard) resultCard.classList.remove('hidden');
    if (progressContainer) progressContainer.classList.add('hidden');
    if (createBtn) createBtn.disabled = false;

    // Auto trigger download for seamless UX
    ziparchiverDownloadCreatedZip();

  } catch (err) {
    console.error('ZIP Creation Error:', err);
    alert('Failed to generate ZIP archive: ' + err.message);
    if (progressContainer) progressContainer.classList.add('hidden');
    if (createBtn) createBtn.disabled = false;
  }
}

function ziparchiverDownloadCreatedZip() {
  if (!ziparchiverCreatedBlob) return;
  const url = URL.createObjectURL(ziparchiverCreatedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ziparchiverCreatedFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function ziparchiverInspectCreatedZip() {
  if (!ziparchiverCreatedBlob) return;
  ziparchiverSetTab('extract');
  const buffer = await ziparchiverCreatedBlob.arrayBuffer();
  ziparchiverLoadZipBuffer(buffer, ziparchiverCreatedFilename, ziparchiverCreatedBlob.size);
}

function ziparchiverResetCreate() {
  ziparchiverQueue = [];
  ziparchiverCreatedBlob = null;
  const pwdInput = document.getElementById('ziparchiver-create-password');
  if (pwdInput) pwdInput.value = '';
  document.getElementById('ziparchiver-pwd-strength-container')?.classList.add('hidden');
  ziparchiverRenderQueue();
  document.getElementById('ziparchiver-create-result')?.classList.add('hidden');
}


// ===================== INSPECT & EXTRACT ZIP LOGIC =====================

function ziparchiverOnExtractDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('ziparchiver-extract-dropzone')?.classList.add('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/20');
}

function ziparchiverOnExtractDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('ziparchiver-extract-dropzone')?.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/20');
}

function ziparchiverOnExtractDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('ziparchiver-extract-dropzone')?.classList.remove('border-blue-500', 'bg-blue-50/50', 'dark:bg-blue-950/20');

  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')) {
      ziparchiverProcessZipFile(file);
    } else {
      alert('Please upload a valid .zip archive.');
    }
  }
}

function ziparchiverHandleZipUpload(e) {
  if (!e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];
  ziparchiverProcessZipFile(file);
  e.target.value = '';
}

function ziparchiverProcessZipFile(file) {
  const loading = document.getElementById('ziparchiver-extract-loading');
  const dropzone = document.getElementById('ziparchiver-extract-dropzone');
  const dashboard = document.getElementById('ziparchiver-extract-dashboard');

  if (loading) loading.classList.remove('hidden');
  if (dropzone) dropzone.classList.add('hidden');
  if (dashboard) dashboard.classList.add('hidden');

  const reader = new FileReader();
  reader.onload = function(evt) {
    ziparchiverLoadZipBuffer(evt.target.result, file.name, file.size);
  };
  reader.onerror = function() {
    alert('Failed to read file.');
    if (loading) loading.classList.add('hidden');
    if (dropzone) dropzone.classList.remove('hidden');
  };
  reader.readAsArrayBuffer(file);
}

async function ziparchiverLoadZipBuffer(buffer, filename, fileSize) {
  const loading = document.getElementById('ziparchiver-extract-loading');
  const dashboard = document.getElementById('ziparchiver-extract-dashboard');
  const dropzone = document.getElementById('ziparchiver-extract-dropzone');
  const decryptBar = document.getElementById('ziparchiver-decrypt-bar');

  ziparchiverAppliedPassword = '';

  try {
    ziparchiverExtractedEntries = [];
    let hasEncryptedFiles = false;
    let totalUncompressed = 0;
    let totalCompressed = 0;
    let folderCount = 0;
    let fileCount = 0;
    let commentText = '';

    // Primary: use zip.js ZipReader for full encryption support
    if (typeof zip !== 'undefined' && zip.ZipReader) {
      const zipBlob = new Blob([buffer]);
      const zipReader = new zip.ZipReader(new zip.BlobReader(zipBlob));
      const entries = await zipReader.getEntries();
      commentText = zipReader.comment || '';

      let idx = 0;
      entries.forEach(entry => {
        const isDir = entry.directory || entry.filename.endsWith('/');
        const parts = entry.filename.split('/');
        const name = isDir ? parts[parts.length - 2] || entry.filename : parts[parts.length - 1];
        const info = ziparchiverGetFileInfo(name);

        const uncompressedSize = entry.uncompressedSize || 0;
        const compressedSize = entry.compressedSize || uncompressedSize;
        const isEncrypted = !!entry.encrypted;

        if (isEncrypted) hasEncryptedFiles = true;

        if (isDir) {
          folderCount++;
        } else {
          fileCount++;
          totalUncompressed += uncompressedSize;
          totalCompressed += compressedSize;
        }

        ziparchiverExtractedEntries.push({
          id: idx++,
          path: entry.filename,
          name: name,
          dir: isDir,
          size: uncompressedSize,
          compressedSize: compressedSize,
          date: entry.lastModDate || new Date(),
          comment: entry.comment || '',
          category: info.category,
          ext: info.ext,
          encrypted: isEncrypted,
          zipEntryObj: entry,
          engine: 'zipjs',
          isSelected: false
        });
      });

    } else {
      // Fallback: JSZip
      const jszip = await JSZip.loadAsync(buffer);
      commentText = jszip.comment || '';

      let idx = 0;
      jszip.forEach((relativePath, file) => {
        const isDir = file.dir || relativePath.endsWith('/');
        const parts = relativePath.split('/');
        const name = isDir ? parts[parts.length - 2] || relativePath : parts[parts.length - 1];
        const info = ziparchiverGetFileInfo(name);

        const uncompressedSize = file._data ? (file._data.uncompressedSize || 0) : 0;
        const compressedSize = file._data ? (file._data.compressedSize || uncompressedSize) : uncompressedSize;

        if (isDir) {
          folderCount++;
        } else {
          fileCount++;
          totalUncompressed += uncompressedSize;
          totalCompressed += compressedSize;
        }

        ziparchiverExtractedEntries.push({
          id: idx++,
          path: relativePath,
          name: name,
          dir: isDir,
          size: uncompressedSize,
          compressedSize: compressedSize,
          date: file.date || new Date(),
          comment: file.comment || '',
          category: info.category,
          ext: info.ext,
          encrypted: false,
          zipEntryObj: file,
          engine: 'jszip',
          isSelected: false
        });
      });
    }

    // Populate Overview Stats
    document.getElementById('ziparchiver-inspect-filename').textContent = filename;
    document.getElementById('ziparchiver-inspect-filesize').textContent = formatBytes(fileSize || buffer.byteLength);
    document.getElementById('ziparchiver-inspect-files-count').textContent = fileCount;
    document.getElementById('ziparchiver-inspect-folders-count').textContent = folderCount;
    document.getElementById('ziparchiver-inspect-uncompressed-size').textContent = formatBytes(totalUncompressed);

    const overallSavings = totalUncompressed > 0 ? Math.max(0, Math.round(((totalUncompressed - (fileSize || buffer.byteLength)) / totalUncompressed) * 100)) : 0;
    document.getElementById('ziparchiver-inspect-compression-ratio').textContent = `${overallSavings}% Savings`;

    // Display comment if available
    const commentCont = document.getElementById('ziparchiver-inspect-comment-container');
    const commentEl = document.getElementById('ziparchiver-inspect-comment');
    if (commentText && commentText.trim() !== '') {
      if (commentCont) commentCont.classList.remove('hidden');
      if (commentEl) commentEl.textContent = commentText;
    } else {
      if (commentCont) commentCont.classList.add('hidden');
    }

    // Encrypted Archive Notice Bar
    if (hasEncryptedFiles) {
      if (decryptBar) decryptBar.classList.remove('hidden');
      const title = document.getElementById('ziparchiver-decrypt-title');
      const sub = document.getElementById('ziparchiver-decrypt-subtext');
      const icon = document.getElementById('ziparchiver-decrypt-status-icon');
      if (title) title.textContent = 'Encrypted Archive Detected';
      if (sub) sub.textContent = 'Files in this ZIP are password protected. Enter password to unlock.';
      if (icon) icon.setAttribute('data-lucide', 'lock');
    } else {
      if (decryptBar) decryptBar.classList.add('hidden');
    }

    if (loading) loading.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    if (dropzone) dropzone.classList.remove('hidden');

    ziparchiverFilterTable();
    lucide.createIcons();

  } catch (err) {
    console.error('ZIP Unpack Error:', err);
    alert('Failed to inspect ZIP file: ' + err.message);
    if (loading) loading.classList.add('hidden');
    if (dropzone) dropzone.classList.remove('hidden');
  }
}

async function ziparchiverApplyPassword() {
  const pwdInput = document.getElementById('ziparchiver-extract-password');
  const pwd = (pwdInput?.value || '').trim();
  if (!pwd) {
    alert('Please enter a password to unlock.');
    return;
  }

  const encryptedEntry = ziparchiverExtractedEntries.find(e => !e.dir && e.encrypted);
  if (!encryptedEntry) {
    ziparchiverAppliedPassword = pwd;
    alert('Password saved for extraction.');
    return;
  }

  try {
    // Test decryption on the first encrypted file
    await encryptedEntry.zipEntryObj.getData(new zip.BlobWriter(), { password: pwd });
    ziparchiverAppliedPassword = pwd;

    const title = document.getElementById('ziparchiver-decrypt-title');
    const sub = document.getElementById('ziparchiver-decrypt-subtext');
    const icon = document.getElementById('ziparchiver-decrypt-status-icon');
    if (title) { title.textContent = 'Archive Successfully Unlocked!'; title.className = 'font-bold text-xs text-emerald-800 dark:text-emerald-200'; }
    if (sub) { sub.textContent = 'Password verified. You can now preview and extract all files.'; sub.className = 'text-[11px] text-emerald-600 dark:text-emerald-400'; }
    if (icon) { icon.setAttribute('data-lucide', 'check-circle-2'); icon.className = 'text-emerald-600'; }
    lucide.createIcons();

  } catch (err) {
    alert('Incorrect password for this archive. Please try again.');
  }
}

function ziparchiverSetFilter(cat) {
  ziparchiverCurrentFilter = cat;
  ['all', 'docs', 'images', 'code', 'media'].forEach(c => {
    const btn = document.getElementById(`ziparchiver-filter-${c}`);
    if (btn) {
      if (c === cat) {
        btn.className = 'px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white shadow-sm transition';
      } else {
        btn.className = 'px-3 py-1.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition';
      }
    }
  });
  ziparchiverFilterTable();
}

function ziparchiverFilterTable() {
  const tbody = document.getElementById('ziparchiver-extract-tbody');
  const searchInput = document.getElementById('ziparchiver-search-input');
  const query = (searchInput?.value || '').toLowerCase().trim();

  if (!tbody) return;

  const filtered = ziparchiverExtractedEntries.filter(entry => {
    if (entry.dir) return false;
    if (ziparchiverCurrentFilter !== 'all' && entry.category !== ziparchiverCurrentFilter) return false;
    if (query && !entry.path.toLowerCase().includes(query)) return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-gray-400 dark:text-gray-500">
          <i data-lucide="folder-search" style="width:24px;height:24px" class="mx-auto mb-2 opacity-50"></i>
          No files matching your search query.
        </td>
      </tr>
    `;
    lucide.createIcons();
    ziparchiverUpdateSelectionUI();
    return;
  }

  let html = '';
  filtered.forEach(entry => {
    const info = ziparchiverGetFileInfo(entry.name);
    const dateStr = entry.date ? new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
    const isChecked = entry.isSelected ? 'checked' : '';
    const lockBadge = entry.encrypted ? '<span class="text-amber-500 text-xs ml-1.5" title="Password Encrypted">🔒</span>' : '';

    html += `
      <tr class="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition group">
        <td class="p-3 text-center">
          <input type="checkbox" ${isChecked} onchange="ziparchiverToggleRowSelection(${entry.id}, this.checked)" class="rounded text-blue-600 focus:ring-blue-500">
        </td>
        <td class="p-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${info.colorClass}">
              <i data-lucide="${info.icon}" style="width:14px;height:14px"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center">
                <span class="font-bold text-gray-800 dark:text-gray-100 block truncate" title="${entry.path}">${entry.name}</span>
                ${lockBadge}
              </div>
              ${entry.path !== entry.name ? `<span class="text-[10px] text-gray-400 truncate block font-mono">/${entry.path}</span>` : ''}
            </div>
          </div>
        </td>
        <td class="p-3 font-mono text-gray-600 dark:text-gray-300">${formatBytes(entry.size)}</td>
        <td class="p-3 font-mono text-gray-500">${formatBytes(entry.compressedSize)}</td>
        <td class="p-3 text-gray-500 text-[11px] whitespace-nowrap">${dateStr}</td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="ziparchiverPreviewFile(${entry.id})" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-200 hover:text-blue-600 rounded-lg text-xs font-semibold transition flex items-center gap-1" title="Preview file in browser">
              <i data-lucide="eye" style="width:12px;height:12px"></i>
              <span>Preview</span>
            </button>
            <button onclick="ziparchiverExtractSingleFile(${entry.id})" class="p-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-600 dark:text-blue-300 hover:text-white rounded-lg transition" title="Download this file">
              <i data-lucide="download" style="width:13px;height:13px"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  lucide.createIcons();
  ziparchiverUpdateSelectionUI();
}

function ziparchiverToggleMasterCheckbox(checked) {
  ziparchiverExtractedEntries.forEach(e => {
    if (!e.dir) e.isSelected = checked;
  });
  ziparchiverFilterTable();
}

function ziparchiverSelectAll(checked) {
  ziparchiverExtractedEntries.forEach(e => {
    if (!e.dir) e.isSelected = checked;
  });
  const master = document.getElementById('ziparchiver-master-checkbox');
  if (master) master.checked = checked;
  ziparchiverFilterTable();
}

function ziparchiverToggleRowSelection(id, checked) {
  const entry = ziparchiverExtractedEntries.find(e => e.id === id);
  if (entry) entry.isSelected = checked;
  ziparchiverUpdateSelectionUI();
}

function ziparchiverUpdateSelectionUI() {
  const selectedCount = ziparchiverExtractedEntries.filter(e => !e.dir && e.isSelected).length;
  const countSpan = document.getElementById('ziparchiver-selected-count');
  const btn = document.getElementById('ziparchiver-download-selected-btn');

  if (countSpan) countSpan.textContent = `(${selectedCount} selected)`;
  if (btn) {
    btn.disabled = selectedCount === 0;
    btn.innerHTML = `<i data-lucide="download" style="width:13px;height:13px"></i> <span>Download Selected (${selectedCount})</span>`;
    lucide.createIcons();
  }
}

// Password Prompt Modal Handlers
function ziparchiverPromptPasswordForEntry(entry, callback) {
  ziparchiverPendingAction = callback;
  const modal = document.getElementById('ziparchiver-password-modal');
  const nameEl = document.getElementById('ziparchiver-pwd-modal-filename');
  const errEl = document.getElementById('ziparchiver-modal-pwd-error');
  const input = document.getElementById('ziparchiver-modal-password-input');

  if (nameEl) nameEl.textContent = entry.name;
  if (errEl) errEl.classList.add('hidden');
  if (input) { input.value = ''; input.focus(); }
  if (modal) modal.classList.remove('hidden');
}

function ziparchiverClosePasswordModal() {
  ziparchiverPendingAction = null;
  const modal = document.getElementById('ziparchiver-password-modal');
  if (modal) modal.classList.add('hidden');
}

async function ziparchiverSubmitPasswordModal() {
  const input = document.getElementById('ziparchiver-modal-password-input');
  const errEl = document.getElementById('ziparchiver-modal-pwd-error');
  const pwd = (input?.value || '').trim();

  if (!pwd) {
    if (errEl) { errEl.textContent = 'Please enter a password.'; errEl.classList.remove('hidden'); }
    return;
  }

  ziparchiverAppliedPassword = pwd;
  const act = ziparchiverPendingAction;
  ziparchiverClosePasswordModal();

  if (act) {
    try {
      await act();
    } catch (err) {
      alert('Decryption failed. Incorrect password.');
    }
  }
}

// Extract Single File
async function ziparchiverExtractSingleFile(id) {
  const entry = ziparchiverExtractedEntries.find(e => e.id === id);
  if (!entry) return;

  if (entry.encrypted && !ziparchiverAppliedPassword) {
    ziparchiverPromptPasswordForEntry(entry, () => ziparchiverExtractSingleFile(id));
    return;
  }

  try {
    let blob;
    if (entry.engine === 'zipjs') {
      blob = await entry.zipEntryObj.getData(new zip.BlobWriter(), {
        password: ziparchiverAppliedPassword || undefined
      });
    } else {
      blob = await entry.zipEntryObj.async('blob');
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

  } catch (err) {
    if (entry.encrypted) {
      ziparchiverPromptPasswordForEntry(entry, () => ziparchiverExtractSingleFile(id));
    } else {
      alert('Failed to extract file: ' + err.message);
    }
  }
}

async function ziparchiverDownloadSelected() {
  const selected = ziparchiverExtractedEntries.filter(e => !e.dir && e.isSelected);
  if (selected.length === 0) return;

  const hasEnc = selected.some(e => e.encrypted);
  if (hasEnc && !ziparchiverAppliedPassword) {
    ziparchiverPromptPasswordForEntry(selected[0], () => ziparchiverDownloadSelected());
    return;
  }

  const progressContainer = document.getElementById('ziparchiver-extract-progress-container');
  const progressBar = document.getElementById('ziparchiver-extract-progress-bar');
  const percentText = document.getElementById('ziparchiver-extract-percent-text');
  const statusText = document.getElementById('ziparchiver-extract-status-text');

  if (progressContainer) progressContainer.classList.remove('hidden');

  for (let i = 0; i < selected.length; i++) {
    const entry = selected[i];
    const percent = Math.round(((i + 1) / selected.length) * 100);
    if (progressBar) progressBar.style.width = percent + '%';
    if (percentText) percentText.textContent = percent + '%';
    if (statusText) statusText.textContent = `Downloading ${entry.name} (${i + 1}/${selected.length})...`;

    await ziparchiverExtractSingleFile(entry.id);
    await new Promise(r => setTimeout(r, 150));
  }

  setTimeout(() => {
    if (progressContainer) progressContainer.classList.add('hidden');
  }, 600);
}

async function ziparchiverExtractAllFiles() {
  const files = ziparchiverExtractedEntries.filter(e => !e.dir);
  if (files.length === 0) return;

  const hasEnc = files.some(e => e.encrypted);
  if (hasEnc && !ziparchiverAppliedPassword) {
    ziparchiverPromptPasswordForEntry(files[0], () => ziparchiverExtractAllFiles());
    return;
  }

  const progressContainer = document.getElementById('ziparchiver-extract-progress-container');
  const progressBar = document.getElementById('ziparchiver-extract-progress-bar');
  const percentText = document.getElementById('ziparchiver-extract-percent-text');
  const statusText = document.getElementById('ziparchiver-extract-status-text');

  if (progressContainer) progressContainer.classList.remove('hidden');

  for (let i = 0; i < files.length; i++) {
    const entry = files[i];
    const percent = Math.round(((i + 1) / files.length) * 100);
    if (progressBar) progressBar.style.width = percent + '%';
    if (percentText) percentText.textContent = percent + '%';
    if (statusText) statusText.textContent = `Extracting ${entry.name} (${i + 1}/${files.length})...`;

    await ziparchiverExtractSingleFile(entry.id);
    await new Promise(r => setTimeout(r, 120));
  }

  setTimeout(() => {
    if (progressContainer) progressContainer.classList.add('hidden');
  }, 600);
}

// In-App File Previewer
async function ziparchiverPreviewFile(id) {
  const entry = ziparchiverExtractedEntries.find(e => e.id === id);
  if (!entry) return;

  if (entry.encrypted && !ziparchiverAppliedPassword) {
    ziparchiverPromptPasswordForEntry(entry, () => ziparchiverPreviewFile(id));
    return;
  }

  ziparchiverCurrentPreviewEntry = entry;
  const modal = document.getElementById('ziparchiver-preview-modal');
  const titleEl = document.getElementById('ziparchiver-preview-filename');
  const sizeEl = document.getElementById('ziparchiver-preview-filesize');
  const bodyEl = document.getElementById('ziparchiver-preview-body');
  const copyBtn = document.getElementById('ziparchiver-preview-copy-btn');
  const typeInfoEl = document.getElementById('ziparchiver-preview-type-info');

  if (titleEl) titleEl.textContent = entry.path;
  if (sizeEl) sizeEl.textContent = formatBytes(entry.size);
  if (copyBtn) copyBtn.classList.add('hidden');

  const info = ziparchiverGetFileInfo(entry.name);
  if (typeInfoEl) typeInfoEl.textContent = `${info.category.toUpperCase()} • ${entry.ext.toUpperCase() || 'FILE'}`;

  // Clean previous preview URL
  if (ziparchiverCurrentPreviewUrl) {
    URL.revokeObjectURL(ziparchiverCurrentPreviewUrl);
    ziparchiverCurrentPreviewUrl = null;
  }

  if (bodyEl) {
    bodyEl.innerHTML = '<i data-lucide="loader-2" style="width:24px;height:24px" class="animate-spin text-blue-500"></i>';
    lucide.createIcons();
  }

  if (modal) modal.classList.remove('hidden');

  try {
    let blob;
    let text;

    if (entry.engine === 'zipjs') {
      if (['images', 'media'].includes(info.category)) {
        blob = await entry.zipEntryObj.getData(new zip.BlobWriter(), { password: ziparchiverAppliedPassword || undefined });
      } else if (['code', 'docs'].includes(info.category)) {
        text = await entry.zipEntryObj.getData(new zip.TextWriter(), { password: ziparchiverAppliedPassword || undefined });
      } else {
        blob = await entry.zipEntryObj.getData(new zip.BlobWriter(), { password: ziparchiverAppliedPassword || undefined });
      }
    } else {
      if (['images', 'media'].includes(info.category)) {
        blob = await entry.zipEntryObj.async('blob');
      } else if (['code', 'docs'].includes(info.category)) {
        text = await entry.zipEntryObj.async('string');
      } else {
        blob = await entry.zipEntryObj.async('blob');
      }
    }

    if (['images'].includes(info.category) && blob) {
      ziparchiverCurrentPreviewUrl = URL.createObjectURL(blob);
      if (bodyEl) {
        bodyEl.innerHTML = `
          <div class="max-h-[55vh] flex items-center justify-center p-2">
            <img src="${ziparchiverCurrentPreviewUrl}" class="max-h-[50vh] max-w-full object-contain rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" alt="${entry.name}">
          </div>
        `;
      }
    } else if (text !== undefined && ['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'sql', 'sh', 'xml', 'yaml', 'yml', 'csv'].includes(info.ext)) {
      if (copyBtn) copyBtn.classList.remove('hidden');

      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const lines = escaped.split('\n');
      let lineHtml = lines.map((l, i) => `<span class="inline-block w-8 text-right pr-3 text-gray-400 select-none">${i + 1}</span>${l}`).join('\n');

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div class="w-full h-full max-h-[55vh] overflow-auto bg-gray-900 text-gray-100 p-4 rounded-2xl font-mono text-xs leading-relaxed text-left border border-gray-800 select-text">
            <pre><code>${lineHtml}</code></pre>
          </div>
        `;
      }
    } else if (['media'].includes(info.category) && ['mp3', 'wav', 'ogg', 'm4a'].includes(info.ext) && blob) {
      ziparchiverCurrentPreviewUrl = URL.createObjectURL(blob);
      if (bodyEl) {
        bodyEl.innerHTML = `
          <div class="p-8 text-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-500 mx-auto flex items-center justify-center">
              <i data-lucide="music" style="width:32px;height:32px"></i>
            </div>
            <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100">${entry.name}</h4>
            <audio controls src="${ziparchiverCurrentPreviewUrl}" class="w-full max-w-md mx-auto"></audio>
          </div>
        `;
        lucide.createIcons();
      }
    } else {
      if (bodyEl) {
        bodyEl.innerHTML = `
          <div class="text-center p-8 space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 mx-auto flex items-center justify-center">
              <i data-lucide="${info.icon}" style="width:28px;height:28px"></i>
            </div>
            <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100">${entry.name}</h4>
            <p class="text-xs text-gray-500 max-w-xs mx-auto">
              Binary format (${entry.ext.toUpperCase() || 'FILE'}). Click Download to extract and view on your machine.
            </p>
          </div>
        `;
        lucide.createIcons();
      }
    }
  } catch (err) {
    if (entry.encrypted) {
      ziparchiverClosePreviewModal();
      ziparchiverPromptPasswordForEntry(entry, () => ziparchiverPreviewFile(id));
    } else if (bodyEl) {
      bodyEl.innerHTML = `<div class="text-red-500 text-xs p-4">Error loading preview: ${err.message}</div>`;
    }
  }
}

function ziparchiverClosePreviewModal() {
  if (ziparchiverCurrentPreviewUrl) {
    URL.revokeObjectURL(ziparchiverCurrentPreviewUrl);
    ziparchiverCurrentPreviewUrl = null;
  }
  ziparchiverCurrentPreviewEntry = null;
  const modal = document.getElementById('ziparchiver-preview-modal');
  if (modal) modal.classList.add('hidden');
}

async function ziparchiverCopyPreviewText() {
  if (!ziparchiverCurrentPreviewEntry) return;
  try {
    let text;
    if (ziparchiverCurrentPreviewEntry.engine === 'zipjs') {
      text = await ziparchiverCurrentPreviewEntry.zipEntryObj.getData(new zip.TextWriter(), { password: ziparchiverAppliedPassword || undefined });
    } else {
      text = await ziparchiverCurrentPreviewEntry.zipEntryObj.async('string');
    }
    await navigator.clipboard.writeText(text);
    const copyText = document.getElementById('ziparchiver-preview-copy-text');
    if (copyText) {
      copyText.textContent = 'Copied!';
      setTimeout(() => copyText.textContent = 'Copy Content', 1500);
    }
  } catch (err) {
    alert('Failed to copy text.');
  }
}

function ziparchiverDownloadCurrentPreview() {
  if (!ziparchiverCurrentPreviewEntry) return;
  ziparchiverExtractSingleFile(ziparchiverCurrentPreviewEntry.id);
}

function ziparchiverReset() {
  ziparchiverResetCreate();
  ziparchiverExtractedEntries = [];
  ziparchiverAppliedPassword = '';
  document.getElementById('ziparchiver-extract-dashboard')?.classList.add('hidden');
  document.getElementById('ziparchiver-extract-dropzone')?.classList.remove('hidden');
  document.getElementById('ziparchiver-decrypt-bar')?.classList.add('hidden');
  const extPwd = document.getElementById('ziparchiver-extract-password');
  if (extPwd) extPwd.value = '';
  ziparchiverClosePreviewModal();
  ziparchiverClosePathModal();
  ziparchiverClosePasswordModal();
  ziparchiverSetTab('create');
}


// =========================================================================
// ======================== STANDARD CALCULATOR STUDIO =====================
// =========================================================================

let calcCurrentInput = '0';
let calcPreviousValue = null;
let calcCurrentOperator = null;
let calcWaitingForSecondOperand = false;
let calcEquationTrail = '';
let calcEquationTokens = []; // Array of tokens: ['112165', '+', '578435', '×', ...]
let calcOperationCount = 0; // Tracks operations chained in current calculation (up to 100)
let calcMemoryStack = []; // Array of saved numbers
let calcHistoryLog = []; // Array of { id, equation, result, timestamp }
let calcCurrentSideTab = 'history'; // 'history', 'memory', 'converter'
let calcInConverterMode = false;
let calcSettings = {
  precision: 'auto',
  grouping: true,
  sound: true,
  accentBg: '#f59e0b',
  accentText: '#ffffff'
};
let calcAudioCtx = null;
let calcKeyboardListenerAttached = false;

// Smartphone Unit Converter State
let calcConverterCategory = 'length';
let calcConvActiveField = 'top'; // 'top' or 'bottom'
let calcConvValTop = '1';
let calcConvValBottom = '2.54';
let calcConvUnitTop = 'in';
let calcConvUnitBottom = 'cm';

const CALC_UNITS_REGISTRY = {
  length: {
    name: 'Length',
    units: {
      in: { name: 'Inches', sym: 'in', factor: 0.0254 },
      cm: { name: 'Centimetres', sym: 'cm', factor: 0.01 },
      m: { name: 'Metres', sym: 'm', factor: 1 },
      km: { name: 'Kilometres', sym: 'km', factor: 1000 },
      mm: { name: 'Millimetres', sym: 'mm', factor: 0.001 },
      ft: { name: 'Feet', sym: 'ft', factor: 0.3048 },
      yd: { name: 'Yards', sym: 'yd', factor: 0.9144 },
      mi: { name: 'Miles', sym: 'mi', factor: 1609.344 },
      nm: { name: 'Nautical Miles', sym: 'NM', factor: 1852 }
    }
  },
  weight: {
    name: 'Mass',
    units: {
      kg: { name: 'Kilograms', sym: 'kg', factor: 1 },
      g: { name: 'Grams', sym: 'g', factor: 0.001 },
      mg: { name: 'Milligrams', sym: 'mg', factor: 0.000001 },
      lb: { name: 'Pounds', sym: 'lb', factor: 0.45359237 },
      oz: { name: 'Ounces', sym: 'oz', factor: 0.02834952 },
      t: { name: 'Metric Tonnes', sym: 't', factor: 1000 },
      st: { name: 'Stone', sym: 'st', factor: 6.35029 }
    }
  },
  temperature: {
    name: 'Temperature',
    units: {
      C: { name: 'Celsius', sym: '°C' },
      F: { name: 'Fahrenheit', sym: '°F' },
      K: { name: 'Kelvin', sym: 'K' }
    }
  },
  volume: {
    name: 'Volume',
    units: {
      L: { name: 'Litres', sym: 'L', factor: 1 },
      mL: { name: 'Millilitres', sym: 'mL', factor: 0.001 },
      m3: { name: 'Cubic Metres', sym: 'm³', factor: 1000 },
      gal: { name: 'US Gallons', sym: 'gal', factor: 3.78541 },
      qt: { name: 'US Quarts', sym: 'qt', factor: 0.946353 },
      pt: { name: 'US Pints', sym: 'pt', factor: 0.473176 },
      cup: { name: 'US Cups', sym: 'cup', factor: 0.236588 },
      floz: { name: 'Fluid Ounces', sym: 'fl oz', factor: 0.0295735 }
    }
  },
  area: {
    name: 'Area',
    units: {
      sqm: { name: 'Square Metres', sym: 'm²', factor: 1 },
      sqkm: { name: 'Square Kilometres', sym: 'km²', factor: 1000000 },
      sqcm: { name: 'Square Centimetres', sym: 'cm²', factor: 0.0001 },
      sqft: { name: 'Square Feet', sym: 'ft²', factor: 0.092903 },
      sqin: { name: 'Square Inches', sym: 'in²', factor: 0.00064516 },
      sqyd: { name: 'Square Yards', sym: 'yd²', factor: 0.836127 },
      acre: { name: 'Acres', sym: 'ac', factor: 4046.86 },
      ha: { name: 'Hectares', sym: 'ha', factor: 10000 }
    }
  },
  data: {
    name: 'Data',
    units: {
      B: { name: 'Bytes', sym: 'B', factor: 1 },
      KB: { name: 'Kilobytes', sym: 'KB', factor: 1024 },
      MB: { name: 'Megabytes', sym: 'MB', factor: 1048576 },
      GB: { name: 'Gigabytes', sym: 'GB', factor: 1073741824 },
      TB: { name: 'Terabytes', sym: 'TB', factor: 1099511627776 },
      PB: { name: 'Petabytes', sym: 'PB', factor: 1125899906842624 }
    }
  },
  speed: {
    name: 'Speed',
    units: {
      kmh: { name: 'Kilometres / hr', sym: 'km/h', factor: 0.277778 },
      mph: { name: 'Miles / hr', sym: 'mph', factor: 0.44704 },
      ms: { name: 'Metres / sec', sym: 'm/s', factor: 1 },
      kn: { name: 'Knots', sym: 'kn', factor: 0.514444 },
      fts: { name: 'Feet / sec', sym: 'ft/s', factor: 0.3048 }
    }
  },
  time: {
    name: 'Time',
    units: {
      s: { name: 'Seconds', sym: 's', factor: 1 },
      min: { name: 'Minutes', sym: 'min', factor: 60 },
      h: { name: 'Hours', sym: 'h', factor: 3600 },
      d: { name: 'Days', sym: 'd', factor: 86400 },
      wk: { name: 'Weeks', sym: 'wk', factor: 604800 },
      mo: { name: 'Months (30d)', sym: 'mo', factor: 2592000 },
      yr: { name: 'Years (365d)', sym: 'yr', factor: 31536000 }
    }
  }
};

// Initialize Calculator
function setupCalculator() {
  calcUpdateDisplay();
  calcRenderHistoryList();
  calcRenderMemoryList();
  calcInitDualConverter();
  calcApplyAccentColor();

  if (!calcKeyboardListenerAttached) {
    window.addEventListener('keydown', calcHandleGlobalKeyboard);
    calcKeyboardListenerAttached = true;
  }
}

// Show Toast Message
function calcShowToast(msg) {
  const toast = document.getElementById('coming-toast');
  const text = document.getElementById('coming-toast-text');
  if (toast && text) {
    text.textContent = msg;
    toast.classList.remove('hidden');
    toast.style.opacity = '1';
    if (window._calcToastTimer) clearTimeout(window._calcToastTimer);
    window._calcToastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2000);
  }
}

// Play synthesized acoustic mechanical tick
function calcPlayAudioTick() {
  if (!calcSettings.sound) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!calcAudioCtx) calcAudioCtx = new AudioCtx();
    if (calcAudioCtx.state === 'suspended') calcAudioCtx.resume();

    const osc = calcAudioCtx.createOscillator();
    const gain = calcAudioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, calcAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, calcAudioCtx.currentTime + 0.022);

    gain.gain.setValueAtTime(0.06, calcAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, calcAudioCtx.currentTime + 0.022);

    osc.connect(gain);
    gain.connect(calcAudioCtx.destination);

    osc.start();
    osc.stop(calcAudioCtx.currentTime + 0.022);
  } catch (e) {
    // Fallback ignored safely
  }
}

// Clean and format floating point math & scientific exponential notation
function calcCleanFloat(num) {
  if (isNaN(num) || !isFinite(num)) return num;

  // For very large numbers (>= 1e16) or very small decimals (< 1e-6), use scientific exponential notation
  if (Math.abs(num) >= 1e16 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return parseFloat(num.toPrecision(12)).toString();
  }

  if (calcSettings.precision !== 'auto') {
    const dec = parseInt(calcSettings.precision, 10);
    return parseFloat(num.toFixed(dec));
  }
  // Remove floating point IEEE artifacts
  return parseFloat(parseFloat(num.toPrecision(14)).toString());
}

// Format numbers with thousands separators, exponential notation, and dynamic font scaling
function calcFormatDisplay(valueStr) {
  if (valueStr === undefined || valueStr === null || valueStr === '') return '0';
  const str = valueStr.toString();
  if (['Error', 'Cannot divide by zero', 'Invalid Input'].includes(str)) {
    return str;
  }

  // Handle scientific exponential notation e.g. 1.53515e+10 or 2.5e-8
  if (str.toLowerCase().includes('e')) {
    const parts = str.toLowerCase().split('e');
    const mantissa = parts[0];
    const exp = parseInt(parts[1], 10);
    return `${mantissa}e${exp >= 0 ? '+' : ''}${exp}`;
  }

  if (!calcSettings.grouping) return str;

  const parts = str.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // Add thousand commas to integer part
  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (isNegative ? '-' : '') + integerPart + decimalPart;
}

// Format multi-step chained tokens into a readable equation trail
function calcFormatTokensTrail(tokens) {
  return tokens.map(t => {
    if (['+', '−', '×', '÷', '='].includes(t)) return t;
    if (t.startsWith('sqr(') || t.startsWith('√(') || t.startsWith('1/(')) return t;
    return calcFormatDisplay(t);
  }).join(' ');
}

function calcUpdateDisplay() {
  const mainEl = document.getElementById('calc-main-display');
  const eqEl = document.getElementById('calc-equation-display');

  if (mainEl) {
    const formatted = calcFormatDisplay(calcCurrentInput);
    mainEl.textContent = formatted;

    // Dynamic responsive font scaling for very large numbers & exponents
    const len = formatted.length;
    if (len <= 10) {
      mainEl.className = 'text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight break-all font-mono transition-all';
    } else if (len <= 15) {
      mainEl.className = 'text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight break-all font-mono transition-all';
    } else if (len <= 20) {
      mainEl.className = 'text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight break-all font-mono transition-all';
    } else if (len <= 26) {
      mainEl.className = 'text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white tracking-tight break-all font-mono transition-all';
    } else {
      mainEl.className = 'text-lg sm:text-xl font-semibold text-gray-900 dark:text-white tracking-tight break-all font-mono transition-all';
    }
  }

  if (eqEl) {
    eqEl.textContent = calcEquationTrail;
    // Auto-scroll trail to show latest operations
    eqEl.scrollLeft = eqEl.scrollWidth;
  }

  calcUpdateMemoryKeyStates();
}

// Digits & Numbers (Extended large input capacity up to 48 digits)
function calcDigit(digit) {
  calcPlayAudioTick();

  // If in Converter mode, type directly into the active dual converter field
  if (calcInConverterMode) {
    let currentVal = calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom;
    if (currentVal === '0' || currentVal === 'Error') {
      currentVal = digit;
    } else {
      if (currentVal.replace(/[^0-9]/g, '').length < 32) {
        currentVal += digit;
      }
    }

    if (calcConvActiveField === 'top') {
      calcConvValTop = currentVal;
    } else {
      calcConvValBottom = currentVal;
    }

    calcPerformDualConversion();
    return;
  }

  if (calcWaitingForSecondOperand) {
    calcCurrentInput = digit;
    calcWaitingForSecondOperand = false;
  } else {
    if (calcCurrentInput === '0' || calcCurrentInput === 'Error' || calcCurrentInput === 'Cannot divide by zero' || calcCurrentInput === 'Invalid Input') {
      calcCurrentInput = digit;
    } else {
      if (calcCurrentInput.replace(/[^0-9]/g, '').length < 48) {
        calcCurrentInput += digit;
      }
    }
  }

  calcUpdateDisplay();
}

function calcDecimal() {
  calcPlayAudioTick();

  // If in Converter mode, add decimal to the active dual converter field
  if (calcInConverterMode) {
    let currentVal = calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom;
    if (!currentVal.includes('.')) {
      if (currentVal === 'Error') currentVal = '0.';
      else currentVal += '.';
    }
    if (calcConvActiveField === 'top') calcConvValTop = currentVal;
    else calcConvValBottom = currentVal;
    calcPerformDualConversion();
    return;
  }

  if (calcWaitingForSecondOperand) {
    calcCurrentInput = '0.';
    calcWaitingForSecondOperand = false;
  } else if (!calcCurrentInput.includes('.')) {
    if (calcCurrentInput === 'Error' || calcCurrentInput === 'Cannot divide by zero' || calcCurrentInput === 'Invalid Input') {
      calcCurrentInput = '0.';
    } else {
      calcCurrentInput += '.';
    }
  }

  calcUpdateDisplay();
}

function calcToggleSign() {
  calcPlayAudioTick();

  if (calcInConverterMode) {
    let currentVal = calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom;
    if (currentVal !== '0' && !isNaN(Number(currentVal))) {
      currentVal = currentVal.startsWith('-') ? currentVal.substring(1) : '-' + currentVal;
      if (calcConvActiveField === 'top') calcConvValTop = currentVal;
      else calcConvValBottom = currentVal;
      calcPerformDualConversion();
    }
    return;
  }

  if (calcCurrentInput === '0' || isNaN(Number(calcCurrentInput))) return;

  if (calcCurrentInput.startsWith('-')) {
    calcCurrentInput = calcCurrentInput.substring(1);
  } else {
    calcCurrentInput = '-' + calcCurrentInput;
  }

  calcUpdateDisplay();
}

function calcBackspace() {
  calcPlayAudioTick();

  if (calcInConverterMode) {
    let currentVal = calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom;
    if (currentVal.length > 1 && currentVal !== 'Error') {
      currentVal = currentVal.slice(0, -1);
      if (currentVal === '-' || currentVal === '') currentVal = '0';
    } else {
      currentVal = '0';
    }
    if (calcConvActiveField === 'top') calcConvValTop = currentVal;
    else calcConvValBottom = currentVal;
    calcPerformDualConversion();
    return;
  }

  if (calcWaitingForSecondOperand) return;

  if (calcCurrentInput.length > 1 && !['Error', 'Cannot divide by zero', 'Invalid Input'].includes(calcCurrentInput)) {
    calcCurrentInput = calcCurrentInput.slice(0, -1);
    if (calcCurrentInput === '-' || calcCurrentInput === '') calcCurrentInput = '0';
  } else {
    calcCurrentInput = '0';
  }

  calcUpdateDisplay();
}

function calcClearEntry() {
  calcPlayAudioTick();

  if (calcInConverterMode) {
    if (calcConvActiveField === 'top') calcConvValTop = '0';
    else calcConvValBottom = '0';
    calcPerformDualConversion();
    return;
  }

  calcCurrentInput = '0';
  calcUpdateDisplay();
}

function calcClearAll() {
  calcPlayAudioTick();

  if (calcInConverterMode) {
    calcConvValTop = '0';
    calcConvValBottom = '0';
    calcPerformDualConversion();
    return;
  }

  calcCurrentInput = '0';
  calcPreviousValue = null;
  calcCurrentOperator = null;
  calcWaitingForSecondOperand = false;
  calcEquationTrail = '';
  calcEquationTokens = [];
  calcOperationCount = 0;
  calcUpdateDisplay();
}

// Operators & Computation with continuous chaining (up to 100 operations in one go)
function calcOperator(op) {
  calcPlayAudioTick();

  if (calcInConverterMode) {
    calcSwapConvUnits();
    return;
  }

  // Enforce 100 operations limit in one continuous calculation
  if (calcOperationCount >= 100 && !calcWaitingForSecondOperand) {
    calcShowToast('Maximum 100 chained operations reached for this calculation. Press = to view result.');
    return;
  }

  const inputValue = parseFloat(calcCurrentInput);

  if (calcPreviousValue === null) {
    calcPreviousValue = inputValue;
    calcOperationCount = 1;
    calcEquationTokens = [calcCurrentInput, op];
  } else if (calcWaitingForSecondOperand) {
    // Replace the last operator if user presses a different operator before entering a number
    calcCurrentOperator = op;
    if (calcEquationTokens.length > 0) {
      calcEquationTokens[calcEquationTokens.length - 1] = op;
    }
    calcEquationTrail = calcFormatTokensTrail(calcEquationTokens);
    calcUpdateDisplay();
    return;
  } else if (calcCurrentOperator) {
    const result = calcCompute(calcPreviousValue, inputValue, calcCurrentOperator);
    if (typeof result === 'string') {
      calcCurrentInput = result;
      calcPreviousValue = null;
      calcCurrentOperator = null;
      calcEquationTrail = '';
      calcEquationTokens = [];
      calcOperationCount = 0;
      calcUpdateDisplay();
      return;
    }
    calcOperationCount++;
    calcPreviousValue = result;
    calcCurrentInput = calcCleanFloat(result).toString();
    calcEquationTokens.push(inputValue.toString(), op);
  }

  calcWaitingForSecondOperand = true;
  calcCurrentOperator = op;
  calcEquationTrail = calcFormatTokensTrail(calcEquationTokens);
  calcUpdateDisplay();
}

function calcCompute(first, second, op) {
  let res;
  switch (op) {
    case '+':
      res = first + second;
      break;
    case '−':
    case '-':
      res = first - second;
      break;
    case '×':
    case '*':
      res = first * second;
      break;
    case '÷':
    case '/':
      if (second === 0) return 'Cannot divide by zero';
      res = first / second;
      break;
    default:
      return second;
  }
  return calcCleanFloat(res);
}

function calcEquals() {
  calcPlayAudioTick();

  if (calcInConverterMode) {
    calcFocusConvField(calcConvActiveField === 'top' ? 'bottom' : 'top');
    return;
  }

  if (calcCurrentOperator === null || calcPreviousValue === null) {
    return;
  }

  const inputValue = parseFloat(calcCurrentInput);
  const result = calcCompute(calcPreviousValue, inputValue, calcCurrentOperator);

  calcEquationTokens.push(inputValue.toString(), '=');
  const equationStr = calcFormatTokensTrail(calcEquationTokens);

  if (typeof result === 'string') {
    calcCurrentInput = result;
    calcEquationTrail = equationStr;
    calcPreviousValue = null;
    calcCurrentOperator = null;
    calcWaitingForSecondOperand = true;
    calcEquationTokens = [];
    calcOperationCount = 0;
    calcUpdateDisplay();
    return;
  }

  const finalResultStr = calcCleanFloat(result).toString();
  calcEquationTrail = equationStr;
  calcCurrentInput = finalResultStr;

  // Add to Calculation History
  calcAddHistory(equationStr, calcFormatDisplay(finalResultStr), result);

  calcPreviousValue = null;
  calcCurrentOperator = null;
  calcWaitingForSecondOperand = true;
  calcEquationTokens = [];
  calcOperationCount = 0;
  calcUpdateDisplay();
}

// Standard Functions (%, 1/x, x², √x)
function calcInputPercent() {
  calcPlayAudioTick();
  if (calcInConverterMode) return;

  const current = parseFloat(calcCurrentInput);
  if (isNaN(current)) return;

  if (calcPreviousValue !== null && (calcCurrentOperator === '+' || calcCurrentOperator === '−')) {
    const percentVal = calcCleanFloat((calcPreviousValue * current) / 100);
    calcCurrentInput = percentVal.toString();
  } else {
    const percentVal = calcCleanFloat(current / 100);
    calcCurrentInput = percentVal.toString();
  }

  calcUpdateDisplay();
}

function calcSquare() {
  calcPlayAudioTick();
  if (calcInConverterMode) return;

  const current = parseFloat(calcCurrentInput);
  if (isNaN(current)) return;

  const res = calcCleanFloat(current * current);
  const eq = `sqr(${calcFormatDisplay(current.toString())})`;
  calcEquationTrail = eq;
  calcCurrentInput = res.toString();
  calcWaitingForSecondOperand = true;

  calcAddHistory(`${eq} =`, calcFormatDisplay(res.toString()), res);
  calcUpdateDisplay();
}

function calcSquareRoot() {
  calcPlayAudioTick();
  if (calcInConverterMode) return;

  const current = parseFloat(calcCurrentInput);
  if (isNaN(current)) return;
  if (current < 0) {
    calcCurrentInput = 'Invalid Input';
    calcUpdateDisplay();
    return;
  }

  const res = calcCleanFloat(Math.sqrt(current));
  const eq = `√(${calcFormatDisplay(current.toString())})`;
  calcEquationTrail = eq;
  calcCurrentInput = res.toString();
  calcWaitingForSecondOperand = true;

  calcAddHistory(`${eq} =`, calcFormatDisplay(res.toString()), res);
  calcUpdateDisplay();
}

function calcReciprocal() {
  calcPlayAudioTick();
  if (calcInConverterMode) return;

  const current = parseFloat(calcCurrentInput);
  if (isNaN(current)) return;
  if (current === 0) {
    calcCurrentInput = 'Cannot divide by zero';
    calcUpdateDisplay();
    return;
  }

  const res = calcCleanFloat(1 / current);
  const eq = `1/(${calcFormatDisplay(current.toString())})`;
  calcEquationTrail = eq;
  calcCurrentInput = res.toString();
  calcWaitingForSecondOperand = true;

  calcAddHistory(`${eq} =`, calcFormatDisplay(res.toString()), res);
  calcUpdateDisplay();
}

// Memory Operations
function calcMemoryStore() {
  calcPlayAudioTick();
  const val = parseFloat(calcInConverterMode ? (calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom) : calcCurrentInput);
  if (isNaN(val)) return;

  calcMemoryStack.unshift(val);
  calcWaitingForSecondOperand = true;
  calcRenderMemoryList();
  calcUpdateMemoryKeyStates();
  calcShowToast('Stored ' + calcFormatDisplay(val.toString()) + ' in memory');
}

function calcMemoryRecall() {
  calcPlayAudioTick();
  if (calcMemoryStack.length === 0) return;
  const recalled = calcCleanFloat(calcMemoryStack[0]).toString();

  if (calcInConverterMode) {
    if (calcConvActiveField === 'top') calcConvValTop = recalled;
    else calcConvValBottom = recalled;
    calcPerformDualConversion();
    return;
  }

  calcCurrentInput = recalled;
  calcWaitingForSecondOperand = true;
  calcUpdateDisplay();
}

function calcMemoryClear() {
  calcPlayAudioTick();
  calcMemoryStack = [];
  calcRenderMemoryList();
  calcUpdateMemoryKeyStates();
  calcShowToast('Memory cleared');
}

function calcMemoryAdd() {
  calcPlayAudioTick();
  const val = parseFloat(calcInConverterMode ? (calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom) : calcCurrentInput);
  if (isNaN(val)) return;

  if (calcMemoryStack.length === 0) {
    calcMemoryStack.push(val);
  } else {
    calcMemoryStack[0] = calcCleanFloat(calcMemoryStack[0] + val);
  }

  calcWaitingForSecondOperand = true;
  calcRenderMemoryList();
  calcUpdateMemoryKeyStates();
}

function calcMemorySubtract() {
  calcPlayAudioTick();
  const val = parseFloat(calcInConverterMode ? (calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom) : calcCurrentInput);
  if (isNaN(val)) return;

  if (calcMemoryStack.length === 0) {
    calcMemoryStack.push(-val);
  } else {
    calcMemoryStack[0] = calcCleanFloat(calcMemoryStack[0] - val);
  }

  calcWaitingForSecondOperand = true;
  calcRenderMemoryList();
  calcUpdateMemoryKeyStates();
}

function calcUpdateMemoryKeyStates() {
  const hasMem = calcMemoryStack.length > 0;
  const mc = document.getElementById('calc-mem-mc');
  const mr = document.getElementById('calc-mem-mr');
  const mDrop = document.getElementById('calc-mem-dropdown');

  [mc, mr, mDrop].forEach(el => {
    if (el) {
      if (hasMem) {
        el.classList.remove('opacity-40', 'cursor-default');
        el.classList.add('opacity-100', 'cursor-pointer', 'text-amber-600', 'dark:text-amber-400');
      } else {
        el.classList.add('opacity-40', 'cursor-default');
        el.classList.remove('opacity-100', 'cursor-pointer', 'text-amber-600', 'dark:text-amber-400');
      }
    }
  });
}

function calcRenderMemoryList() {
  const listEl = document.getElementById('calc-memory-list');
  if (!listEl) return;

  if (calcMemoryStack.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-12 space-y-2 text-gray-400 dark:text-gray-500">
        <i data-lucide="database" style="width:28px;height:28px" class="mx-auto opacity-40"></i>
        <p class="text-xs font-semibold">There's nothing saved in memory</p>
        <p class="text-[11px] opacity-75">Use MS to store values or M+/M− to accumulate</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let html = '';
  calcMemoryStack.forEach((val, idx) => {
    html += `
      <div class="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700/80 flex items-center justify-between gap-2 group hover:border-amber-400 transition">
        <div class="cursor-pointer flex-1" onclick="calcLoadMemoryItem(${val})">
          <div class="text-[10px] text-gray-400 font-semibold">Slot #${idx + 1}</div>
          <div class="font-mono text-sm font-bold text-gray-800 dark:text-gray-100">${calcFormatDisplay(val.toString())}</div>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="calcMemoryItemAdd(${idx})" class="px-2.5 py-1.5 bg-white dark:bg-gray-800 hover:bg-amber-50 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition" title="Add to this slot">M+</button>
          <button onclick="calcMemoryItemSub(${idx})" class="px-2.5 py-1.5 bg-white dark:bg-gray-800 hover:bg-amber-50 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition" title="Subtract from this slot">M−</button>
          <button onclick="calcMemoryItemClear(${idx})" class="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-500 rounded-lg transition active:scale-95" title="Clear slot"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  lucide.createIcons();
}

function calcLoadMemoryItem(val) {
  calcPlayAudioTick();
  if (calcInConverterMode) {
    const s = calcCleanFloat(val).toString();
    if (calcConvActiveField === 'top') calcConvValTop = s;
    else calcConvValBottom = s;
    calcPerformDualConversion();
    return;
  }

  calcCurrentInput = calcCleanFloat(val).toString();
  calcWaitingForSecondOperand = true;
  calcUpdateDisplay();
}

function calcMemoryItemAdd(idx) {
  const current = parseFloat(calcInConverterMode ? (calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom) : calcCurrentInput);
  if (isNaN(current)) return;
  calcMemoryStack[idx] = calcCleanFloat(calcMemoryStack[idx] + current);
  calcRenderMemoryList();
}

function calcMemoryItemSub(idx) {
  const current = parseFloat(calcInConverterMode ? (calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom) : calcCurrentInput);
  if (isNaN(current)) return;
  calcMemoryStack[idx] = calcCleanFloat(calcMemoryStack[idx] - current);
  calcRenderMemoryList();
}

function calcMemoryItemClear(idx) {
  calcMemoryStack.splice(idx, 1);
  calcRenderMemoryList();
  calcUpdateMemoryKeyStates();
}

// History Operations
function calcAddHistory(equation, formattedResult, rawResult) {
  const item = {
    id: Date.now(),
    equation: equation,
    result: formattedResult,
    rawResult: rawResult,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  calcHistoryLog.unshift(item);
  calcRenderHistoryList();

  const dot = document.getElementById('calc-history-count-dot');
  if (dot) dot.classList.remove('hidden');
}

function calcRenderHistoryList() {
  const listEl = document.getElementById('calc-history-list');
  if (!listEl) return;

  if (calcHistoryLog.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-12 space-y-2 text-gray-400 dark:text-gray-500">
        <i data-lucide="clock" style="width:28px;height:28px" class="mx-auto opacity-40"></i>
        <p class="text-xs font-semibold">There's no history yet</p>
        <p class="text-[11px] opacity-75">Your completed calculations will appear here</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let html = '';
  calcHistoryLog.forEach(item => {
    html += `
      <div class="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700/80 hover:border-amber-400 cursor-pointer transition text-right group relative" onclick="calcLoadHistoryItem(${item.rawResult})">
        <div class="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="calcDeleteHistoryItem(${item.id}, event)" class="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/60 text-gray-400 hover:text-red-500 rounded-xl transition active:scale-90" title="Delete calculation">
              <i data-lucide="trash-2" style="width:16px;height:16px"></i>
            </button>
            <span class="text-[11px] font-medium">${item.timestamp}</span>
          </div>
          <span class="opacity-0 group-hover:opacity-100 text-amber-600 dark:text-amber-400 font-semibold text-[11px] transition">Click to load</span>
        </div>
        <div class="text-xs font-medium text-gray-500 dark:text-gray-400 font-mono truncate pr-1">${item.equation}</div>
        <div class="text-base font-bold text-gray-800 dark:text-gray-100 font-mono mt-0.5 pr-1">${item.result}</div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  lucide.createIcons();
}

function calcLoadHistoryItem(rawResult) {
  calcPlayAudioTick();
  if (calcInConverterMode) {
    const s = calcCleanFloat(rawResult).toString();
    if (calcConvActiveField === 'top') calcConvValTop = s;
    else calcConvValBottom = s;
    calcPerformDualConversion();
    return;
  }

  calcCurrentInput = calcCleanFloat(rawResult).toString();
  calcWaitingForSecondOperand = true;
  calcUpdateDisplay();
}

function calcDeleteHistoryItem(id, event) {
  if (event) event.stopPropagation();
  calcPlayAudioTick();
  calcHistoryLog = calcHistoryLog.filter(item => item.id !== id);
  calcRenderHistoryList();
  if (calcHistoryLog.length === 0) {
    const dot = document.getElementById('calc-history-count-dot');
    if (dot) dot.classList.add('hidden');
  }
  calcShowToast('Calculation deleted from history');
}

function calcClearHistory() {
  calcHistoryLog = [];
  calcRenderHistoryList();
  const dot = document.getElementById('calc-history-count-dot');
  if (dot) dot.classList.add('hidden');
  calcShowToast('History cleared');
}

function calcExportHistory() {
  if (calcHistoryLog.length === 0) {
    alert('No calculation history to export.');
    return;
  }

  let text = `PockitUp Standard Calculator - History Log (${new Date().toLocaleDateString()})\n\n`;
  calcHistoryLog.forEach((item, idx) => {
    text += `[${item.timestamp}] ${item.equation} ${item.result}\n`;
  });

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calculator_history_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Sidecar Tabs Switcher
function calcSwitchSideTab(tab) {
  calcCurrentSideTab = tab;
  ['history', 'memory', 'converter'].forEach(t => {
    const btn = document.getElementById(`calc-sidetab-${t}-btn`);
    const panel = document.getElementById(`calc-panel-${t}`);

    if (t === tab) {
      if (btn) btn.className = 'flex-1 py-2 px-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm transition flex items-center justify-center gap-1.5 font-bold';
      if (panel) panel.classList.remove('hidden');
    } else {
      if (btn) btn.className = 'flex-1 py-2 px-3 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-1.5 font-semibold';
      if (panel) panel.classList.add('hidden');
    }
  });

  const stdScreen = document.getElementById('calc-standard-screen');
  const convScreen = document.getElementById('calc-converter-screen');
  const modeTitle = document.getElementById('calc-current-mode-title');
  const headerIcon = document.getElementById('calc-header-icon');

  if (tab === 'converter') {
    calcInConverterMode = true;
    if (stdScreen) stdScreen.classList.add('hidden');
    if (convScreen) convScreen.classList.remove('hidden');
    if (modeTitle) modeTitle.textContent = 'Unit Converter';
    if (headerIcon) {
      headerIcon.setAttribute('data-lucide', 'repeat');
      lucide.createIcons();
    }
    calcInitDualConverter();
  } else {
    calcInConverterMode = false;
    if (convScreen) convScreen.classList.add('hidden');
    if (stdScreen) stdScreen.classList.remove('hidden');
    if (modeTitle) modeTitle.textContent = 'Standard';
    if (headerIcon) {
      headerIcon.setAttribute('data-lucide', 'calculator');
      lucide.createIcons();
    }
  }
}

function calcToggleSideTab(tab) {
  calcSwitchSideTab(tab);
}

// =========================================================================
// =============== SMARTPHONE DUAL UNIT CONVERTER SYSTEM ===================
// =========================================================================

function calcInitDualConverter() {
  calcSelectConvCat(calcConverterCategory || 'length');
}

function calcSelectConvCat(cat) {
  calcConverterCategory = cat;
  const reg = CALC_UNITS_REGISTRY[cat];
  if (!reg) return;

  // 1. Update horizontal category chips inside calculator
  document.querySelectorAll('.calc-cat-chip').forEach(btn => {
    const bCat = btn.getAttribute('data-cat');
    if (bCat === cat) {
      btn.className = 'calc-cat-chip px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-sm transition whitespace-nowrap font-bold';
    } else {
      btn.className = 'calc-cat-chip px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition whitespace-nowrap font-semibold';
    }
  });

  // 2. Update sidecar category buttons
  document.querySelectorAll('.calc-side-cat-btn').forEach(btn => {
    const bCat = btn.getAttribute('data-cat');
    if (bCat === cat) {
      btn.className = 'calc-side-cat-btn p-2.5 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-2 transition';
    } else {
      btn.className = 'calc-side-cat-btn p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 transition';
    }
  });

  // 3. Populate unit dropdowns
  const topSel = document.getElementById('calc-conv-unit-top');
  const bottomSel = document.getElementById('calc-conv-unit-bottom');

  if (topSel && bottomSel) {
    const keys = Object.keys(reg.units);
    const optionsHtml = keys.map(k => `<option value="${k}">${reg.units[k].name}</option>`).join('');

    topSel.innerHTML = optionsHtml;
    bottomSel.innerHTML = optionsHtml;

    // Set default selections
    topSel.value = keys[0];
    bottomSel.value = keys.length > 1 ? keys[1] : keys[0];

    calcConvUnitTop = topSel.value;
    calcConvUnitBottom = bottomSel.value;
  }

  // 4. Default input
  calcConvActiveField = 'top';
  calcConvValTop = '1';
  calcFocusConvField('top');
  calcPerformDualConversion();
}

function calcFocusConvField(field) {
  calcConvActiveField = field;
  const topBox = document.getElementById('calc-conv-field-top');
  const botBox = document.getElementById('calc-conv-field-bottom');

  if (field === 'top') {
    if (topBox) topBox.className = 'p-3 rounded-xl border-2 border-amber-500 bg-white dark:bg-gray-800 cursor-pointer transition shadow-sm';
    if (botBox) botBox.className = 'p-3 rounded-xl border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 bg-white/60 dark:bg-gray-800/60 cursor-pointer transition';
  } else {
    if (topBox) topBox.className = 'p-3 rounded-xl border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 bg-white/60 dark:bg-gray-800/60 cursor-pointer transition';
    if (botBox) botBox.className = 'p-3 rounded-xl border-2 border-amber-500 bg-white dark:bg-gray-800 cursor-pointer transition shadow-sm';
  }
}

function calcOnUnitChange(field) {
  const topSel = document.getElementById('calc-conv-unit-top');
  const bottomSel = document.getElementById('calc-conv-unit-bottom');

  if (topSel) calcConvUnitTop = topSel.value;
  if (bottomSel) calcConvUnitBottom = bottomSel.value;

  calcPerformDualConversion();
}

function calcSwapConvUnits() {
  const topSel = document.getElementById('calc-conv-unit-top');
  const bottomSel = document.getElementById('calc-conv-unit-bottom');

  if (topSel && bottomSel) {
    const temp = topSel.value;
    topSel.value = bottomSel.value;
    bottomSel.value = temp;

    calcConvUnitTop = topSel.value;
    calcConvUnitBottom = bottomSel.value;

    calcPerformDualConversion();
  }
}

function calcPerformDualConversion() {
  const cat = calcConverterCategory;
  const reg = CALC_UNITS_REGISTRY[cat];
  if (!reg) return;

  const topSel = document.getElementById('calc-conv-unit-top');
  const bottomSel = document.getElementById('calc-conv-unit-bottom');
  if (topSel) calcConvUnitTop = topSel.value;
  if (bottomSel) calcConvUnitBottom = bottomSel.value;

  const uTop = reg.units[calcConvUnitTop];
  const uBottom = reg.units[calcConvUnitBottom];

  const symTopEl = document.getElementById('calc-conv-sym-top');
  const symBotEl = document.getElementById('calc-conv-sym-bottom');
  if (symTopEl && uTop) symTopEl.textContent = uTop.sym;
  if (symBotEl && uBottom) symBotEl.textContent = uBottom.sym;

  if (calcConvActiveField === 'top') {
    const raw = calcConvValTop.replace(/,/g, '');
    const num = parseFloat(raw);
    const converted = isNaN(num) ? 0 : calcComputeUnitConvert(num, calcConvUnitTop, calcConvUnitBottom, cat);
    calcConvValBottom = calcCleanFloat(converted).toString();
  } else {
    const raw = calcConvValBottom.replace(/,/g, '');
    const num = parseFloat(raw);
    const converted = isNaN(num) ? 0 : calcComputeUnitConvert(num, calcConvUnitBottom, calcConvUnitTop, cat);
    calcConvValTop = calcCleanFloat(converted).toString();
  }

  // Render numbers
  const valTopEl = document.getElementById('calc-conv-val-top');
  const valBotEl = document.getElementById('calc-conv-val-bottom');
  if (valTopEl) valTopEl.textContent = calcFormatDisplay(calcConvValTop);
  if (valBotEl) valBotEl.textContent = calcFormatDisplay(calcConvValBottom);

  // Update formula in sidecar
  const formulaText = document.getElementById('calc-conv-formula-text');
  if (formulaText && uTop && uBottom) {
    const oneConv = calcCleanFloat(calcComputeUnitConvert(1, calcConvUnitTop, calcConvUnitBottom, cat));
    formulaText.textContent = `1 ${uTop.name} (${uTop.sym}) = ${calcFormatDisplay(oneConv.toString())} ${uBottom.name} (${uBottom.sym})`;
  }
}

function calcComputeUnitConvert(val, fromKey, toKey, cat) {
  if (fromKey === toKey) return val;

  if (cat === 'temperature') {
    if (fromKey === 'C' && toKey === 'F') return (val * 9 / 5) + 32;
    if (fromKey === 'C' && toKey === 'K') return val + 273.15;
    if (fromKey === 'F' && toKey === 'C') return (val - 32) * 5 / 9;
    if (fromKey === 'F' && toKey === 'K') return (val - 32) * 5 / 9 + 273.15;
    if (fromKey === 'K' && toKey === 'C') return val - 273.15;
    if (fromKey === 'K' && toKey === 'F') return (val - 273.15) * 9 / 5 + 32;
    return val;
  }

  const reg = CALC_UNITS_REGISTRY[cat];
  if (!reg) return val;
  const uFrom = reg.units[fromKey];
  const uTo = reg.units[toKey];

  if (!uFrom || !uTo) return val;

  const inBase = val * uFrom.factor;
  return inBase / uTo.factor;
}

// Copy Result with toast feedback
function calcCopyResult(event) {
  if (event) event.stopPropagation();
  const val = calcInConverterMode ? (calcConvActiveField === 'top' ? calcConvValTop : calcConvValBottom) : calcCurrentInput;
  if (!val || val === 'Error' || val === 'Cannot divide by zero' || val === 'Invalid Input') return;

  navigator.clipboard.writeText(val).then(() => {
    calcShowToast('Copied ' + val + ' to clipboard!');
  }).catch(() => {
    calcShowToast('Copied to clipboard!');
  });
}

// Sound Settings
function calcToggleSound() {
  calcSettings.sound = !calcSettings.sound;
  const icon = document.getElementById('calc-sound-icon');
  if (icon) {
    icon.setAttribute('data-lucide', calcSettings.sound ? 'volume-2' : 'volume-x');
    lucide.createIcons();
  }
  calcShowToast(calcSettings.sound ? 'Audio clicks enabled' : 'Audio clicks muted');
}

// Settings Modal
function calcOpenSettingsModal() {
  const modal = document.getElementById('calc-settings-modal');
  if (modal) modal.classList.remove('hidden');
}

function calcCloseSettingsModal() {
  const modal = document.getElementById('calc-settings-modal');
  if (modal) modal.classList.add('hidden');
}

function calcSetAccentTheme(bg, text) {
  calcSettings.accentBg = bg;
  calcSettings.accentText = text;
  calcApplyAccentColor();
}

function calcApplyAccentColor() {
  const eqBtn = document.getElementById('calc-equals-btn');
  if (eqBtn) {
    eqBtn.style.backgroundColor = calcSettings.accentBg;
    eqBtn.style.color = calcSettings.accentText;
  }
}

function calcSaveSettings() {
  const precisionSel = document.getElementById('calc-setting-precision');
  const groupingChk = document.getElementById('calc-setting-grouping');
  const soundChk = document.getElementById('calc-setting-sound');

  if (precisionSel) calcSettings.precision = precisionSel.value;
  if (groupingChk) calcSettings.grouping = groupingChk.checked;
  if (soundChk) calcSettings.sound = soundChk.checked;

  const soundIcon = document.getElementById('calc-sound-icon');
  if (soundIcon) {
    soundIcon.setAttribute('data-lucide', calcSettings.sound ? 'volume-2' : 'volume-x');
    lucide.createIcons();
  }

  calcCloseSettingsModal();
  calcUpdateDisplay();
  if (calcInConverterMode) calcPerformDualConversion();
  calcShowToast('Calculator settings saved');
}

// Keyboard Support
function calcHandleGlobalKeyboard(e) {
  const view = document.getElementById('calculator-view');
  if (!view || view.classList.contains('hidden')) return;

  // Prevent handling if typing in an input
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

  const key = e.key;

  if (key >= '0' && key <= '9') {
    calcTriggerVisualKey(key);
    calcDigit(key);
  } else if (key === '.') {
    calcTriggerVisualKey('.');
    calcDecimal();
  } else if (key === '+' || key === '-') {
    calcTriggerVisualKey(key === '-' ? '-' : '+');
    calcOperator(key === '-' ? '−' : '+');
  } else if (key === '*') {
    calcTriggerVisualKey('*');
    calcOperator('×');
  } else if (key === '/') {
    e.preventDefault();
    calcTriggerVisualKey('/');
    calcOperator('÷');
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calcTriggerVisualKey('Enter');
    calcEquals();
  } else if (key === 'Backspace') {
    calcTriggerVisualKey('Backspace');
    calcBackspace();
  } else if (key === 'Escape') {
    calcTriggerVisualKey('Escape');
    calcClearAll();
  } else if (key === 'Delete') {
    calcTriggerVisualKey('Delete');
    calcClearEntry();
  } else if (key === '%') {
    calcTriggerVisualKey('%');
    calcInputPercent();
  } else if (key.toLowerCase() === 'r') {
    calcTriggerVisualKey('r');
    calcReciprocal();
  } else if (key === '@') {
    calcTriggerVisualKey('@');
    calcSquareRoot();
  } else if (key === 'ArrowUp') {
    if (calcInConverterMode) {
      e.preventDefault();
      calcFocusConvField('top');
    }
  } else if (key === 'ArrowDown') {
    if (calcInConverterMode) {
      e.preventDefault();
      calcFocusConvField('bottom');
    }
  }
}

function calcTriggerVisualKey(dataKey) {
  const btn = document.querySelector(`.calc-btn[data-key="${dataKey}"]`);
  if (btn) {
    btn.classList.add('calc-btn-active');
    setTimeout(() => btn.classList.remove('calc-btn-active'), 120);
  }
}

function calcReset() {
  calcClearAll();
  calcCloseSettingsModal();
  calcSwitchSideTab('history');
}








