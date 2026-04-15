'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

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

  // Auto-resize textarea
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

  return (
    <div className="border-t border-border/50 p-4 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground text-sm leading-relaxed"
            placeholder={isRunning ? "Claude is working... (message will be queued)" : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className={`absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !disabled
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-11 11"/>
              <path d="M22 2 15 22 11 13 2 9Z"/>
            </svg>
          </button>
        </div>
        
        {isRunning && (
          <Button
            variant="destructive"
            onPress={onStop}
            className="h-11 px-4 rounded-xl font-medium shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            Stop
          </Button>
        )}
      </div>
      
      {/* Queue indicator */}
      {queuedCount > 0 && (
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 typing-dot"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 typing-dot"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 typing-dot"></span>
          </div>
          <span>{queuedCount} message{queuedCount > 1 ? 's' : ''} queued</span>
        </div>
      )}
    </div>
  );
}
