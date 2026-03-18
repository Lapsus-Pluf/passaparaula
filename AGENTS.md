# AGENTS.md - Passaparaula

Guidelines for AI coding agents working in this repository.

## Project Overview

Passaparaula is a Catalan "Pasapalabra" TV game show web app.
Single-page React application (Vite + TypeScript), served by nginx in Docker.
All UI text is in **Catalan**.

## Tech Stack

- **React 18** with TypeScript (strict mode)
- **Vite 6** for bundling
- **Pure CSS** (no CSS-in-JS, no UI library)
- **Docker** (multi-stage: node:20-alpine build, nginx:alpine serve)
- No backend; fully client-side SPA

## Build / Run Commands

```bash
# Docker (recommended, no local Node.js needed)
docker compose up --build          # Build & run at http://localhost:3000
docker compose down                # Stop

# Local development (requires Node.js 20+)
npm install                        # Install dependencies
npm run dev                        # Dev server at http://localhost:3000
npm run build                      # Production build to dist/
npm run preview                    # Preview production build

# Quality checks
npm run typecheck                  # TypeScript type checking (tsc --noEmit)
npm run lint                       # ESLint
npm run build                      # Full build (typecheck + bundle)
```

There are no tests yet. When adding tests, use Vitest (already compatible with Vite).
To run a single test: `npx vitest run src/path/to/file.test.ts`

## Project Structure

```
passaparaula/
├── index.html                     # SPA entry point
├── src/
│   ├── main.tsx                   # React root mount
│   ├── App.tsx                    # Screen router (welcome → game → results)
│   ├── types.ts                   # All TypeScript types/interfaces
│   ├── components/
│   │   ├── WelcomeScreen.tsx      # File upload + config
│   │   ├── GameScreen.tsx         # Main game layout + keyboard handling
│   │   ├── Rosco.tsx              # SVG circular letter board
│   │   ├── CameraView.tsx         # Webcam feed in rosco center
│   │   ├── Timer.tsx              # Countdown display
│   │   ├── QuestionDisplay.tsx    # Current question bar
│   │   ├── Controls.tsx           # Buttons + score + keyboard legend
│   │   └── ResultsScreen.tsx      # End-of-game summary
│   ├── hooks/
│   │   ├── useGame.ts             # Game state machine (core logic)
│   │   ├── useTimer.ts            # Countdown timer
│   │   └── useCamera.ts           # Webcam access (getUserMedia)
│   └── utils/
│       └── validateQuestions.ts    # JSON file validation
├── public/
│   └── template.json              # Example questions file
├── Dockerfile                     # Multi-stage build
├── docker-compose.yml             # One-command startup
└── nginx.conf                     # SPA routing config
```

## Code Style Guidelines

### TypeScript
- Strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`)
- Use `interface` for object shapes, `type` for unions/aliases
- Export types from `src/types.ts`; import with `import type { ... }`
- No `any`; use `unknown` and narrow with type guards
- Prefer `const` over `let`; never use `var`

### React
- Functional components only (no classes)
- Custom hooks in `src/hooks/` prefixed with `use`
- Props defined as interfaces, named `ComponentNameProps`
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Avoid inline object/array literals in JSX props (causes re-renders)

### Naming Conventions
- Components: PascalCase (`GameScreen.tsx`)
- Hooks: camelCase with `use` prefix (`useTimer.ts`)
- Utils: camelCase (`validateQuestions.ts`)
- CSS files: match component name (`GameScreen.css`)
- Types/interfaces: PascalCase (`LetterState`, `GamePhase`)
- Constants: camelCase or UPPER_SNAKE_CASE for true constants

### CSS
- One CSS file per component, imported at top of component file
- Use class names prefixed by component context (e.g., `.rosco-tile`, `.timer-value`)
- Dark theme: background `#0a0a2e` range, text `#ccd6f6`, muted `#5a6380`
- Color palette:
  - Primary: `#667eea` (blue-purple)
  - Accent: `#f1c40f` (yellow)
  - Success: `#2ecc71` (green)
  - Error: `#e74c3c` (red)
  - Warning: `#e67e22` (orange)
- Use CSS transitions for state changes (0.2s-0.3s ease)
- Font: Inter (loaded from Google Fonts)
- Border radius: 8-12px for panels, 10px for buttons

### Imports
- React imports first, then types, then components, then hooks, then utils, then CSS
- Use relative paths (no aliases configured)
- Group imports: external libs → local types → local modules → CSS

### Error Handling
- Validate user input (JSON files) with descriptive Catalan error messages
- Use try/catch for async operations (file reading, camera access)
- Show errors in the UI, never silent failures
- Camera errors are non-fatal (game works without camera)

### Game Logic
- Game state machine in `useGame.ts`: idle → playing ↔ paused → finished
- Letter statuses: pending → current → correct|incorrect|passed
- Pass mechanic: skipped letters revisited in a second round
- Timer and game state are kept in sync in `GameScreen.tsx`

## JSON Questions Format

```json
{
  "title": "Rosco title",
  "time": 130,
  "letters": [
    {
      "letter": "A",
      "type": "starts",
      "question": "Comença per A. ...",
      "answer": "Answer"
    },
    {
      "letter": "B",
      "type": "contains",
      "question": "Conté la B. ...",
      "answer": "Answer"
    }
  ]
}
```

- `title`: string (required)
- `time`: number in seconds (optional, default 130, range 10-600)
- `letters`: array of entries (required, at least 1)
- `type`: `"starts"` or `"contains"`
- Letters are dynamic (rosco adapts to whatever letters are provided)

## Keyboard Controls

| Key     | Action              |
|---------|---------------------|
| Enter   | Start game          |
| B       | Mark correct        |
| M       | Mark incorrect      |
| P       | Pass (skip letter)  |
| Space   | Pause / Resume      |
