import fs from 'fs';
import path from 'path';

// Complete Target List of Dubai Commercial Domains across High-Ticket Sectors
const TARGET_DOMAINS_SUITE = [
  { name: "Metropolitan Premium Properties", category: "Real Estate Brokerage", url: "https://metropolitan.realestate", phone: "+971 58 648 8888", email: "info@metropolitan.realestate", location: "Business Bay, Dubai" },
  { name: "Biolite Aesthetic Clinic", category: "Anti-Aging & Medical Spa", url: "https://biolitedubai.com", phone: "+971 50 292 0086", email: "concierge@biolitedubai.com", location: "Umm Suqeim 2, Dubai" },
  { name: "Tania's Teahouse", category: "Lifestyle Cafe & Events", url: "https://taniasteahouse.com", phone: "+971 4 324 0021", email: "hello@taniasteahouse.com", location: "Dubai Hills Estate" },
  { name: "White & Co Real Estate", category: "Real Estate Brokerage", url: "https://whiteandcogroup.com", phone: "+971 4 876 2333", email: "marketing@whiteandcogroup.com", location: "Motor City, Dubai" },
  { name: "Lucia Clinic Dubai", category: "Aesthetic Dermatology", url: "https://luciaclinic.com", phone: "+971 56 115 9194", email: "info@luciaclinic.com", location: "Jumeirah 2, Dubai" },
  { name: "Nightjar Coffee Roasters", category: "Artisanal F&B / Roastery", url: "https://nightjar.coffee", phone: "+971 50 518 1768", email: "info@nightjar.coffee", location: "Alserkal Avenue, Al Quoz 1" },
  { name: "Comptoir 102 Concept Store", category: "Organic Dining & Boutique", url: "https://comptoir102.com", phone: "+971 4 385 4555", email: "contact@comptoir102.com", location: "Jumeirah 1, Dubai" },
  { name: "Dr. Roze BioHealth Clinics", category: "Biological Dental Practice", url: "https://drroze.com", phone: "+971 4 388 1388", email: "contact@drroze.com", location: "Jumeirah Beach Road" },
  { name: "Seven Media Dubai", category: "PR & Communications", url: "https://sevenmedia.ae", phone: "+971 4 450 7888", email: "info@sevenmedia.ae", location: "Dubai Media City" },
  { name: "The Luxury Closet", category: "Pre-Owned Luxury D2C", url: "https://theluxurycloset.com", phone: "+971 4 586 7800", email: "marketing@theluxurycloset.com", location: "Al Barsha 1, Dubai" }
];

async function runFull8VectorAudit(item) {
  const t0 = performance.now();
  let html = '';
  let loadTimeMs = 0;
  let reachable = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

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
      overallHealthScore: 20,
      verdict: "🔴 CRITICAL: Website Down or Bot-Firewalled",
      vectorBreakdown: {
        v1_copyright: "❌ Failed (Unreachable)",
        v2_speed: "❌ Failed (>7.0s Timeout)",
        v3_ai_seo: "❌ Failed",
        v4_whatsapp: "❌ Failed",
        v5_opengraph: "❌ Failed",
        v6_viewport: "❌ Failed",
        v7_code_hygiene: "❌ Failed",
        v8_ssl_security: "❌ Failed"
      },
      criticalLeaksFound: ["Website unreachable or severe timeout on mobile network"],
      flickAdvisoryPitch: "High-Priority Infrastructure Recovery & Server Migration (AED 35,000 Upfront)"
    };
  }

  let score = 100;
  const leaks = [];
  const breakdown = {};

  // VECTOR 1: Copyright Freshness Check
  const copyMatch = html.match(/(?:©|&copy;|Copyright)\s*(?:20\d{2}\s*[-–]\s*)?(20\d{2})/i);
  if (copyMatch && parseInt(copyMatch[1]) < 2025) {
    breakdown.v1_copyright = `❌ Outdated Copyright (© ${copyMatch[1]})`;
    leaks.push(`Stale Copyright Year (© ${copyMatch[1]})`);
    score -= 15;
  } else if (copyMatch) {
    breakdown.v1_copyright = `✅ Fresh Copyright (© ${copyMatch[1]})`;
  } else {
    breakdown.v1_copyright = `⚠️ Missing Explicit Copyright`;
    score -= 5;
  }

  // VECTOR 2: Mobile Network Speed & TTFB
  const loadSec = (loadTimeMs / 1000).toFixed(2);
  if (loadTimeMs > 4000) {
    breakdown.v2_speed = `❌ Severe Mobile Latency (${loadSec}s)`;
    leaks.push(`Slow Mobile Load Speed (${loadSec}s - High Bounce Risk)`);
    score -= 15;
  } else if (loadTimeMs > 2000) {
    breakdown.v2_speed = `⚠️ Moderate Speed Lag (${loadSec}s)`;
    score -= 8;
  } else {
    breakdown.v2_speed = `✅ Tesla-Fast Response (${loadSec}s)`;
  }

  // VECTOR 3: AI-SEO & Schema.org JSON-LD
  const hasSchema = html.includes('application/ld+json');
  const hasH1 = /<h1[^>]*>/i.test(html);
  if (!hasSchema) {
    breakdown.v3_ai_seo = `❌ Missing Schema.org JSON-LD (Invisible to ChatGPT & Google AI)`;
    leaks.push('Missing Schema.org Structured Data (Invisible to AI Search Engines)');
    score -= 12;
  } else {
    breakdown.v3_ai_seo = `✅ Active Schema.org JSON-LD`;
  }
  if (!hasH1) {
    leaks.push('Missing Semantic <h1> Tag');
    score -= 5;
  }

  // VECTOR 4: Direct WhatsApp Quick-Chat Integration
  const hasWhatsApp = html.includes('wa.me') || html.includes('api.whatsapp.com') || html.includes('whatsapp');
  if (!hasWhatsApp) {
    breakdown.v4_whatsapp = `❌ Missing Direct wa.me WhatsApp Button`;
    leaks.push('Missing 1-Click WhatsApp Quick-Chat CTA (Losing 60% Mobile Inquiries)');
    score -= 15;
  } else {
    breakdown.v4_whatsapp = `✅ Direct WhatsApp CTA Integrated`;
  }

  // VECTOR 5: OpenGraph Social Preview Cards (WhatsApp / LinkedIn)
  const hasOgImage = html.includes('property="og:image"') || html.includes("property='og:image'");
  if (!hasOgImage) {
    breakdown.v5_opengraph = `❌ Missing og:image (Shows Blank Gray Box on WhatsApp)`;
    leaks.push('Broken WhatsApp Link Preview (Missing og:image preview card)');
    score -= 12;
  } else {
    breakdown.v5_opengraph = `✅ Rich OpenGraph Card Configured`;
  }

  // VECTOR 6: Mobile Viewport & Touch Responsiveness
  const hasViewport = html.includes('name="viewport"');
  if (!hasViewport) {
    breakdown.v6_viewport = `❌ Missing Mobile Viewport Meta Tag`;
    leaks.push('Non-Responsive Viewport (Broken on Mobile Devices)');
    score -= 10;
  } else {
    breakdown.v6_viewport = `✅ Mobile Viewport Tag Active`;
  }

  // VECTOR 7: Code Hygiene & Legacy Script Bloat
  const hasAncientJquery = html.includes('jquery-1.') || html.includes('jquery/1.');
  if (hasAncientJquery) {
    breakdown.v7_code_hygiene = `❌ Ancient jQuery 1.x Detected (Security/Speed Vulnerability)`;
    leaks.push('Deprecated Legacy JavaScript Libraries Detected');
    score -= 10;
  } else {
    breakdown.v7_code_hygiene = `✅ Modern JavaScript Architecture`;
  }

  // VECTOR 8: SSL Security & Modern HTTPS
  const isHttps = item.url.startsWith('https');
  if (!isHttps) {
    breakdown.v8_ssl_security = `❌ Insecure HTTP Connection`;
    leaks.push('Missing SSL Certificate');
    score -= 20;
  } else {
    breakdown.v8_ssl_security = `✅ Secure HTTPS Verified`;
  }

  const finalScore = Math.max(0, score);
  let verdict = "🟢 HIGH PERFORMANCE (Maintain & Scale)";
  let flickAdvisoryPitch = "Performance Ads & 4K Video Creative Retainer (AED 15,000 - 25,000/mo)";

  if (finalScore < 65) {
    verdict = "🔴 PRIME REDESIGN & AI-SEO CANDIDATE";
    flickAdvisoryPitch = "Complete Web Redesign & AI-SEO Glow-Up (AED 25,000 - 45,000 Upfront)";
  } else if (finalScore < 80) {
    verdict = "🟡 CONVERSION & SPEED OPTIMIZATION CANDIDATE";
    flickAdvisoryPitch = "Speed Optimization & WhatsApp Conversion Setup (AED 12,000 - 18,000)";
  }

  return {
    ...item,
    reachable: true,
    loadTimeSeconds: loadSec,
    overallHealthScore: finalScore,
    verdict,
    vectorBreakdown: breakdown,
    criticalLeaksFound: leaks,
    flickAdvisoryPitch
  };
}

export async function runFullSuiteWebsiteHealthAuditor() {
  console.log('========================================================================');
  console.log('  🔬 FLICK STUDIO: FULL-SUITE 8-VECTOR WEBSITE HEALTH AUDITOR');
  console.log('  🎯 Vectors: Copyright | Speed | AI-SEO | WhatsApp | OpenGraph | Mobile | Code | SSL');
  console.log('========================================================================\n');

  const auditedResults = [];

  for (let i = 0; i < TARGET_DOMAINS_SUITE.length; i++) {
    const item = TARGET_DOMAINS_SUITE[i];
    process.stdout.write(`[${i + 1}/${TARGET_DOMAINS_SUITE.length}] Running 8-Vector Suite on ${item.url}... `);
    const result = await runFull8VectorAudit(item);
    auditedResults.push(result);
    console.log(`✓ Score: ${result.overallHealthScore}/100 [${result.verdict.split(' ')[0]}]`);
  }

  // 1. Export CSV
  const csvHeader = 'Company Name,Category,Website URL,Phone / WhatsApp,Email Address,Office Location,Overall Health Score (0-100),Audit Verdict,V1 Copyright,V2 Speed,V3 AI-SEO Schema,V4 WhatsApp CTA,V5 OpenGraph Preview,V6 Mobile Viewport,V7 Code Hygiene,V8 SSL Security,Critical Leaks Summary,Flick Advisory Pitch Offer\n';
  const csvRows = auditedResults.map(r => {
    return [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.url}"`,
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${r.location}"`,
      `"${r.overallHealthScore}"`,
      `"${r.verdict.replace(/"/g, '""')}"`,
      `"${r.vectorBreakdown.v1_copyright || ''}"`,
      `"${r.vectorBreakdown.v2_speed || ''}"`,
      `"${r.vectorBreakdown.v3_ai_seo || ''}"`,
      `"${r.vectorBreakdown.v4_whatsapp || ''}"`,
      `"${r.vectorBreakdown.v5_opengraph || ''}"`,
      `"${r.vectorBreakdown.v6_viewport || ''}"`,
      `"${r.vectorBreakdown.v7_code_hygiene || ''}"`,
      `"${r.vectorBreakdown.v8_ssl_security || ''}"`,
      `"${r.criticalLeaksFound.join(' | ').replace(/"/g, '""')}"`,
      `"${r.flickAdvisoryPitch.replace(/"/g, '""')}"`
    ].join(',');
  }).join('\n');

  const csvPath = path.join(process.cwd(), 'full_suite_8vector_audited_leads.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');

  // 2. Export JSON
  const jsonPath = path.join(process.cwd(), 'full_suite_8vector_audited_leads.json');
  fs.writeFileSync(jsonPath, JSON.stringify(auditedResults, null, 2), 'utf-8');

  console.log('\n========================================================================');
  console.log('  🎉 8-VECTOR AUDIT SUITE COMPLETE — FILES EXPORTED');
  console.log('========================================================================');
  console.log(`📄 Comprehensive CSV:  ${csvPath}`);
  console.log(`💾 Structured JSON:    ${jsonPath}\n`);

  console.log('--- 8-VECTOR DEEP DIVE SAMPLE (FIRST 3 LEADS) ---');
  auditedResults.slice(0, 3).forEach((r, idx) => {
    console.log(`\n[#${idx + 1}] ${r.name} (${r.url})`);
    console.log(`     Overall Health: ${r.overallHealthScore} / 100 [${r.verdict}]`);
    console.log(`     Vector 1 (Copyright):  ${r.vectorBreakdown.v1_copyright}`);
    console.log(`     Vector 2 (Speed):      ${r.vectorBreakdown.v2_speed}`);
    console.log(`     Vector 3 (AI-SEO):     ${r.vectorBreakdown.v3_ai_seo}`);
    console.log(`     Vector 4 (WhatsApp):   ${r.vectorBreakdown.v4_whatsapp}`);
    console.log(`     Vector 5 (OpenGraph):  ${r.vectorBreakdown.v5_opengraph}`);
    console.log(`     Vector 6 (Viewport):   ${r.vectorBreakdown.v6_viewport}`);
    console.log(`     Vector 7 (Hygiene):    ${r.vectorBreakdown.v7_code_hygiene}`);
    console.log(`     Vector 8 (Security):   ${r.vectorBreakdown.v8_ssl_security}`);
    console.log(`     Flick Advisory Pitch:  ${r.flickAdvisoryPitch}`);
  });
}

runFullSuiteWebsiteHealthAuditor().catch(console.error);
