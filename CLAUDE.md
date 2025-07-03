# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

My Hacker News - A React-based Hacker News client built with TypeScript, Vite, and Material-UI.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build for production (runs TypeScript check then Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks

### Testing
No test framework is currently set up. If adding tests, you'll need to configure a test runner first.

## Architecture

### Data Flow
1. Static JSON data loaded from `src/hn_stories.json`
2. App.tsx manages sorting state and renders story grid
3. StoryCard component displays individual stories

### Component Structure
- `App.tsx` - Main component with sorting logic and grid layout
- `components/StoryCard.tsx` - Reusable card for displaying story details

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

## Development Notes

- The app uses static JSON data, not live Hacker News API
- Sorting is implemented client-side with React hooks
- All external links open in new tabs
- Grid layout is responsive (12/6/4 columns for xs/sm/md breakpoints)