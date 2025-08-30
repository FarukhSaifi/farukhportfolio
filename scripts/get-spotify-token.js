#!/usr/bin/env node

/**
 * Manual Spotify Token Generator
 * This script helps you get a refresh token manually
 */

console.log("🎵 Spotify Token Generator\n");

const clientId = "2f1999f27d9e4d47802d16e09220b362";
const redirectUri = "http://localhost:3000/spotify-success";
const scope = "user-read-currently-playing,user-read-recently-played";

console.log("📋 Step 1: Visit this URL in your browser:");
console.log("=".repeat(80));
console.log(
  `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`
);
console.log("=".repeat(80));

console.log("\n📋 Step 2: After authorization, you'll be redirected to a URL like:");
console.log("http://localhost:3000/spotify-success?code=AQD7...");
console.log('\nCopy the "code" parameter value (everything after "code=")');

console.log("\n📋 Step 3: Run this command with your code:");
console.log('curl -X POST -H "Content-Type: application/x-www-form-urlencoded" \\');
console.log(
  `     -H "Authorization: Basic $(echo -n '${clientId}:5fa7adc38ba6417e8f28e0c4b26ec714' | base64)" \\`
);
console.log(
  '     -d "grant_type=authorization_code&code=YOUR_CODE_HERE&redirect_uri=http://localhost:3000/spotify-success" \\'
);
console.log("     https://accounts.spotify.com/api/token");

console.log(
  '\n📋 Step 4: Copy the "refresh_token" from the response and update your .env.local file'
);
console.log("\n💡 Tip: Make sure your Spotify app has the correct redirect URI:");
console.log(`   ${redirectUri}`);

console.log("\n🔍 To check your app settings, visit:");
console.log("https://developer.spotify.com/dashboard");
