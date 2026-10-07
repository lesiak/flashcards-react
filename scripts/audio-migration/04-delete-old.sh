#!/usr/bin/env bash
# Step 4: remove the old layout, <lang>/<voiceId>/*.mp3 and <lang>/manifest.json,
# once the deployed app plays audio from <lang>/words/. Runs the step 2
# verification first and stops if it fails. Irreversible, although nothing is
# lost as long as step 1 copied every clip, which is what the check confirms.
#
# Usage: scripts/audio-migration/04-delete-old.sh [--yes]
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

"$(dirname "${BASH_SOURCE[0]}")/02-verify-copy.sh"

if [[ "${1:-}" != "--yes" ]]; then
  echo
  read -r -p "Delete the old <lang>/<voiceId>/ clips and <lang>/manifest.json in $ACCOUNT/$CONTAINER? [y/N] " answer
  [[ "$answer" == [yY] ]] || { echo "Nothing deleted."; exit 0; }
fi

lang_voices | while read -r lang voice _; do
  echo "== $lang: deleting $lang/$voice/*"
  az_blob delete-batch --source "$CONTAINER" --pattern "$lang/$voice/*"
  if [[ $(az_blob exists --container-name "$CONTAINER" --name "$lang/manifest.json" --query exists -o tsv) == true ]]; then
    az_blob delete --container-name "$CONTAINER" --name "$lang/manifest.json"
    echo "   deleted $lang/manifest.json"
  fi
done

echo
echo "Old layout removed. The container now holds only <lang>/<group>/... paths."
