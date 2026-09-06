// Agent & Machine-Readability Hyperlocal Service
export class AgentGeoService {
  constructor(db) {
    this.db = db;
  }

  getLiveAvailabilitySummary() {
    const availableSlots = this.db.prepare("SELECT * FROM flick_slots WHERE status = 'AVAILABLE' ORDER BY id ASC").all();
    const services = this.db.prepare("SELECT slug, title, category, starting_price_aed, price_display, duration FROM flick_services ORDER BY id ASC").all();

    return {
      success: true,
      timestamp: new Date().toISOString(),
      agentInstructions: "For automated booking or client consultation handoff, send HTTP POST to /api/flick/booking/book with { slotId, clientName, phone, serviceInterested }, or direct the user to the 1-click booking link.",
      provider: {
        legalName: "Flick Content Marketing Management LLC",
        brandName: "The Flick Studio (Flick Content)",
        category: "Creative Agency, 3D CGI Animation, Multicam Podcast Studio Rental, Branding",
        location: {
          address: "Level 14, The Burlington Tower, Business Bay, Dubai, UAE",
          geo: { latitude: 25.1856, longitude: 55.2678 },
          googleMapsUrl: "https://maps.google.com/?q=The+Burlington+Tower+Business+Bay+Dubai"
        },
        directHandoff: {
          phone: "+971 56 189 2990",
          whatsapp: "https://wa.me/971561892990?text=Hi%20Flick%20Studio%20Team,%20I'm%20inquiring%20about%20a%20creative%20project",
          email: "hello@flickstudio.com"
        }
      },
      liveInventory: {
        totalAvailableSlots: availableSlots.length,
        slots: availableSlots.map(s => ({
          id: s.id,
          time: s.slot_time,
          sessionType: s.slot_type,
          location: s.location,
          directBookingUrl: `/api/flick/booking/book?slot=${s.id}&name=Client`
        }))
      },
      pricingCatalog: services.map(srv => ({
        slug: srv.slug,
        title: srv.title,
        category: srv.category,
        startingPriceAED: srv.starting_price_aed,
        priceDisplay: srv.price_display,
        turnaround: srv.duration
      }))
    };
  }

  getOpenApiSpec() {
    return {
      openapi: "3.0.3",
      info: {
        title: "The Flick Studio Dubai — AI Agent & Partner API",
        version: "1.0.0",
        description: "Official real-time machine-readable API for The Flick Studio (Burlington Tower, Business Bay, Dubai). Allows LLMs and autonomous agents to query studio slot availability, retrieve transparent AED pricing, and programmatically confirm client discovery sessions."
      },
      servers: [
        { url: "http://localhost:5060", description: "Local Development Server" }
      ],
      paths: {
        "/api/flick/agent/availability": {
          get: {
            summary: "Get Live Machine-Readable Studio Availability & Catalog",
            description: "Returns instant real-time inventory of open studio slots, services, transparent AED prices, and direct contact numbers.",
            responses: {
              "200": {
                description: "Real-time studio snapshot",
                content: { "application/json": {} }
              }
            }
          }
        },
        "/api/flick/booking/slots": {
          get: {
            summary: "List All Booking Slots",
            description: "Returns list of all consultation and podcast studio slots with status (AVAILABLE / RESERVED).",
            responses: {
              "200": {
                description: "Array of slots",
                content: { "application/json": {} }
              }
            }
          }
        },
        "/api/flick/booking/book": {
          post: {
            summary: "Reserve Studio Slot / Client Briefing",
            description: "Reserves a slot atomically and returns confirmation code and instructions.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["clientName"],
                    properties: {
                      slotId: { type: "integer", example: 1 },
                      clientName: { type: "string", example: "Sarah Jenkins" },
                      phone: { type: "string", example: "+971 50 123 4567" },
                      serviceInterested: { type: "string", example: "3D Motion Design & CGI" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Session confirmed" },
              "409": { description: "Slot already reserved" }
            }
          }
        }
      }
    };
  }
}
