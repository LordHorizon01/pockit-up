console.log("Telemetry SDK loaded successfully.");
window.TelemetrySDK = {
  logEvent: (name, params) => {
    console.log(`[Telemetry] Event: ${name}`, params);
  }
};
