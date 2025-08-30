# Spotify Integration Setup Guide

This guide will help you set up Spotify integration for your portfolio using the [Spotify Web API](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track).

## Prerequisites

- A Spotify account
- Node.js 18+ (for the test script)

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create App"**
3. Fill in the app details:
   - **App name**: Your portfolio name (e.g., "My Portfolio")
   - **App description**: Brief description
   - **Website**: Your portfolio URL
   - **Redirect URI**: `http://localhost:3000/spotify-success` (for development)
4. Click **"Save"**

## Step 2: Get Your Credentials

After creating the app, you'll see:

- **Client ID**: Copy this
- **Client Secret**: Click "Show Client Secret" and copy it

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Spotify API credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
```

## Step 4: Get Your Refresh Token

### Option A: Use the Built-in Auth Flow

1. Start your development server: `npm run dev`
2. Visit `/spotify-auth` in your browser
3. Click "Connect with Spotify"
4. Authorize your app
5. You'll be redirected to `/spotify-success` with your refresh token
6. Copy the token and add it to `.env.local`

### Option B: Manual Token Generation

1. Visit this URL (replace `YOUR_CLIENT_ID` with your actual client ID):

   ```
   https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/spotify-success&scope=user-read-currently-playing,user-read-recently-played
   ```

2. Authorize the app
3. Copy the `code` parameter from the redirect URL
4. Exchange the code for tokens using curl:

   ```bash
   curl -X POST -H "Content-Type: application/x-www-form-urlencoded" \
        -H "Authorization: Basic $(echo -n 'YOUR_CLIENT_ID:YOUR_CLIENT_SECRET' | base64)" \
        -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=http://localhost:3000/spotify-success" \
        https://accounts.spotify.com/api/token
   ```

5. Copy the `refresh_token` from the response

## Step 5: Test Your Setup

Run the test script to verify everything works:

```bash
npm run test:spotify
```

This will:

- ✅ Check environment variables
- ✅ Test token refresh
- ✅ Test API calls
- ✅ Show detailed error messages if something fails

## Step 6: Deploy

For production, update your redirect URI in the Spotify Dashboard to your live domain:

- **Production Redirect URI**: `https://yourdomain.com/spotify-success`

## Troubleshooting

### Common Issues

#### 1. "Invalid refresh token" Error

- **Cause**: Token expired or invalid
- **Solution**: Re-authenticate using `/spotify-auth`

#### 2. "Invalid client credentials" Error

- **Cause**: Wrong client ID or secret
- **Solution**: Double-check your credentials in the Spotify Dashboard

#### 3. "Missing required Spotify environment variables" Error

- **Cause**: `.env.local` file missing or incomplete
- **Solution**: Create/update `.env.local` with all required variables

#### 4. API Returns 204 (No Content)

- **Cause**: User not currently playing anything
- **Solution**: This is normal - start playing music on Spotify

### Debug Mode

Enable detailed logging by checking the console output. The updated service includes comprehensive logging for:

- Token refresh attempts
- API calls
- Error details
- Response status codes

### Rate Limits

Spotify API has rate limits:

- **Token refresh**: 100 requests per hour
- **Currently playing**: 100 requests per hour
- **Recently played**: 100 requests per hour

The API includes caching (30 seconds) to minimize API calls.

## API Endpoints

Your portfolio now includes these Spotify endpoints:

- **`/api/spotify/now-playing`** - Get currently playing track
- **`/api/spotify/recently-played`** - Get recently played tracks
- **`/spotify-auth`** - Spotify authentication page
- **`/spotify-success`** - Success page with refresh token

## Security Notes

- Never commit `.env.local` to version control
- Keep your client secret secure
- Refresh tokens can be revoked by users
- Consider implementing token rotation for production

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Run `npm run test:spotify` to isolate the problem
3. Verify your credentials in the Spotify Dashboard
4. Check the [Spotify Web API documentation](https://developer.spotify.com/documentation/web-api)

---

**Happy coding! 🎵**
