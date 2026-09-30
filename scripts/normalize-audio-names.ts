/**
 * Renames every file and directory under audio-cache/ whose name is not in
 * Unicode NFC (composed) form, so that names on disk match the manifest and
 * the URLs the app requests byte for byte.
 *
 * Why: the generation script writes NFC names, but files that pass through
 * an HFS+ volume or certain copy tools come back decomposed (NFD). macOS
 * hides the difference when opening files; Azure Blob Storage compares
 * bytes, so a decomposed blob name is a 404 for the app. This runs before
 * every `npm run audio:sync`. It also removes Finder's .DS_Store files so
 * they are never uploaded.
 *
 * Usage: npm run audio:normalize   (or via audio:sync)
 */

import { readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AUDIO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'audio-cache');

let renamed = 0;
let removed = 0;

function normalizeDir(dir: string): void {
  for (const name of readdirSync(dir)) {
    let current = join(dir, name);
    if (name === '.DS_Store') {
      rmSync(current);
      console.log(`removed  ${current.slice(AUDIO_ROOT.length + 1)}`);
      removed++;
      continue;
    }
    const nfc = name.normalize('NFC');
    if (nfc !== name) {
      const target = join(dir, nfc);
      renameSync(current, target);
      console.log(`renamed  ${current.slice(AUDIO_ROOT.length + 1)}  ->  NFC`);
      current = target;
      renamed++;
    }
    if (statSync(current).isDirectory()) {
      normalizeDir(current);
    }
  }
}

try {
  normalizeDir(AUDIO_ROOT);
} catch (e) {
  if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
    console.log(`No ${AUDIO_ROOT} directory; nothing to normalize`);
  } else {
    throw e;
  }
}
console.log(`${renamed} name(s) renamed to NFC, ${removed} .DS_Store file(s) removed`);
