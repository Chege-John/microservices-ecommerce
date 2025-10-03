import express, { Request, Response } from 'express';
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { shouldBeUser } from './middleware/authMiddleware.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
  })
);

// Public route: /health
app.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Protected routes with Clerk middleware
app.use(clerkMiddleware());

app.get('/test', shouldBeUser, (req, res) => {
  res.json({ message: 'product service authenticated', userId: req.userId });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(8000, () => {
  console.log('Product service is running on port 8000');
});