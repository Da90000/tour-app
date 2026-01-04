// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');

// Centralized modules
const socket = require('./socket');
const { startScheduler } = require('./scheduler');

// Import all routers
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const tourDataRoutes = require('./routes/tourData');
const expenseRoutes = require('./routes/expenses');
const financeRoutes = require('./routes/finances');
const notificationRoutes = require('./routes/notifications');
const announcementRoutes = require('./routes/announcements');

// --- Initialization ---
const app = express();

// app.use(async (req, res, next) => {
//  console.log(`${req.method} ${req.url}`);
//   next();
// })

const server = http.createServer(app);

// Initialize Socket.IO and pass it the http server
const io = socket.init(server);

const PORT = process.env.PORT || 3001;

// --- Middleware ---

// *** THIS IS THE FIX ***
// Replace the simple app.use(cors()) with a more detailed configuration.
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:4173"], // Allow your frontend origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow all common methods
  allowedHeaders: "Content-Type,Authorization", // Explicitly allow the Authorization header
  credentials: true,
};
app.use(cors(corsOptions));
// **********************

app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tours', tourDataRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);

// --- Start Services ---
// We don't need to pass `io` here anymore because the scheduler can get it from socket.js
startScheduler();

server.listen(PORT, () => {
  console.log(`Server with WebSockets is listening on port ${PORT}`);
});