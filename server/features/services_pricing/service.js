// Services & Transparent Pricing Service
export class ServicesPricingService {
  constructor(db) {
    this.db = db;
  }

  listServices() {
    const rows = this.db.prepare('SELECT * FROM flick_services ORDER BY starting_price_aed DESC').all();
    return rows.map(r => ({
      ...r,
      deliverables: typeof r.deliverables === 'string' ? JSON.parse(r.deliverables) : r.deliverables
    }));
  }

  getServiceBySlug(slug) {
    const r = this.db.prepare('SELECT * FROM flick_services WHERE slug = ?').get(slug);
    if (!r) return null;
    return {
      ...r,
      deliverables: typeof r.deliverables === 'string' ? JSON.parse(r.deliverables) : r.deliverables
    };
  }

  listPortfolio() {
    return this.db.prepare('SELECT * FROM flick_portfolio ORDER BY id ASC').all();
  }
}
