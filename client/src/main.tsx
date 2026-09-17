import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);

/*
 * React has finished mounting.
 * Fade out the browser-level BookMyStay loader.
 */
window.requestAnimationFrame(() => {
  const loader = document.getElementById("bookmystay-loader");

  if (loader) {
    loader.classList.add("hide");

    window.setTimeout(() => {
      loader.remove();
    }, 500);
  }
});