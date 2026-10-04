
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PatchSandbox from './components/PatchSandbox';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {new URLSearchParams(window.location.search).get('mode') === 'patch' ? <PatchSandbox /> : <App />}
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to mount React application:", error);
  rootElement.innerHTML = `<div style="color: red; padding: 20px;"><h1>System Failure</h1><pre>${error instanceof Error ? error.message : String(error)}</pre></div>`;
}
