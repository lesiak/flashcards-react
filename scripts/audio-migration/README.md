# Moving pronunciation blobs into deck groups

One-off migration that goes with the commit "Store clips and manifests per
deck group". Clips used to live at `<lang>/<voiceId>/<name>.mp3` with one
manifest per language at `<lang>/manifest.json`; they now live at
`<lang>/<group>/<voiceId>/<name>.mp3` with a manifest per group at
`<lang>/<group>/manifest.json`. All existing clips belong to the `words`
group. The rewritten manifests are already in `audio-cache/<lang>/words/`;
these scripts move the blobs in the `pronunciations` container to match.

Run the steps in order from the repo root. Each needs the Azure CLI and an
`az login` with data access to the storage account, the same as
`npm run audio:sync`. Set `AUDIO_AZ_AUTH="--account-key ..."` to use a key
instead.

| Step | Script | What it does | Reversible |
|---|---|---|---|
| 1 | `01-copy-to-words.sh` | Server-side copy of every clip to `<lang>/words/<voiceId>/` | yes, additive |
| 2 | `02-verify-copy.sh` | Old, new and manifest clip counts must agree | read-only |
| 3 | `03-sync-manifests.sh` | Uploads the new manifests (`npm run audio:sync`) | yes, additive |
| 4 | `04-delete-old.sh` | Deletes `<lang>/<voiceId>/*` and `<lang>/manifest.json` after re-verifying | no |

Deploy the app between steps 3 and 4 and check that a vocabulary deck plays
audio. Until the deploy, the old app keeps reading the old paths, which are
untouched until step 4.

The language and voice list is read from the manifests, so nothing here
needs editing when a language is added. Once step 4 has run everywhere,
this directory can be deleted.
