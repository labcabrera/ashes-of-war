/**
 * Sets every unit game resilience value to the configured baseline.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const targetResilience = 3;
const checkOnly = process.argv.includes('--check');
const unitCataloguePath = path.join(rootDir, 'src/data/units/units.json');
const dataRoots = [
  path.join(rootDir, 'src/data/vehicles'),
  path.join(rootDir, 'src/data/towed'),
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function jsonFilesUnder(dirPath) {
  const files = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...jsonFilesUnder(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function setResilience(profile, filePath, fieldPath) {
  if (!profile || typeof profile !== 'object') {
    throw new Error(`${path.relative(rootDir, filePath)} ${fieldPath} must be an object.`);
  }
  if (profile.resilience === targetResilience) {
    return false;
  }
  profile.resilience = targetResilience;
  return true;
}

function updateUnitCatalogue(filePath) {
  const catalogue = readJson(filePath);
  let changed = false;
  for (const [index, unit] of catalogue.units.entries()) {
    changed = setResilience(unit, filePath, `units[${index}]`) || changed;
  }
  if (changed && !checkOnly) {
    writeJson(filePath, catalogue);
  }
  return changed;
}

function updatePerFileUnit(filePath) {
  const entry = readJson(filePath);
  const changed = setResilience(entry.game, filePath, 'game');
  if (changed && !checkOnly) {
    writeJson(filePath, entry);
  }
  return changed;
}

const changedFiles = [];
if (updateUnitCatalogue(unitCataloguePath)) {
  changedFiles.push(unitCataloguePath);
}
for (const filePath of dataRoots.flatMap(jsonFilesUnder)) {
  if (updatePerFileUnit(filePath)) {
    changedFiles.push(filePath);
  }
}

if (checkOnly && changedFiles.length > 0) {
  console.error(`Unit resilience must be ${targetResilience} in ${changedFiles.length} file(s).`);
  process.exit(1);
}

console.log(`Set unit resilience to ${targetResilience} in ${changedFiles.length} file(s).`);
