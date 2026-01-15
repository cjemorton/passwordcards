import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Check if we should show legacy or modern version
const showLegacy = import.meta.env.MODE === 'development' && 
                   new URLSearchParams(window.location.search).get('legacy') === 'true';

if (showLegacy) {
  // Redirect to legacy version
  window.location.href = '/resources/index.html';
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
