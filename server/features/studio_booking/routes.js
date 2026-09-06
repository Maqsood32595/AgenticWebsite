import express from 'express';
import { StudioBookingService } from './service.js';

let sharedService = null;

export function getSharedBookingService(db, broadcaster = null) {
  if (!sharedService) {
    sharedService = new StudioBookingService(db, broadcaster);
  } else if (broadcaster) {
    sharedService.setBroadcaster(broadcaster);
  }
  return sharedService;
}

export function registerRoutes(db) {
  const router = express.Router();
  const service = getSharedBookingService(db);

  // List all slots
  router.get('/slots', (req, res) => {
    res.json({
      success: true,
      slots: service.listSlots()
    });
  });

  // Direct JSON Booking (AI Agents / API)
  router.post('/book', (req, res) => {
    const { slotId, clientName, phone, serviceInterested } = req.body;
    const result = service.bookSlot(slotId, clientName, phone, serviceInterested);
    if (!result.success) return res.status(409).json(result);
    res.json(result);
  });

  // 1-Click Parameterized URL Booking (Human-in-the-Loop)
  router.get('/book', (req, res) => {
    const slotId = req.query.slot || req.query.slotId || "1";
    const clientName = req.query.name || req.query.clientName || "Executive Client";
    const phone = req.query.phone || "+971 50 000 0000";
    const serviceInterested = req.query.service || "VIP Creative Session";

    const result = service.bookSlot(slotId, clientName, phone, serviceInterested);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(result);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Session Confirmed — The Flick Studio Dubai</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { background: #07080b; color: #f8fafc; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: rgba(18, 20, 26, 0.95); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px; padding: 36px; max-width: 520px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align: center; }
          .badge { background: rgba(37, 99, 235, 0.15); border: 1px solid #3b82f6; color: #93c5fd; padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 16px; }
          h1 { font-family: 'Cinzel', serif; font-size: 1.8rem; color: #fff; margin-bottom: 6px; }
          .sub { color: #d4af37; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
          .code-box { background: rgba(0,0,0,0.5); border: 1px dashed #d4af37; border-radius: 12px; padding: 18px; margin: 20px 0; font-family: 'Courier New', monospace; font-size: 1.3rem; color: #f3e5ab; font-weight: 700; }
          .details { text-align: left; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 18px; margin-bottom: 24px; font-size: 0.9rem; line-height: 1.7; color: #cbd5e1; }
          .btn { display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #07080b; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 0.95rem; box-sizing: border-box; }
          .btn-cancel { display: block; width: 100%; margin-top: 12px; padding: 12px; border: 1px solid rgba(239,68,68,0.4); border-radius: 10px; color: #f87171; text-decoration: none; font-size: 0.88rem; font-weight: 600; text-align: center; box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">⚡ Confirmed Session</div>
          <h1>THE FLICK STUDIO</h1>
          <div class="sub">Level 14, The Burlington Tower • Business Bay, Dubai</div>
          
          <div class="code-box">${result.confirmationCode || 'CONFIRMED'}</div>
          
          <div class="details">
            <div>👤 <strong>Client:</strong> ${clientName}</div>
            <div>🗓️ <strong>Session:</strong> ${result.slotType || 'Creative Briefing'}</div>
            <div>⏰ <strong>Time:</strong> ${result.slotTime || 'Scheduled'}</div>
            <div>📍 <strong>Location:</strong> Level 14, The Burlington Tower, Business Bay, Dubai</div>
            <div>📞 <strong>Host Line:</strong> +971 56 189 2990</div>
          </div>

          <a href="/" class="btn">View Live Studio Schedule ➔</a>
          <a href="/api/flick/booking/cancel?slot=${result.slotId || slotId}&name=${encodeURIComponent(clientName)}" class="btn-cancel">Cancel This Session ✕</a>
        </div>
      </body>
      </html>
    `);
  });

  // Cancellation Endpoint
  router.get('/cancel', (req, res) => {
    const slotId = req.query.slot || req.query.slotId;
    const clientName = req.query.name || req.query.clientName;

    const result = service.cancelSlot(slotId, clientName);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(result);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Session Cancelled — The Flick Studio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { background: #07080b; color: #f8fafc; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: rgba(18, 20, 26, 0.95); border: 1px solid rgba(239,68,68,0.35); border-radius: 20px; padding: 36px; max-width: 500px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align: center; }
          .badge { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 16px; }
          h1 { font-family: 'Cinzel', serif; font-size: 1.8rem; color: #fff; margin-bottom: 6px; }
          .sub { color: #d4af37; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
          .msg { background: rgba(0,0,0,0.4); border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; }
          .btn { display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #07080b; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 0.95rem; box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">✕ Session Released</div>
          <h1>THE FLICK STUDIO</h1>
          <div class="sub">Business Bay • Dubai</div>
          <div class="msg">${result.message || result.error || 'The slot has been released back to available.'}</div>
          <a href="/" class="btn">Return to Live Schedule ➔</a>
        </div>
      </body>
      </html>
    `);
  });

  return router;
}
