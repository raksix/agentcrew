'use client';

import { useState } from 'react';
import { Button, Input } from '@heroui/react';

interface Session {
  id: string;
  name: string;
  projectTag?: string;
  status: string;
  messages: any[];
  queue?: string[];
}

interface SidebarProps {
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (session: Session) => void;
  onCreateSession: (name: string, projectTag?: string) => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggle = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-muted transition-colors border border-border"
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
  );
}

function NewSessionModal({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">New Session</h2>
        
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Session name..."
          className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 mb-4"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        
        <div className="flex gap-3">
          <Button variant="bordered" onPress={onClose} className="flex-1">Cancel</Button>
          <Button color="primary" onPress={handleCreate} className="flex-1">Create</Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ sessions, activeSession, onSelectSession, onCreateSession, onDeleteSession, onClose }: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    onDeleteSession(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border w-72">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm text-primary-foreground font-bold">A</span>
            </div>
            <span className="font-semibold text-foreground">AgentCrew</span>
          </div>
          <div className="flex items-center gap-1">
            <a href="/settings" className="p-2 rounded-lg hover:bg-muted transition-colors border border-border inline-flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </a>
            <ThemeToggle />
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="px-2 space-y-1">
            {sessions.map((session) => {
              const isActive = activeSession?.id === session.id;
              const hasQueue = session.queue && session.queue.length > 0;
              
              return (
                <div
                  key={session.id}
                  className={`group relative rounded-xl p-3 cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-muted border border-transparent'
                  }`}
                  onClick={() => onSelectSession(session)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${session.status === 'running' ? 'bg-yellow-500 animate-pulse' : session.status === 'done' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="font-medium text-foreground truncate">{session.name}</span>
                        {hasQueue && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                            {session.queue.length}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.messages?.length || 0} messages
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* New Session Modal */}
      <NewSessionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onCreate={(name) => onCreateSession(name)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div 
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Session?</h2>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
            
            <div className="flex gap-3">
              <Button variant="bordered" onPress={() => setShowDeleteConfirm(null)} className="flex-1">Cancel</Button>
              <Button color="danger" onPress={() => handleDelete(showDeleteConfirm)} className="flex-1">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
