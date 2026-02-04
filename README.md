# CoinCraft

A modular expense tracker where users choose a financial "character" that shapes their experience, then customize by enabling/disabling modules.

## Features

- **Character System**: Choose from 3 unique financial characters (Observer, Planner, Saver) each with different modules and focuses
- **Module System**: Enable/disable features based on your needs
- **Quick Add**: Log transactions in under 5 seconds
- **Dashboard Canvas**: Customizable widget-based dashboard
- **Envelope Budgeting**: For The Planner character
- **Savings Goals**: For The Saver character
- **Statistics**: Comprehensive charts and analytics
- **Gamification**: Streaks, achievements, and health scores
- **Dark Mode**: Full dark theme support
- **Responsive**: Works on mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Charts**: Recharts
- **Dates**: date-fns

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd coin-craft
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_postgres_connection_string

# App URL (for OG images)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run database migrations

```bash
npx drizzle-kit migrate
```

### 6. Seed the database

```bash
npx tsx src/db/seed.ts
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run check` | Run lint + typecheck + build |
| `npm run test` | Run unit/integration tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npx drizzle-kit generate` | Generate migration |
| `npx drizzle-kit migrate` | Apply migrations |
| `npx drizzle-kit studio` | Open Drizzle Studio |

## Project Structure

```
coin-craft/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app routes
│   ├── (auth)/            # Auth routes (login, signup, onboarding)
│   └── api/               # API routes (for widgets)
├── src/
│   ├── components/        # React components
│   ├── db/                # Database schema and migrations
│   ├── lib/               # Utilities, types, constants
│   ├── modules/           # Module system (envelope, goals, statistics)
│   ├── server/            # Server actions and queries
│   └── stores/            # Zustand stores
├── public/                # Static assets
└── drizzle/               # Generated migrations
```

## Characters

| Character | Focus | Modules |
|-----------|-------|---------|
| The Observer | Track everything | Core, Statistics |
| The Planner | Budget with envelopes | Core, Statistics, Envelopes |
| The Saver | Hit savings goals | Core, Statistics, Goals |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## License

MIT
