import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 Starting ImageVault Application");

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(<App />);