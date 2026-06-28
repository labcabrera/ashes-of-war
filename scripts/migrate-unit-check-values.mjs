/**
 * Migrates unit profile check values from string notation ("4+") to numeric values (4).
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const dryRun = process.argv.includes('--check');
const dataRoots = [
  path.join(rootDir, 'src/data/vehicles'),
  path.join(rootDir, 'src/data/towed'),
];
const unitCataloguePath = path.join(rootDir, 'src/data/units/units.json');

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

function convertProfileValue(value, filePath, fieldPath) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && /^\d+\+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  throw new Error(`${path.relative(rootDir, filePath)} ${fieldPath} must be a number or N+ string.`);
}

function migrateProfile(profile, filePath, fieldPrefix) {
  let changed = false;
  for (const field of ['recover', 'morale']) {
    if (profile[field] === undefined) {
      continue;
    }
    const next = convertProfileValue(profile[field], filePath, `${fieldPrefix}.${field}`);
    if (next !== profile[field]) {
      profile[field] = next;
      changed = true;
    }
  }
  return changed;
}

function migrateUnitCatalogue(filePath) {
  const catalogue = readJson(filePath);
  let changed = false;
  for (const [index, unit] of catalogue.units.entries()) {
    changed = migrateProfile(unit, filePath, `units[${index}]`) || changed;
  }
  if (changed && !dryRun) {
    writeJson(filePath, catalogue);
  }
  return changed;
}

function migrateEntry(filePath) {
  const entry = readJson(filePath);
  const changed = migrateProfile(entry.game, filePath, 'game');
  if (changed && !dryRun) {
    writeJson(filePath, entry);
  }
  return changed;
}

const changedFiles = [];
if (migrateUnitCatalogue(unitCataloguePath)) {
  changedFiles.push(unitCataloguePath);
}
for (const filePath of dataRoots.flatMap(jsonFilesUnder)) {
  if (migrateEntry(filePath)) {
    changedFiles.push(filePath);
  }
}

if (dryRun && changedFiles.length > 0) {
  console.error(`Unit check values need migration in ${changedFiles.length} file(s).`);
  process.exit(1);
}

console.log(`Migrated unit check values in ${changedFiles.length} file(s).`);
