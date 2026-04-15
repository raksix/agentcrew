'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button, Input } from '@heroui/react';

interface Session {
  id: string;
  name: string;
  projectTag?: string;
  status: string;
  messages: any[];
}

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
      <Modal 
        isOpen={isOpen} 
        onClose={onModalClose} 
        backdrop="blur"
        classNames={{
          base: "bg-card border border-border",
          header: "border-b border-border",
          footer: "border-t border-border"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl text-primary-foreground font-bold">+</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">New Session</h2>
                <p className="text-sm text-muted-foreground font-normal">Create a new Claude Code session</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-6">
              <Input
                label="Session Name"
                placeholder="My Agent Session"
                value={newName}
                onValueChange={setNewName}
                variant="bordered"
                classNames={{
                  input: "text-base",
                  label: "text-sm font-medium text-foreground mb-1",
                  inputWrapper: "border-border bg-muted/50"
                }}
                description="Give your session a memorable name"
              />
              <Input
                label="Project Tag (optional)"
                placeholder="e.g., sooliva, finder, lawfirm"
                value={newProjectTag}
                onValueChange={setNewProjectTag}
                variant="bordered"
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium text-foreground mb-1",
                  inputWrapper: "border-border bg-muted/50"
                }}
                description="Group sessions by project"
              />
              
              {/* Quick templates */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Quick templates</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="flat" 
                    className="bg-muted"
                    onPress={() => { setNewName('Coding Task'); setNewProjectTag('general'); }}
                  >
                    💻 Coding
                  </Button>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    className="bg-muted"
                    onPress={() => { setNewName('Bug Fix'); setNewProjectTag('debug'); }}
                  >
                    🐛 Bug Fix
                  </Button>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    className="bg-muted"
                    onPress={() => { setNewName('Code Review'); setNewProjectTag('review'); }}
                  >
                    👀 Review
                  </Button>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    className="bg-muted"
                    onPress={() => { setNewName('New Feature'); setNewProjectTag('feature'); }}
                  >
                    🚀 Feature
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose} className="font-medium">
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleCreate} 
              isDisabled={!newName.trim()}
              className="font-medium"
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              }
            >
              Create Session
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function SessionItem({ session, isActive, onClick, onDelete }: { session: any; isActive: boolean; onClick: () => void; onDelete: () => void }) {
  const statusColors: Record<string, string> = {
    idle: 'bg-green-500',
    running: 'bg-yellow-500',
    done: 'bg-purple-500',
    error: 'bg-red-500',
  };

  const status = statusColors[session.status] || statusColors.idle;

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
        isActive 
          ? 'bg-primary/10 border-primary/40' 
          : 'hover:bg-muted border-transparent'
      }`}
      onClick={onClick}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${status} flex-shrink-0`} />
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {session.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {session.messages?.length || 0} messages
        </p>
      </div>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </Button>
    </div>
  );
}
