
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling and debugging
console.log("🚀 Starting ImageVault Application");
console.log("Environment:", import.meta.env.MODE);
console.log("Base URL:", import.meta.env.BASE_URL);

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack
  });
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found!");
  throw new Error("Root element not found");
}

try {
  console.log("✅ Root element found, creating React root...");
  const root = createRoot(rootElement);
  
  console.log("✅ React root created, rendering App...");
  root.render(<App />);
  
  console.log("✅ App rendered successfully!");
} catch (error) {
  console.error("❌ Error during app initialization:", error);
  
  // Fallback error display
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Application Error</h1>
      <p style="font-size: 1.1rem; margin-bottom: 1rem; max-width: 600px;">
        ImageVault failed to initialize. Please check the console for detailed error information.
      </p>
      <button 
        onclick="window.location.reload()" 
        style="
          padding: 12px 24px;
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        "
        onmouseover="this.style.background='rgba(255,255,255,0.3)'"
        onmouseout="this.style.background='rgba(255,255,255,0.2)'"
      >
        🔄 Reload Application
      </button>
      <pre style="
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(0,0,0,0.3);
        border-radius: 4px;
        font-size: 0.8rem;
        max-width: 100%;
        overflow: auto;
        white-space: pre-wrap;
      ">${error.message}</pre>
    </div>
  `;
}
