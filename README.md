# My Hacker News

A React-based Hacker News client focused on AI and software engineering stories, with dual data sources: static JSON and live BigQuery data via Google Cloud Functions.

## Features

- 🔄 **Dual Data Sources**: Toggle between static JSON and live BigQuery data
- 🔍 **AI-Focused**: Filters for LLM, ChatGPT, Copilot, and other AI coding tools
- 📊 **Smart Caching**: 1-hour Firestore cache for fresh data (free tier usage)
- 🔒 **Secure API**: CORS-protected Cloud Function with optional API key auth
- 📱 **Responsive Design**: Material-UI with mobile-friendly grid layout
- ⚡ **Fast Development**: Vite with HMR and TypeScript

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Optional - Setup BigQuery integration**:
   ```bash
   ./setup-gcloud.sh
   ```

## Architecture

- **Frontend**: React + TypeScript + Vite + Material-UI
- **Backend**: Google Cloud Functions (Node.js 20)
- **Database**: BigQuery public dataset + Firestore caching
- **Deployment**: Vercel (frontend) + Google Cloud (backend)

## Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Detailed project structure and development notes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete deployment guide for Google Cloud setup

## Security

The Cloud Function is secured with:
- **CORS Protection**: Only accepts requests from authorized domains
- **Optional API Key**: Can be enabled for additional security
- **No Sensitive Data**: Only public BigQuery data is cached

## Development Notes

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
