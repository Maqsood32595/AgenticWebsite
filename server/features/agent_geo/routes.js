import express from 'express';
import { AgentGeoService } from './service.js';

export function registerRoutes(db) {
  const router = express.Router();
  const service = new AgentGeoService(db);

  // Machine-readable availability endpoint for AI agents
  router.get('/availability', (req, res) => {
    res.json(service.getLiveAvailabilitySummary());
  });

  // OpenAPI 3.0 specification for tool/function calling
  router.get('/openapi.json', (req, res) => {
    res.json(service.getOpenApiSpec());
  });

  return router;
}
