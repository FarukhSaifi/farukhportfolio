#!/usr/bin/env node

/**
 * Check Spotify App Configuration
 * This script helps verify your Spotify app settings
 */

console.log("🔍 Spotify App Configuration Checker\n");

const clientId = "2f1999f27d9e4d47802d16e09220b362";
const redirectUri = "http://localhost:3000/spotify-success";

console.log("📋 Your Current Spotify App Settings:");
console.log("=".repeat(60));
console.log(`Client ID: ${clientId}`);
console.log(`Redirect URI: ${redirectUri}`);
console.log("=".repeat(60));

console.log("\n🔗 Test Authorization URL:");
console.log("=".repeat(60));
console.log(
  `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=user-read-currently-playing,user-read-recently-played`
);
console.log("=".repeat(60));

console.log("\n📋 To Fix Redirect URI Issues:");
console.log("1. Go to https://developer.spotify.com/dashboard");
console.log("2. Click on your app");
console.log('3. Click "Edit Settings"');
console.log("4. Add this Redirect URI: http://localhost:3000/spotify-success");
console.log("5. Save the changes");

console.log("\n💡 Common Issues:");
console.log("• Redirect URI mismatch (most common)");
console.log("• Missing scopes");
console.log("• App not active");
console.log("• Wrong client ID");

console.log("\n🧪 Test Steps:");
console.log("1. Fix redirect URI in Spotify Dashboard");
console.log("2. Visit the auth page: http://localhost:3000/spotify-auth");
console.log('3. Click "Authorize with Spotify"');
console.log("4. You should be redirected to Spotify (not stuck on loader)");
console.log("5. After authorization, you'll go to /spotify-success");
