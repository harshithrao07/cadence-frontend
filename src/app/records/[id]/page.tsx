"use client";

import { useRecords } from "@/context/RecordContext";
import { useSongs } from "@/context/SongContext";
import { useUser } from "@/context/UserContext";
import { RecordPreviewDTO, RecordType } from "@/types/Record";
import { SongInRecordDTO } from "@/types/Song";
import { Play, Pause, Clock, Heart, Settings } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddRecordPage from "../add/page";

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0 && secs === 0) return "0 seconds";
  if (mins === 0) return `${secs} second${secs !== 1 ? 's' : ''}`;
  if (secs === 0) return `${mins} minute${mins !== 1 ? 's' : ''}`;
  return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function RecordPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getRecordById } = useRecords();
  const { fetchSongsByRecordId } = useSongs();
  const { isAdmin } = useUser();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [songs, setSongs] = useState<SongInRecordDTO[]>([]);
  const [record, setRecord] = useState<RecordPreviewDTO>({
    id: "",
    title: "Loading...",
    coverUrl: "",
    recordType: RecordType.ALBUM,
    releaseTimestamp: Date.now(),
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const recordId = Array.isArray(id) ? id[0] : id;

    const fetchRecord = async () => {
      if (recordId) {
        const record = await getRecordById(recordId);
        if (record) {
          setRecord(record);
        }
        const songs = await fetchSongsByRecordId(recordId);
        if (songs) {
          setSongs(songs);
        }
      }
    };
    fetchRecord();
  }, [id, getRecordById, fetchSongsByRecordId]);

  const totalDuration = songs.reduce(
    (acc, song) => acc + song.totalDuration,
    0
  );
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = totalDuration % 60;

  const formattedTotalDuration = (() => {
    if (totalMinutes === 0 && totalSeconds === 0) return "0 seconds";
    if (totalMinutes === 0) return `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
    if (totalSeconds === 0) return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
    return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''} ${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
  })();

  const togglePlay = (songId: string) => {
    setPlayingId(playingId === songId ? null : songId);
  };

  const toggleLikeSong = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    const newLiked = new Set(likedSongs);
    if (newLiked.has(songId)) {
      newLiked.delete(songId);
    } else {
      newLiked.add(songId);
    }
    setLikedSongs(newLiked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-black to-black text-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-6 flex flex-col md:flex-row gap-6 items-end">
        <Image
          src={record.coverUrl || "/images/records/record-placeholder.png"}
          alt={record.title}
          className="w-56 h-56 shadow-2xl"
          width={224}
          height={224}
        />
        <div className="flex flex-col justify-end">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {record.title}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <div className="font-medium flex flex-wrap gap-1">
              {(() => {
                // Collect unique artists from all songs
                const uniqueArtists = new Map<string, { id: string; name: string }>();
                songs.forEach(song => {
                  song.artists?.forEach(artist => {
                    if (!uniqueArtists.has(artist.id)) {
                      uniqueArtists.set(artist.id, artist);
                    }
                  });
                });

                const artists = Array.from(uniqueArtists.values());
                if (artists.length === 0) return <span>Unknown Artist</span>;

                return artists.map((artist, index) => (
                  <span key={artist.id}>
                    <button
                      onClick={() => router.push(`/artists/${artist.id}`)}
                      className="text-white hover:text-red-400 transition underline"
                    >
                      {artist.name}
                    </button>
                    {index < artists.length - 1 && ", "}
                  </span>
                ));
              })()}
            </div>
            <span>•</span>
            <span>{formatDate(record.releaseTimestamp)}</span>
            <span>•</span>
            <span>
              {songs.length} songs, {formattedTotalDuration}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-6 bg-gradient-to-b from-black/40 to-black">
        <div className="flex items-center gap-6">
          <button
            onClick={() => togglePlay(songs[0].songId)}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 hover:scale-105 transition flex items-center justify-center"
          >
            {playingId ? (
              <Pause className="w-6 h-6 text-black fill-black" />
            ) : (
              <Play className="w-6 h-6 text-black fill-black ml-1" />
            )}
          </button>
          <button
            onClick={() => setLiked(!liked)}
            className="transition hover:scale-110"
          >
            <Heart
              className={`w-8 h-8 ${liked
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-white"
                }`}
            />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowUpdateModal(true)}
              className="transition hover:scale-110"
              title="Update Record"
            >
              <Settings className="w-8 h-8 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Song List */}
      <div className="px-6 pb-12">
        <div className="grid grid-cols-[16px_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 mb-2">
          <div>#</div>
          <div>Title</div>
          <div></div>
          <div className="flex justify-end">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {songs.map((song, index) => (
          <div
            key={song.songId}
            className="grid grid-cols-[16px_1fr_auto_auto] gap-4 px-4 py-3 rounded hover:bg-white/10 group cursor-pointer transition"
            onClick={() => togglePlay(song.songId)}
          >
            <div className="flex items-center justify-center text-gray-400 group-hover:text-white">
              {playingId === song.songId ? (
                <div className="flex gap-0.5 items-end h-4">
                  <span className="w-0.5 bg-red-500 animate-pulse h-2"></span>
                  <span
                    className="w-0.5 bg-red-500 animate-pulse h-4"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                  <span
                    className="w-0.5 bg-red-500 animate-pulse h-3"
                    style={{ animationDelay: "0.4s" }}
                  ></span>
                </div>
              ) : (
                <span className="group-hover:hidden">{index + 1}</span>
              )}
              <Play className="w-4 h-4 hidden group-hover:block text-white fill-white" />
            </div>
            <div className="flex items-center gap-3">
              <Image
                src={song.coverUrl || "/images/records/record-placeholder.png"}
                alt={song.title}
                className="w-10 h-10 md:hidden"
                width={40}
                height={40}
              />
              <div>
                <div
                  className={`font-medium ${playingId === song.songId ? "text-red-500" : "text-white"
                    }`}
                >
                  {song.title}
                </div>
                <div className="text-sm text-gray-400">
                  {song.artists?.map((artist, index) => (
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
                      {index < (song.artists?.length || 0) - 1 && ", "}
                    </span>
                  )) || "Unknown Artist"}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={(e) => toggleLikeSong(e, song.songId)}
                className="opacity-0 group-hover:opacity-100 transition hover:scale-110"
              >
                <Heart
                  className={`w-5 h-5 ${likedSongs.has(song.songId)
                    ? "fill-red-500 text-red-500 opacity-100"
                    : "text-gray-400 hover:text-white"
                    }`}
                  style={likedSongs.has(song.songId) ? { opacity: 1 } : {}}
                />
              </button>
            </div>
            <div className="flex items-center justify-end text-gray-400 text-sm">
              {formatDuration(song.totalDuration)}
            </div>
          </div>
        ))}

        {songs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No songs available</div>
            <div className="text-gray-500 text-sm">This record doesn't have any songs yet.</div>
          </div>
        )}
      </div>

      {/* Update Record Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
              <AddRecordPage
                isUpdate={true}
                existingRecord={record}
                existingSongs={songs}
                onUpdateSuccess={() => setShowUpdateModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
