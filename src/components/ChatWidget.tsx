import React, { useState } from 'react';
import Chat from './Chat';
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-widget-popup">
          <div className="chat-widget-header">
            <h3>Chat Support</h3>
            <button onClick={toggleChat} className="close-button">×</button>
          </div>
          <Chat />
        </div>
      )}
      <button 
        className="chat-widget-button" 
        onClick={toggleChat}
      >
        {isOpen ? 'Close Chat' : 'Chat with us'}
      </button>
    </div>
  );
};

export default ChatWidget;