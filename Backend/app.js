// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const stockRoutes = require('./routes/stocks'); // Stock management routes
const salesRoutes = require('./routes/sales'); // Sales management routes
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: [
      "https://budget-hair-stock-management-system-ddel.vercel.app", // Vercel production 1
      "https://budget-hair-stock-management-system.vercel.app",     // Vercel production 2
      "http://localhost:5173",                                      // Local development (Vite)
      "http://localhost:5174"                                       // Local development (other ports)
    ],
    methods: ["GET", "POST"], // Allow only GET and POST methods
  },
});

// Define the server port
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
  origin: [
    "https://budget-hair-stock-management-system-ddel.vercel.app",
    "https://budget-hair-stock-management-system.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  methods: ['GET', 'POST', 'DELETE', 'PUT'] // Allowed HTTP methods
}));

// Attach `Socket.IO` instance to all incoming requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Register routes
app.use('/api', stockRoutes); // Stock routes
app.use('/api', salesRoutes); // Sales routes
app.use('/api/notifications', notificationRoutes); // Notification routes

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A client connected via WebSocket');

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
