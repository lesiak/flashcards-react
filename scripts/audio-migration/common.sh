# Shared settings for the one-off move of pronunciation blobs from
# <lang>/<voiceId>/ to <lang>/words/<voiceId>/ (see README.md here).
# Sourced by the numbered step scripts; not meant to be run on its own.

set -euo pipefail

ACCOUNT=${AUDIO_STORAGE_ACCOUNT:-flashcardsresources}
CONTAINER=${AUDIO_CONTAINER:-pronunciations}
# `npm run audio:sync` authenticates the same way; set AUDIO_AZ_AUTH to e.g.
# "--account-key ..." if your az login has no data-plane role on the account.
read -r -a AZ_AUTH <<< "${AUDIO_AZ_AUTH:---auth-mode login}"

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
AUDIO_CACHE="$REPO_ROOT/audio-cache"

az_blob() {
  az storage blob "$@" --account-name "$ACCOUNT" "${AZ_AUTH[@]}" --only-show-errors
}

# Prints one "lang voiceId clipCount" line per migrated manifest, so the
# steps work from the same data the app will read.
lang_voices() {
  node -e '
    const fs = require("fs"), path = require("path");
    const root = process.argv[1];
    for (const lang of fs.readdirSync(root).sort()) {
      const p = path.join(root, lang, "words", "manifest.json");
      if (!fs.existsSync(p)) continue;
      const m = JSON.parse(fs.readFileSync(p, "utf8"));
      const files = new Set(Object.values(m.entries).flat().map((e) => e.file));
      console.log(lang, m.voice.voiceId, files.size);
    }' "$AUDIO_CACHE"
}

count_mp3s() {  # count_mp3s <prefix>
  az_blob list --container-name "$CONTAINER" --prefix "$1" \
    --query "length([?ends_with(name, '.mp3')])" -o tsv
}
