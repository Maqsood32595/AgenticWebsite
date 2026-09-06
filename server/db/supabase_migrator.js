import pg from 'pg';
const { Pool } = pg;

// ============================================================================
// THE FLICK STUDIO — SUPABASE POSTGRESQL PROMOTER & MIGRATOR
// Migrates validated In-RAM schema into persistent cloud Supabase tables
// Strictly isolated under 'flick_*' namespace (No disturbance to existing tables)
// ============================================================================

const rawDbUrl = process.env.DATABASE_URL || 
  'postgresql://postgres.wxzphkzixtolcgxfpyrx:bahram%4035911@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require';

// Strip sslmode query param to avoid pg driver SSL confusion with poolers
const cleanDbUrl = rawDbUrl.split('?')[0];

export async function runSupabaseMigration() {
  console.log('🚀 [SUPABASE MIGRATOR] Initializing PostgreSQL connection...');

  const pool = new Pool({
    connectionString: cleanDbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();

  try {
    console.log('🛡️ [SUPABASE MIGRATOR] Creating isolated flick_* tables...');

    await client.query('BEGIN');

    // 1. flick_services
    await client.query(`
      CREATE TABLE IF NOT EXISTS flick_services (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        starting_price_aed INTEGER NOT NULL,
        price_display TEXT NOT NULL,
        duration TEXT NOT NULL,
        short_desc TEXT NOT NULL,
        deliverables JSONB NOT NULL,
        is_featured BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. flick_slots
    await client.query(`
      CREATE TABLE IF NOT EXISTS flick_slots (
        id SERIAL PRIMARY KEY,
        slot_time TEXT NOT NULL,
        slot_type TEXT NOT NULL,
        location TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        booked_by TEXT,
        contact_phone TEXT,
        confirmation_code TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. flick_portfolio
    await client.query(`
      CREATE TABLE IF NOT EXISTS flick_portfolio (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        category TEXT NOT NULL,
        metric TEXT NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. flick_inquiries
    await client.query(`
      CREATE TABLE IF NOT EXISTS flick_inquiries (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        client_name TEXT NOT NULL,
        phone TEXT,
        service_interested TEXT,
        notes TEXT,
        source TEXT DEFAULT 'AI_AGENT'
      );
    `);

    console.log('🌱 [SUPABASE MIGRATOR] Seeding initial data into flick_* tables...');

    // Seed flick_services idempotently
    const services = [
      {
        slug: 'brand-identity-positioning',
        title: 'High-End Brand Identity & Visual Positioning',
        category: 'Branding & Strategy',
        starting_price_aed: 12500,
        price_display: 'From AED 12,500',
        duration: '3-4 Weeks',
        short_desc: 'Complete luxury identity overhaul: bespoke typography, custom 3D logo animation, color psychology, and comprehensive brand book.',
        deliverables: JSON.stringify(['Custom Logo & Monogram', '3D Motion Logo Sting', 'Full Brand Guidelines Book', 'Social Media Asset Kit', 'Typography & Palette System'])
      },
      {
        slug: '3d-animation-cgi-vfx',
        title: '3D Motion Design, CGI & Photorealistic VFX',
        category: 'CGI & 3D Animation',
        starting_price_aed: 18000,
        price_display: 'From AED 18,000',
        duration: '2-3 Weeks',
        short_desc: 'High-end CGI product reveals, 3D commercial visuals, virtual showroom assets, and broadcast-quality visual effects.',
        deliverables: JSON.stringify(['Cinema 4D / Blender 3D Scene Modeling', '4K Octane / Redshift Photorealistic Rendering', 'Sound Design & Dynamic Audio Mix', 'Multiple Aspect Ratio Exports (16:9 & 9:16)'])
      },
      {
        slug: 'podcast-studio-rental-production',
        title: 'VIP Multicam Podcast Studio Rental & Live Switching',
        category: 'Studio Production',
        starting_price_aed: 1200,
        price_display: 'AED 1,200 / Hour',
        duration: 'Per Session',
        short_desc: 'Acoustically tuned studio in Business Bay with 4x Sony 4K FX3 cameras, Shure SM7B mics, live ATEM switching, and on-site audio engineer.',
        deliverables: JSON.stringify(['4x 4K Sony Cinema Cameras', 'Studio Audio Engineer Included', 'Multi-Track Raw Audio & 4K Video Delivery', 'Same-Day Reel Cuts (3 High-Hook Shorts)'])
      },
      {
        slug: 'viral-social-content-engine',
        title: 'Monthly Viral Social Content & Video Engine',
        category: 'Social Growth',
        starting_price_aed: 8500,
        price_display: 'AED 8,500 / Month',
        duration: 'Monthly Retainer',
        short_desc: 'End-to-end TikTok & Instagram content engine: scripting, studio filming, fast-cut editing, motion graphics, and algorithmic posting strategy.',
        deliverables: JSON.stringify(['16 High-Hook Cinematic Short Videos / Month', '2 Full Studio Filming Sessions / Month', 'Scriptwriting & Trend Forecasting', 'Monthly Analytics & Audience Growth Audit'])
      }
    ];

    for (const s of services) {
      await client.query(`
        INSERT INTO flick_services (slug, title, category, starting_price_aed, price_display, duration, short_desc, deliverables)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          starting_price_aed = EXCLUDED.starting_price_aed,
          price_display = EXCLUDED.price_display;
      `, [s.slug, s.title, s.category, s.starting_price_aed, s.price_display, s.duration, s.short_desc, s.deliverables]);
    }

    // Seed flick_slots idempotently if empty
    const slotCountRes = await client.query('SELECT COUNT(*) FROM flick_slots');
    if (parseInt(slotCountRes.rows[0].count, 10) === 0) {
      const slots = [
        ['Today at 2:00 PM', 'In-Person Studio Tour & Creative Briefing', 'Level 14, The Burlington Tower, Business Bay, Dubai', 'AVAILABLE'],
        ['Today at 4:30 PM', 'VIP Multicam Podcast Studio Session (2 Hours)', 'The Flick Studio Suite A, Business Bay, Dubai', 'AVAILABLE'],
        ['Tomorrow at 11:00 AM', '3D Motion Design & Rebrand Discovery Call', 'Executive Creative Suite / Zoom', 'AVAILABLE'],
        ['Tomorrow at 3:00 PM', 'Full-Day Studio & Cyclorama Production Rental', 'Main Stage & Cyc Wall, Business Bay, Dubai', 'AVAILABLE'],
        ['Tomorrow at 5:30 PM', 'Monthly Social Content Engine Strategy Session', 'Executive Boardroom, Business Bay, Dubai', 'AVAILABLE']
      ];

      for (const slot of slots) {
        await client.query(`
          INSERT INTO flick_slots (slot_time, slot_type, location, status)
          VALUES ($1, $2, $3, $4);
        `, slot);
      }
    }

    await client.query('COMMIT');
    console.log('✅ [SUPABASE MIGRATOR] Migration and seeding complete! All flick_* tables are live in Supabase.');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [SUPABASE MIGRATOR] Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run directly if invoked as main script
if (process.argv[1] && process.argv[1].endsWith('supabase_migrator.js')) {
  runSupabaseMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
