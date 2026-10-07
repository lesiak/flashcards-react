#!/usr/bin/env bash
# Step 1: move the local clips into the words group,
# audio-cache/<lang>/<voiceId>/*.mp3 -> audio-cache/<lang>/words/<voiceId>/*.mp3.
#
# Run on the machine that holds the full cache. The manifests were already
# moved and rewritten by git; this moves the mp3s to match. Files are moved
# one by one, so an existing destination folder is merged into, and a rerun
# with nothing left to move is a no-op. A stale audio-cache/<lang>/manifest.json
# from the old layout is removed.
#
# Usage: scripts/audio-migration/01-move-local-clips.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

moved=0
lang_voices | while read -r lang voice; do
  src="$AUDIO_CACHE/$lang/$voice"
  dst="$AUDIO_CACHE/$lang/words/$voice"
  if [[ -d "$src" ]]; then
    mkdir -p "$dst"
    count=0
    while IFS= read -r -d '' f; do
      mv -n "$f" "$dst/"
      count=$((count + 1))
    done < <(find "$src" -maxdepth 1 -name '*.mp3' -print0)
    rm -f "$src/.DS_Store"
    rmdir "$src" 2>/dev/null || echo "   left $lang/$voice/ in place: not empty after the move"
    echo "$lang: moved $count clip(s) to $lang/words/$voice/"
  else
    echo "$lang: nothing to move (no $lang/$voice/ here)"
  fi
  if [[ -f "$AUDIO_CACHE/$lang/manifest.json" ]]; then
    rm "$AUDIO_CACHE/$lang/manifest.json"
    echo "   removed stale $lang/manifest.json"
  fi
done

echo
echo "Next: 02-verify-local.sh"
