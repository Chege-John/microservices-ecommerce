import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { shouldBeUser } from './middleware/authMiddleware.js';
import productRouter from './routes/product.route';
import categoryRouter from './routes/category.route';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
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

app.get('/test', shouldBeUser, (req, res) => {
  res.json({ message: 'product service authenticated', userId: req.userId });
});

app.use('/products', productRouter);
app.use('/categories', categoryRouter);

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

app.listen(8000, () => {
  console.log('Product service is running on port 8000');
});
