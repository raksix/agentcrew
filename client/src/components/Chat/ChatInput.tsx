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
    <div className="border-t border-border p-4 bg-card">
      <div className="max-w-4xl mx-auto">
        {/* Main input container */}
        <div className="bg-muted rounded-2xl border border-border px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground text-sm min-h-[24px] max-h-[150px]"
            placeholder={isRunning ? "Claude is working... your message will be queued..." : "Type your message... (Shift+Enter for new line)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          
          {/* Bottom row with actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              {queuedCount > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {queuedCount} queued
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                ⏎ send • ⇧+⏎ new line
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {isRunning ? (
                <Button
                  color="danger"
                  size="sm"
                  onPress={onStop}
                  className="font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                  Stop
                </Button>
              ) : (
                <Button
                  color="primary"
                  size="sm"
                  onPress={handleSend}
                  isDisabled={disabled || !input.trim()}
                  className="font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                    <path d="m22 2-11 11"/>
                    <path d="M22 2 15 22 11 13 2 9Z"/>
                  </svg>
                  Send
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
