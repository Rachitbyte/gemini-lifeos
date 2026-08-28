import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import app from './api/index';

dotenv.config();

const PORT = 3000;

// Vite middleware & Production Serving Setup (for standalone Node execution in Cloud Run or Local Dev)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gemini LifeOS] Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Gemini LifeOS] Fatal server initialization error:', err);
});
