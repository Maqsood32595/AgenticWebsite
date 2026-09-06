import assert from 'node:assert';
import http from 'node:http';
import { getRamDatabase } from '../../server/db/ram_db.js';

// ============================================================================
// PIET ZERO-MOCK FALSIFICATION TEST SUITE — THE FLICK STUDIO DUBAI
// Proves In-RAM database, Fractal-Kernel discovery, booking locks & Agent APIs
// Supports Target Port 5060 via node:http and Port 5065 via fetch
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 PIET IN-RAM ZERO-MOCK FALSIFICATION TEST SUITE');
console.log('🏢 Target: The Flick Studio (Primary Port: 5060 | Browser Port: 5065)');
console.log('═══════════════════════════════════════════════════════════════');

let testFailures = 0;

function httpRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          text: async () => body,
          json: async () => JSON.parse(body)
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function gate(name, fn) {
  return async () => {
    try {
      process.stdout.write(`\n⏳ Running ${name}... `);
      await fn();
      console.log(`✅ PASSED`);
    } catch (err) {
      console.log(`❌ FALSIFIED / FAILED`);
      console.error(`   Error: ${err.message}`);
      testFailures++;
    }
  };
}

// GATE 1: In-RAM Ephemeral Twin Schema & Seed Verification
const gate1 = gate('GATE 1: In-RAM SQLite Ephemeral Twin Verification', async () => {
  const db = getRamDatabase();
  assert(db, 'RAM Database instance must exist');

  const services = db.prepare('SELECT COUNT(*) as count FROM flick_services').get();
  assert.strictEqual(services.count, 4, 'Must have exactly 4 seeded services');

  const slots = db.prepare('SELECT COUNT(*) as count FROM flick_slots').get();
  assert.strictEqual(slots.count, 5, 'Must have 5 seeded booking slots');

  const portfolio = db.prepare('SELECT COUNT(*) as count FROM flick_portfolio').get();
  assert.strictEqual(portfolio.count, 4, 'Must have 4 portfolio case studies');
});

// GATE 2: Core Profile & Contact Verification on Port 5060
const gate2 = gate('GATE 2: Agency Profile & Physical Contact on Port 5060', async () => {
  const res = await httpRequest('http://127.0.0.1:5060/api/flick/core/profile');
  assert.strictEqual(res.status, 200, 'Profile endpoint must respond with 200 OK');
  
  const data = await res.json();
  assert.strictEqual(data.contacts.officialPhone, '+971 56 189 2990', 'Phone must be verified +971 56 189 2990');
  assert(data.location.fullAddress.includes('The Burlington Tower'), 'Must be located in The Burlington Tower');
  assert(data.location.fullAddress.includes('Business Bay'), 'Must be in Business Bay, Dubai');
});

// GATE 3: Productized Services & AED Pricing Verification on Port 5060
const gate3 = gate('GATE 3: Transparent AED Pricing Catalog on Port 5060', async () => {
  const res = await httpRequest('http://127.0.0.1:5060/api/flick/services');
  assert.strictEqual(res.status, 200, 'Services endpoint must respond 200');
  
  const body = await res.json();
  assert(Array.isArray(body.services), 'Body must contain services array');
  assert.strictEqual(body.services.length, 4, 'Must have 4 services');

  const podcastStudio = body.services.find(s => s.slug === 'podcast-studio-rental-production');
  assert(podcastStudio, 'Podcast studio service must exist');
  assert.strictEqual(podcastStudio.starting_price_aed, 1200, 'Podcast studio must be AED 1,200/hr');
});

// GATE 4: Real-Time Studio Slot Booking & State Mutation on Port 5060
let bookedSlotId = null;
const gate4 = gate('GATE 4: Real-Time Studio Slot Booking & Lock Mutation on Port 5060', async () => {
  // Check available slots
  let slotsRes = await httpRequest('http://127.0.0.1:5060/api/flick/booking/slots');
  let slotsData = await slotsRes.json();
  let availableSlot = slotsData.slots.find(s => s.status === 'AVAILABLE');

  // Self-heal: If all slots are currently booked from previous test runs, release slot 1
  if (!availableSlot) {
    await httpRequest('http://127.0.0.1:5060/api/flick/booking/cancel?slot=1', {
      headers: { 'Accept': 'application/json' }
    });
    slotsRes = await httpRequest('http://127.0.0.1:5060/api/flick/booking/slots');
    slotsData = await slotsRes.json();
    availableSlot = slotsData.slots.find(s => s.status === 'AVAILABLE');
  }

  assert(availableSlot, 'There must be at least one available slot to book');
  bookedSlotId = availableSlot.id;

  // Book the slot
  const bookRes = await httpRequest('http://127.0.0.1:5060/api/flick/booking/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slotId: bookedSlotId,
      clientName: 'PIET Falsification Client',
      phone: '+971 50 999 8888',
      serviceInterested: '3D Motion Design, CGI & VFX'
    })
  });

  assert.strictEqual(bookRes.status, 200, 'Booking must succeed with 200 OK');
  const bookData = await bookRes.json();
  assert(bookData.confirmationCode.startsWith('FLICK-'), 'Must generate confirmation code #FLICK-XXXX');

  // Verify slot state mutated in-RAM
  const verifyRes = await httpRequest('http://127.0.0.1:5060/api/flick/booking/slots');
  const verifyData = await verifyRes.json();
  const lockedSlot = verifyData.slots.find(s => s.id === bookedSlotId);
  assert.strictEqual(lockedSlot.status, 'RESERVED', 'Slot status must have mutated to RESERVED');
  assert.strictEqual(lockedSlot.booked_by, 'PIET Falsification Client', 'Booked by must match client name');
});

// GATE 5: Double-Booking Conflict Rejection Gate (409 Conflict) on Port 5060
const gate5 = gate('GATE 5: Double-Booking Conflict Rejection (409 Falsification)', async () => {
  assert(bookedSlotId, 'Must have a booked slot from Gate 4');

  // Attempt to book the exact same slot again
  const conflictRes = await httpRequest('http://127.0.0.1:5060/api/flick/booking/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slotId: bookedSlotId,
      clientName: 'Intruder Client',
      phone: '+971 50 000 0000'
    })
  });

  assert.strictEqual(conflictRes.status, 409, 'Double booking must be rejected with 409 Conflict');
  const conflictData = await conflictRes.json();
  assert.strictEqual(conflictData.success, false, 'Conflict response success must be false');

  // Cleanup: Release the booked test slot so the test suite is repeatable
  await httpRequest(`http://127.0.0.1:5060/api/flick/booking/cancel?slot=${bookedSlotId}`, {
    headers: { 'Accept': 'application/json' }
  });
});

// GATE 6: AI Agent Machine-Readability & LLMs Manifest Verification on Port 5060
const gate6 = gate('GATE 6: Machine-Readability & LLMs Manifest on Port 5060', async () => {
  // Test /api/flick/agent/availability
  const availRes = await httpRequest('http://127.0.0.1:5060/api/flick/agent/availability');
  assert.strictEqual(availRes.status, 200, 'Availability endpoint must respond 200');
  const availData = await availRes.json();
  assert(availData.provider.directHandoff.phone === '+971 56 189 2990', 'Agent phone must match +971 56 189 2990');
  assert(Array.isArray(availData.pricingCatalog), 'Pricing catalog must be provided to agents');

  // Test /llms.txt
  const llmRes = await httpRequest('http://127.0.0.1:5060/llms.txt');
  assert.strictEqual(llmRes.status, 200, 'llms.txt must respond 200');
  const llmText = await llmRes.text();
  assert(llmText.includes('THE FLICK STUDIO'), 'llms.txt must contain agency title');
  assert(llmText.includes('+971 56 189 2990'), 'llms.txt must contain direct phone');
  assert(llmText.includes('Burlington Tower'), 'llms.txt must contain Burlington Tower');
});

// GATE 7: Browser Companion Port 5065 Verification (WHATWG Fetch Test)
const gate7 = gate('GATE 7: Browser Companion Port 5065 Compatibility (Fetch API)', async () => {
  const res = await fetch('http://127.0.0.1:5065/api/health');
  assert.strictEqual(res.status, 200, 'Companion port 5065 must respond 200 to fetch()');
  const data = await res.json();
  assert.strictEqual(data.directPhone, '+971 56 189 2990', 'Must return verified phone');
});

// Execute all gates sequentially
async function runAllGates() {
  await gate1();
  await gate2();
  await gate3();
  await gate4();
  await gate5();
  await gate6();
  await gate7();

  console.log('\n═══════════════════════════════════════════════════════════════');
  if (testFailures === 0) {
    console.log('🏆 ALL 7 PIET GATES PASSED! SYSTEM VERIFIED 100% OPERATIONAL.');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error(`💥 ${testFailures} PIET GATES FAILED!`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runAllGates();
