# Shared settings for the one-off move of the local pronunciation cache from
# audio-cache/<lang>/<voiceId>/ to audio-cache/<lang>/words/<voiceId>/ before
# it is re-uploaded (see README.md here). Sourced by the numbered step
# scripts; not meant to be run on its own.

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
AUDIO_CACHE="$REPO_ROOT/audio-cache"

# Prints one "lang voiceId" line per migrated manifest.
lang_voices() {
  node -e '
    const fs = require("fs"), path = require("path");
    const root = process.argv[1];
    for (const lang of fs.readdirSync(root).sort()) {
      const p = path.join(root, lang, "words", "manifest.json");
      if (!fs.existsSync(p)) continue;
      const m = JSON.parse(fs.readFileSync(p, "utf8"));
      console.log(lang, m.voice.voiceId);
    }' "$AUDIO_CACHE"
}

# Prints every clip path a manifest lists, one per line, relative to audio-cache.
manifest_files() {  # manifest_files <lang>
  node -e '
    const m = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    for (const f of new Set(Object.values(m.entries).flat().map((e) => e.file))) console.log(f);
  ' "$AUDIO_CACHE/$1/words/manifest.json"
}
