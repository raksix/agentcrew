'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/Chat';

import { Button } from '@heroui/react';
import { Session, SessionEvent } from '@/lib/types';
import * as api from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [thinkingContent, setThinkingContent] = useState('');
  const [showThinking, setShowThinking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => { loadSessions(); }, []);

  const { isConnected, lastMessage } = useWebSocket(activeSession?.id || null);
  
  useEffect(() => {
    if (!lastMessage) return;
    
    if (lastMessage.type === 'output') {
      setStreamingOutput(prev => prev + lastMessage.data);
    }
    else if (lastMessage.type === 'thinking') {
      setThinkingContent(prev => prev + lastMessage.data + '\n');
    }
    else if (lastMessage.type === 'done' || lastMessage.type === 'error') {
      const finalOutput = lastMessage.data;
      setThinkingContent('');
      setTimeout(() => {
        api.getSession(activeSession!.id).then(updated => {
          if (finalOutput && updated.messages.length > 0) {
            const lastMsg = updated.messages[updated.messages.length - 1];
            if (lastMsg.role === 'assistant' && !lastMsg.content) {
              lastMsg.content = finalOutput;
            }
          }
          setActiveSession(updated);
          setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
          setStreamingOutput('');
        }).catch(console.error);
      }, 1000);
    }
  }, [lastMessage, activeSession]);

  const loadSessions = async () => {
    try { 
      const updatedSessions = await api.getSessions();
      setSessions(updatedSessions);
      if (activeSession) {
        const updatedActive = updatedSessions.find(s => s.id === activeSession.id);
        if (updatedActive) {
          setActiveSession(updatedActive);
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateSession = async (name: string, projectTag?: string) => {
    try {
      const session = await api.createSession({ name, projectTag });
      setSessions(prev => [...prev, session]);
      setActiveSession(session);
      setSidebarOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleDeleteSession = async (id: string) => {
    try { await api.deleteSession(id); setSessions(prev => prev.filter(s => s.id !== id)); if (activeSession?.id === id) setActiveSession(null); } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!activeSession) return;
    
    // Upload files if any
    let attachmentUrls: string[] = [];
    if (attachments && attachments.length > 0) {
      try {
        const uploaded = await api.uploadFiles(attachments);
        attachmentUrls = uploaded.map(f => f.url);
      } catch (e) {
        console.error('File upload failed:', e);
        return;
      }
    }
    
    // Build message with attachments
    let fullContent = content;
    if (attachmentUrls.length > 0) {
      fullContent = content + '\n\n**Attachments:**\n' + attachmentUrls.map(url => `- [${url.split('/').pop()}](${url})`).join('\n');
    }
    
    setStreamingOutput('');
    try { 
      const result = await api.sendMessage(activeSession.id, fullContent);
      setActiveSession({ ...result.session });
      setSessions(prev => prev.map(s => s.id === result.session.id ? { ...result.session } : s));
    } catch (e) { console.error(e); }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    try { 
      await api.stopSession(activeSession.id); 
      setStreamingOutput(prev => prev + '\n[Stopped]');
    } catch (e) { console.error(e); }
  };

  const handleSelectSession = (session: Session) => {
    setActiveSession(session);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-50 h-full transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0 w-72
      `}>
        <Sidebar 
          sessions={sessions} 
          activeSession={activeSession} 
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-transparent">
          <Button
            isIconOnly
            variant="light"
            onPress={() => setSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </div>
        
        <ChatArea 
          session={activeSession} 
          streamingOutput={streamingOutput} 
          thinkingContent={thinkingContent}
          showThinking={showThinking}
          onToggleThinking={() => setShowThinking(!showThinking)}
          onSendMessage={handleSendMessage} 
          onStop={handleStop}
          queuedMessages={activeSession?.queue?.length || 0}
          isConnected={isConnected}
        />
        

      </div>
    </div>
  );
}
