# YouTube Music setup (Google OAuth + YouTube Data API)

This app connects YouTube Music via **Google OAuth 2.0 (PKCE)** and reads track metadata with **YouTube Data API v3**. There is no separate “YouTube Music API” product in Google Cloud — you use a Google Cloud project, enable YouTube Data API v3, and create a **Web application** OAuth client.

## What you need in `.env.local`

Copy from [`.env.example`](.env.example) and set:

| Variable                      | Required | Purpose                                                      |
| ----------------------------- | -------- | ------------------------------------------------------------ |
| `YOUTUBE_MUSIC_CLIENT_ID`     | Yes      | OAuth 2.0 Client ID                                          |
| `YOUTUBE_MUSIC_CLIENT_SECRET` | Yes      | OAuth 2.0 Client secret                                      |
| `YOUTUBE_MUSIC_REDIRECT_URI`  | No       | Override callback URL if it must differ from the app default |

Also required for token storage (already used by Spotify):

- `MONGODB_URI`

Admin Connect is behind password protection:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### Default redirect URIs (must match Google Cloud exactly)

| Environment | Redirect URI                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Local       | `http://127.0.0.1:3000/youtube-music-success`                                                         |
| Production  | `{NEXT_PUBLIC_BASE_URL}/youtube-music-success` (e.g. `https://your-domain.com/youtube-music-success`) |

Optional override in env:

```bash
YOUTUBE_MUSIC_REDIRECT_URI=http://127.0.0.1:3000/youtube-music-success
```

Use `127.0.0.1` for local (same pattern as Spotify). Prefer not relying on `localhost` if Google rejects it for your client.

---

## Step-by-step in Google Cloud Console

### 1. Open Google Cloud Console

Go to [https://console.cloud.google.com](https://console.cloud.google.com) and sign in with the Google account that should own the credentials.

### 2. Create or select a project

1. Open the project picker (top bar).
2. **New Project** → name it (e.g. `farukh-portfolio`) → **Create**.
3. Select that project.

### 3. Enable YouTube Data API v3

1. Go to **APIs & Services** → **Library**  
   (or [https://console.cloud.google.com/apis/library](https://console.cloud.google.com/apis/library)).
2. Search for **YouTube Data API v3**.
3. Open it → **Enable**.

### 4. Configure the OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**.
2. Choose **External** (unless you use a Google Workspace org and want Internal).
3. Fill required app name, user support email, and developer contact.
4. Add scopes when prompted, or later under **Scopes**:
   - `https://www.googleapis.com/auth/youtube.readonly`
5. Under **Test users** (while the app is in Testing): add the Google account(s) that will click **Connect** in `/admin`.
6. Save.

> While the consent app is in **Testing**, only listed test users can complete OAuth.

### 5. Create OAuth 2.0 credentials (Web application)

1. **APIs & Services** → **Credentials**  
   (or [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)).
2. **Create credentials** → **OAuth client ID**.
3. Application type: **Web application**.
4. Name it (e.g. `Portfolio YouTube Music`).
5. Under **Authorized redirect URIs** → **Add URI**, add exactly:
   - Local: `http://127.0.0.1:3000/youtube-music-success`
   - Production (when ready): `https://your-domain.com/youtube-music-success`
6. **Create**.
7. Copy the **Client ID** and **Client secret**.

### 6. Put values in `.env.local`

```bash
YOUTUBE_MUSIC_CLIENT_ID=your-client-id.apps.googleusercontent.com
YOUTUBE_MUSIC_CLIENT_SECRET=your-client-secret
# Optional — only if you need an explicit override:
# YOUTUBE_MUSIC_REDIRECT_URI=http://127.0.0.1:3000/youtube-music-success
```

Restart the Next.js dev server after changing env vars (`npm run dev`).

For production (e.g. Vercel), set the same `YOUTUBE_MUSIC_CLIENT_ID` and `YOUTUBE_MUSIC_CLIENT_SECRET`, plus a production redirect URI in Google Cloud that matches `NEXT_PUBLIC_BASE_URL`.

---

## Verify in the app

1. Sign in at `/admin`.
2. Open the **YouTube Music** tab (`/admin?tab=youtube-music`).
3. Click **Connect** — you should be sent to Google, then back to `/youtube-music-success`.
4. Admin should show connected; tokens land in the shared MongoDB collection `spotify_credentials` with `service: "youtube_music"`.
5. Public endpoint: `GET /api/youtube-music/public-now-playing` (uses Liked Music / last-played persistence in `youtube_music_last_played`).

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Connect fails or 500 mentioning client id/secret | Missing `YOUTUBE_MUSIC_CLIENT_ID` / `YOUTUBE_MUSIC_CLIENT_SECRET` in `.env.local`, or server not restarted |
| `redirect_uri_mismatch` | Redirect URI in Google Cloud ≠ app callback (check `127.0.0.1` vs `localhost`, trailing slash, http vs https) |
| Access blocked / app not verified | Consent screen in Testing and your Google account is not a **Test user** |
| API errors after connect | YouTube Data API v3 not enabled on the same project as the OAuth client |
| Tokens not saved | `MONGODB_URI` missing/wrong, or admin session missing during Connect |

---

## Notes

- OAuth uses PKCE; the client secret is still required for Google’s web client token exchange in this app.
- “Now playing” for YouTube Music is approximated via YouTube Data API (Liked Music playlist `LM` and last-played persistence), not a live YouTube Music “currently playing” API.
- Do not commit real client secrets. Keep them in `.env.local` / host env only.
