import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { shouldBeAdmin } from './middleware/authMiddleware.js';
import userRoute from './routes/user.route.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3003'],
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
app.use(express.json());
app.use(clerkMiddleware());

app.use('/users', shouldBeAdmin, userRoute);

// Product & Category error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Server error:', err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal server error' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const start = async () => {
  try {
    app.listen(8003, () => {
      console.log('Product service is running on port 8003');
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
