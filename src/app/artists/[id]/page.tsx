"use client";

import React, { useEffect, useState } from "react";
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Shuffle,
  Disc,
} from "lucide-react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ArtistProfileDTO } from "@/types/Artists";
import { RecordPreviewDTO } from "@/types/Record";
import { ApiResponse } from "@/types/ApiResponse";
import Image from "next/image";
import { useArtists } from "@/context/ArtistContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import { SongInRecordDTO, TrackPreviewDTO } from "@/types/Song";
import { toast } from "sonner";
import AddArtist from "../../../components/artists/AddArtist";

export default function ArtistProfile() {
  const { getArtistById, refreshArtists } = useArtists();
  const { isAdmin } = useUser();
  const { playSong, playQueue, currentSong, isPlaying: isGlobalPlaying, togglePlay: toggleGlobalPlay } = usePlayer();
  const [likedSongs, setLikedSongs] = useState(new Set());
  const { id } = useParams();
  const [artist, setArtist] = useState<ArtistProfileDTO>({
    id: "",
    name: "Unknown Artist",
    profileUrl: "",
    description: "This artist profile is loading.",
    followers: 0,
    monthlyListeners: 0,
    popularSongs: [],
    artistRecords: [],
  });
  const [popularSongs, setPopularSongs] = useState<TrackPreviewDTO[]>([]);
  const [artistRecords, setArtistRecords] = useState<RecordPreviewDTO[]>([]);
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const artistId = Array.isArray(id) ? id[0] : id;
    const preview = getArtistById(artistId);
    if (preview) {
      setArtist((prev) => ({
        ...prev,
        id: preview.id,
        name: preview.name,
        profileUrl: preview.profileUrl || prev.profileUrl,
      }));
    }

    // Fetch artist data based on id
    const fetchArtistData = async (artistId) => {
      const res = await api.get<ApiResponse<ArtistProfileDTO>>(
        "/api/v1/artist/" + artistId
      );
      setArtist(res.data.data);
      setPopularSongs(res.data.data.popularSongs);
      setArtistRecords(res.data.data.artistRecords);
    };

    fetchArtistData(artistId);
  }, [id]);

  const toggleLike = (id) => {
    setLikedSongs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatReleaseDate = (timestamp: string | number) => {
    const date = new Date(Number(timestamp));
    return date.getFullYear();
  };

  const formatDuration = (seconds: number | string) => {
    const totalSeconds = typeof seconds === "string" ? parseInt(seconds) : seconds;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isCurrentSongPlaying = (songId: string) => {
    return currentSong?.songId === songId && isGlobalPlaying;
  };

  const handlePlayPopularSong = (track: TrackPreviewDTO) => {
    if (currentSong?.songId === track.songId) {
      toggleGlobalPlay();
      return;
    }

    if (!popularSongs.length) return;

    let orderedTracks = [...popularSongs];
    if (shuffle) {
      orderedTracks = [...popularSongs];
      for (let i = orderedTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [orderedTracks[i], orderedTracks[j]] = [orderedTracks[j], orderedTracks[i]];
      }
    }

    const queueSongs: SongInRecordDTO[] = orderedTracks.map((t) => ({
      songId: t.songId,
      title: t.title,
      totalDuration: t.totalDuration,
      coverUrl: t.coverUrl,
      artists: t.artists,
      createdBy: [],
      songUrl: "",
      order: 0,
      genres: []
    }));

    const startIndex = queueSongs.findIndex(s => s.songId === track.songId);
    if (startIndex === -1) {
      const songToPlay: SongInRecordDTO = {
        songId: track.songId,
        title: track.title,
        totalDuration: track.totalDuration,
        coverUrl: track.coverUrl,
        artists: track.artists,
        createdBy: [],
        songUrl: "",
        order: 0,
        genres: []
      };
      playSong(songToPlay);
      return;
    }

    playQueue(queueSongs, startIndex);
  };

  const handleDeleteArtist = async () => {
    const artistIdParam = Array.isArray(id) ? id[0] : id;
    if (!artistIdParam) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this artist? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/v1/artist/delete/${artistIdParam}`);
      await refreshArtists();
      toast.success("Artist deleted successfully");
      router.push("/artists");
    } catch (error) {
      console.error("Failed to delete artist:", error);
      toast.error("Failed to delete artist. Please try again.");
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-black text-white px-8 pt-16">
        <AddArtist
          setShowAddForm={setIsEditing}
          initialArtist={artist}
          mode="edit"
          onArtistSaved={(updated) => {
            setArtist((prev) => ({
              ...prev,
              name: updated.name,
              description: updated.description || "",
              profileUrl: updated.profileUrl || prev.profileUrl,
            }));
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-b from-red-500 to-black">
        <div className="absolute inset-0 flex items-end p-8">
          {artist.profileUrl && (
            <Image
              src={artist.profileUrl || "/images/artists/artist-placeholder.png"}
              alt={artist.name}
              width={192}
              height={192}
              className="w-48 h-48 rounded-full object-cover shadow-2xl mr-6"
            />
          )}

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Verified Artist</span>
            </div>
            <h1 className="text-7xl font-bold mb-4">{artist.name}</h1>
            <p className="text-sm">
              {artist.monthlyListeners} monthly listeners
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black p-8">
        <div className="flex items-center justify-between mb-8">
          {/* Left controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (popularSongs.length > 0) {
                  if (isCurrentSongPlaying(popularSongs[0].songId)) {
                    toggleGlobalPlay();
                  } else {
                    handlePlayPopularSong(popularSongs[0]);
                  }
                }
              }}
              className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-105 transition"
            >
              {popularSongs.length > 0 && isCurrentSongPlaying(popularSongs[0].songId) ? (
                <Pause fill="black" className="text-black" />
              ) : (
                <Play fill="black" className="text-black ml-1" />
              )}
            </button>

            <button
              onClick={() => setShuffle((prev) => !prev)}
              className={`w-10 h-10 border rounded-full flex items-center justify-center transition ${shuffle ? "border-red-500 text-red-500" : "border-gray-600 text-gray-400 hover:border-white hover:text-white"}`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                className="w-10 h-10 flex items-center justify-center hover:scale-110 transition"
                onClick={() => setShowMoreMenu((prev) => !prev)}
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
              {isAdmin && showMoreMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-black border border-zinc-700 rounded-md shadow-lg z-20">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setIsEditing(true);
                    }}
                  >
                    Edit artist
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleDeleteArtist();
                    }}
                  >
                    Delete artist
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right action */}
          {isAdmin && (
            <button
              onClick={() => router.push(`/records/add?artistId=${artist.id}`)}
              className="flex items-center gap-2 bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 border border-zinc-700 shadow-lg"
            >
              <Disc className="w-5 h-5" />
              Add New Record
            </button>
          )}
        </div>

        {/* Popular Tracks */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Popular</h2>
          <div className="space-y-2">
            {popularSongs.map((track, index) => (
              <div
                key={track.songId}
                className="grid grid-cols-[auto_auto_1fr_auto] gap-4 items-center p-2 rounded hover:bg-white/10 group transition"
              >
                <div className="w-8 text-gray-400 group-hover:hidden text-center flex items-center justify-center">
                  {isCurrentSongPlaying(track.songId) ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 bg-red-500 animate-pulse h-1.5"></span>
                      <span className="w-0.5 bg-red-500 animate-pulse h-3" style={{ animationDelay: "0.2s" }}></span>
                      <span className="w-0.5 bg-red-500 animate-pulse h-2" style={{ animationDelay: "0.4s" }}></span>
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>
                <button
                  onClick={() => handlePlayPopularSong(track)}
                  className="w-8 hidden group-hover:flex justify-center"
                >
                  {isCurrentSongPlaying(track.songId) ? (
                    <Pause fill="white" className="w-4 h-4" />
                  ) : (
                    <Play fill="white" className="w-4 h-4" />
                  )}
                </button>
                <div className="min-w-0 flex items-center gap-3">
                  <Image
                    src={track.coverUrl || "/images/records/record-placeholder.png"}
                    alt={track.title}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                  <div>
                    <div className={`font-semibold truncate ${isCurrentSongPlaying(track.songId) ? "text-red-500" : "text-white"}`}>
                      {track.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {track.artists?.length > 0 ? (
                        track.artists.map((artist, artistIndex) => (
                          <span key={artist.id}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/artists/${artist.id}`);
                              }}
                              className="hover:text-red-400 transition underline"
                            >
                              {artist.name}
                            </button>
                            {artistIndex < track.artists.length - 1 && ", "}
                          </span>
                        ))
                      ) : (
                        "Unknown Artist"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-end">
                  <button
                    onClick={() => toggleLike(track.songId)}
                    className="opacity-0 group-hover:opacity-100 transition"
                  >
                    <Heart
                      className={`w-5 h-5 ${likedSongs.has(track.songId)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                        }`}
                    />
                  </button>
                  <div className="text-sm text-gray-400 w-16 text-right">
                    {formatDuration(track.totalDuration)}
                  </div>
                </div>
              </div>
            ))}

            {popularSongs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No popular songs</div>
                <div className="text-gray-500 text-sm">This artist does not have any popular songs yet.</div>
              </div>
            )}
          </div>
        </div>

        {/* Discography */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Discography</h2>
            <button
              onClick={() => router.push(`/records?artistId=${artist.id}`)}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Show all
            </button>
          </div>

          {artistRecords.length === 0 ? (
            <p className="text-gray-400">No records released yet.</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {artistRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => router.push(`/records/${record.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative mb-2">
                    <Image
                      src={record.coverUrl || "/images/records/record-placeholder.png"}
                      alt={record.title}
                      width={150}
                      height={150}
                      className="w-full aspect-square rounded-lg object-cover shadow-lg group-hover:scale-105 transition"
                    />

                    {/* Play button overlay */}
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition">
                      <Play fill="black" className="ml-0.5 w-4 h-4" />
                    </button>
                  </div>

                  <div className="font-semibold truncate text-sm">{record.title}</div>
                  <div className="text-xs text-gray-400">
                    {formatReleaseDate(record.releaseTimestamp)} • {record.recordType}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <div className="flex items-start gap-6">
            {artist.profileUrl && (
              <Image
                src={artist.profileUrl || "/images/artists/artist-placeholder.png"}
                alt={artist.name}
                width={192}
                height={192}
                className="w-48 h-48 rounded-lg object-cover"
              />
            )}

            <div>
              <div className="text-gray-300 mb-4">{artist.description}</div>
              <div className="text-sm font-semibold mb-1">
                {artist.followers} Followers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
