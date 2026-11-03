# Gradebook

A responsive, static student grade tracker.

## Run locally
Open `index.html` in a modern browser, or serve this folder with any static web server.

## Deploy
This is a static website and can be deployed to GitHub Pages, Netlify, Cloudflare Pages or Vercel:
1. Upload the project files to a Git repository.
2. Import the repository into your hosting provider.
3. Set the project root to the repository root.
4. No build command is needed. Publish the root directory.

## Current functionality
- Responsive dashboard for desktop and mobile
- Course creation and deletion
- Starting grades and assessment records
- Relative-weight assessment averages
- Remaining-coursework goal simulator
- Dark and light themes
- JSON export and import backups
- Browser local storage

## Important: cloud accounts and syncing
This version stores grades in the current browser using `localStorage`. It does **not** yet have user accounts or cloud sync. Do not enter sensitive information. To add real cloud sync, connect a backend such as Supabase:
- Create a Supabase project.
- Enable email authentication.
- Create a per-user courses table with row-level security.
- Add the project URL and public anon key to a frontend config.
- Replace local persistence with authenticated database reads and writes.

Never put a Supabase service-role key or other secret in frontend code.
