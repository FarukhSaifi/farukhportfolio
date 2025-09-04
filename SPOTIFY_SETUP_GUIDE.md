# Spotify Integration Setup Guide

## Issue Resolution: 401 Unauthorized Error

The 401 Unauthorized error occurs because the Spotify API credentials are not properly configured. Follow these steps to resolve the issue:

## Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: Your Portfolio (or any name you prefer)
   - **App description**: Portfolio website with Spotify integration
   - **Website**: Your website URL (e.g., <https://farukh.me>)
   - **Redirect URI**:
     - For development: `http://localhost:3000/spotify-success`
     - For production: `https://farukh.me/spotify-success`
5. Click "Save"

## Step 2: Get Your Credentials

1. In your app dashboard, click on your app
2. Note down:
   - **Client ID** (visible in the app overview)
   - **Client Secret** (click "Show client secret" to reveal it)

## Step 3: Create Environment File

Create a `.env.local` file in your project root with the following content:

```env
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Base URL for production
NEXT_PUBLIC_BASE_URL=https://farukh.me
```

Replace `your_spotify_client_id_here` and `your_spotify_client_secret_here` with your actual credentials from Step 2.

## Step 4: Restart Your Development Server

After creating the `.env.local` file:

```bash
# Stop your current development server (Ctrl+C)
# Then restart it
npm run dev
# or
yarn dev
```

## Step 5: Authenticate with Spotify

1. Go to `http://localhost:3000/spotify-auth`
2. Click "Connect with Spotify"
3. Authorize the app in the Spotify popup
4. You'll be redirected back with a refresh token stored in your browser

## Step 6: Test the Integration

1. Make sure you have Spotify open and playing music
2. Visit your portfolio website
3. The "Now Playing" component should display your current track

## Troubleshooting

### Still getting 401 errors?

1. **Check your environment variables**: Make sure `.env.local` exists and has the correct credentials
2. **Verify redirect URI**: Ensure the redirect URI in your Spotify app matches exactly
3. **Check token storage**: Open browser dev tools → Application → Local Storage and verify tokens are stored
4. **Restart server**: Environment variables require a server restart

### Common Issues

- **"Invalid client credentials"**: Check your Client ID and Client Secret
- **"Invalid redirect URI"**: Make sure the redirect URI in your Spotify app matches your environment
- **"No refresh token"**: You need to go through the OAuth flow at `/spotify-auth`

## API Endpoints

The integration uses these endpoints:

- `/api/spotify/now-playing` - Get currently playing track
- `/api/spotify/auth` - Start OAuth flow
- `/api/spotify/callback` - Handle OAuth callback
- `/api/spotify/exchange-code` - Exchange authorization code for tokens

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Client Secret should only be used on the server side
- Refresh tokens are stored in browser localStorage

## Production Deployment

For production deployment:

1. Set the environment variables in your hosting platform
2. Update the redirect URI in your Spotify app to use your production domain
3. Make sure `NEXT_PUBLIC_BASE_URL` is set to your production URL
