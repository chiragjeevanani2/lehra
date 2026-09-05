# Lehra Companion

A digital lehra/accompaniment tool for Indian classical music practice (tabla, kathak, and instrumental riyaz): a browser-based player with a tanpura drone, pitch and tempo control, and a step-sequencer editor for building your own lehra loops.

## Project structure

- `frontend/` — React + Vite app. Playback UI, sequencer editor, and Tone.js audio engine.
- `backend/` — Express API. Auth, saved lehras, favorites, and community sharing (MongoDB via Mongoose).

## Running locally

### Backend

```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev             # http://localhost:5000
```

`MONGODB_URI` can point at a local MongoDB or an Atlas cluster. If Node can't resolve the Atlas hostname even though your browser can (common with VPNs or Cloudflare WARP redirecting Node's DNS to a loopback proxy that refuses Node's own lookups), uncomment `DNS_SERVERS=1.1.1.1,8.8.8.8` in `.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to the backend
```

Open the frontend URL, click **Play** (browser audio requires a user gesture to start), and the hardcoded lehra + tanpura loop should play immediately. Sign in (top right) to save favorites and lehras — that data now lives in MongoDB, not the browser.

### Deploying the frontend (Vercel)

`frontend/vercel.json` rewrites every path except `/api/*` to `index.html`, so the app loads correctly on a hard refresh or a direct link to any URL instead of 404ing — standard SPA fallback (this app doesn't use client-side routing yet, but it's one less thing to hit if that changes). The `/api/*` exclusion is there so a future rewrite proxying `/api` to wherever the backend is deployed won't conflict with it, regardless of the order rewrites are listed in. The frontend currently calls the API via relative `/api/...` paths (`frontend/src/api/client.js`), which only resolves correctly if something maps `/api` to the backend's real origin — locally that's Vite's dev proxy (`vite.config.js`); on Vercel you'll need either a rewrite to the backend's deployed URL or to change the frontend to call an absolute API URL.

## Current status

Build steps 1-7 and 9 are done:

- Tailwind + dark mode, and an end-to-end playback UI (instrument selector, tanpura drone, pitch shift, live BPM control, transport) driven by a Tone.js engine (`frontend/src/audio/`, `frontend/src/hooks/useLehraEngine.js`) with one hardcoded 16-beat Teentaal loop.
- A step-sequencer editor (`Editor` tab) supporting any beat count and 4/8/16/32-per-matra quantization, chromatic note entry in sargam terms (Sa re Re ga Ga Ma ma Pa dha Dha ni Ni), chords (multiple notes per step), click-drag step-range selection with delete/shift, undo/redo (Ctrl+Z / Ctrl+Y, in-memory), and its own instrument/tempo preview player. See `frontend/src/editor/`, `frontend/src/components/editor/`, `frontend/src/hooks/useHistoryState.js`, `frontend/src/hooks/useEditorPreview.js`.
- A Swing % control on both the Playback screen and the Editor preview (`frontend/src/audio/swing.js`). Each note gets an independent, freshly-randomized timing offset when scheduled, capped at 10% of one subdivision's duration regardless of the slider value, so it never breaks the beat even at 100%.
- A real backend: Express + Mongoose models for `User`, `Lehra`, and `Favorite` (`backend/src/models/`), JWT email/password auth (`backend/src/routes/auth.js`), and REST endpoints for lehras (list/get/create/update/fork) and favorites (list/create/delete), with rate limiting and payload validation on the write routes (`backend/src/routes/lehras.js`, `backend/src/routes/favorites.js`, `backend/src/middleware/`).
- The frontend is wired to that backend: sign-in/register (`frontend/src/contexts/AuthContext.jsx`, `frontend/src/components/AuthDialog.jsx`), and both `useSavedLehras` and `useFavorites` now call the real API instead of `localStorage`. Saving or loading in the Editor, or favoriting on the Playback screen, requires being signed in; the UI prompts for that when needed.

- Polish pass: loading and error states for the favorites/lehras API calls (`frontend/src/components/ErrorBanner.jsx`, surfaced in the Playback and Editor screens and the Load dialog instead of failing silently), and a mobile responsiveness pass — verified with real touch-event testing (Chrome DevTools Protocol, not just viewport screenshots) on a 390×844 mobile viewport across the Playback screen, Editor, and all three dialogs (Save/Load/Auth). That testing caught a real bug: the sequencer grid's click-drag step-range selection (`frontend/src/components/editor/SequencerGrid.jsx`) tracked its "am I dragging" flag in React state, which lost the first move of a drag because `pointermove` can fire before the state update re-renders — most visible on touch, where a drag gesture is fast and short. Fixed by tracking it in a ref instead.

Not done yet: the Load dialog's "Community" section is still a placeholder — the backend already supports listing/searching public lehras and forking (`GET /api/lehras`, `POST /api/lehras/:id/fork`), but the browse-and-fork UI (build step 8) isn't built. There's also no `DELETE /api/lehras/:id` endpoint (not in the original API spec — only favorites are deletable), so saved lehras can't be removed from the Load dialog yet.

Instrument voices (Sitar, Sarangi, Bansuri High/Low, Benjo, Chimta, Harmonium, Santur, Shehnai, Tumbi) and the Tanpura drone are all `Tone.Sampler`s built from the bundled **JSP Indian Instrumental Sounds** pack (`frontend/public/samples/<instrument>/{dry,wet}.wav`), each a single note recorded at C4 that Tone.js pitch-shifts to cover the rest of the range. A Dry/Wet toggle in the UI switches which take is loaded. See `frontend/src/audio/instruments.js` and `frontend/src/audio/tanpura.js`.
