'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@heroui/react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  disabled: boolean;
  isRunning: boolean;
  queuedCount?: number;
}

export function ChatInput({ onSend, onStop, disabled, isRunning, queuedCount = 0 }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="max-w-4xl mx-auto p-4">
        {/* Main input container */}
        <div className="bg-muted rounded-2xl border border-border px-4 py-3 focus-within:border-primary/50 transition-colors">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
            placeholder={isRunning ? "Claude is working... your message will be queued..." : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          
          {/* Bottom row with actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {queuedCount > 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {queuedCount} queued
                </span>
              )}
              <span>Enter to send</span>
              <span className="text-border">•</span>
              <span>Shift + Enter for new line</span>
            </div>
            
            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  onClick={onStop}
                  className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={disabled}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={disabled || !input.trim()}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-11 11"/>
                    <path d="M22 2 15 22 11 13 2 9Z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tips */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
          <span>💡 Claude Code will help you with coding tasks</span>
          <span className="text-border">•</span>
          <span>Use /slash commands for special actions</span>
        </div>
      </div>
    </div>
  );
}
