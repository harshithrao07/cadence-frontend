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
  const [queue, setQueue] = useState<SongInRecordDTO[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUrlRef = useRef<string | null>(null);
  const queueRef = useRef<SongInRecordDTO[]>([]);
  const queueIndexRef = useRef<number>(-1);
  const requestControllerRef = useRef<AbortController | null>(null);
  const playRequestIdRef = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      const audio = audioRef.current;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleDurationChange = () => setDuration(audio.duration);

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.pause();
        audio.src = "";
        if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(activeUrlRef.current);
          activeUrlRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadAndPlaySong = React.useCallback(
    async (song: SongInRecordDTO) => {
      if (!audioRef.current) return;

      const requestId = ++playRequestIdRef.current;

      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
        requestControllerRef.current = null;
      }

      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;

      setCurrentSong(song);
      setCurrentTime(0);

      try {
        let url: string | null = null;
        const localFile = (song as any).file as File | undefined;
        let controller: AbortController | null = null;

        if (localFile) {
          const blob = new Blob([localFile], { type: localFile.type || "audio/mpeg" });
          url = window.URL.createObjectURL(blob);
        } else if (song.songUrl) {
          url = song.songUrl;
        } else {
          controller = new AbortController();
          requestControllerRef.current = controller;
          const response = await api.get(
            `api/v1/song/stream/${song.songId}`,
            {
              responseType: "blob",
              signal: controller.signal,
            }
          );

          const blob = new Blob([response.data], { type: "audio/mpeg" });
          url = window.URL.createObjectURL(blob);
        }

        if (controller && requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }

        if (requestId !== playRequestIdRef.current) {
          if (url && typeof url === "string" && url.startsWith("blob:")) {
            window.URL.revokeObjectURL(url);
          }
          return;
        }

        if (url) {
          if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:")) {
            window.URL.revokeObjectURL(activeUrlRef.current);
          }
          activeUrlRef.current = url;
          audio.src = url;
        }

        await audio.play();

        if (requestId !== playRequestIdRef.current) {
          audio.pause();
          return;
        }

        setIsPlaying(true);
      } catch (error: any) {
        if (error && (error.code === "ERR_CANCELED" || error.name === "CanceledError")) {
          return;
        }
        console.error("Error playing song:", error);
        setIsPlaying(false);
      }
    },
    []
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const q = queueRef.current;
      const idx = queueIndexRef.current;

      if (q.length > 0 && idx >= 0 && idx < q.length - 1) {
        const nextIndex = idx + 1;
        setQueueIndex(nextIndex);
        loadAndPlaySong(q[nextIndex]);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [loadAndPlaySong]);

  const playSong = React.useCallback(
    (song: SongInRecordDTO) => {
      setQueue([song]);
      setQueueIndex(0);
      queueRef.current = [song];
      queueIndexRef.current = 0;
      loadAndPlaySong(song);
    },
    [loadAndPlaySong]
  );

  const playQueue = React.useCallback(
    (songs: SongInRecordDTO[], startIndex: number = 0) => {
      if (!songs.length || startIndex < 0 || startIndex >= songs.length) return;
      setQueue(songs);
      setQueueIndex(startIndex);
      queueRef.current = songs;
      queueIndexRef.current = startIndex;
      loadAndPlaySong(songs[startIndex]);
    },
    [loadAndPlaySong]
  );

  const playNext = React.useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0 || idx < 0 || idx >= q.length - 1) return;
    const nextIndex = idx + 1;
    setQueueIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    loadAndPlaySong(q[nextIndex]);
  }, [loadAndPlaySong]);

  const playPrevious = React.useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0 || idx <= 0) return;
    const prevIndex = idx - 1;
    setQueueIndex(prevIndex);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    loadAndPlaySong(q[prevIndex]);
  }, [loadAndPlaySong]);

  const pauseSong = React.useCallback(() => {
    playRequestIdRef.current++;
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
      requestControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
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

  const resetPlayer = React.useCallback(() => {
    playRequestIdRef.current++;
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
      requestControllerRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }
    if (activeUrlRef.current && activeUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setQueue([]);
    setQueueIndex(-1);
    queueRef.current = [];
    queueIndexRef.current = -1;
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        queueIndex,
        playSong,
        pauseSong,
        resumeSong,
        seekTo,
        setVolume,
        togglePlay,
        playQueue,
        playNext,
        playPrevious,
        resetPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
