console.log("Data SDK loaded successfully.");

const DEFAULT_TEMPLATES = {
  "page-title": "PockitUp",
  "subtitle": "Your toolbox, with 100+ free tools, always within your pocket",
  "merger-card-title": "Merge PDF",
  "merger-card-desc": "Combine multiple PDFs into a single document",
  "merger-title": "Merge PDF Documents",
  "drop-label": "Drag and drop your PDF files here",
  "merge-btn": "Merge PDFs",
  "preview-title": "PDF Pages Preview"
};

window.DataSDK = {
  getData: (key) => DEFAULT_TEMPLATES[key] || "",
  getAllData: () => ({ ...DEFAULT_TEMPLATES })
};

// Automatically populate template IDs if they are empty on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-template-id]").forEach(el => {
    const templateId = el.getAttribute("data-template-id");
    if (templateId && DEFAULT_TEMPLATES[templateId] && !el.textContent.trim()) {
      el.textContent = DEFAULT_TEMPLATES[templateId];
    }
  });
});
