'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SessionEvent } from '@/lib/types';
import * as api from '@/lib/api';

interface UseWebSocketResult {
  isConnected: boolean;
  lastMessage: SessionEvent | null;
  error: string | null;
}

export function useWebSocket(sessionId: string | null): UseWebSocketResult {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SessionEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryAttemptsRef = useRef<number>(0);
  const [retryNonce, setRetryNonce] = useState(0);
  const cancelledRef = useRef<boolean>(false);

  const scheduleReconnect = useCallback(() => {
    if (retryTimerRef.current) return;
    // Exponential backoff: 1s, 2s, 4s, 8s (max)
    const attempt = retryAttemptsRef.current;
    const delay = Math.min(8000, 1000 * Math.pow(2, attempt));
    retryTimerRef.current = window.setTimeout(() => {
      retryTimerRef.current = null;
      retryAttemptsRef.current += 1;
      setRetryNonce(n => n + 1);
    }, delay);
  }, []);

  const connect = useCallback(() => {
    if (!sessionId || cancelledRef.current) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    console.log('WS: Connecting to session:', sessionId);
    
    try {
      const ws = api.createSessionWebSocket(sessionId);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WS: Connected!');
        setError(null);
        setIsConnected(true);
        // Reset backoff on successful connection
        retryAttemptsRef.current = 0;
        if (retryTimerRef.current) {
          window.clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: SessionEvent = JSON.parse(event.data);
          // Ignore pong messages (keepalive responses)
          if (data.type === 'pong') return;
          
          console.log('WS: Message received:', data.type);
          setLastMessage(data);
        } catch (err) {
          console.error('WS: Failed to parse message:', err);
        }
      };

      ws.onerror = () => {
        // Don't set error here - onclose handles retry logic
        console.log('WS: Error occurred');
      };

      ws.onclose = (evt) => {
        console.log('WS: Closed:', evt.code, evt.wasClean);
        setIsConnected(false);
        wsRef.current = null;

        // Don't reconnect if:
        // - Cancelled (cleanup in progress)
        // - Clean close (code 1000, wasClean true)
        // - Session ended normally
        if (
          cancelledRef.current ||
          (evt?.code === 1000 && evt?.wasClean)
        ) {
          console.log('WS: Not reconnecting - clean close or cancelled');
          return;
        }

        // Reconnect on unexpected closures
        console.log('WS: Scheduling reconnect...');
        scheduleReconnect();
      };

    } catch (err) {
      console.error('WS: Connection failed:', err);
      retryAttemptsRef.current += 1;
      scheduleReconnect();
    }
  }, [sessionId, scheduleReconnect]);

  useEffect(() => {
    if (!sessionId) {
      setIsConnected(false);
      setLastMessage(null);
      setError(null);
      return;
    }

    cancelledRef.current = false;
    connect();

    return () => {
      console.log('WS: Cleanup');
      cancelledRef.current = true;
      
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      
      if (wsRef.current) {
        // Clear all handlers to prevent callbacks after cleanup
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        
        // Close the connection
        wsRef.current.close(1000, 'component_unmount');
        wsRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [sessionId, retryNonce]);

  return { isConnected, lastMessage, error };
}
