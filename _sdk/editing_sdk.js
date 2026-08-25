console.log("Editing SDK loaded successfully.");

window.EditingSDK = {
  saveDesign: (bytes) => {
    console.log("[Editing] Saving design bytes...", bytes);
    return Promise.resolve({ success: true });
  },
  exportDesign: (format) => {
    console.log(`[Editing] Exporting design as ${format}...`);
    return Promise.resolve({ success: true });
  }
};
