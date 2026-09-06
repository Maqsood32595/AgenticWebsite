import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// FRACTAL KERNEL — MANIFEST-DRIVEN FEATURE AUTO-DISCOVERY
// Discovers features/*, loads feature.manifest.json, mounts isolated routers
// ============================================================================

export async function bootstrapKernel(app, db) {
  const featuresDir = path.join(__dirname, 'features');
  const mountedFeatures = [];

  if (!fs.existsSync(featuresDir)) {
    console.warn('⚠️ [KERNEL] No features directory found at:', featuresDir);
    return mountedFeatures;
  }

  const entries = fs.readdirSync(featuresDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const featurePath = path.join(featuresDir, entry.name);
    const manifestFile = path.join(featurePath, 'feature.manifest.json');
    const routesFile = path.join(featurePath, 'routes.js');

    if (!fs.existsSync(manifestFile)) {
      console.warn(`⚠️ [KERNEL] Skipping ${entry.name}: Missing feature.manifest.json`);
      continue;
    }

    try {
      const manifestRaw = fs.readFileSync(manifestFile, 'utf8');
      const manifest = JSON.parse(manifestRaw);

      if (!manifest.id || !manifest.prefix) {
        console.warn(`⚠️ [KERNEL] Invalid manifest in ${entry.name}: Missing id or prefix`);
        continue;
      }

      if (fs.existsSync(routesFile)) {
        const routeModuleUrl = new URL(`features/${entry.name}/routes.js`, import.meta.url).href;
        const routeModule = await import(routeModuleUrl);

        if (typeof routeModule.registerRoutes === 'function') {
          const router = routeModule.registerRoutes(db, manifest);
          app.use(manifest.prefix, router);

          mountedFeatures.push({
            id: manifest.id,
            name: manifest.name,
            version: manifest.version,
            prefix: manifest.prefix,
            capabilities: manifest.capabilities || []
          });

          console.log(`🌀 [KERNEL] Feature Mounted: ${manifest.name} (v${manifest.version}) -> ${manifest.prefix}`);
        }
      }
    } catch (err) {
      console.error(`❌ [KERNEL] Failed to mount feature ${entry.name}:`, err.message);
    }
  }

  return mountedFeatures;
}
