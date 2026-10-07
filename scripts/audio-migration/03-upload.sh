#!/usr/bin/env bash
# Step 3: upload the whole local cache, clips and manifests, in the new layout.
# This is `npm run audio:sync`: it normalises file names to NFC, then runs
# `az storage blob sync` into the pronunciations container without deleting
# anything remote. Needs the Azure CLI and an `az login` with data access to
# the storage account.
#
# Deploy the app afterwards; it reads /api/audio/<lang>/<group>/manifest.json.
#
# Usage: scripts/audio-migration/03-upload.sh
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

"$(dirname "${BASH_SOURCE[0]}")/02-verify-local.sh"

cd "$REPO_ROOT"
npm run audio:sync

echo
echo "Uploaded. Deploy the app and check that a vocabulary deck plays audio."
