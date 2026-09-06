import fs from 'fs';
import path from 'path';

// List of Active UAE Business Domains to Audit & Rate
const AUDIT_DOMAINS_POOL = [
  { name: "Metropolitan Premium Properties", category: "Real Estate Brokerage", url: "https://metropolitan.realestate", phone: "+971 58 648 8888", email: "info@metropolitan.realestate", location: "Business Bay, Dubai" },
  { name: "White & Co Real Estate", category: "Real Estate Group", url: "https://whiteandcogroup.com", phone: "+971 4 876 2333", email: "marketing@whiteandcogroup.com", location: "Motor City, Dubai" },
  { name: "Lucia Clinic Dubai", category: "Aesthetic Dermatology", url: "https://luciaclinic.com", phone: "+971 56 115 9194", email: "info@luciaclinic.com", location: "Jumeirah 2, Dubai" },
  { name: "Biolite Aesthetic Clinic", category: "Anti-Aging & Medical Spa", url: "https://biolitedubai.com", phone: "+971 50 292 0086", email: "concierge@biolitedubai.com", location: "Umm Suqeim 2, Dubai" },
  { name: "Nightjar Coffee Roasters", category: "Artisanal F&B / Roastery", url: "https://nightjar.coffee", phone: "+971 50 518 1768", email: "info@nightjar.coffee", location: "Alserkal Avenue, Al Quoz 1" },
  { name: "Comptoir 102 Concept Store", category: "Organic Dining & Boutique", url: "https://comptoir102.com", phone: "+971 4 385 4555", email: "contact@comptoir102.com", location: "Jumeirah 1, Dubai" },
  { name: "Tania's Teahouse", category: "Lifestyle Cafe", url: "https://taniasteahouse.com", phone: "+971 4 324 0021", email: "hello@taniasteahouse.com", location: "Dubai Hills Estate" },
  { name: "Dr. Roze BioHealth Clinics", category: "Biological Dental Practice", url: "https://drroze.com", phone: "+971 4 388 1388", email: "contact@drroze.com", location: "Jumeirah Beach Road" },
  { name: "Seven Media Dubai", category: "PR & Communications", url: "https://sevenmedia.ae", phone: "+971 4 450 7888", email: "info@sevenmedia.ae", location: "Dubai Media City" },
  { name: "The Luxury Closet", category: "Pre-Owned Luxury D2C", url: "https://theluxurycloset.com", phone: "+971 4 586 7800", email: "marketing@theluxurycloset.com", location: "Al Barsha 1, Dubai" }
];

async function auditDomain(item) {
  const t0 = performance.now();
  let html = '';
  let loadTimeMs = 0;
  let reachable = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(item.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });

    clearTimeout(timeout);
    loadTimeMs = performance.now() - t0;
    html = await res.text();
    reachable = res.ok || html.length > 500;
  } catch {
    loadTimeMs = performance.now() - t0;
    reachable = false;
  }

  if (!reachable || !html) {
    return {
      ...item,
      reachable: false,
      loadTimeSeconds: (loadTimeMs / 1000).toFixed(2),
      freshnessScore: 25,
      verdictTag: "🔴 CRITICAL: Site Down or Bot-Blocked",
      criticalIssues: ["Website unreachable or severe timeout on mobile network"],
      flickPitchOffer: "High-Priority Web Infrastructure Recovery (AED 35,000 Upfront)"
    };
  }

  const issues = [];
  const wins = [];
  let score = 100;

  // 1. Copyright Year Check
  const copyMatch = html.match(/(?:©|&copy;|Copyright)\s*(?:20\d{2}\s*[-–]\s*)?(20\d{2})/i);
  if (copyMatch && parseInt(copyMatch[1]) < 2025) {
    issues.push(`Outdated Copyright (© ${copyMatch[1]})`);
    score -= 15;
  } else if (copyMatch) {
    wins.push(`Fresh Copyright (© ${copyMatch[1]})`);
  }

  // 2. Mobile Speed Check
  const loadSec = (loadTimeMs / 1000).toFixed(2);
  if (loadTimeMs > 4000) {
    issues.push(`Slow Load Time (${loadSec}s)`);
    score -= 15;
  } else if (loadTimeMs > 2000) {
    issues.push(`Moderate Speed Latency (${loadSec}s)`);
    score -= 8;
  } else {
    wins.push(`Fast TTFB Response (${loadSec}s)`);
  }

  // 3. AI-SEO & Schema Check
  const hasSchema = html.includes('application/ld+json');
  const hasH1 = /<h1[^>]*>/i.test(html);
  if (!hasSchema) {
    issues.push('Missing Schema.org JSON-LD (Invisible to ChatGPT & Google AI)');
    score -= 10;
  } else {
    wins.push('Structured Schema.org Active');
  }

  if (!hasH1) {
    issues.push('Missing Semantic <h1> Tag');
    score -= 5;
  }

  // 4. WhatsApp Integration Check
  const hasWhatsApp = html.includes('wa.me') || html.includes('api.whatsapp.com') || html.includes('whatsapp');
  if (!hasWhatsApp) {
    issues.push('Missing Direct WhatsApp Quick-Chat CTA');
    score -= 15;
  } else {
    wins.push('Direct WhatsApp CTA Integrated');
  }

  // 5. OpenGraph Social Cards Check
  const hasOgImage = html.includes('property="og:image"') || html.includes("property='og:image'");
  if (!hasOgImage) {
    issues.push('Broken WhatsApp Link Preview (Missing og:image)');
    score -= 10;
  } else {
    wins.push('Rich OpenGraph Social Cards Configured');
  }

  // 6. Viewport Check
  const hasViewport = html.includes('name="viewport"');
  if (!hasViewport) {
    issues.push('Missing Mobile Viewport Meta Tag');
    score -= 10;
  } else {
    wins.push('Mobile Viewport Active');
  }

  const finalScore = Math.max(0, score);
  let verdictTag = "🟢 HIGH PERFORMANCE";
  let flickPitchOffer = "Performance Ads & 4K Video Creative Retainer (AED 15,000 - 25,000/mo)";

  if (finalScore < 65) {
    verdictTag = "🔴 PRIME REDESIGN CANDIDATE";
    flickPitchOffer = "Complete Web Redesign & AI-SEO Glow-Up (AED 25,000 - 45,000 Upfront)";
  } else if (finalScore < 80) {
    verdictTag = "🟡 CONVERSION OPTIMIZATION CANDIDATE";
    flickPitchOffer = "Speed Optimization & WhatsApp Conversion Setup (AED 12,000 - 18,000)";
  }

  return {
    ...item,
    reachable: true,
    loadTimeSeconds: loadSec,
    freshnessScore: finalScore,
    verdictTag,
    criticalIssues: issues,
    positiveWins: wins,
    flickPitchOffer
  };
}

async function runRatingAuditor() {
  console.log('========================================================================');
  console.log('  📊 FLICK STUDIO — RATING-BASED LEAD AUDIT & EXTRACTION ENGINE');
  console.log('  🎯 Focus: Live 8-Vector Health Audit on Dubai Commercial Leads');
  console.log('========================================================================\n');

  const results = [];

  for (let i = 0; i < AUDIT_DOMAINS_POOL.length; i++) {
    const item = AUDIT_DOMAINS_POOL[i];
    process.stdout.write(`[${i + 1}/${AUDIT_DOMAINS_POOL.length}] Auditing live domain: ${item.url}... `);
    const audited = await auditDomain(item);
    results.push(audited);
    console.log(`✓ Score: ${audited.freshnessScore}/100 [${audited.verdictTag}]`);
  }

  // 1. Export CSV
  const csvHeader = 'Company Name,Category,Website URL,Phone / WhatsApp,Email Address,Office Location,Health Score (0-100),Audit Verdict,Key Issues Detected,Flick Recommended Pitch Offer\n';
  const csvRows = results.map(r => {
    return [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.url}"`,
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${r.location}"`,
      `"${r.freshnessScore}"`,
      `"${r.verdictTag}"`,
      `"${r.criticalIssues.join(' | ').replace(/"/g, '""')}"`,
      `"${r.flickPitchOffer.replace(/"/g, '""')}"`
    ].join(',');
  }).join('\n');

  const csvPath = path.join(process.cwd(), 'rated_dubai_leads_with_audits.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');

  // 2. Export JSON
  const jsonPath = path.join(process.cwd(), 'rated_dubai_leads_with_audits.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n========================================================================');
  console.log('  🎉 RATING AUDIT COMPLETE — FILES EXPORTED');
  console.log('========================================================================');
  console.log(`📄 CSV Database:  ${csvPath}`);
  console.log(`💾 JSON Database: ${jsonPath}\n`);

  console.log('--- SAMPLE RATED AUDIT RESULTS PREVIEW ---');
  results.slice(0, 5).forEach((r, idx) => {
    console.log(`\n[#${idx + 1}] ${r.name}`);
    console.log(`     Score:       ${r.freshnessScore}/100 (${r.verdictTag})`);
    console.log(`     Speed:       ${r.loadTimeSeconds}s`);
    console.log(`     Issues:      ${r.criticalIssues.join(' | ')}`);
    console.log(`     Flick Offer: ${r.flickPitchOffer}`);
  });
}

runRatingAuditor().catch(console.error);
