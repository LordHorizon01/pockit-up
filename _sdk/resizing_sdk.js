console.log("Resizing SDK loaded successfully.");

window.ResizingSDK = {
  notifyResize: () => {
    const height = document.documentElement.scrollHeight;
    console.log(`[Resizing] Height changed to ${height}px`);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'resize', height }, '*');
    }
  }
};

// Automatically monitor document height changes
document.addEventListener("DOMContentLoaded", () => {
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => {
      window.ResizingSDK.notifyResize();
    });
    observer.observe(document.body);
  } else {
    window.addEventListener('resize', window.ResizingSDK.notifyResize);
    window.ResizingSDK.notifyResize();
  }
});
