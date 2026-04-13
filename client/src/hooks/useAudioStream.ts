/**
 * useAudioStream Hook - Real-time Audio Streaming for Notebook
 * 
 * Manages:
 * - WebSocket connection to backend audio-stream
 * - Microphone capture with MediaRecorder
 * - Audio playback queue for AI responses
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioStreamState {
   isConnected: boolean;
   isRecording: boolean;
   isPlaying: boolean;
   error: string | null;
}

interface UseAudioStreamReturn {
   state: AudioStreamState;
   connect: () => Promise<void>;
   disconnect: () => void;
   startRecording: () => Promise<void>;
   stopRecording: () => void;
   textResponse: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4004').replace(/\/$/, '');

export function useAudioStream(token: string, companyId?: string): UseAudioStreamReturn {
   const [state, setState] = useState<AudioStreamState>({
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      error: null,
   });
   const [textResponse, setTextResponse] = useState('');

   const wsRef = useRef<WebSocket | null>(null);
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const audioContextRef = useRef<AudioContext | null>(null);
   const audioQueueRef = useRef<ArrayBuffer[]>([]);

   // Connect to WebSocket
   const connect = useCallback(async () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
         return;
      }

      try {
         setState(prev => ({ ...prev, error: null }));

         // Build WebSocket URL
         const wsUrl = API_URL.replace('http', 'ws');
         const url = `${wsUrl}/audio-stream/connect?token=${token}${companyId ? `&companyId=${companyId}` : ''}`;

         const ws = new WebSocket(url);
         wsRef.current = ws;

         ws.onopen = () => {
            console.log('[AudioStream] WebSocket opened');
         };

         ws.onmessage = (event) => {
            try {
               const data = JSON.parse(event.data);
               handleMessage(data);
            } catch (e) {
               console.error('[AudioStream] Parse error:', e);
            }
         };

         ws.onerror = (error) => {
            console.error('[AudioStream] WebSocket error:', error);
            setState(prev => ({ ...prev, error: 'Bağlantı hatası', isConnected: false }));
         };

         ws.onclose = () => {
            console.log('[AudioStream] WebSocket closed');
            setState(prev => ({ ...prev, isConnected: false }));
         };

      } catch (error) {
         console.error('[AudioStream] Connect error:', error);
         setState(prev => ({ ...prev, error: 'Bağlantı kurulamadı' }));
      }
   }, [token, companyId]);

   // Handle incoming messages
   const handleMessage = useCallback((data: any) => {
      switch (data.type) {
         case 'connected':
            setState(prev => ({ ...prev, isConnected: true }));
            break;

         case 'text':
            setTextResponse(prev => prev + data.data);
            break;

         case 'audio':
            // Queue audio for playback
            playAudioChunk(data.data, data.mimeType);
            break;

         case 'turn_complete':
            setState(prev => ({ ...prev, isPlaying: false }));
            break;

         case 'error':
            setState(prev => ({ ...prev, error: data.message }));
            break;

         case 'gemini_closed':
            setState(prev => ({ ...prev, error: data.reason, isConnected: false }));
            break;
      }
   }, []);

   // Play audio chunk
   const playAudioChunk = useCallback(async (base64Data: string, mimeType: string) => {
      try {
         setState(prev => ({ ...prev, isPlaying: true }));

         // Decode base64 to ArrayBuffer
         const binaryString = atob(base64Data);
         const bytes = new Uint8Array(binaryString.length);
         for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
         }

         // Create audio context if needed
         if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
         }

         // Play the audio chunk
         // Note: This is simplified - real implementation needs proper PCM handling
         const audioBlob = new Blob([bytes], { type: mimeType || 'audio/wav' });
         const audioUrl = URL.createObjectURL(audioBlob);
         const audio = new Audio(audioUrl);
         audio.play().catch(console.error);
         audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
         };

      } catch (error) {
         console.error('[AudioStream] Play error:', error);
      }
   }, []);

   // Start recording
   const startRecording = useCallback(async () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
         setState(prev => ({ ...prev, error: 'Bağlantı yok' }));
         return;
      }

      try {
         setTextResponse(''); // Clear previous response

         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
         });

         mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
               // Convert blob to base64 and send
               const reader = new FileReader();
               reader.onload = () => {
                  const base64 = (reader.result as string).split(',')[1];
                  wsRef.current?.send(JSON.stringify({
                     type: 'audio',
                     data: base64,
                     mimeType: 'audio/webm',
                  }));
               };
               reader.readAsDataURL(event.data);
            }
         };

         mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            wsRef.current?.send(JSON.stringify({ type: 'end_turn' }));
         };

         mediaRecorderRef.current = mediaRecorder;
         mediaRecorder.start(100); // Send chunks every 100ms
         setState(prev => ({ ...prev, isRecording: true }));

      } catch (error) {
         console.error('[AudioStream] Mic error:', error);
         setState(prev => ({ ...prev, error: 'Mikrofon erişimi reddedildi' }));
      }
   }, []);

   // Stop recording
   const stopRecording = useCallback(() => {
      if (mediaRecorderRef.current && state.isRecording) {
         mediaRecorderRef.current.stop();
         setState(prev => ({ ...prev, isRecording: false }));
      }
   }, [state.isRecording]);

   // Disconnect
   const disconnect = useCallback(() => {
      if (wsRef.current) {
         wsRef.current.close();
         wsRef.current = null;
      }
      if (mediaRecorderRef.current) {
         mediaRecorderRef.current.stop();
      }
      setState({
         isConnected: false,
         isRecording: false,
         isPlaying: false,
         error: null,
      });
   }, []);

   // Cleanup on unmount
   useEffect(() => {
      return () => {
         disconnect();
      };
   }, [disconnect]);

   return {
      state,
      connect,
      disconnect,
      startRecording,
      stopRecording,
      textResponse,
   };
}
