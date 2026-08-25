pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ===================== APP NAVIGATION =====================
function openTool(tool) {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById(tool + '-view').classList.remove('hidden');
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






