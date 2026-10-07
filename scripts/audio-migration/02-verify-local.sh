#!/usr/bin/env bash
# Step 2: check that every clip the words manifests list exists on disk under
# the new path, so the upload in step 3 gives the app a complete set. Lists
# any missing clip and exits non-zero; a missing clip means the cache on this
# machine is incomplete, and `npm run audio -- public/wordfiles/<lang>/words/*.json`
# regenerates exactly the missing ones (that costs text-to-speech credits).
#
# Usage: scripts/audio-migration/02-verify-local.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

missing_total=0
while read -r lang _; do
  total=0; missing=0
  while IFS= read -r rel; do
    total=$((total + 1))
    if [[ ! -f "$AUDIO_CACHE/$rel" ]]; then
      missing=$((missing + 1))
      [[ $missing -le 5 ]] && echo "   missing $rel"
    fi
  done < <(manifest_files "$lang")
  if [[ $missing -eq 0 ]]; then
    echo "ok        $lang  $total clips present"
  else
    echo "INCOMPLETE $lang  $missing of $total clips missing"
    missing_total=$((missing_total + missing))
  fi
done < <(lang_voices)

echo
if [[ $missing_total -gt 0 ]]; then
  echo "$missing_total clip(s) missing. Regenerate them with npm run audio, or run step 1 on the machine that has them."
  exit 1
fi
echo "Every manifest clip is on disk. Next: 03-upload.sh"
