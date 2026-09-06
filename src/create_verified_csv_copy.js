import fs from 'fs';
import path from 'path';

const flickDir = process.cwd();
const masterCsvPath = path.join(flickDir, 'Flick_Leads_Master.csv');
const verifiedCsvPath = path.join(flickDir, 'Flick_Leads_Verified.csv');
const content = fs.readFileSync(masterCsvPath, 'utf-8');

fs.writeFileSync(verifiedCsvPath, content, 'utf-8');
console.log(`✓ Created unlocked duplicate: ${verifiedCsvPath}`);
