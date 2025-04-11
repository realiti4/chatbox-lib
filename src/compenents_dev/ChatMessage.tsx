import { useMemo, useState } from 'react';
import { useAppContext } from '../utils/app.context';
import { Message, PendingMessage } from '../utils/types';
import MarkdownDisplay, { CopyButton } from './MarkdownDisplay';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SplitMessage {
  content: PendingMessage['content'];
  thought?: string;
  isThinking?: boolean;
}

export default function ChatMessage({
  msg,
  siblingLeafNodeIds,
  siblingCurrIdx,
  id,
  onRegenerateMessage,
  onEditMessage,
  onChangeSibling,
  isPending,
}: {
  msg: Message | PendingMessage;
  siblingLeafNodeIds: Message['id'][];
  siblingCurrIdx: number;
  id?: string;
  onRegenerateMessage(msg: Message): void;
  onEditMessage(msg: Message, content: string): void;
  onChangeSibling(sibling: Message['id']): void;
  isPending?: boolean;
}) {
  // @ts-ignore
  const { viewingChat, config } = useAppContext();
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const timings = useMemo(
    () =>
      msg.timings
        ? {
            ...msg.timings,
            prompt_per_second:
              (msg.timings.prompt_n / msg.timings.prompt_ms) * 1000,
            predicted_per_second:
              (msg.timings.predicted_n / msg.timings.predicted_ms) * 1000,
          }
        : null,
    [msg.timings]
  );
  const nextSibling = siblingLeafNodeIds[siblingCurrIdx + 1];
  const prevSibling = siblingLeafNodeIds[siblingCurrIdx - 1];

  // for reasoning model, we split the message into content and thought
  // TODO: implement this as remark/rehype plugin in the future
  const { content, thought, isThinking }: SplitMessage = useMemo(() => {
    if (msg.content === null || msg.role !== 'assistant') {
      return { content: msg.content };
    }
    let actualContent = '';
    let thought = '';
    let isThinking = false;
    let thinkSplit = msg.content.split('<think>', 2);
    actualContent += thinkSplit[0];
    while (thinkSplit[1] !== undefined) {
      // <think> tag found
      thinkSplit = thinkSplit[1].split('</think>', 2);
      thought += thinkSplit[0];
      isThinking = true;
      if (thinkSplit[1] !== undefined) {
        // </think> closing tag found
        isThinking = false;
        thinkSplit = thinkSplit[1].split('<think>', 2);
        actualContent += thinkSplit[0];
      }
    }
    return { content: actualContent, thought, isThinking };
  }, [msg]);

  // if (!viewingChat) return null;

  return (
    <div className="chatbox-message-group" id={id}>
      <div className={`chatbox-message ${msg.role === 'user' ? 'chatbox-message-user' : 'chatbox-message-assistant'}`}>
        <div className={`chatbox-bubble chatbox-markdown ${msg.role === 'user' ? 'chatbox-bubble-user' : 'chatbox-bubble-assistant'}`}>
          {/* textarea for editing message */}
          {editingContent !== null && (
            <>
              <textarea
                dir="auto"
                className="chatbox-textarea"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              ></textarea>
              <br />
              <button
                className="chatbox-button"
                onClick={() => setEditingContent(null)}
              >
                Cancel
              </button>
              <button
                className="chatbox-button"
                onClick={() => {
                  if (msg.content !== null) {
                    setEditingContent(null);
                    onEditMessage(msg as Message, editingContent);
                  }
                }}
              >
                Submit
              </button>
            </>
          )}
          {/* not editing content, render message */}
          {editingContent === null && (
            <>
              {content === null ? (
                <>
                  {/* show loading dots for pending message */}
                  <span className="chatbox-loading-dots"></span>
                </>
              ) : (
                <>
                  {/* render message as markdown */}
                  <div dir="auto">
                    {thought && (
                      <div className="chatbox-collapsible">
                        <div className="chatbox-collapsible-header" onClick={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.classList.toggle('chatbox-collapsible-open');
                          }
                        }}>
                          {isPending && isThinking ? (
                            <span>
                              <span className="chatbox-loading-spinner"></span>
                              <b>Thinking</b>
                            </span>
                          ) : (
                            <b>Thought Process</b>
                          )}
                        </div>
                        <div className="chatbox-collapsible-content">
                          <MarkdownDisplay
                            content={thought}
                            isGenerating={isPending}
                          />
                        </div>
                      </div>
                    )}

                    {msg.extra && msg.extra.length > 0 && (
                      <div className="chatbox-collapsible">
                        <div className="chatbox-collapsible-header" onClick={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.classList.toggle('chatbox-collapsible-open');
                          }
                        }}>
                          Extra content
                        </div>
                        <div className="chatbox-collapsible-content">
                          {msg.extra.map(
                            (extra, i) =>
                              extra.type === 'textFile' ? (
                                <div key={extra.name}>
                                  <b>{extra.name}</b>
                                  <pre>{extra.content}</pre>
                                </div>
                              ) : extra.type === 'context' ? (
                                <div key={i}>
                                  <pre>{extra.content}</pre>
                                </div>
                              ) : null // TODO: support other extra types
                          )}
                        </div>
                      </div>
                    )}

                    <MarkdownDisplay
                      content={content}
                      isGenerating={isPending}
                    />
                  </div>
                </>
              )}
              {/* render timings if enabled */}
              {timings && config.showTokensPerSecond && (
                <div className="chatbox-timings">
                  <div className="chatbox-timings-summary">
                    Speed: {timings.predicted_per_second.toFixed(1)} t/s
                  </div>
                  <div className="chatbox-timings-details">
                    <b>Prompt</b>
                    <br />- Tokens: {timings.prompt_n}
                    <br />- Time: {timings.prompt_ms} ms
                    <br />- Speed: {timings.prompt_per_second.toFixed(1)} t/s
                    <br />
                    <b>Generation</b>
                    <br />- Tokens: {timings.predicted_n}
                    <br />- Time: {timings.predicted_ms} ms
                    <br />- Speed: {timings.predicted_per_second.toFixed(1)} t/s
                    <br />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* actions for each message */}
      {msg.content !== null && (
        <div className={`chatbox-actions ${msg.role === 'user' ? 'chatbox-actions-user' : 'chatbox-actions-assistant'}`}>
          {siblingLeafNodeIds && siblingLeafNodeIds.length > 1 && (
            <div className="chatbox-siblings">
              <button
                className={`chatbox-sibling-nav ${!prevSibling ? 'chatbox-sibling-nav-disabled' : ''}`}
                onClick={() => prevSibling && onChangeSibling(prevSibling)}
              >
                <ChevronLeftIcon className="chatbox-icon-small" />
              </button>
              <span>
                {siblingCurrIdx + 1} / {siblingLeafNodeIds.length}
              </span>
              <button
                className={`chatbox-sibling-nav ${!nextSibling ? 'chatbox-sibling-nav-disabled' : ''}`}
                onClick={() => nextSibling && onChangeSibling(nextSibling)}
              >
                <ChevronRightIcon className="chatbox-icon-small" />
              </button>
            </div>
          )}
          {/* user message */}
          {msg.role === 'user' && (
            <button
              className="chatbox-button chatbox-button-hidden"
              onClick={() => setEditingContent(msg.content)}
              disabled={msg.content === null}
            >
              ✍️ Edit
            </button>
          )}
          {/* assistant message */}
          {msg.role === 'assistant' && (
            <>
              {!isPending && (
                <button
                  className="chatbox-button chatbox-button-hidden"
                  onClick={() => {
                    if (msg.content !== null) {
                      onRegenerateMessage(msg as Message);
                    }
                  }}
                  disabled={msg.content === null}
                >
                  🔄 Regenerate
                </button>
              )}
            </>
          )}
          <CopyButton
            className="chatbox-button chatbox-button-hidden"
            content={msg.content}
          />
        </div>
      )}
    </div>
  );
}
