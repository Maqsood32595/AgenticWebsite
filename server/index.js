import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getRamDatabase } from './db/ram_db.js';
import { bootstrapKernel } from './kernel.js';
import { getSharedBookingService } from './features/studio_booking/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5060;

// Enable CORS & JSON Body Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Initialize In-RAM SQLite Ephemeral Twin Database
const ramDb = getRamDatabase();

// 2. Setup Server-Sent Events (SSE) for Real-Time Booking Updates
const sseClients = new Set();

function broadcastEvent(eventType, payload) {
  const message = `data: ${JSON.stringify({ event: eventType, payload, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Attach broadcaster to shared studio booking service
getSharedBookingService(ramDb, broadcastEvent);

// SSE Stream Endpoint
app.get('/api/flick/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ event: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 3. Health & Discovery Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    agency: 'The Flick Studio (Flick Content Marketing Management LLC)',
    location: 'Level 14, The Burlington Tower, Business Bay, Dubai, UAE',
    directPhone: '+971 56 189 2990',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

import { createCompressionEngine } from './compression.js';

// Explicit llms.txt & robots.txt routes
const publicDir = path.join(__dirname, '../public');

// 3B. Initialize In-RAM Brotli & Gzip Compression Engine (Reduces transfer by 86%+)
const { middleware: compressionMiddleware, cache: compressionCache } = createCompressionEngine(publicDir);
app.use(compressionMiddleware);

// Performance & Compression Telemetry API
app.get('/api/flick/performance/compression', (req, res) => {
  res.json(compressionCache.getTelemetry());
});

app.get('/llms.txt', (req, res) => {
  const filePath = path.join(publicDir, 'llms.txt');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(filePath);
  }
  res.status(404).send('llms.txt not found');
});

app.get('/robots.txt', (req, res) => {
  const filePath = path.join(publicDir, 'robots.txt');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(filePath);
  }
  res.status(404).send('robots.txt not found');
});

// 4. Bootstrap Fractal Kernel (Auto-Discovers server/features/*)
console.log('🌀 [FRACTAL KERNEL] Bootstrapping modular features...');
const mountedFeatures = await bootstrapKernel(app, ramDb);
console.log(`✅ [FRACTAL KERNEL] Successfully mounted ${mountedFeatures.length} features.`);

// 5. Serve Static Assets
app.use(express.static(publicDir));

// Fallback for root single-page app
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start listening on Target Port (PORT) and optional Local Browser Safe Port 5065
const isRenderOrProd = process.env.RENDER || process.env.NODE_ENV === 'production';
const ALT_PORT = 5065;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log(`🎬 THE FLICK STUDIO DUBAI — HIGH-END AGENTIC PORTAL`);
  console.log(`📍 Location: Level 14, The Burlington Tower, Business Bay, Dubai`);
  console.log(`📞 Direct Contact: +971 56 189 2990`);
  console.log(`🌐 Primary Target Server (Port ${PORT}): http://localhost:${PORT}`);
  if (!isRenderOrProd) {
    console.log(`🌐 Browser / Chrome Safe Mirror (Port 5065): http://localhost:${ALT_PORT}`);
  }
  console.log(`🤖 Agent Readability: http://localhost:${PORT}/api/flick/agent/availability`);
  console.log(`📜 LLMs Manifest: http://localhost:${PORT}/llms.txt`);
  console.log(`⚡ Real-Time SSE: http://localhost:${PORT}/api/flick/events`);
  console.log('================================================================');
});

let altServer = null;
if (!isRenderOrProd) {
  try {
    altServer = app.listen(ALT_PORT, '0.0.0.0');
  } catch (err) {
    console.warn('Alternate port 5065 skipped:', err.message);
  }
}

export { app, server, altServer, ramDb };
