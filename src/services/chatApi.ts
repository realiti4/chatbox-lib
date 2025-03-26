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
  "Thanks for sharing that information."
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
