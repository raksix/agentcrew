'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button, Input } from '@heroui/react';
import { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SidebarProps {
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (session: Session) => void;
  onCreateSession: (name: string, projectTag?: string) => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
}

export function Sidebar({ sessions, activeSession, onSelectSession, onCreateSession, onDeleteSession, onClose }: SidebarProps) {
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [newName, setNewName] = useState('');
  const [newProjectTag, setNewProjectTag] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateSession(newName.trim(), newProjectTag.trim() || undefined);
      setNewName('');
      setNewProjectTag('');
      onModalClose();
    }
  };

  return (
    <div className="w-full lg:w-72 h-full flex flex-col bg-gradient-to-b from-card to-background border-r border-border/50">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">AgentCrew</h1>
              <p className="text-xs text-muted-foreground">Claude Code UI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {onClose && (
              <button 
                onClick={onClose} 
                className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* New session button */}
      <div className="p-3 sm:p-4">
        <button
          onClick={onOpen}
          className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 pb-3 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No sessions yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Create one to get started</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={activeSession?.id === session.id}
              onClick={() => onSelectSession(session)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground text-center">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Create session modal */}
      <Modal isOpen={isOpen} onClose={onModalClose} className="dark">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-lg font-semibold">Create New Session</span>
            <span className="text-sm font-normal text-muted-foreground">Start a new Claude Code session</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4 py-2">
              <Input
                label="Session Name"
                placeholder="My Agent Session"
                value={newName}
                onValueChange={setNewName}
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium"
                }}
              />
              <Input
                label="Project Tag (optional)"
                placeholder="e.g., sooliva, finder"
                value={newProjectTag}
                onValueChange={setNewProjectTag}
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium"
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose} className="font-medium">Cancel</Button>
            <Button color="primary" onPress={handleCreate} isDisabled={!newName.trim()} className="font-medium">Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
