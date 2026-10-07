#!/usr/bin/env bash
# Step 3: upload the rewritten manifests (audio-cache/<lang>/words/manifest.json)
# so the container has both layouts side by side. This is `npm run audio:sync`,
# which never deletes remote blobs, so the old <lang>/manifest.json and clips
# stay until step 4.
#
# Deploy the app after this step; it reads /api/audio/<lang>/<group>/manifest.json.
#
# Usage: scripts/audio-migration/03-sync-manifests.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

cd "$REPO_ROOT"
npm run audio:sync

echo
echo "Manifests synced. Deploy the app, check that audio plays, then run 04-delete-old.sh."
