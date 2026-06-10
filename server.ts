import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface Player {
  ws: WebSocket;
  role: 'host' | 'client';
}

interface Room {
  host?: Player;
  client?: Player;
}

const rooms = new Map<string, Room>();

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  let currentRoomId: string | null = null;
  let currentRole: 'host' | 'client' | null = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'host') {
        const roomId = data.room;
        currentRoomId = roomId;
        currentRole = 'host';

        const room = rooms.get(roomId) || {};
        room.host = { ws, role: 'host' };
        rooms.set(roomId, room);

        console.log(`Room [${roomId}]: Host connected.`);

        // Notify host that setup is completed
        ws.send(JSON.stringify({ type: 'host-success', room: roomId }));

        // If client is already connected, notify both
        if (room.client) {
          ws.send(JSON.stringify({ type: 'companion-connected' }));
          room.client.ws.send(JSON.stringify({ type: 'companion-connected' }));
        }
      } else if (data.type === 'join') {
        const roomId = data.room;
        currentRoomId = roomId;
        currentRole = 'client';

        const room = rooms.get(roomId) || {};
        room.client = { ws, role: 'client' };
        rooms.set(roomId, room);

        console.log(`Room [${roomId}]: Client connected.`);

        // Notify client successful join
        ws.send(JSON.stringify({ type: 'join-success', room: roomId }));

        // Notify both that partner joined
        if (room.host) {
          ws.send(JSON.stringify({ type: 'companion-connected' }));
          room.host.ws.send(JSON.stringify({ type: 'companion-connected' }));
        }
      } else {
        // Forward message to the opponent in the same room
        if (currentRoomId) {
          const room = rooms.get(currentRoomId);
          if (room) {
            const target = currentRole === 'host' ? room.client : room.host;
            if (target && target.ws.readyState === WebSocket.OPEN) {
              target.ws.send(JSON.stringify(data));
            }
          }
        }
      }
    } catch (e) {
      console.error('Error processing WebSocket message:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && currentRole) {
      console.log(`Room [${currentRoomId}]: ${currentRole} disconnected.`);
      const room = rooms.get(currentRoomId);
      if (room) {
        if (currentRole === 'host') {
          delete room.host;
          if (room.client && room.client.ws.readyState === WebSocket.OPEN) {
            room.client.ws.send(JSON.stringify({ type: 'companion-disconnected' }));
          }
        } else {
          delete room.client;
          if (room.host && room.host.ws.readyState === WebSocket.OPEN) {
            room.host.ws.send(JSON.stringify({ type: 'companion-disconnected' }));
          }
        }

        if (!room.host && !room.client) {
          rooms.delete(currentRoomId);
          console.log(`Room [${currentRoomId}]: Deleted because empty.`);
        }
      }
    }
  });
});

// Hook WS server to HTTP upgrade on /ws
server.on('upgrade', (request, socket, head) => {
  const url = request.url || '';
  const pathname = url.split('?')[0];

  if (pathname === '/ws' || pathname === '/ws/' || pathname.startsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else if (process.env.NODE_ENV === 'production') {
    // In production, safely destroy other connections to prevent socket leaks
    socket.destroy();
  }
  // In development, do not destroy other sockets (e.g., Vite HMR)
});

// Initialize Vite and Start Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
