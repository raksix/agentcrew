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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div
        className={`max-w-[80%] px-5 py-3 rounded-2xl ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm border border-border/50'
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
                  <a href={href} className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              },
              blockquote({ children }) {
                return <blockquote className="border-l-4 border-primary/50 pl-4 italic my-2">{children}</blockquote>;
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
            }}
          >
            {message.content || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function MessageList({ messages, streamingOutput, className = '' }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingOutput]);

  return (
    <div className={`flex-1 overflow-y-auto p-4 ${className}`}>
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
          <div className="max-w-[80%] bg-muted rounded-2xl rounded-bl-sm px-5 py-3 border border-border/50">
            <pre className="whitespace-pre-wrap text-sm">{streamingOutput}<span className="animate-pulse">▌</span></pre>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
