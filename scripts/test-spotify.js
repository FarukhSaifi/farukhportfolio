#!/usr/bin/env node

/**
 * Test script to verify Spotify API credentials
 * Usage: node scripts/test-spotify.js
 */

require('dotenv').config({ path: '.env.local' });

async function testSpotifyCredentials() {
  console.log('🧪 Testing Spotify API credentials...\n');
  
  // Check environment variables
  const requiredVars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKEN'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease create a .env.local file with your Spotify credentials.');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  console.log(`   Client ID: ${process.env.SPOTIFY_CLIENT_ID?.substring(0, 8)}...`);
  console.log(`   Client Secret: ${process.env.SPOTIFY_CLIENT_SECRET?.substring(0, 8)}...`);
  console.log(`   Refresh Token: ${process.env.SPOTIFY_REFRESH_TOKEN?.substring(0, 8)}...\n`);
  
  // Test token refresh
  try {
    console.log('🔄 Testing token refresh...');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Token refresh failed (${response.status}): ${errorText}`);
      
      if (response.status === 400) {
        console.error('\n💡 This usually means your refresh token is invalid or expired.');
        console.error('   Please re-authenticate with Spotify using the /spotify-auth page.');
      } else if (response.status === 401) {
        console.error('\n💡 This usually means your client ID or client secret is incorrect.');
        console.error('   Please check your Spotify app credentials.');
      }
      
      process.exit(1);
    }
    
    const data = await response.json();
    console.log('✅ Token refresh successful');
    console.log(`   Access token: ${data.access_token.substring(0, 20)}...`);
    console.log(`   Expires in: ${data.expires_in} seconds\n`);
    
    // Test API call
    console.log('🎵 Testing Spotify API call...');
    
    const apiResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });
    
    if (apiResponse.status === 204) {
      console.log('✅ API call successful (no currently playing track)');
    } else if (apiResponse.ok) {
      const trackData = await apiResponse.json();
      console.log('✅ API call successful');
      if (trackData.item) {
        console.log(`   Currently playing: ${trackData.item.name} by ${trackData.item.artists[0].name}`);
      }
    } else {
      console.error(`❌ API call failed (${apiResponse.status}): ${apiResponse.statusText}`);
      process.exit(1);
    }
    
    console.log('\n🎉 All tests passed! Your Spotify integration should work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or you need to install node-fetch');
  process.exit(1);
}

testSpotifyCredentials().catch(console.error);
