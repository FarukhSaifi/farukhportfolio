# 🎵 Spotify Integration Setup Guide

This guide will help you set up the Spotify "Now Playing" feature in your portfolio.

## 🚀 **Quick Start**

### **Step 1: Spotify App Configuration**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or select existing one
3. Add this redirect URI: `http://localhost:3000/api/spotify/callback`
4. Copy your **Client ID** and **Client Secret**

### **Step 2: Environment Variables**

Add these to your `.env.local` file:

```bash
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
```

### **Step 3: Get Your Refresh Token**

1. Visit: `http://localhost:3000/spotify-auth`
2. Click "Authorize with Spotify"
3. Complete the Spotify authorization
4. Copy the refresh token from the success page
5. Add it to your `.env.local` file

### **Step 4: Restart Server**

```bash
npm run dev
```

## 🔧 **How It Works**

### **Architecture**

- **`/lib/spotify.ts`** - Centralized Spotify service with token management
- **`/api/spotify/now-playing`** - API endpoint for currently playing track
- **`/api/spotify/auth`** - Initiates OAuth flow
- **`/api/spotify/callback`** - Handles OAuth callback
- **`/spotify-auth`** - User-facing authorization page
- **`/spotify-success`** - Success page with refresh token
- **`NowPlayingBanner`** - Header component displaying current track

### **Features**

- ✅ Automatic token refresh
- ✅ Error handling and fallbacks
- ✅ Rate limiting (30-second cache)
- ✅ Clean separation of concerns
- ✅ TypeScript interfaces
- ✅ Responsive design

### **API Endpoints**

- `GET /api/spotify/now-playing` - Get currently playing track
- `GET /api/spotify/auth` - Start OAuth flow
- `GET /api/spotify/callback` - OAuth callback handler

## 🎯 **Customization**

### **Change Refresh Interval**

In `NowPlaying.tsx`, modify the interval:

```typescript
// Refresh every 30 seconds
const interval = setInterval(fetchTrack, 30000);

// Refresh every 2 minutes
const interval = setInterval(fetchTrack, 120000);
```

### **Add More Spotify Data**

Extend the `SpotifyService` class in `/lib/spotify.ts`:

```typescript
async getRecentlyPlayed(limit: number = 5) {
  // Implementation for recently played tracks
}

async getPlaylists() {
  // Implementation for user playlists
}
```

### **Styling**

Modify the `NowPlayingBanner` component in `/components/NowPlaying.tsx` to match your design.

## 🐛 **Troubleshooting**

### **Common Issues**

#### **"Missing required Spotify environment variables"**

- Check your `.env.local` file
- Ensure all three variables are set
- Restart your development server

#### **"Failed to refresh Spotify access token"**

- Your refresh token may have expired
- Re-authorize through `/spotify-auth`
- Update your `.env.local` with the new token

#### **"Spotify API error: 401"**

- Invalid or expired access token
- The service will automatically refresh, but check your credentials

#### **"Failed to fetch Spotify data"**

- Check your internet connection
- Verify your Spotify app settings
- Check server logs for detailed errors

### **Debug Mode**

Enable detailed logging by adding to your `.env.local`:

```bash
DEBUG=spotify:*
```

## 🔒 **Security Notes**

- **Never commit** your `.env.local` file
- **Refresh tokens** are long-lived - keep them secure
- **Client secrets** should remain server-side only
- **Access tokens** are automatically managed and short-lived

## 📱 **Production Deployment**

1. Update redirect URIs in Spotify Dashboard
2. Set `NEXT_PUBLIC_BASE_URL` environment variable
3. Ensure all environment variables are set in your hosting platform
4. Test the OAuth flow in production

## 🎉 **You're All Set!**

Once configured, the Spotify "Now Playing" banner will automatically appear in your header when you're listening to music on Spotify!

---

**Need Help?** Check the server logs or browser console for detailed error messages.
