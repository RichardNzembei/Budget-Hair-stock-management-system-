const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const stockRoutes = require('./routes/stocks');
const salesRoutes = require('./routes/sales');
const notificationRoutes = require('./routes/notifications');
require("./cron/salesCleanup");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "https://budget-hair-stock-management-system-wui7.vercel.app",
      "https://budget-hair-stock-management-system.vercel.app",
      "https://budget-hair-stock-management-system-ll2i.vercel.app",
      "https://budget-hair-stock-management-system.vercel.app/",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "https://budget-hair-stock-management-system-wui7.vercel.app",
      "https://budget-hair-stock-management-system.vercel.app",
      "https://budget-hair-stock-management-system-ll2i.vercel.app",
      "https://budget-hair-stock-management-system.vercel.app/",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  })
);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', stockRoutes);
app.use('/api', salesRoutes);
app.use('/api', notificationRoutes);

io.on('connection', (socket) => {
  console.log('WebSocket client connected');
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
