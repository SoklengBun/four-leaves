# Anella

Anella is a personal Vue 3 web app for discovering lyrics, organizing playlists, and playing songs through the YouTube IFrame Player API. It also includes a responsive home dashboard, browser-storage tools, authentication, themes, localization, and installable PWA support.

## Features

- Browse, search, add, and edit lyrics
- Search songs, artists, and playlists
- Create and reorder personal playlists
- Play YouTube audio with seek, shuffle, repeat, and A–B loop controls
- Sign up, sign in, and protect account-only pages
- View weather, battery, calendar, and time information
- Inspect and clear data stored in the browser
- Switch between light and dark themes
- English and Japanese localization
- Responsive mobile and desktop layouts
- PWA installation and update prompts
- Extra pages such as Princess Connect and Shake

## Tech stack

- [Vue 3](https://vuejs.org/) with TypeScript and `<script setup>`
- [Vite](https://vite.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vant](https://vant-ui.github.io/vant/)
- [VueUse](https://vueuse.org/)
- [Vue I18n](https://vue-i18n.intlify.dev/)
- [Vitest](https://vitest.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## Requirements

- Node.js 18 or newer
- Yarn 1.x
- A compatible Anella API server for lyrics, playlists, artists, and authentication

The dashboard can render without the application API, but API-backed features will return network errors until the backend is available.

## Getting started

1. Install dependencies:

   ```sh
   yarn install
   ```

2. Create your local environment file:

   ```sh
   cp .env.example .env.local
   ```

3. Set the API URL in `.env.local`:

   ```dotenv
   VITE_API_BASEURL=http://localhost:4000/api
   VITE_DEV=true
   ```

4. Start the development server:

   ```sh
   yarn dev
   ```

Vite serves the app at [http://localhost:5555](http://localhost:5555) and opens it in the default browser.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASEURL` | Yes | Base URL for the Anella API. |
| `VITE_DEV` | No | When set to a non-empty value, keeps the context menu and developer keyboard shortcuts enabled. Omit it from production builds. |
| `VITE_GOOGLE_SHEET` | No | Reserved Google Sheets integration setting; currently unused by the frontend. |
| `VITE_GOOGLE_SHEET_ID` | No | Reserved Google Sheets document ID; currently unused by the frontend. |

Vite exposes variables prefixed with `VITE_` to client-side code. Do not store secrets in these values.

## Available scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Run the Vite development server on the local network. |
| `yarn build` | Type-check the project and create a production build. |
| `yarn preview` | Preview the production build locally. |
| `yarn type-check` | Run Vue and TypeScript checks without emitting files. |
| `yarn test:unit` | Run unit tests with Vitest and jsdom. |
| `yarn lint` | Run ESLint and apply safe automatic fixes. |

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Responsive personal dashboard |
| `/lyrics` | Lyrics home, search, and featured content |
| `/lyrics/all` | Paginated lyrics library |
| `/lyrics/:id` | Lyrics detail and music player |
| `/lyrics/playlist/:playlistId` | Playlist detail |
| `/lyrics/artist/:artistId` | Artist detail |
| `/lyrics/mine` | Signed-in user's lyrics |
| `/lyrics/add` | Add lyrics (authentication required) |
| `/storage` | Browser local-storage inspector |
| `/princess-connect` | Princess Connect page |
| `/shake` | Motion-based mini-tool |
| `/login` and `/sign-up` | Authentication |

## Project structure

```text
src/
├── assets/       Images and global styles
├── components/   Pages, layout, music player, and shared UI
├── composables/  Reusable Vue composition logic
├── locales/      English and Japanese translations
├── router/       Routes and authentication guards
├── services/     API client and domain services
├── stores/       Pinia state for auth, player, playlists, and widgets
├── types/        Shared TypeScript declarations
├── utils/        Lyrics, storage, toast, and general helpers
└── views/        Route-level components
```

## External browser services

Anella loads or calls the following services directly from the browser:

- YouTube IFrame Player API for playback
- YouTube image servers for video thumbnails
- ipapi for approximate location lookup
- Open-Meteo for current weather

Some browsers do not expose the Battery Status API, so the battery widget may show an unavailable state. The Shake page also depends on motion and vibration support.

## Production

Create an optimized build with:

```sh
yarn build
```

The generated files are written to `dist/`. Because the app uses Vue Router history mode, configure the web server to fall back to `index.html` for unknown routes.
