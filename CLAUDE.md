# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

My Hacker News - A React-based Hacker News client with dual data sources: static JSON and live BigQuery data via Google Cloud Functions.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build for production (runs TypeScript check then Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks

### Google Cloud Deployment
- `./setup-gcloud.sh` - Automated setup of Google Cloud resources (requires billing enabled)
- `./deploy-function.sh` - Quick redeploy of Cloud Function only
- `./test-function.js` - Test the deployed Cloud Function
- `cd cloud-function && npm run deploy` - Deploy Cloud Function manually
- **Prerequisites**: Google Cloud billing must be enabled before running setup

### Testing
No test framework is currently set up. If adding tests, you'll need to configure a test runner first.

## Architecture

### Data Sources
1. **Static Data**: JSON file with sample stories (`src/hn_stories.json`)
2. **Live Data**: BigQuery public dataset via Google Cloud Function with Firestore caching

### Data Flow (Live Mode)
1. React app calls Cloud Function API
2. Cloud Function checks Firestore cache (1-hour TTL)
3. On cache miss: Query BigQuery → Store in Firestore → Return to client
4. On cache hit: Return cached data immediately

### Component Structure
- `App.tsx` - Main component with data source toggle, sorting, and grid layout
- `components/StoryCard.tsx` - Reusable card for displaying story details
- `services/hackernews.ts` - Service layer for Cloud Function API calls

### Key Interfaces
```typescript
interface Story {
  id: string;
  title: string;
  text: string | null;
  url: string | null;
  score: string | null;
  parent: string | null;
  ranking: string | null;
  descendants: string | null;
  timestamp: string;
}
```

### Technology Decisions
- **Material-UI**: Used for all UI components (Card, Grid, Typography, etc.)
- **Emotion**: CSS-in-JS solution that comes with MUI
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Vite**: Fast development server with HMR
- **Google Cloud**: BigQuery for data, Cloud Functions for API, Firestore for caching

### Cloud Architecture
- **Cloud Function**: Node.js 20 runtime with 512MB memory, 60s timeout, Gen 2 (Cloud Run)
- **BigQuery**: Queries `bigquery-public-data.hacker_news.full` table
- **Firestore**: Native mode database for caching query results
- **Caching Strategy**: 1-hour TTL for fresh data (free tier usage)
- **Security**: CORS-protected API (localhost:5173 + production domain), optional API key auth

## Development Notes

- Toggle between static JSON and live BigQuery data
- Sorting is implemented client-side with React hooks
- All external links open in new tabs
- Grid layout is responsive (12/6/4 columns for xs/sm/md breakpoints)
- Error handling with fallback to cached/static data
- Loading states and last updated indicators

## Security & Deployment

### Cloud Function Security
- **CORS Protection**: Only allows requests from authorized domains:
  - Development: `http://localhost:5173`
  - Production: `https://my-hacker-news-navy.vercel.app`
- **Optional API Key**: Can be enabled by setting `API_KEY` environment variable
- **Function URL**: `https://us-central1-hacker-news-ai-dev-feed.cloudfunctions.net/fetchHackerNewsStories`

### Deployment Requirements
1. **Google Cloud Billing**: Must be enabled for the project
2. **Required APIs**: BigQuery, Cloud Functions, Firestore, Cloud Run (auto-enabled by setup script)
3. **Service Account**: Uses default compute service account with necessary permissions
4. **Environment Variables**: Copy `.env.example` to `.env` (created automatically by setup scripts)