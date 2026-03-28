# Passaparaula

Catalan Pasapalabra web game. Single-page React app (Vite + TypeScript).

## Run with Docker (recommended)

```bash
docker compose up --build
```

Open http://localhost:3000

```bash
docker compose down   # stop
```

## Run locally (requires Node.js 20+)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Other commands

```bash
npm run build       # production build → dist/
npm run preview     # preview production build
npm run typecheck   # TypeScript check
npm run lint        # ESLint
```

## Usage

1. Upload a JSON questions file (see `public/template.json` for the format) or use the template.
2. Press **Enter** to start.

| Key   | Action           |
|-------|------------------|
| B     | Mark correct     |
| M     | Mark incorrect   |
| P     | Pass (skip)      |
| Space | Pause / Resume   |
