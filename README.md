# unesa.js

TypeScript scrapers and a small HTTP API for UNESA student, course, Moodle LMS, and assignment deadline data.

## Requirements

- Node.js 20 or newer
- pnpm
- An authenticated SINDIG session cookie

## Setup

Install dependencies:

```sh
pnpm install
```

Set `UNESA_COOKIE` to the authenticated `Cookie` request header from a signed-in SINDIG session. The scraper reads Moodle's `sesskey` from the authenticated [`/my/` page](https://sindig-vokasi.unesa.ac.id/my/) automatically when it requests calendar data, so no separate sesskey is needed.

Keep the cookie private. It grants access to your account until the session expires. Do not commit it, share it, or expose it in client-side code. `.env.example` is a template only; this project does not load `.env` automatically. For example, set the variable in your shell before starting the server:

```sh
export UNESA_COOKIE='MoodleSession=your-session-cookie'
```

## Run

Start the API in development mode:

```sh
pnpm dev
```

The server listens on port `3000` by default. Set `PORT` to use another port.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health status |
| `GET` | `/api/mahasiswa` | Student profile data |
| `GET` | `/api/matkul` | Course list |
| `GET` | `/api/tugas` | Assignment deadlines |
| `GET` | `/api/lms/:courseId` | LMS content for a numeric course ID |

Example:

```sh
curl http://localhost:3000/api/health
```

## Package usage

Import scraper functions from `src/index.ts`. Importing a module does not make a network request; call an `extract*` function to fetch data.

## Scripts

- `pnpm check` — check TypeScript types without generating output.
- `pnpm build` — compile JavaScript and declarations into `dist/`.
- `pnpm dev` — run the API with reload.
- `pnpm start` — run the built API.
