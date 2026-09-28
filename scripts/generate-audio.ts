/**
 * Generates pronunciation audio for the cards in one or more deck files
 * using the ElevenLabs text-to-speech API and stores the mp3s under
 * audio-cache/{lang}/{voiceId}/{name}.mp3, recording each in
 * audio-cache/manifest.json. Changing a language's voice therefore
 * starts a fresh directory and never overwrites earlier recordings.
 *
 * Usage:
 *   npm run audio -- public/wordfiles/es/17_Anatomy.json [more files...]
 *   npm run audio -- --lang es some/other/path.json
 *   npm run audio -- --dry-run public/wordfiles/es/17_Anatomy.json
 *
 * The language is taken from the parent directory of each file unless
 * --lang is given. Entries already present on disk and in the manifest
 * are skipped, so rerunning is cheap and only voices new words.
 *
 * Requires ELEVENLABS_API_KEY in the environment or in a .env file.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioFilePath, deriveVoicedTexts } from '../src/service/AudioNaming.ts';
import type { Lesson } from '../src/model/Lesson.ts';

// ---------------------------------------------------------------- types

interface VoiceConfig {
  voiceId: string;
  modelId: string;
  outputFormat: string;
}

interface ManifestEntry {
  text: string;
  file: string;
}

interface Manifest {
  version: 1;
  voices: Record<string, VoiceConfig>;
  entries: Record<string, Record<string, ManifestEntry[]>>;
}

interface Options {
  files: string[];
  lang?: string;
  dryRun: boolean;
}

// ---------------------------------------------------------------- paths

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_ROOT = join(REPO_ROOT, 'audio-cache');
const MANIFEST_PATH = join(AUDIO_ROOT, 'manifest.json');
const VOICES_PATH = join(REPO_ROOT, 'scripts', 'audio-voices.json');
const ELEVENLABS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// ---------------------------------------------------------------- cli

function parseArgs(argv: string[]): Options {
  const options: Options = { files: [], dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--lang') {
      options.lang = argv[++i];
      if (!options.lang) fail('--lang needs a value');
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--')) {
      fail(`Unknown option ${arg}`);
    } else {
      options.files.push(arg);
    }
  }
  if (options.files.length === 0) {
    fail('Usage: generate-audio.ts [--lang xx] [--dry-run] <deck.json> [more decks...]');
  }
  return options;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function loadDotEnv(): void {
  const envPath = join(REPO_ROOT, '.env');
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

// ---------------------------------------------------------------- io

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function loadManifest(): Manifest {
  if (existsSync(MANIFEST_PATH)) {
    return readJson<Manifest>(MANIFEST_PATH);
  }
  return { version: 1, voices: {}, entries: {} };
}

function saveManifest(manifest: Manifest): void {
  mkdirSync(AUDIO_ROOT, { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

function langFromPath(file: string): string {
  const lang = basename(dirname(resolve(file)));
  if (!/^[a-z]{2,3}$/.test(lang)) {
    fail(`Cannot infer language from path "${file}"; pass --lang`);
  }
  return lang;
}

// ---------------------------------------------------------------- tts

/**
 * `lang` is passed as ISO 639-1 `language_code` so single words are not
 * mis-detected; models that do not support it ignore the field.
 */
async function synthesize(text: string, lang: string, voice: VoiceConfig, apiKey: string): Promise<Buffer> {
  const url = `${ELEVENLABS_URL}/${voice.voiceId}?output_format=${voice.outputFormat}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({ text, model_id: voice.modelId, language_code: lang }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs ${response.status} for "${text}": ${detail}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// ---------------------------------------------------------------- main

interface Counters {
  generated: number;
  skipped: number;
  errors: number;
}

async function processDeck(
  file: string,
  lang: string,
  voice: VoiceConfig,
  manifest: Manifest,
  options: Options,
  apiKey: string,
  counters: Counters,
): Promise<void> {
  const lesson = readJson<Lesson>(file);
  const langEntries = (manifest.entries[lang] ??= {});
  // Detects two different texts collapsing onto one file name within this run.
  const claimedNames = new Map<string, string>();

  console.log(`\n${lesson.name} (${lang}, ${lesson.cards.length} cards) <- ${file}`);

  for (const card of lesson.cards) {
    const texts = deriveVoicedTexts(card.word);
    const entries: ManifestEntry[] = [];

    for (const text of texts) {
      const relPath = audioFilePath(lang, voice.voiceId, text);
      const absPath = join(AUDIO_ROOT, relPath);

      const previousOwner = claimedNames.get(relPath);
      if (previousOwner !== undefined && previousOwner !== text) {
        fail(`Name collision: "${previousOwner}" and "${text}" both map to ${relPath}`);
      }
      claimedNames.set(relPath, text);
      entries.push({ text, file: relPath });

      const alreadyRecorded = langEntries[card.word]?.some((e) => e.file === relPath) ?? false;
      if (alreadyRecorded && existsSync(absPath)) {
        counters.skipped++;
        continue;
      }

      if (options.dryRun) {
        console.log(`  would generate  ${relPath}  <- "${text}"`);
        counters.generated++;
        continue;
      }

      try {
        const audio = await synthesize(text, lang, voice, apiKey);
        mkdirSync(dirname(absPath), { recursive: true });
        writeFileSync(absPath, audio);
        console.log(`  generated  ${relPath}  <- "${text}"  (${audio.length} bytes)`);
        counters.generated++;
      } catch (error) {
        console.error(`  ERROR  ${relPath}: ${(error as Error).message}`);
        counters.errors++;
      }
    }

    // Only record entries whose files actually exist, so a failed call
    // is retried on the next run instead of being marked done.
    const existing = entries.filter((e) => options.dryRun || existsSync(join(AUDIO_ROOT, e.file)));
    if (existing.length > 0 && !options.dryRun) {
      langEntries[card.word] = existing;
      saveManifest(manifest);
    }
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  loadDotEnv();

  const apiKey = process.env.ELEVENLABS_API_KEY ?? '';
  if (!apiKey && !options.dryRun) {
    fail('ELEVENLABS_API_KEY is not set (put it in .env or the environment)');
  }

  const voices = readJson<Record<string, VoiceConfig>>(VOICES_PATH);
  const manifest = loadManifest();
  const counters: Counters = { generated: 0, skipped: 0, errors: 0 };

  for (const file of options.files) {
    if (!existsSync(file)) fail(`File not found: ${file}`);
    const lang = options.lang ?? langFromPath(file);
    const voice = voices[lang];
    if (!voice) fail(`No voice configured for language "${lang}" in ${VOICES_PATH}`);

    manifest.voices[lang] = voice;
    await processDeck(file, lang, voice, manifest, options, apiKey, counters);
  }

  if (!options.dryRun) saveManifest(manifest);

  const verb = options.dryRun ? 'would generate' : 'generated';
  console.log(`\nDone: ${counters.generated} ${verb}, ${counters.skipped} skipped, ${counters.errors} errors`);
  if (counters.errors > 0) process.exit(1);
}

main().catch((error) => fail(String(error)));
