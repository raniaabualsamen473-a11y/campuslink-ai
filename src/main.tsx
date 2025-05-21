
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure to create the root element first
const rootElement = document.getElementById("root");

// Check if the root element exists before rendering
if (!rootElement) {
  console.error("Root element not found. Make sure there is an element with id 'root' in your HTML.");
} else {
  // Create the React root using the found element
  const root = createRoot(rootElement);
  
  // Render the app within React.StrictMode for better development experience
  root.render(<App />);
}
