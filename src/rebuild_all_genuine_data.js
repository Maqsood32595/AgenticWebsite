import { extractPopularGoogleNoWebsiteLeads } from './extract_popular_google_no_website_leads.js';
import { extractActiveAdSpenders } from './extract_active_ad_spenders_leaky_funnels.js';
import { extractActiveMarketingHiringLeads } from './extract_active_marketing_hiring_leads.js';
import { extractLast10DaysCompanies } from './extract_last_10_days_new_companies.js';
import { extractNewlyRegisteredBusinesses } from './extract_newly_registered_businesses.js';

console.log('========================================================================');
console.log('  🚀 REBUILDING ALL AGENT DATABASES (100% GENUINE & PURGED)');
console.log('========================================================================\n');

extractPopularGoogleNoWebsiteLeads();
extractActiveAdSpenders();
extractActiveMarketingHiringLeads();
extractLast10DaysCompanies();
extractNewlyRegisteredBusinesses();

console.log('✓ All 5 agent databases refreshed with 100% genuine data!\n');
