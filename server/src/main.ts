/**
 * Open Frontier - Server Entry Point
 * Phase 0: Proof of Concept
 */

import express from 'express';
import cors from 'cors';
import { SERVER_PORT } from '@open-frontier/shared';

console.log('Open Frontier - Server starting...');
console.log('Phase 0: Proof of Concept');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', phase: 'Phase 0', version: '0.1.0' });
});

// API routes (to be implemented)
app.get('/api/game/state', (_req, res) => {
  res.json({ message: 'Game state endpoint - not yet implemented' });
});

app.post('/api/game/action', (_req, res) => {
  res.json({ message: 'Game action endpoint - not yet implemented' });
});

// Start server
app.listen(SERVER_PORT, () => {
  console.log(`Server listening on http://localhost:${SERVER_PORT}`);
  console.log('Server initialized successfully');
  console.log('\nAPI endpoints:');
  console.log(`  GET  http://localhost:${SERVER_PORT}/health`);
  console.log(`  GET  http://localhost:${SERVER_PORT}/api/game/state`);
  console.log(`  POST http://localhost:${SERVER_PORT}/api/game/action`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
