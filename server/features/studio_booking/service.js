// Studio Booking & Consultation Slot Service
export class StudioBookingService {
  constructor(db, eventBroadcaster = null) {
    this.db = db;
    this.eventBroadcaster = eventBroadcaster;
  }

  setBroadcaster(broadcaster) {
    this.eventBroadcaster = broadcaster;
  }

  listSlots() {
    return this.db.prepare('SELECT * FROM flick_slots ORDER BY id ASC').all();
  }

  listAvailableSlots() {
    return this.db.prepare("SELECT * FROM flick_slots WHERE status = 'AVAILABLE' ORDER BY id ASC").all();
  }

  bookSlot(slotIdentifier, clientName, phone = null, serviceInterested = null) {
    if (!clientName) {
      return { success: false, error: 'clientName is required to confirm a session' };
    }

    let slot = null;
    const numId = parseInt(slotIdentifier, 10);

    if (!isNaN(numId)) {
      slot = this.db.prepare('SELECT * FROM flick_slots WHERE id = ?').get(numId);
    }

    if (!slot) {
      slot = this.db.prepare("SELECT * FROM flick_slots WHERE status = 'AVAILABLE' ORDER BY id ASC LIMIT 1").get();
    }

    if (!slot) {
      return {
        success: false,
        error: 'No studio or discovery slots currently available. Please call +971 56 189 2990 directly.'
      };
    }

    if (slot.status !== 'AVAILABLE') {
      return {
        success: false,
        error: `Slot #${slot.id} (${slot.slot_time}) is already reserved by ${slot.booked_by}.`
      };
    }

    const code = `FLICK-${Math.floor(1000 + Math.random() * 9000)}`;

    this.db.prepare(`
      UPDATE flick_slots 
      SET status = 'RESERVED', booked_by = ?, contact_phone = ?, confirmation_code = ?
      WHERE id = ?
    `).run(clientName, phone || '+971-Client', code, slot.id);

    // Record inquiry
    this.db.prepare(`
      INSERT INTO flick_inquiries (created_at, client_name, phone, service_interested, notes, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      new Date().toISOString(),
      clientName,
      phone,
      serviceInterested || slot.slot_type,
      `Confirmation Code: ${code} for ${slot.slot_time}`,
      'AI_AGENT'
    );

    const updatedSlot = this.db.prepare('SELECT * FROM flick_slots WHERE id = ?').get(slot.id);

    if (this.eventBroadcaster) {
      this.eventBroadcaster('SLOT_BOOKED', {
        slotId: updatedSlot.id,
        slotTime: updatedSlot.slot_time,
        slotType: updatedSlot.slot_type,
        clientName
      });
    }

    return {
      success: true,
      confirmationCode: code,
      slotId: updatedSlot.id,
      slotTime: updatedSlot.slot_time,
      slotType: updatedSlot.slot_type,
      location: updatedSlot.location,
      clientName,
      message: `Confirmed session for ${clientName} at The Flick Studio: ${updatedSlot.slot_type} (${updatedSlot.slot_time}). Confirmation Code: #${code}.`
    };
  }

  cancelSlot(slotIdentifier, clientName) {
    let slot = null;
    const numId = parseInt(slotIdentifier, 10);

    if (!isNaN(numId)) {
      slot = this.db.prepare('SELECT * FROM flick_slots WHERE id = ?').get(numId);
    }

    if (!slot && clientName) {
      slot = this.db.prepare("SELECT * FROM flick_slots WHERE status = 'RESERVED' AND LOWER(booked_by) LIKE ? LIMIT 1")
        .get(`%${clientName.toLowerCase()}%`);
    }

    if (!slot) {
      return { success: false, error: 'Could not find an active reservation matching those details.' };
    }

    if (slot.status === 'AVAILABLE') {
      return { success: false, error: `Slot #${slot.id} (${slot.slot_time}) is already available.` };
    }

    const previousClient = slot.booked_by;

    this.db.prepare(`
      UPDATE flick_slots 
      SET status = 'AVAILABLE', booked_by = NULL, contact_phone = NULL, confirmation_code = NULL
      WHERE id = ?
    `).run(slot.id);

    if (this.eventBroadcaster) {
      this.eventBroadcaster('SLOT_CANCELLED', {
        slotId: slot.id,
        slotTime: slot.slot_time,
        previousClient
      });
    }

    return {
      success: true,
      slotId: slot.id,
      slotTime: slot.slot_time,
      previousClient,
      message: `Reservation for ${previousClient} at Slot #${slot.id} (${slot.slot_time}) has been released back to AVAILABLE.`
    };
  }
}
