#!/usr/bin/env bash
# Step 1: copy every clip from <lang>/<voiceId>/ to <lang>/words/<voiceId>/.
#
# Server-side copies inside the container: nothing is downloaded and no
# text-to-speech credits are spent. Additive, so the deployed app keeps
# playing from the old paths until the new build goes out. Safe to rerun;
# an existing destination blob is simply overwritten with the same bytes.
#
# Usage: scripts/audio-migration/01-copy-to-words.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

PARALLEL=${AUDIO_COPY_PARALLEL:-8}

lang_voices | while read -r lang voice expected; do
  src="$lang/$voice/"
  echo "== $lang: copying $src -> $lang/words/$voice/ ($expected clips in manifest)"
  az_blob list --container-name "$CONTAINER" --prefix "$src" --query "[].name" -o tsv |
    xargs -P "$PARALLEL" -I{} bash -c '
      source "$1/common.sh"
      name=$2; lang=$3
      az_blob copy start --source-container "$CONTAINER" --source-blob "$name" \
        --destination-container "$CONTAINER" --destination-blob "$lang/words/${name#"$lang"/}" -o none
      echo "   copied $name"
    ' _ "$(dirname "${BASH_SOURCE[0]}")" {} "$lang"
done

echo
echo "Copies started. Run 02-verify-copy.sh to confirm the counts."
