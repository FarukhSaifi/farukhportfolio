"use client";
import { useEffect, useState } from "react";

interface Track {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
}

const NowPlaying = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        // Call the API route you created to get the currently playing track
        const response = await fetch("/api/spotify");
        const data = await response.json();

        if (data.isPlaying) {
          setTrack({
            title: data.title,
            artist: data.artist,
            album: data.album,
            imageUrl: data.albumImageUrl,
            songUrl: data.songUrl,
          });
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      } catch (error) {
        console.error("Error fetching track:", error);
      }
    };

    fetchTrack();
  }, []);

  return (
    <div>
      <h1>Currently Playing</h1>
      {isPlaying ? (
        <div>
          <h2>{track?.title}</h2>
          <p>{track?.artist}</p>
          <p>{track?.album}</p>
          <img
            src={track?.imageUrl}
            alt={track?.title}
            width={100}
            height={100}
          />
          <p>
            <a href={track?.songUrl} target="_blank" rel="noopener noreferrer">
              Listen on Spotify
            </a>
          </p>
        </div>
      ) : (
        <p>No song is currently playing</p>
      )}
    </div>
  );
};

export default NowPlaying;
