import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import App_dev from './App_dev';
import './index.css';

// Development entry point
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* <App /> */}
      <App_dev />
    </React.StrictMode>
  );
}
