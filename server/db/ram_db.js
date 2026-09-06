import { DatabaseSync } from 'node:sqlite';

// ============================================================================
// THE FLICK STUDIO — IN-RAM EPHEMERAL TWIN DATABASE (SQLITE)
// Prototyped and validated entirely in memory (:memory:)
// ============================================================================

let dbInstance = null;

export function getRamDatabase() {
  if (dbInstance) return dbInstance;

  dbInstance = new DatabaseSync(':memory:');
  initRamSchema(dbInstance);
  seedRamData(dbInstance);

  return dbInstance;
}

function initRamSchema(db) {
  // 1. Services & Transparent Pricing Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS flick_services (
      id INTEGER PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      starting_price_aed INTEGER NOT NULL,
      price_display TEXT NOT NULL,
      duration TEXT NOT NULL,
      short_desc TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      is_featured INTEGER DEFAULT 1
    );
  `);

  // 2. Real-Time Booking & Consultation Slots Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS flick_slots (
      id INTEGER PRIMARY KEY,
      slot_time TEXT NOT NULL,
      slot_type TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      booked_by TEXT,
      contact_phone TEXT,
      confirmation_code TEXT
    );
  `);

  // 3. Portfolio & Case Studies Showcase Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS flick_portfolio (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      client_name TEXT NOT NULL,
      category TEXT NOT NULL,
      metric TEXT NOT NULL,
      image_url TEXT NOT NULL
    );
  `);

  // 4. Inbound Client Inquiries & Agent Actions Log Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS flick_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      client_name TEXT NOT NULL,
      phone TEXT,
      service_interested TEXT,
      notes TEXT,
      source TEXT NOT NULL DEFAULT 'AI_AGENT'
    );
  `);
}

function seedRamData(db) {
  // Seed Services
  const insertService = db.prepare(`
    INSERT INTO flick_services (id, slug, title, category, starting_price_aed, price_display, duration, short_desc, deliverables, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const services = [
    [
      1,
      'brand-identity-positioning',
      'High-End Brand Identity & Visual Positioning',
      'Branding & Strategy',
      12500,
      'From AED 12,500',
      '3-4 Weeks',
      'Complete luxury identity overhaul: bespoke typography, custom 3D logo animation, color psychology, and comprehensive brand book.',
      JSON.stringify(['Custom Logo & Monogram', '3D Motion Logo Sting', 'Full Brand Guidelines Book', 'Social Media Asset Kit', 'Typography & Palette System']),
      1
    ],
    [
      2,
      '3d-animation-cgi-vfx',
      '3D Motion Design, CGI & Photorealistic VFX',
      'CGI & 3D Animation',
      18000,
      'From AED 18,000',
      '2-3 Weeks',
      'High-end CGI product reveals, 3D commercial visuals, virtual showroom assets, and broadcast-quality visual effects.',
      JSON.stringify(['Cinema 4D / Blender 3D Scene Modeling', '4K Octane / Redshift Photorealistic Rendering', 'Sound Design & Dynamic Audio Mix', 'Multiple Aspect Ratio Exports (16:9 & 9:16)']),
      1
    ],
    [
      3,
      'podcast-studio-rental-production',
      'VIP Multicam Podcast Studio Rental & Live Switching',
      'Studio Production',
      1200,
      'AED 1,200 / Hour',
      'Per Session',
      'Acoustically tuned studio in Business Bay with 4x Sony 4K FX3 cameras, Shure SM7B mics, live ATEM switching, and on-site audio engineer.',
      JSON.stringify(['4x 4K Sony Cinema Cameras', 'Studio Audio Engineer Included', 'Multi-Track Raw Audio & 4K Video Delivery', 'Same-Day Reel Cuts (3 High-Hook Shorts)']),
      1
    ],
    [
      4,
      'viral-social-content-engine',
      'Monthly Viral Social Content & Video Engine',
      'Social Growth',
      8500,
      'AED 8,500 / Month',
      'Monthly Retainer',
      'End-to-end TikTok & Instagram content engine: scripting, studio filming, fast-cut editing, motion graphics, and algorithmic posting strategy.',
      JSON.stringify(['16 High-Hook Cinematic Short Videos / Month', '2 Full Studio Filming Sessions / Month', 'Scriptwriting & Trend Forecasting', 'Monthly Analytics & Audience Growth Audit']),
      1
    ]
  ];

  for (const s of services) {
    insertService.run(...s);
  }

  // Seed Consultation & Studio Booking Slots
  const insertSlot = db.prepare(`
    INSERT INTO flick_slots (id, slot_time, slot_type, location, status, booked_by, contact_phone, confirmation_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const slots = [
    [1, 'Today at 2:00 PM', 'In-Person Studio Tour & Creative Briefing', 'Level 14, The Burlington Tower, Business Bay, Dubai', 'AVAILABLE', null, null, null],
    [2, 'Today at 4:30 PM', 'VIP Multicam Podcast Studio Session (2 Hours)', 'The Flick Studio Suite A, Business Bay, Dubai', 'AVAILABLE', null, null, null],
    [3, 'Tomorrow at 11:00 AM', '3D Motion Design & Rebrand Discovery Call', 'Executive Creative Suite / Zoom', 'AVAILABLE', null, null, null],
    [4, 'Tomorrow at 3:00 PM', 'Full-Day Studio & Cyclorama Production Rental', 'Main Stage & Cyc Wall, Business Bay, Dubai', 'AVAILABLE', null, null, null],
    [5, 'Tomorrow at 5:30 PM', 'Monthly Social Content Engine Strategy Session', 'Executive Boardroom, Business Bay, Dubai', 'AVAILABLE', null, null, null]
  ];

  for (const slot of slots) {
    insertSlot.run(...slot);
  }

  // Seed Portfolio
  const insertPortfolio = db.prepare(`
    INSERT INTO flick_portfolio (id, title, client_name, category, metric, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const portfolio = [
    [1, 'Aura Luxury Fragrances Global 3D CGI Launch', 'Aura Parfums Dubai', '3D CGI & Motion', '14.2M Social Impressions • Sold Out in 48h', '/assets/portfolio/aura.jpg'],
    [2, 'Beyond The Matrix UAE Tech Podcast Show', 'Beyond Capital', 'Podcast Studio Production', 'Top #3 Tech Podcast in GCC', '/assets/portfolio/podcast.jpg'],
    [3, 'Apex Supercars Dubai Visual Identity & Showroom 3D', 'Apex Motors', 'Brand Identity & Web', '+310% Inbound High-Ticket Inquiries', '/assets/portfolio/apex.jpg'],
    [4, 'Noir Couture Fashion Week Runway Campaign', 'Noir House', 'Video Production & VFX', 'Vogue Arabia Feature & 2.4M Reels Views', '/assets/portfolio/fashion.jpg']
  ];

  for (const p of portfolio) {
    insertPortfolio.run(...p);
  }
}
