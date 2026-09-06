import express from 'express';
import { ServicesPricingService } from './service.js';

export function registerRoutes(db) {
  const router = express.Router();
  const service = new ServicesPricingService(db);

  router.get('/', (req, res) => {
    res.json({
      success: true,
      services: service.listServices()
    });
  });

  router.get('/portfolio', (req, res) => {
    res.json({
      success: true,
      portfolio: service.listPortfolio()
    });
  });

  router.get('/:slug', (req, res) => {
    const item = service.getServiceBySlug(req.params.slug);
    if (!item) return res.status(404).json({ success: false, error: 'Service not found' });
    res.json({ success: true, service: item });
  });

  return router;
}
