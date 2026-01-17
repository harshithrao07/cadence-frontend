"use client";

import React from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, ListMusic } from "lucide-react";
import Image from "next/image";

const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const MusicPlayer: React.FC = () => {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        seekTo,
        setVolume
    } = usePlayer();

    if (!currentSong) return null;

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        seekTo(parseFloat(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/90 backdrop-blur-lg border-t border-white/10 px-4 flex items-center justify-between z-50">
            {/* Song Info */}
            <div className="flex items-center gap-4 w-[30%]">
                <div className="relative w-14 h-14 flex-shrink-0">
                    <Image
                        src={currentSong.coverUrl || "/images/records/record-placeholder.png"}
                        alt={currentSong.title}
                        fill
                        className="rounded shadow-lg object-cover"
                    />
                </div>
                <div className="min-w-0">
                    <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
                    <p className="text-gray-400 text-xs truncate">
                        {currentSong.artists?.map(a => a.name).join(", ") || "Unknown Artist"}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-2 w-[40%]">
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition">
                        <SkipBack className="w-5 h-5 fill-current" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-black fill-current" />
                        ) : (
                            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                        )}
                    </button>
                    <button className="text-gray-400 hover:text-white transition">
                        <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full max-w-md">
                    <span className="text-[10px] text-gray-400 w-8 text-right">
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-red-500 transition"
                    />
                    <span className="text-[10px] text-gray-400 w-8">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Volume & Extra */}
            <div className="flex items-center justify-end gap-3 w-[30%]">
                <ListMusic className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-red-500 transition"
                    />
                </div>
                <Maximize2 className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
            </div>
        </div>
    );
};
