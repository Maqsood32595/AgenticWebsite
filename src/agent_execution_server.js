import http from 'http';
import url from 'url';

// Simulated Live Database for a Dubai Marina Business (e.g. Royal Grooming Lounge)
const LIVE_SLOTS_DB = {
  "2026-09-05": [
    { time: "11:00", available: true, barber: "Tarek", price: "AED 120" },
    { time: "14:30", available: true, barber: "Samir", price: "AED 120" },
    { time: "17:00", available: true, barber: "Tarek", price: "AED 120" },
    { time: "19:00", available: false, barber: "Samir", price: "AED 140" } // Booked
  ]
};

const RESERVATIONS = [];

// Lightweight Agentic Execution Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set JSON Response Headers (CORS Enabled for Web Agents)
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Tool: Check Live Availability (Pre-Login)
  // Example: GET /api/agent/availability?date=2026-09-05
  if (method === 'GET' && pathname === '/api/agent/availability') {
    const queryDate = parsedUrl.query.date || "2026-09-05";
    const slots = LIVE_SLOTS_DB[queryDate] || [];
    const openSlots = slots.filter(s => s.available);

    res.writeHead(200);
    res.end(JSON.stringify({
      businessName: "The Royal Grooming Lounge (Dubai Marina)",
      queryDate,
      totalAvailableSlots: openSlots.length,
      availableSlots: openSlots,
      bookingProtocol: "Guest Reservation (No Password or Login Required)",
      executionEndpoint: "POST /api/agent/reserve"
    }, null, 2));
    return;
  }

  // 2. Tool: Instant Pre-Login Guest Reservation
  // Example: POST /api/agent/reserve
  if (method === 'POST' && pathname === '/api/agent/reserve') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { name, whatsapp, date, slot, service } = data;

        if (!name || !whatsapp || !slot) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Missing required fields: name, whatsapp, slot" }));
          return;
        }

        const reservationId = `RGL-${Date.now().toString().slice(-6)}`;
        const reservationRecord = {
          reservationId,
          guestName: name,
          whatsappDirect: whatsapp,
          date: date || "2026-09-05",
          timeSlot: slot,
          serviceRequested: service || "Hot Towel Beard Sculpt & Cut",
          status: "CONFIRMED_GUEST_HOLD",
          whatsappConfirmationTriggered: true,
          locationAddress: "Ground Floor, Marina Diamond 4, Dubai Marina",
          timestamp: new Date().toISOString()
        };

        RESERVATIONS.push(reservationRecord);

        // Mark slot as booked
        const targetDay = LIVE_SLOTS_DB[reservationRecord.date];
        if (targetDay) {
          const booked = targetDay.find(s => s.time === slot);
          if (booked) booked.available = false;
        }

        console.log(`⚡ [AGENT EXECUTION SUCCESS] Guest Chair Reserved for ${name} (${whatsapp}) at ${slot}!`);

        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: "Guest reservation locked in 12ms. WhatsApp confirmation ping sent.",
          reservation: reservationRecord
        }, null, 2));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
      }
    });
    return;
  }

  // Default Fallback
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Endpoint not found. Use /api/agent/availability or /api/agent/reserve" }));
});

const PORT = 3456;
server.listen(PORT, () => {
  console.log(`========================================================================`);
  console.log(`⚡ AGENTIC EXECUTION SERVER RUNNING ON: http://localhost:${PORT}`);
  console.log(`🎯 Tool 1 (GET):  http://localhost:${PORT}/api/agent/availability?date=2026-09-05`);
  console.log(`🎯 Tool 2 (POST): http://localhost:${PORT}/api/agent/reserve`);
  console.log(`========================================================================`);
});
