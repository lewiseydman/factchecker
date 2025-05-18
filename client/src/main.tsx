import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Material Icons
const materialIconsLink = document.createElement('link');
materialIconsLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
materialIconsLink.rel = "stylesheet";
document.head.appendChild(materialIconsLink);

// Add Inter font
const interFontLink = document.createElement('link');
interFontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
interFontLink.rel = "stylesheet";
document.head.appendChild(interFontLink);

// Add title
const titleElement = document.createElement('title');
titleElement.textContent = "FactCheck - Truth Verification Platform";
document.head.appendChild(titleElement);

// Add meta description
const metaDescription = document.createElement('meta');
metaDescription.name = "description";
metaDescription.content = "Verify facts with our powerful fact-checking platform. Get accurate true/false results with supporting evidence. Create an account to save and track your fact-checking history.";
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
