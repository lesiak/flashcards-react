/**
 * Generates pronunciation audio for the cards in one or more deck files
 * using the ElevenLabs text-to-speech API and stores the mp3s under
 * audio-cache/{lang}/{group}/{voiceId}/{name}.mp3, recording each in
 * audio-cache/{lang}/{group}/manifest.json keyed by the voiced text. The
 * group is the deck group folder (words, a1), so each group keeps its own
 * clips. Changing a language's voice starts a fresh directory and never
 * overwrites earlier recordings.
 *
 * A clip whose file already exists on disk is reused without a TTS call
 * even if the manifest does not list it, so rewording a card's marks or
 * alternatives never re-voices what was already recorded.
 *
 * Usage:
 *   npm run audio -- public/wordfiles/es/words/17_Anatomy.json [more files...]
 *   npm run audio -- --lang es --group words some/other/path.json
 *   npm run audio -- --dry-run public/wordfiles/es/a1/A1_Level_Part1.json
 *
 * The language and group are taken from the two parent directories of
 * each file (.../{lang}/{group}/{deck}.json) unless --lang and --group are
 * given. Entries already present on disk and in the manifest are skipped,
 * so rerunning is cheap and only voices new words.
 *
 * Requires ELEVENLABS_API_KEY in the environment or in a .env file.
 *
 * Afterwards, `npm run audio:sync` uploads audio-cache/ to the private
 * "pronunciations" container of the flashcardsresources storage account
 * (needs the Azure CLI and `az login`). Only new or changed files are
 * uploaded. The script passes --delete-destination false on purpose:
 * `az storage blob sync` mirrors by default and would otherwise delete
 * every blob missing from the local directory, which is only a partial
 * cache on most machines.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioFilePath, deriveVoicedTexts } from '../src/service/AudioNaming.ts';
import type { Lesson } from '../src/model/Lesson.ts';
import type { AudioManifest as Manifest, VoiceConfig } from '../src/model/AudioManifest.ts';

// ---------------------------------------------------------------- types

interface Options {
  files: string[];
  lang?: string;
  group?: string;
  dryRun: boolean;
}

// ---------------------------------------------------------------- paths

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_ROOT = join(REPO_ROOT, 'audio-cache');
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
    } else if (arg === '--group') {
      options.group = argv[++i];
      if (!options.group) fail('--group needs a value');
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--')) {
      fail(`Unknown option ${arg}`);
    } else {
      options.files.push(arg);
    }
  }
  if (options.files.length === 0) {
    fail('Usage: generate-audio.ts [--lang xx] [--group words] [--dry-run] <deck.json> [more decks...]');
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

function manifestPath(lang: string, group: string): string {
  return join(AUDIO_ROOT, lang, group, 'manifest.json');
}

function loadManifest(lang: string, group: string, voice: VoiceConfig): Manifest {
  const path = manifestPath(lang, group);
  if (existsSync(path)) {
    const manifest = readJson<Manifest>(path);
    if (manifest.version !== 3) {
      fail(`${path} is a version ${manifest.version} manifest; expected version 3 (clips keyed by voiced text)`);
    }
    manifest.voice = voice;
    return manifest;
  }
  return { version: 3, lang, group, voice, clips: {} };
}

function saveManifest(manifest: Manifest): void {
  const path = manifestPath(manifest.lang, manifest.group);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
}

/** .../{lang}/{group}/{deck}.json -> lang and group. */
function langAndGroupFromPath(file: string): { lang: string; group: string } {
  const groupDir = dirname(resolve(file));
  const group = basename(groupDir);
  const lang = basename(dirname(groupDir));
  if (!/^[a-z]{2,3}$/.test(lang) || !/^[a-z0-9_-]+$/i.test(group)) {
    fail(`Cannot infer language and group from path "${file}"; pass --lang and --group`);
  }
  return { lang, group };
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
  manifest: Manifest,
  options: Options,
  apiKey: string,
  counters: Counters,
): Promise<void> {
  const { lang, group, voice, clips } = manifest;
  const lesson = readJson<Lesson>(file);
  // Every file the manifest already uses, so a new text that would collapse
  // onto the recording of a different text is refused.
  const ownerOfFile = new Map<string, string>();
  for (const [text, clipFile] of Object.entries(clips)) ownerOfFile.set(clipFile, text);

  console.log(`\n${lesson.name} (${lang}/${group}, ${lesson.cards.length} cards) <- ${file}`);

  for (const card of lesson.cards) {
    for (const text of deriveVoicedTexts(card.word)) {
      const relPath = audioFilePath(lang, group, voice.voiceId, text);
      const absPath = join(AUDIO_ROOT, relPath);

      const owner = ownerOfFile.get(relPath);
      if (owner !== undefined && owner !== text) {
        fail(`Name collision: "${owner}" and "${text}" both map to ${relPath}`);
      }
      ownerOfFile.set(relPath, text);

      if (existsSync(absPath)) {
        // Recorded earlier, possibly under a card that has since been reworded.
        if (clips[text] !== relPath && !options.dryRun) {
          clips[text] = relPath;
          saveManifest(manifest);
        }
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
        // Recorded only once the file is on disk, so a failed call is retried next run.
        clips[text] = relPath;
        saveManifest(manifest);
        console.log(`  generated  ${relPath}  <- "${text}"  (${audio.length} bytes)`);
        counters.generated++;
      } catch (error) {
        console.error(`  ERROR  ${relPath}: ${(error as Error).message}`);
        counters.errors++;
      }
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
  const manifests = new Map<string, Manifest>();
  const counters: Counters = { generated: 0, skipped: 0, errors: 0 };

  for (const file of options.files) {
    if (!existsSync(file)) fail(`File not found: ${file}`);
    const inferred = options.lang && options.group ? null : langAndGroupFromPath(file);
    const lang = options.lang ?? inferred!.lang;
    const group = options.group ?? inferred!.group;
    const voice = voices[lang];
    if (!voice) fail(`No voice configured for language "${lang}" in ${VOICES_PATH}`);

    const key = `${lang}/${group}`;
    let manifest = manifests.get(key);
    if (!manifest) {
      manifest = loadManifest(lang, group, voice);
      manifests.set(key, manifest);
    }
    await processDeck(file, manifest, options, apiKey, counters);
  }

  if (!options.dryRun) {
    for (const manifest of manifests.values()) saveManifest(manifest);
  }

  const verb = options.dryRun ? 'would generate' : 'generated';
  console.log(`\nDone: ${counters.generated} ${verb}, ${counters.skipped} skipped, ${counters.errors} errors`);
  if (counters.errors > 0) process.exit(1);
}

main().catch((error) => fail(String(error)));
