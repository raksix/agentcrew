'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  streamingOutput?: string;
  showTyping?: boolean;
  className?: string;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  // Format timestamp
  const timeStr = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl overflow-hidden ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm border border-border/50'
        }`}
      >
        <div className="text-sm font-sans leading-relaxed overflow-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');
                
                if (match) {
                  return (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg mt-2 mb-2 text-sm !bg-[oklch(0.12_0_0)] overflow-x-auto"
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  );
                }
                
                return (
                  <code className="bg-black/20 px-1.5 py-0.5 rounded text-sm font-mono overflow-wrap-anywhere" {...props}>
                    {children}
                  </code>
                );
              },
              pre({ children }) {
                return <pre className="bg-[oklch(0.12_0_0)] rounded-lg p-3 overflow-x-auto my-2 text-sm">{children}</pre>;
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3 rounded-lg border border-border">
                    <table className="min-w-full text-sm">{children}</table>
                  </div>
                );
              },
              a({ href, children }) {
                return (
                  <a href={href} className="text-blue-400 underline hover:text-blue-300 break-all" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0 break-words">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-2 space-y-1 break-words">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-2 space-y-1 break-words">{children}</ol>;
              },
              li({ children }) {
                return <li className="break-words">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold mb-2 break-words">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-bold mb-2 break-words">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-bold mb-2 break-words">{children}</h3>;
              },
              blockquote({ children }) {
                return <blockquote className="border-l-4 border-primary/50 pl-4 italic my-2 break-words">{children}</blockquote>;
              },
              thead({ children }) {
                return <thead className="bg-primary/10">{children}</thead>;
              },
              tbody({ children }) {
                return <tbody>{children}</tbody>;
              },
              tr({ children }) {
                return <tr className="border-b border-border/50 last:border-0">{children}</tr>;
              },
              th({ children }) {
                return <th className="px-3 py-2 text-left font-semibold break-words">{children}</th>;
              },
              td({ children }) {
                return <td className="px-3 py-2 border-l border-border/50 first:border-0 break-words">{children}</td>;
              },
            }}
          >
            {message.content || ''}
          </ReactMarkdown>
        </div>
        <div className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}

export function MessageList({ messages, streamingOutput, className = '' }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Handle scroll - track if user scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  // Auto-scroll only if at bottom OR streaming
  useEffect(() => {
    if (isAtBottomRef.current || streamingOutput) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, streamingOutput]);

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll} 
      className={`flex-1 overflow-y-auto p-4 ${className}`}
    >
      {messages.length === 0 && !streamingOutput && (
        <div className="flex flex-col items-center justify-center h-full py-16">
          <p className="text-lg font-medium text-muted-foreground">Start a conversation</p>
          <p className="text-sm text-muted-foreground mt-1">Send a message to run Claude Code</p>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble key={message.id || index} message={message} />
      ))}

      {/* Streaming output */}
      {streamingOutput && (
        <div className="flex justify-start mb-4 px-4">
          <div className="max-w-[85%] sm:max-w-[75%] bg-muted rounded-2xl rounded-bl-sm px-5 py-3 border border-border/50 overflow-hidden">
            <pre className="whitespace-pre-wrap break-words text-sm">{streamingOutput}<span className="animate-pulse">▌</span></pre>
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {showTyping && (
        <div className="flex justify-start mb-4 px-4">
          <div className="max-w-[85%] sm:max-w-[75%] bg-muted rounded-2xl rounded-bl-sm px-5 py-3 border border-border/50">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
