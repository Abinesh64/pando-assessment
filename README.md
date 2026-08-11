# Pando — Google Photos clone

A photos/trash/albums app. React (Vite) frontend, Express + MongoDB backend, ImgBB for image hosting.

## Running it

Everything is containerized, so this is the only step needed:

```bash
docker compose up --build
```

Then open http://localhost:5173. Mongo, the backend, and the frontend all start together — `.env` is already included with a working ImgBB key, so there's nothing else to configure.

## Running without Docker

**Backend**
```bash
cd backend
npm install
npm run dev
```
You'll need your own `backend/.env` with `PORT`, `MONGODB_URI`, and `IMGBB_API_KEY` set (see `backend/src/index.js` for what's read).

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Running tests

```bash
cd backend
npm test
```
21 unit tests covering the photos and albums controllers (Mocha + Chai + Sinon — stubs for DB/network calls, mocks where the exact call needs asserting).

## Features

- **Photos** — upload (name/description/tags), search by name/tags/description, download, soft delete (moves to Trash)
- **Trash** — restore or permanently delete
- **Albums** — group photos into albums, browse by album, add-to-album from the preview modal

## What I'd do next with more time

The core feature set is covered, but a few things are intentionally simplified for the scope of this exercise:

- **No indexing** — queries (search, pagination) run without indexes on `name`/`tags`/`description`/`createdAt`. Fine at this size, but would need indexes before it scales.
- **Offset-based pagination** — pagination uses `skip`/`limit`, which gets slow on large collections. Cursor-based pagination would hold up much better at scale.
- **Search is a MongoDB regex scan** — works for a small library, but a search-heavy app at scale would offload this to Elasticsearch (or similar) for faster, more relevant results.
- **No caching** — every request hits MongoDB directly. Frequently-read data (album lists, common searches) would benefit from a caching layer with a clear invalidation strategy on writes.
- **Single user only** — everything is currently attached to one hardcoded static user. The data model already references a user on each photo/album, but there's no real multi-user support yet.
- **No authentication** — there's no sign-in/sign-up flow. That's the biggest gap — a real version of this needs auth (e.g. JWT-based sessions) before it could support multiple real users.
