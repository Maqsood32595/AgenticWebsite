// Agency Core Business Profile Service
export class AgencyCoreService {
  constructor(db) {
    this.db = db;
  }

  getProfile() {
    return {
      agencyName: "The Flick Studio (Flick Content)",
      tagline: "Next-Level Creative, 3D CGI & Multicam Production Agency",
      location: {
        tower: "The Burlington Tower, Level 14",
        area: "Business Bay",
        city: "Dubai",
        country: "United Arab Emirates",
        fullAddress: "Level 14, The Burlington Tower, Business Bay, Dubai, UAE",
        geo: {
          latitude: 25.1856,
          longitude: 55.2678
        }
      },
      contacts: {
        officialPhone: "+971 56 189 2990",
        officialEmail: "hello@flickstudio.com",
        vipWhatsApp: "+971 56 189 2990",
        dialUrl: "tel:+971561892990",
        whatsappUrl: "https://wa.me/971561892990?text=Hi%20Flick%20Studio%20Team,%20I'm%20inquiring%20about%20a%20creative%20project"
      },
      operatingHours: {
        days: "Monday – Saturday",
        hours: "9:00 AM – 8:00 PM GST",
        weekendStudioShoots: "Available by private booking"
      },
      socialProof: {
        instagram: "https://instagram.com/theflickstudio",
        linkedin: "https://linkedin.com/company/flickcontent"
      }
    };
  }
}
