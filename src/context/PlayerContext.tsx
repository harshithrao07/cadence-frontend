"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { SongInRecordDTO } from "@/types/Song";
import { PlayerContextType } from "@/types/Player";
import api from "@/lib/api";

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<SongInRecordDTO | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      const audio = audioRef.current;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleDurationChange = () => setDuration(audio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("ended", handleEnded);
        audio.pause();
        audio.src = "";
        if (activeUrlRef.current) {
          URL.revokeObjectURL(activeUrlRef.current);
          activeUrlRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = React.useCallback(
    async (song: SongInRecordDTO) => {
      if (audioRef.current) {
        try {
          if (currentSong?.songId !== song.songId) {
            const response = await api.get(
              `api/v1/song/stream/${song.songId}`,
              {
                responseType: "blob",
              }
            );

            const blob = new Blob([response.data], { type: "audio/mpeg" });
            const url = window.URL.createObjectURL(blob);

            if (activeUrlRef.current) {
              window.URL.revokeObjectURL(activeUrlRef.current);
            }
            activeUrlRef.current = url;

            audioRef.current.src = url;
            setCurrentSong(song);
          }

          audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing song:", error);
        }
      }
    },
    [currentSong]
  );

  const pauseSong = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeSong = React.useCallback(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  const togglePlay = React.useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  }, [isPlaying, pauseSong, resumeSong]);

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        playSong,
        pauseSong,
        resumeSong,
        seekTo,
        setVolume,
        togglePlay,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
