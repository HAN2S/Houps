import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';

export function useRoomWebSocket(roomId: string, onMessage: (data: any) => void) {
  useEffect(() => {
    const socket = new SockJS('http://localhost:8081/ws'); // Adjust port if needed
    const client = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [roomId, onMessage]);
} 