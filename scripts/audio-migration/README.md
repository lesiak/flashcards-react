# Moving the pronunciation cache into deck groups

One-off migration that goes with the commit "Store clips and manifests per
deck group". Clips used to live at `<lang>/<voiceId>/<name>.mp3` with one
manifest per language at `<lang>/manifest.json`; they now live at
`<lang>/<group>/<voiceId>/<name>.mp3` with a manifest per group at
`<lang>/<group>/manifest.json`. All existing clips belong to the `words`
group. The rewritten manifests are already in `audio-cache/<lang>/words/`.

The blob container was emptied, so the move happens in the local cache and
the whole cache is uploaded again. Run the steps in order, from the repo
root, on the machine that holds the full `audio-cache/` with the mp3s.

| Step | Script | What it does |
|---|---|---|
| 1 | `01-move-local-clips.sh` | Moves `audio-cache/<lang>/<voiceId>/*.mp3` to `audio-cache/<lang>/words/<voiceId>/` |
| 2 | `02-verify-local.sh` | Every clip listed in a manifest must exist on disk; lists what is missing |
| 3 | `03-upload.sh` | Re-runs step 2, then `npm run audio:sync` uploads clips and manifests |

Deploy the app after step 3. If step 2 reports missing clips, the cache on
that machine is incomplete; `npm run audio -- public/wordfiles/<lang>/words/*.json`
regenerates only the missing ones, at the cost of text-to-speech credits.

The language and voice list is read from the manifests, so nothing here
needs editing when a language is added. Once the upload is done, this
directory can be deleted.
