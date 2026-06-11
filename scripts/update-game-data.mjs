#!/usr/bin/env node
/**
 * Recalculate derived game fields from historical catalogue data.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { updateGameDataFromHistorical } from '../node_modules/.tmp/game-data-conversions/utils/conversions.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogueRoots = [
  path.join(repoRoot, 'src/data/vehicles'),
  path.join(repoRoot, 'src/data/towed'),
];
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run') || args.has('--check');
const check = args.has('--check');

async function main() {
  const files = (await Promise.all(catalogueRoots.map((root) => collectJsonFiles(root)))).flat();
  const changedFiles = [];

  for (const file of files) {
    const original = await readFile(file, 'utf8');
    const entry = JSON.parse(original);
    const updated = updateGameDataFromHistorical(entry);
    const currentCanonical = JSON.stringify(entry);
    const nextCanonical = JSON.stringify(updated);
    const next = `${JSON.stringify(updated, null, 2)}\n`;

    if (nextCanonical !== currentCanonical) {
      changedFiles.push(path.relative(repoRoot, file));
      if (!dryRun) {
        await writeFile(file, next, 'utf8');
      }
    }
  }

  if (changedFiles.length === 0) {
    console.log('Game data is already up to date.');
    return;
  }

  const action = dryRun ? 'would update' : 'updated';
  console.log(`Game data ${action} ${changedFiles.length} file(s):`);
  for (const file of changedFiles) {
    console.log(`- ${file}`);
  }

  if (check) {
    process.exitCode = 1;
  }
}

async function collectJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectJsonFiles(entryPath);
      if (entry.isFile() && entry.name.endsWith('.json')) return [entryPath];
      return [];
    }),
  );
  return nested.flat().sort();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
