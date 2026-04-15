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
  className?: string;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-2 ml-1">
          <span className="text-sm">🤖</span>
        </div>
      )}
      
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md glow-primary'
            : 'bg-muted text-foreground rounded-bl-md border border-border'
        }`}
      >
        <div className="text-sm font-sans leading-relaxed">
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
                      className="rounded-lg mt-2 mb-2 text-sm !bg-[oklch(0.12_0_0)]"
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  );
                }
                
                return (
                  <code className="bg-black/20 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
              },
              li({ children }) {
                return <li>{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold mb-2">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-bold mb-2">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-bold mb-2">{children}</h3>;
              },
              a({ href, children }) {
                return (
                  <a href={href} className="text-blue-400 underline hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              },
              blockquote({ children }) {
                return <blockquote className="border-l-4 border-primary/50 pl-4 italic my-2 text-muted-foreground">{children}</blockquote>;
              },
              pre({ children }) {
                return <pre className="bg-[oklch(0.12_0_0)] rounded-lg p-3 overflow-x-auto my-2">{children}</pre>;
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3 rounded-lg border border-border">
                    <table className="min-w-full text-sm">{children}</table>
                  </div>
                );
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
                return <th className="px-3 py-2 text-left font-semibold">{children}</th>;
              },
              td({ children }) {
                return <td className="px-3 py-2 border-l border-border/50 first:border-0">{children}</td>;
              },
              strong({ children }) {
                return <strong className="font-semibold">{children}</strong>;
              },
              em({ children }) {
                return <em className="italic">{children}</em>;
              },
            }}
          >
            {message.content || ''}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* Avatar for user */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ml-2 mr-1">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  );
}

export function MessageList({ messages, streamingOutput, className = '' }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingOutput]);

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 ${className}`}>
      {messages.length === 0 && !streamingOutput && (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
            <span className="text-4xl">🤖</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
          <p className="text-muted-foreground max-w-sm">
            Send a message and Claude Code will help you with your tasks
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <div key={message.id || index}>
          <MessageBubble message={message} />
        </div>
      ))}

      {/* Streaming output */}
      {streamingOutput && (
        <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-2 ml-1">
            <span className="text-sm">🤖</span>
          </div>
          <div className="max-w-[85%] sm:max-w-[75%] bg-muted rounded-2xl rounded-bl-md px-4 py-3 border border-border shadow-sm">
            <div className="text-sm font-sans leading-relaxed">
              <pre className="whitespace-pre-wrap">{streamingOutput}<span className="animate-pulse inline-block w-2 h-4 bg-primary ml-1">&nbsp;</span></pre>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
