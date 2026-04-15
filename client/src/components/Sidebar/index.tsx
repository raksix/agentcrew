'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button, Input } from '@heroui/react';
import { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';

interface SidebarProps {
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (session: Session) => void;
  onCreateSession: (name: string, projectTag?: string) => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
}

function ThemeToggleSimple() {
  const [isDark, setIsDark] = useState(true);

  const toggle = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <Button isIconOnly variant="bordered" size="sm" onPress={toggle} className="border-border">
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </Button>
  );
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
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-lg text-primary-foreground font-bold">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AgentCrew</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggleSimple />
          {onClose && (
            <Button isIconOnly variant="light" size="sm" onPress={onClose} className="hidden lg:flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* New session button */}
      <div className="px-4 pb-3">
        <Button onPress={onOpen} className="w-full font-medium" color="primary">
          + New Session
        </Button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No sessions yet</p>
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
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Create session modal */}
      <Modal isOpen={isOpen} onClose={onModalClose} backdrop="opaque">
        <ModalContent className="bg-background">
          <ModalHeader>New Session</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input label="Name" placeholder="My Session" value={newName} onValueChange={setNewName} />
              <Input label="Project Tag (optional)" placeholder="e.g., sooliva" value={newProjectTag} onValueChange={setNewProjectTag} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose}>Cancel</Button>
            <Button color="primary" onPress={handleCreate} isDisabled={!newName.trim()}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
