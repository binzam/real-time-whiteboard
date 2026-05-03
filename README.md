# Architect AI

A collaborative, real-time diagram and whiteboard app with AI-assisted features. The frontend is a Next.js app that uses `tldraw` for drawing, `Yjs` for CRDT-based collaboration and a small Hocuspocus WebSocket server to persist Yjs documents via Prisma. Authentication is handled with `better-auth` and data is stored in PostgreSQL via Prisma.

**Features**

- **Real-time collaboration:** Live shared canvas powered by Yjs + Hocuspocus.
- **Persistent documents:** Yjs document state is saved to Postgres via a Hocuspocus database extension and Prisma.
- **Authentication:** Email/password auth with `better-auth` and a Prisma adapter.
- **AI tooling:** Integration with Google GenAI (Gemini) for diagram generation / explanations.
- **tldraw-based UI:** Rich drawing/diagram tools using `tldraw` and custom templates.

**Tech stack**

- Frontend: Next.js 16, React 19, Tailwind CSS
- Realtime: Yjs, @hocuspocus/server, Hocuspocus database extension
- Database: PostgreSQL + Prisma
- Auth: better-auth (Prisma adapter)
- AI: @google/generative-ai (Gemini)

**Quick Start (Development)**

Prerequisites

- Node.js (v18+ recommended)
- pnpm (project uses pnpm workspace)
- PostgreSQL instance accessible and a `DATABASE_URL` connection string

Clone and install

```bash
git clone https://github.com/binzam/real-time-whiteboard.git
cd real-time-whiteboard
pnpm install
```

Create a `.env` file at the project root. Example values (replace with your real values):

```env
# Postgres connection string used by Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/architectdb?schema=public"

# Secret used by better-auth (pick a long random value)
BETTER_AUTH_SECRET=your-long-random-secret

# Base URL for the app (used by auth links)
BETTER_AUTH_URL=http://localhost:3000

# Publicly visible WebSocket URL used by client to connect to Hocuspocus
NEXT_PUBLIC_YJS_URL=ws://localhost:1234

# API key for Google generative AI (Gemini) integration
GEMINI_API_KEY=your-gemini-api-key

# (optional) Node environment
NODE_ENV=development
```

Run Prisma migrations and generate the client

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```

Run the app in development (starts Next.js and the Hocuspocus WebSocket server concurrently):

```bash
pnpm run dev
```

Useful scripts

- `pnpm run dev` — runs both Next.js and the WebSocket server concurrently
- `pnpm run dev:next` — runs only the Next.js frontend
- `pnpm run dev:wss` — runs only the Hocuspocus WebSocket server (`server/index.ts`)
- `pnpm run build` — builds Next.js for production
- `pnpm run start` — starts the built Next.js app

Server details

- The Hocuspocus server is implemented in `server/index.ts` and listens on port `1234` by default. It uses Prisma to fetch and persist Yjs document buffers to the `yjsDocument` table.
- The frontend connects to the WebSocket at the value of `NEXT_PUBLIC_YJS_URL`.

Environment variables reference

- **DATABASE_URL**: Postgres connection string used by Prisma.
- **BETTER_AUTH_SECRET**: Application secret used by `better-auth` for signing and encryption.
- **BETTER_AUTH_URL**: Base URL of your running app (e.g., `http://localhost:3000`).
- **NEXT_PUBLIC_YJS_URL**: WebSocket URL for the Hocuspocus server (e.g., `ws://localhost:1234`).
- **GEMINI_API_KEY**: API key for Google generative AI (Gemini) used by server-side AI endpoints.
- **NODE_ENV**: (optional) `development` | `production`.

Notes & troubleshooting

- If you change Prisma models, run `pnpm exec prisma migrate dev` to apply migrations and `pnpm exec prisma generate` to regenerate the client.
- Ensure Postgres is running and reachable from the machine where you run the app.
- If you only need the real-time server, run `pnpm run dev:wss` and connect a client to the `NEXT_PUBLIC_YJS_URL`.

Where to look in the code

- `app/` — Next.js application (pages, auth, protected room views)
- `server/index.ts` — Hocuspocus WebSocket server and Yjs persistence
- `lib/prisma.ts` — Prisma client setup
- `lib/auth.ts` — `better-auth` configuration
- `prisma/schema.prisma` — Prisma schema and models

Contributing

- Contributions welcome. Open issues or pull requests with clear descriptions and tests where appropriate.
