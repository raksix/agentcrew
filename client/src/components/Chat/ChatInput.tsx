'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  onStop: () => void;
  disabled: boolean;
  isRunning: boolean;
  queuedCount?: number;
}

const SLASH_COMMANDS = [
  { cmd: '/update-config', desc: 'Update Claude Code configuration' },
  { cmd: '/debug', desc: 'Enable debug mode' },
  { cmd: '/simplify', desc: 'Simplify the output' },
  { cmd: '/batch', desc: 'Run in batch mode' },
  { cmd: '/loop', desc: 'Enable loop mode' },
  { cmd: '/claude-api', desc: 'Configure Claude API settings' },
  { cmd: '/compact', desc: 'Compact context window' },
  { cmd: '/context', desc: 'Show current context' },
  { cmd: '/cost', desc: 'Show token usage and cost' },
  { cmd: '/heapdump', desc: 'Generate heap dump' },
  { cmd: '/pr-comments', desc: 'View PR comments' },
  { cmd: '/release-notes', desc: 'Generate release notes' },
  { cmd: '/review', desc: 'Review code changes' },
  { cmd: '/security-review', desc: 'Run security review' },
  { cmd: '/insights', desc: 'Show session insights' },
];

export function ChatInput({ onSend, onStop, disabled, isRunning, queuedCount = 0 }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = SLASH_COMMANDS.filter(
    c => c.cmd.toLowerCase().includes(slashFilter.toLowerCase()) ||
         c.desc.toLowerCase().includes(slashFilter.toLowerCase())
  );

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !disabled) {
      onSend(input.trim(), attachments);
      setInput('');
      setAttachments([]);
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSlashMenu && filteredCommands.length > 0) {
        setInput(filteredCommands[0].cmd + ' ');
        setShowSlashMenu(false);
        setSlashFilter('');
      } else {
        handleSend();
      }
    } else if (e.key === 'Escape' && showSlashMenu) {
      setShowSlashMenu(false);
      setSlashFilter('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    
    // Detect slash command
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPos);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1 && lastSlashIndex === 0) {
      const filterText = textBeforeCursor.substring(1);
      if (!filterText.includes(' ')) {
        setSlashFilter(filterText);
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    } else if (lastSlashIndex === -1) {
      setShowSlashMenu(false);
    }
  };

  const selectCommand = (cmd: string) => {
    setInput(cmd + ' ');
    setShowSlashMenu(false);
    setSlashFilter('');
    textareaRef.current?.focus();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="max-w-4xl mx-auto p-4">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm"
              >
                <span>{getFileIcon(file.type)}</span>
                <span className="max-w-[120px] truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-destructive ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main input container */}
        <div className="bg-muted rounded-2xl border border-border px-4 py-3 focus-within:border-primary/50 transition-colors relative">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground text-base"
            placeholder={isRunning ? "Claude is working... your message will be queued..." : "Type your message or / for commands..."}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          
          {/* Slash command menu */}
          {showSlashMenu && filteredCommands.length > 0 && (
            <div 
              ref={slashMenuRef}
              className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto"
            >
              <div className="px-3 py-2 border-b border-border bg-muted/50">
                <span className="text-xs text-muted-foreground font-medium">Commands</span>
              </div>
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.cmd}
                  onClick={() => selectCommand(cmd.cmd)}
                  className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-sm font-mono text-primary">{cmd.cmd}</span>
                    <span className="text-xs text-muted-foreground ml-2">{cmd.desc}</span>
                  </div>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">↵</span>
                </button>
              ))}
              <div className="px-3 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground">
                ↑↓ navigate • Enter select • Esc close
              </div>
            </div>
          )}
          
          {/* Bottom row with actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isRunning}
                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                title="Attach file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Enter send • / for commands
              </span>
              
              {queuedCount > 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  {queuedCount} queued
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  onClick={onStop}
                  className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={disabled || (!input.trim() && attachments.length === 0)}
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
          <span>💡 Attach images & PDFs • Type / for commands</span>
        </div>
      </div>
    </div>
  );
}
