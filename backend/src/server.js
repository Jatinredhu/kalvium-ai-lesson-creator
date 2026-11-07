import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, getDbStatus } from './config/db.js';
import lessonRoutes from './routes/lessonRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Kalvium AI Lesson Creation API',
    database: getDbStatus()
  });
});

// API Routes
app.use('/api', lessonRoutes);

// Serve frontend static build if available
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    // Avoid intercepting API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ ok: false, error: 'Endpoint not found' });
    }
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    ok: false,
    error: err.message || 'Internal Server Error'
  });
});

// Initialize Database and Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Kalvium AI Lesson Creation Tool Running!`);
    console.log(`🌐 Web App Interface: http://localhost:${PORT}`);
    console.log(`📡 API Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`📚 Database Storage:  ${getDbStatus().type}`);
    console.log(`====================================================`);
  });
};

startServer();
