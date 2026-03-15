# Qiraa

Qiraa is a mobile app that helps Muslims improve their Quran recitation by learning from and imitating the styles of renowned reciters.

**Stack:** Expo (React Native) · Turborepo · Supabase · Python/FastAPI ML backend

## Repo structure

- **`apps/mobile`** — Expo app (Expo Router, Zustand, expo-av)
- **`apps/web`** — Next.js marketing site (optional)
- **`packages/shared`** — Shared TypeScript types and utils
- **`services/ml`** — FastAPI + faster-whisper + librosa analysis pipeline

## Setup

1. **Install dependencies (root):**
   ```bash
   npm install
   ```

2. **Mobile:** from repo root, `npm run dev:mobile` or `cd apps/mobile && npx expo start`.

3. **ML backend:** see `services/ml/README.md` (Python 3.11+, venv, `pip install -r requirements.txt`).

4. **Env:** copy `.env.example` to `.env` in the app/service you run and fill in keys (see CLAUDE.md).

## Docs

- **`CLAUDE.md`** — Single source of truth: architecture, design system, API contracts, DB schema, and coding standards.

## Pushing to a remote

After creating a new repo on GitHub/GitLab/Bitbucket (empty, no README):

```bash
git remote add origin <your-remote-url>
git branch -M main          # optional: use main instead of master
git push -u origin main      # or: git push -u origin master
```

Use the same branch name you have locally if you skip `git branch -M main`.

## License

Private. All rights reserved.
