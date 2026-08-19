# Environment Setup

This project supports two environments, each connected to a different Firebase project.

## Files

| File | Purpose |
|------|---------|
| `.env.development` | Firebase config for the **local/development** project |
| `.env.production` | Firebase config for the **production** project |
| `.firebaserc` | Firebase CLI project aliases |

> Both `.env.*` files are gitignored. Copy from the templates and fill in your values.

## Development

```bash
# Run dev server against DEVELOPMENT Firebase
npm run dev

# Run dev server against PRODUCTION Firebase (for testing)
npm run dev:prod
```

## Building

```bash
# Build for development environment
npm run build

# Build for production environment
npm run build:prod
```

## Deploying

```bash
# Deploy to dev Firebase project
npm run deploy:dev

# Deploy to production Firebase project
npm run deploy:prod
```

## Switching Firebase CLI project manually

```bash
firebase use local        # switches to dev project
firebase use production   # switches to prod project
```

## How it works

- Vite loads the appropriate `.env.[mode]` file based on the `--mode` flag.
  - `--mode development` → loads `.env.development`
  - `--mode production` → loads `.env.production`
- `firebase.js` reads all config values from `import.meta.env.VITE_FIREBASE_*`.
- The `.firebaserc` file maps aliases (`local`, `production`) to Firebase project IDs.

## Setup for production

1. Create a new Firebase project in the Firebase Console
2. Fill in `.env.production` with the new project's credentials
3. Replace `YOUR_PRODUCTION_PROJECT_ID` in `.firebaserc` with the actual project ID
4. Set up SendGrid API key as a secret on the production project:
   ```bash
   firebase use production
   firebase functions:secrets:set SENDGRID_API_KEY
   ```
