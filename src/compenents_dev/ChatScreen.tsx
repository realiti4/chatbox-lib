import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import { throttle } from '../utils/misc';
import { chatApi } from '../services/chatApi';

// Simplified message structure
export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isPending?: boolean;
}

const scrollToBottom = throttle(
  (requiresNearBottom: boolean, delay: number = 80) => {
    const mainScrollElem = document.getElementById('main-scroll');
    if (!mainScrollElem) return;
    const spaceToBottom =
      mainScrollElem.scrollHeight -
      mainScrollElem.scrollTop -
      mainScrollElem.clientHeight;
    if (!requiresNearBottom || spaceToBottom < 50) {
      setTimeout(
        () => mainScrollElem.scrollTo({ top: mainScrollElem.scrollHeight }),
        delay
      );
    }
  },
  80
);

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const textarea = useOptimizedTextarea("");
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (content: string) => {
    if (content.trim().length === 0 || isGenerating) return false;

    // Add user message
    const userMsgId = Date.now();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMsg]);
    scrollToBottom(false);

    // Generate AI response
    await generateMessage(content);
    return true;
  };

  const generateMessage = async (userContent: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    const pendingId = Date.now() + 1;
    const newPendingMsg: Message = {
      id: pendingId,
      role: 'assistant',
      content: '',
      isPending: true
    };

    setPendingMessage(newPendingMsg); // Show initial pending state

    try {
      // Optional: Show "typing" effect immediately if desired
      setPendingMessage(prev => prev ? { ...prev, content: '...' } : null);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate typing delay

      // Use the dummy chatApi instead of real API
      const response = await chatApi.sendMessage(userContent);

      // Transform the response to match our Message interface
      const assistantMessage: Message = {
        id: pendingId, // Use the same ID
        role: 'assistant',
        content: response.text,
        isPending: false // Mark as not pending anymore
      };

      setMessages(prev => [...prev, assistantMessage]);

      // We no longer need to show it separately as it's now in the main list
      setPendingMessage(null);

    } catch (err) {
      console.error(err);
      alert((err as any)?.message ?? 'Failed to get response');
      // Optionally add an error message to the chat
      // setMessages(prev => [...prev, { id: Date.now(), role: 'system', content: 'Error fetching response.' }]);

      // *** FIX: Ensure pending message is cleared on error too ***
      setPendingMessage(null);

    } finally {
      // *** FIX: Removed the logic that added the message here ***
      // The message is now added in the `try` block upon success.

      setIsGenerating(false);
      abortController.current = null; // Assuming chatApi doesn't use the abort controller here
      scrollToBottom(false);
    }
  };

  const stopGenerating = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
      setIsGenerating(false);
      setPendingMessage(null);
    }
  };

  const sendNewMessage = async () => {
    const lastInpMsg = textarea.value();

    if (lastInpMsg.trim().length === 0 || isGenerating) return;

    textarea.setValue('');

    if (!(await sendMessage(lastInpMsg))) {
      // restore the input message if failed
      textarea.setValue(lastInpMsg);
    }
  };

  useEffect(() => {
    textarea.focus();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textarea.ref]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col w-full max-w-[900px] mx-auto h-full">
        <div
          id="main-scroll"
          ref={mainScrollRef}
          className="grow overflow-y-auto min-h-0 p-4" // Added padding here instead of CSS
        >
          <div className={`flex flex-col ${messages.length > 0 ? '' : 'mt-auto'}`}>
            {messages.length === 0 && !pendingMessage ? (
              <div className="text-center text-gray-500 p-4">Send a message to start</div>
            ) : (
              <>
                {[...messages, ...(pendingMessage ? [pendingMessage] : [])].map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    msg={{
                      id: msg.id,
                      convId: 'conv-1',
                      content: msg.content,
                      role: msg.role,
                      type: 'text',
                      timestamp: msg.id,
                      parent: -1,
                      children: []
                    }}
                    siblingLeafNodeIds={[]}
                    siblingCurrIdx={0}
                    isPending={!!msg.isPending}
                    onRegenerateMessage={() => { }}
                    onEditMessage={() => { }}
                    onChangeSibling={() => { }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-base-100 flex-shrink-0">
          <textarea
            className="textarea textarea-bordered w-full resize-none"
            placeholder="Type a message (Shift+Enter to add a new line)"
            ref={textarea.ref}
            rows={1} // Start with 1 row
            style={{ maxHeight: '150px' }} // Limit max height
            onInput={(e) => { // Auto-resize textarea
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === 'Enter' && e.shiftKey) return;
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendNewMessage();
                // Reset height after sending
                const target = e.target as HTMLTextAreaElement;
                setTimeout(() => {
                  target.style.height = 'auto'; // Recalculate based on placeholder or empty content
                  target.style.height = `${target.scrollHeight}px`;
                }, 0);
              }
            }}
            id="msg-input"
            dir="auto"
          ></textarea>
          {isGenerating ? (
            <button
              className="btn btn-neutral ml-2"
              onClick={stopGenerating}
            >
              Stop
            </button>
          ) : (
            <button className="btn btn-primary ml-2" onClick={sendNewMessage}>
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface OptimizedTextareaValue {
  value: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  ref: React.RefObject<HTMLTextAreaElement | null>;
}

// This is a workaround to prevent the textarea from re-rendering when the inner content changes
// See https://github.com/ggml-org/llama.cpp/pull/12299
function useOptimizedTextarea(initValue: string): OptimizedTextareaValue {
  const [savedInitValue, setSavedInitValue] = useState<string>(initValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && savedInitValue) {
      textareaRef.current.value = savedInitValue;
      setSavedInitValue('');
    }
  }, [textareaRef, savedInitValue, setSavedInitValue]);

  return {
    value: () => {
      return textareaRef.current?.value ?? savedInitValue;
    },
    setValue: (value: string) => {
      if (textareaRef.current) {
        textareaRef.current.value = value;
      }
    },
    focus: () => {
      if (textareaRef.current) {
        // focus and move the cursor to the end
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.value.length;
      }
    },
    ref: textareaRef,
  };
}
