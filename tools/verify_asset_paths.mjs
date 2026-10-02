import fs from 'fs';
import path from 'path';

const distAssets = path.resolve('dist/assets');
const jsFiles = fs.readdirSync(distAssets).filter(f => f.endsWith('.js'));

let allClean = true;

for (const f of jsFiles) {
  const content = fs.readFileSync(path.join(distAssets, f), 'utf8');
  // Check for any absolute image paths like '/player_anime.png'
  const badMatches = content.match(/['"`]\/[a-zA-Z0-9_\-]+\.(?:png|jpg|jpeg)['"`]/g) || [];
  if (badMatches.length > 0) {
    console.error(`FAIL: Found ${badMatches.length} absolute image path(s) in ${f}:`, badMatches);
    allClean = false;
  } else {
    console.log(`PASS: 0 absolute image paths in ${f}`);
  }

  // Count relative image paths
  const relativeMatches = content.match(/\.\/[a-zA-Z0-9_\-]+\.(?:png|jpg|jpeg)/g) || [];
  console.log(`INFO: Found ${relativeMatches.length} relative image paths (./*.png) in ${f}`);
}

if (!allClean) {
  process.exit(1);
} else {
  console.log('ALL DIST ASSET PATHS ARE RELATIVE AND CLEAN FOR DESKTOP!');
}
