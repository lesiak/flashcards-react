#!/usr/bin/env bash
# Step 2: check that every language has as many clips under <lang>/words/
# as under the old <lang>/<voiceId>/ prefix, and as many as its manifest
# lists. Exits non-zero on any mismatch, so 04-delete-old.sh can refuse
# to run until this passes.
#
# Usage: scripts/audio-migration/02-verify-copy.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

status=0
lang_voices | while read -r lang voice expected; do
  old=$(count_mp3s "$lang/$voice/")
  new=$(count_mp3s "$lang/words/$voice/")
  if [[ "$new" == "$expected" && ( "$old" == "$expected" || "$old" == 0 ) ]]; then
    echo "ok       $lang  old=$old  new=$new  manifest=$expected"
  else
    echo "MISMATCH $lang  old=$old  new=$new  manifest=$expected"
    status=1
  fi
  echo "$status" > "${TMPDIR:-/tmp}/audio-migration-verify-status"
done

status=$(cat "${TMPDIR:-/tmp}/audio-migration-verify-status" 2>/dev/null || echo 1)
rm -f "${TMPDIR:-/tmp}/audio-migration-verify-status"
if [[ "$status" != 0 ]]; then
  echo
  echo "Counts differ. Rerun 01-copy-to-words.sh, or wait: copies finish asynchronously."
  exit 1
fi
echo
echo "All languages match. Next: 03-sync-manifests.sh, then deploy the app."
