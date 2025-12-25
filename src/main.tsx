import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  event.preventDefault();
  return true;
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
  return true;
});

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error rendering app:", error.message);
    }
  }
}
