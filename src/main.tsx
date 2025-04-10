import React from 'react';
import { createRoot } from 'react-dom/client';
// import ChatWidget from './components/ChatWidget';
import ChatScreen from './compenents_dev/ChatScreen'
import './index.scss';

// Track initialization state
let widgetInitialized = false;

// Extend Window interface
declare global {
  interface Window {
    initChatWidget: typeof initChatWidget;
  }
}

// This function will be exposed to the global scope
export function initChatWidget(containerId = 'chat-widget-container') {
  // Prevent multiple initializations
  if (widgetInitialized) {
    console.warn('Chat widget already initialized');
    return;
  }

  // Create container if it doesn't exist
  containerId = 'chatWindow';

  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ChatScreen />
    </React.StrictMode>
  );
  
  // Mark as initialized
  widgetInitialized = true;
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  window.initChatWidget = initChatWidget;
  
  // // Use a single initialization approach
  // if (document.readyState === 'complete' || document.readyState === 'interactive') {
  //   setTimeout(initChatWidget, 1);
  // } else {
  //   document.addEventListener('DOMContentLoaded', () => initChatWidget());
  // }
}