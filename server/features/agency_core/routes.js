import express from 'express';
import { AgencyCoreService } from './service.js';

export function registerRoutes(db) {
  const router = express.Router();
  const service = new AgencyCoreService(db);

  router.get('/profile', (req, res) => {
    res.json(service.getProfile());
  });

  return router;
}
