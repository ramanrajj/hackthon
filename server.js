// backend.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// In-memory storage for users (can replace with DB later)
let users = {};

/**
 * Endpoint: Update user location
 * Expects: { userId, name, phone, lat, lng }
 * Emits real-time update to all connected clients
 */
app.post('/api/update-location', (req, res) => {
  const { userId, name, phone, lat, lng } = req.body;

  if (!userId || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing data' });
  }

  users[userId] = {
    userId,
    name: name || 'Unknown',
    phone: phone || 'N/A',
    lat,
    lng,
    time: new Date()
  };

  // Emit real-time update to all clients
  io.emit('location-update', users[userId]);

  res.json({ status: 'updated', user: users[userId] });
});

/**
 * Endpoint: Get all users
 */
app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

/**
 * Example: Merged old backend route
 * You can add as many routes as needed here
 */
app.get('/api/data', (req, res) => {
  res.json({ msg: 'Hello from merged backend!' });
});

/**
 * Socket.IO connection
 */
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Optional: send all current users to newly connected client
  socket.emit('initial-users', Object.values(users));

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
