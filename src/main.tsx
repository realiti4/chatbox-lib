import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './components/ChatWidget';
// import './index.css';

// Extend Window interface
declare global {
  interface Window {
    initChatWidget: typeof initChatWidget;
  }
}

// This function will be exposed to the global scope
export function initChatWidget(containerId = 'chat-widget-container') {
  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  window.initChatWidget = initChatWidget;
  
  // Auto-initialize if no configuration is needed
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initChatWidget, 1);
  } else {
    document.addEventListener('DOMContentLoaded', () => initChatWidget());
  }
}