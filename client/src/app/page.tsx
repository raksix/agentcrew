'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/Chat';
import { SubagentPanel } from '@/components/Subagent';
import { Session, SessionEvent } from '@/lib/types';
import * as api from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  
  // Use ref to always have current queue value
  const messageQueueRef = useRef<string[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    messageQueueRef.current = messageQueue;
  }, [messageQueue]);

  useEffect(() => { loadSessions(); }, []);

  // Process next message from queue - defined before useEffect that uses it
  const processQueue = useCallback(async () => {
    const queue = messageQueueRef.current;
    if (queue.length === 0 || !activeSession) return;
    
    const [nextMessage, ...rest] = queue;
    setMessageQueue(rest);
    messageQueueRef.current = rest;
    
    setStreamingOutput('');
    try { 
      const result = await api.sendMessage(activeSession.id, nextMessage);
      setActiveSession({ ...result.session });
      setRefreshKey(k => k + 1);
      setSessions(prev => prev.map(s => s.id === result.session.id ? { ...result.session } : s));
    } catch (e) { console.error(e); }
  }, [activeSession]);

  // Use the WebSocket hook for real-time streaming
  const { isConnected, lastMessage } = useWebSocket(activeSession?.id || null);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    console.log('WS: Message received:', lastMessage.type);
    if (lastMessage.type === 'output') {
      setStreamingOutput(prev => prev + lastMessage.data);
    }
    else if (lastMessage.type === 'done' || lastMessage.type === 'error') {
      console.log('WS: Done/Error, final data:', lastMessage.data);
      const finalOutput = lastMessage.data;
      setTimeout(() => {
        api.getSession(activeSession!.id).then(updated => {
          console.log('Fetched session, messages:', updated.messages.length);
          if (finalOutput && updated.messages.length > 0) {
            const lastMsg = updated.messages[updated.messages.length - 1];
            if (lastMsg.role === 'assistant' && !lastMsg.content) {
              lastMsg.content = finalOutput;
            }
          }
          setActiveSession(updated);
          setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
          setStreamingOutput('');
          processQueue();
        }).catch(console.error);
      }, 1000);
    }
  }, [lastMessage, activeSession]);

  const loadSessions = async () => {
    try { 
      const updatedSessions = await api.getSessions();
      setSessions(updatedSessions);
      // Also update activeSession if it exists in the updated list
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

  const handleSendMessage = async (content: string) => {
    if (!activeSession) return;
    
    // If Claude is running, queue the message
    if (activeSession.status === 'running') {
      setMessageQueue(prev => [...prev, content]);
      return;
    }
    
    // Otherwise send immediately
    setStreamingOutput('');
    try { 
      const result = await api.sendMessage(activeSession.id, content);
      setActiveSession({ ...result.session });
      setRefreshKey(k => k + 1);
      setSessions(prev => prev.map(s => s.id === result.session.id ? { ...result.session } : s));
    } catch (e) { console.error(e); }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    try { 
      await api.stopSession(activeSession.id); 
      setStreamingOutput(prev => prev + '\n[Stopped]');
      // Clear queue on stop
      setMessageQueue([]);
    } catch (e) { console.error(e); }
  };

  const handleSelectSession = (session: Session) => {
    setActiveSession(session);
    setSidebarOpen(false);
    setMessageQueue([]); // Clear queue when switching sessions
  };

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`
        fixed lg:relative z-50 h-full transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0
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
        {/* Mobile header with menu button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </button>
            <div className="font-semibold text-sm">
              {activeSession ? activeSession.name : 'AgentCrew'}
            </div>
          </div>
          
          {/* Connection status */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
        
        <ChatArea 
          key={refreshKey}
          session={activeSession} 
          streamingOutput={streamingOutput} 
          onSendMessage={handleSendMessage} 
          onStop={handleStop}
          queuedMessages={messageQueue.length}
        />
        {activeSession && <SubagentPanel sessionId={activeSession.id} subagents={activeSession.subagents || []} />}
      </div>
    </div>
  );
}
