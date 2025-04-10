export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const DUMMY_RESPONSES = [
  "Hello there! How can I help you today?",
  "That's interesting. Tell me more.",
  "I understand your concern.",
  "I'm just a demo chat bot.",
  "Could you elaborate on that?",
  "Thanks for sharing that information.",
  
  // Markdown code examples
  "Here's a simple JavaScript function:\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('User'));\n```\nYou can use this to greet your users!",
  
  "Let me show you a Python example:\n```python\ndef calculate_area(radius):\n    return 3.14159 * (radius ** 2)\n\n# Calculate area of circle with radius 5\nprint(calculate_area(5))\n```\nThis calculates the area of a circle.",
  
  "Here's how you can create a simple HTML component:\n```html\n<div class=\"card\">\n  <h2>Product Title</h2>\n  <p>Product description goes here.</p>\n  <button>Add to Cart</button>\n</div>\n```\nYou can style it with CSS afterwards.",
  
  "For React components, try this:\n```jsx\nimport React from 'react';\n\nconst Button = ({ text, onClick }) => (\n  <button \n    className=\"primary-button\"\n    onClick={onClick}\n  >\n    {text}\n  </button>\n);\n\nexport default Button;\n```\nThis creates a reusable button component.",
  
  "# Markdown Formatting Example\n\n- **Bold text** is good for emphasis\n- *Italic text* adds style\n- `inline code` for variables\n\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n```\nThis CSS centers content both horizontally and vertically."
];

export const chatApi = {
  sendMessage: async (text: string): Promise<Message> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate random response
    const botResponse = DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)];
    
    // Log the user's message to show we're using the text parameter
    console.log(`Received message: ${text}`);
    
    return {
      id: Date.now().toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };
  }
};
