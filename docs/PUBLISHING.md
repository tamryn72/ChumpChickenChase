# Publishing Chump Chicken Chase

Two distribution channels, two different workflows. GitHub Pages is the quick
path — enable it once and every push to `main` updates the live site. itch.io is
for when you want a proper game page with a cover image and a discoverable
listing.

---

## Pre-flight: playtest before shipping

Before either path, open the game in a real browser and sanity-check the
outstanding risks from `docs/SESSION_HANDOFF.md`:

- **Audio balance** — the M13 normalization pass + all M14 effects (exec_order
  thump, supersonic zing, ice hit/splat) were never ear-tested. Cycle through
  the 25/50/75/100/125% master volume options and listen for clipping under
  W5 chaos (final form + rocks + buildings + executive orders).
- **Mobile touch** — the virtual d-pad, trap palette, and GO button have
  never run on a real phone. If you can, open the live URL on a device.
- **All four Executive Orders** — Speed / Supersonic / Red Foxes / Tropical.
  Play a few levels to see each flavor fire at least once.
- **Transitions / menu intro** — they shouldn't feel too long.

Fix anything broken in `src/`, re-run `node tools/smoke.mjs`, then ship.

---

## Path A: GitHub Pages (do this first)

GitHub Pages serves the repo as a static site. The existing `index.html` at
the repo root loads `./src/main.js` as a native ES module, which works fine
under Pages — no build step, no bundling, nothing in `dist/` to commit. Every
push to `main` auto-redeploys.

### One-time setup

1. **Merge this branch to `main`.** From the GitHub UI or locally:

   ```bash
   git checkout main
   git merge claude/publishing-guide-bZm18
   git push origin main
   ```

2. **Enable Pages.** On GitHub:

   - Repo → **Settings** → **Pages**
   - **Source**: *Deploy from a branch*
   - **Branch**: `main`, folder: `/ (root)`
   - Click **Save**

3. **Wait ~30 seconds**, then visit:

   ```
   https://tamryn72.github.io/Trumplestiltskin/
   ```

   > Note the capital `T` — Pages URLs preserve the repo name's casing.

   The first deploy takes a minute or two. After that, every push to `main`
   redeploys within seconds.

### Updating the live site

Just push to `main`. Pages picks it up automatically.

```bash
git checkout main
# make changes, commit
git push origin main
```

### If something breaks on Pages but worked locally

- Open DevTools → Console on the live URL. Module load errors show up here.
- Check that all file paths in `src/` are **case-sensitive correct** — GitHub
  Pages runs on Linux, so `Sprites.js` vs `sprites.js` matters (local macOS
  dev is case-insensitive and will silently hide this bug).
- Confirm you didn't accidentally commit a file with an absolute path starting
  with `/`. All imports should be `./relative.js`.

---

## Path B: itch.io (when ready)

itch.io wants a self-contained zip it can iframe. That's exactly what
`tools/build.mjs` produces — a single `dist/index.html` with all JS inlined,
no external assets.

### Build the bundle

```bash
node tools/build.mjs
```

This writes `dist/index.html` (~265 KB, no dependencies). Double-click it to
confirm it runs from `file://` — if it does, itch will be happy.

> **Heads up:** the bundler is regex-based. It does not support
> `export default` or other exotic ESM patterns. After any significant change
> to `src/`, grep the output for leaked statements:
>
> ```bash
> grep -E '^(import |export )' dist/index.html
> ```
>
> Should be empty. If it's not, see `tools/build.mjs` for the limitations.

### Package for upload

itch.io requires a zip even for a single file:

```bash
cd dist && zip chump-chicken-chase.zip index.html && cd ..
```

### Create the itch page

1. Log in to https://itch.io → **Upload new project**
2. **Kind of project**: HTML
3. **Uploads**: drop in `chump-chicken-chase.zip`
4. Check **This file will be played in the browser**
5. **Embed options**:
   - **Viewport dimensions**: 640 × 480 (the game's logical resolution)
   - **Fullscreen button**: enabled
   - **Mobile friendly**: enabled (the touch controls work)
   - **Orientation**: landscape
6. **Cover image**: 630 × 500 recommended. Screenshot of the title screen or
   chaos mid-chase works great. No cover = worse discoverability.
7. **Genre**: Action. **Tags**: `2d`, `arcade`, `chaos`, `chicken`, `cursed`,
   `pixel-art`, `singleplayer`.
8. **Description**: borrow copy from `README.md` — the "THE CHICKEN —
   Personality & Behaviors" section is already hilarious page copy.
9. **Visibility**: start as **Restricted** or **Draft** to preview, then flip
   to **Public** when you're happy.
10. **Save & view page**, tick the "Can be accessed by anyone" box once ready.

### Updating the itch build

Same flow: rebuild, rezip, upload a new file to the existing project (don't
create a new project). itch will diff and update the live embed.

```bash
node tools/build.mjs
cd dist && zip -f chump-chicken-chase.zip index.html && cd ..
# then re-upload via the itch dashboard
```

---

## Name / branding notes

- **Public name**: Chump Chicken Chase
- **Project codename** (repo, internal docs): Trumplestiltskin
- The `<title>` in `index.html` is already "Chump Chicken Chase"
- The README headline is "Chump Chicken Chase"

If the itch page ever diverges from the in-game title, update both at once.

---

## Checklist

- [ ] Playtest audio under chaos
- [ ] Playtest mobile touch on a real phone
- [ ] Confirm all 4 Executive Orders fire
- [ ] `node tools/smoke.mjs` passes
- [ ] GitHub Pages: merge to `main`, enable in Settings → Pages
- [ ] GitHub Pages: visit the live URL, open DevTools console, look for errors
- [ ] itch.io: `node tools/build.mjs`, zip, double-click `dist/index.html` to verify
- [ ] itch.io: create project, upload, set viewport 640×480
- [ ] itch.io: cover image + description + tags
- [ ] itch.io: flip to public
