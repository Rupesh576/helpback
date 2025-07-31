import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import postRoutes from './routes/api/posts.js';
// --- Import the new admin route file ---
import adminRoutes from './routes/api/admin.js';

// --- Initial Setup ---
dotenv.config();
const app = express();
const server = http.createServer(app);

// --- Database Connection ---
connectDB();

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/posts', postRoutes);
// --- Use the new admin routes ---
app.use('/api/admin', adminRoutes);

// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io };
