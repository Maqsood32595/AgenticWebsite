import fs from 'fs';
import path from 'path';

const DNC_FILE = path.join(process.cwd(), 'suppression_list.json');

export function loadDncRegistry() {
  if (!fs.existsSync(DNC_FILE)) {
    return { suppressedPhones: [], suppressedEmails: [], suppressedDomains: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DNC_FILE, 'utf-8'));
  } catch {
    return { suppressedPhones: [], suppressedEmails: [], suppressedDomains: [] };
  }
}

export function addToDnc(phoneOrEmail) {
  const dnc = loadDncRegistry();
  const val = String(phoneOrEmail).trim().toLowerCase();

  if (val.includes('@')) {
    if (!dnc.suppressedEmails.includes(val)) {
      dnc.suppressedEmails.push(val);
    }
  } else {
    const cleanPhone = val.replace(/[^0-9+]/g, '');
    if (!dnc.suppressedPhones.includes(cleanPhone)) {
      dnc.suppressedPhones.push(cleanPhone);
    }
  }

  dnc.updatedAt = new Date().toISOString();
  fs.writeFileSync(DNC_FILE, JSON.stringify(dnc, null, 2), 'utf-8');
  console.log(`✓ Added to DNC Suppression Registry: ${phoneOrEmail}`);
}

export function scrubLeadsAgainstDnc(leads) {
  const dnc = loadDncRegistry();
  const phoneSet = new Set(dnc.suppressedPhones.map(p => p.replace(/[^0-9+]/g, '')));
  const emailSet = new Set(dnc.suppressedEmails.map(e => e.toLowerCase()));

  const initialCount = leads.length;
  const cleanLeads = leads.filter(lead => {
    const leadPhone = (lead.whatsapp || lead.whatsappDirect || lead.phone || '').replace(/[^0-9+]/g, '');
    const leadEmail = (lead.email || '').toLowerCase().trim();

    if (phoneSet.has(leadPhone)) return false;
    if (emailSet.has(leadEmail)) return false;
    return true;
  });

  const suppressedCount = initialCount - cleanLeads.length;
  if (suppressedCount > 0) {
    console.log(`🛡️ DNC Filter: Blocked & scrubbed ${suppressedCount} suppressed contacts from export!`);
  } else {
    console.log(`🛡️ DNC Filter: 100% of ${cleanLeads.length} leads verified clean against suppression list.`);
  }

  return cleanLeads;
}

// CLI testing support
if (process.argv[2] === 'add' && process.argv[3]) {
  addToDnc(process.argv[3]);
} else if (process.argv[2] === 'status') {
  const dnc = loadDncRegistry();
  console.log('\n--- DNC SUPPRESSION REGISTRY STATUS ---');
  console.log(`Phones Suppressed: ${dnc.suppressedPhones.length}`);
  console.log(`Emails Suppressed: ${dnc.suppressedEmails.length}`);
  console.log(`Last Updated:     ${dnc.updatedAt}\n`);
}
