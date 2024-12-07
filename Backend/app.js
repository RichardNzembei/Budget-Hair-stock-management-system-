const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const stockRoutes = require('./routes/stocks');
const salesRoutes = require('./routes/sales');

const app = express();
const server = http.createServer(app);

// Socket.IO initialization with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: [
      "https://budget-hair-stock-management-system-ddel.vercel.app/", // Vercel production 1
      "https://budget-hair-stock-management-system.vercel.app",     // Vercel production 2
      "http://localhost:5173",                                      // Local development (Vite)
      "http://localhost:5174"                                       // Local development (other ports, e.g., React)
    ],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(cors({
  origin: [
    "https://budget-hair-stock-management-system-mf6o.vercel.app",
    "https://budget-hair-stock-management-system.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  methods: ["GET", "POST"],
}));
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', stockRoutes);
app.use('/api', salesRoutes);

io.on('connection', (socket) => {
  console.log('A client connected via WebSocket');

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
