"use client";

import React, { useEffect, useState } from "react";
import { X, Music, Edit2, Play, Pause } from "lucide-react";
import { GenreSelector } from "../genres/GenreSelector";
import { SongFilePicker } from "./SongFIlePicker";
import { RECORD_LIMITS } from "@/types/Record";
import { toast } from "sonner";
import { ArtistSelector } from "../artists/ArtistSelector";
import { EachNewSongDTO } from "@/types/Song";
import { RecordType } from "@/types/Record";
import { ArtistPreviewDTO } from "@/types/Artists";

const AddSongSection = ({
  recordArtistIds = [],
  recordType,
  recordTitle = "",
  onSongsChange,
  onSongFilesChange,
  initialSongs = [],
  isUpdate = false,
  onSongUpdate,
  selectedArtists = [], // Array of ArtistPreviewDTO objects
}) => {
  const [songs, setSongs] = useState<EachNewSongDTO[]>(initialSongs);
  const [songFiles, setSongFiles] = useState<Map<string, File>>(new Map());
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [song, setSong] = useState<EachNewSongDTO>({
    title: "",
    genreIds: [],
    artistIds: [...recordArtistIds],
    totalDuration: 0,
    order: 1,
    coverUrl: ""
  });
  // Editing state
  const [editingSongIndex, setEditingSongIndex] = useState<number | null>(null);

  // Selector keys to force re-render when resetting
  const [artistSelectorKey, setArtistSelectorKey] = useState(0);
  const [genreSelectorKey, setGenreSelectorKey] = useState(0);
  const [filePickerKey, setFilePickerKey] = useState(0);

  const maxSongsAllowed = RECORD_LIMITS[recordType] ?? Infinity;
  const hasReachedLimit = songs.length >= maxSongsAllowed;
  const hasGenre = song.genreIds.length > 0;

  // State for playing songs
  const [playingSongIndex, setPlayingSongIndex] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    onSongsChange?.(songs);
  }, [songs]);

  useEffect(() => {
    onSongFilesChange?.(songFiles);
  }, [songFiles]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (!editingSongIndex) {
      setSong((prev) => ({
        ...prev,
        artistIds: recordArtistIds,
      }));
    }
  }, [recordArtistIds, editingSongIndex]);

  useEffect(() => {
    if (recordType === RecordType.SINGLE && recordTitle.trim() && !editingSongIndex) {
      setSong((prev) => ({
        ...prev,
        title: recordTitle.trim(),
      }));
    }
  }, [recordTitle, recordType, editingSongIndex]);

  const resetForm = () => {
    setSong({
      title: recordType === RecordType.SINGLE ? recordTitle.trim() : "",
      genreIds: [],
      artistIds: [...recordArtistIds],
      totalDuration: 0,
      order: recordType === RecordType.SINGLE ? 1 :
        Math.max(...songs.map(s => s.order), 0) + 1,
      coverUrl: ""
    });
    setCurrentFile(undefined);
    setEditingSongIndex(null);
    setArtistSelectorKey((k) => k + 1);
    setGenreSelectorKey((k) => k + 1);
    setFilePickerKey((k) => k + 1);
  };

  const handleSaveSong = () => {
    // Validation
    const isEditing = editingSongIndex !== null;

    // For updates, we might not need a new file if we keep the old one
    if (!currentFile && !isEditing) {
      toast.error("Please upload an audio file");
      return;
    }

    // If editing, we need either a new file OR an existing file for this song
    if (isEditing && !currentFile && !songFiles.has(song.title.trim())) {
      // Only error if we somehow lost the file mapping and didn't provide a new one
      // But usually we key by title. If title changed, we check if we have a file.
      // Actually, let's simplify: if we are editing, currentFile is optional ONLY IF we aren't changing the title/file in a way that loses data
      // For simplicity: if currentFile is undefined, we assume we keep the old file associated with the OLD title (before rename).
      // Logic handled below.
    }

    if (!song.title.trim()) {
      toast.error("Song title is required");
      return;
    }

    const trimmedTitle = song.title.trim();

    // Check availability
    // If adding: invalid if exists in current songs or file map
    // If editing: invalid if exists in OTHER songs (excluding self)
    const titleConflict = songs.some((s, idx) =>
      s.title.trim() === trimmedTitle && idx !== editingSongIndex
    );

    if (titleConflict) {
      toast.error(
        "A song with this title already exists. Please use a different title."
      );
      return;
    }

    if (song.genreIds.length === 0) {
      toast.error("Please select at least one genre");
      return;
    }

    if (song.totalDuration > 600) {
      toast.error("Song duration cannot exceed 10 minutes");
      return;
    }

    // Limit check only if adding new song
    if (!isEditing && hasReachedLimit) {
      toast.error(
        recordType === "SINGLE"
          ? "A Single can contain only one song"
          : `You can add up to ${maxSongsAllowed} songs for an ${recordType}`
      );
      return;
    }

    // --- File Handling ---
    if (currentFile) {
      // New file provided (Add or Update)
      setSongFiles(prev => {
        const newMap = new Map(prev);
        // If updating, delete old mapping if title changed or just to be clean
        if (isEditing) {
          const oldTitle = songs[editingSongIndex].title.trim();
          newMap.delete(oldTitle);
        }
        newMap.set(trimmedTitle, currentFile);
        return newMap;
      });
    } else if (isEditing) {
      // No new file provided -> We are keeping the existing file.
      // If title changed, we need to move the file mapping.
      const oldTitle = songs[editingSongIndex].title.trim();
      if (oldTitle !== trimmedTitle) {
        setSongFiles(prev => {
          const newMap = new Map(prev);
          const file = newMap.get(oldTitle);
          if (file) {
            newMap.delete(oldTitle);
            newMap.set(trimmedTitle, file);
          }
          return newMap;
        });
      }
    }

    // --- Song List Update ---
    const finalOrder = recordType === RecordType.SINGLE ? 1 : song.order;

    setSongs((prev) => {
      let newSongs = [...prev];

      // Remove old entry if editing
      if (isEditing) {
        newSongs = newSongs.filter((_, i) => i !== editingSongIndex);
        // Normalize orders to prevent gaps when moving items (e.g. moving 3 to 5)
        newSongs = newSongs.map((s, idx) => ({ ...s, order: idx + 1 }));
      }

      // Handle Order Conflicts
      const orderConflictIndex = newSongs.findIndex(s => s.order === finalOrder);
      if (orderConflictIndex >= 0) {
        // If manual order conflict, shift others or swap? 
        // Original logic was: shift subsequent songs up (for add)
        // or swap (for update).
        // Let's stick to simple "insert and re-sort" if adding, or "swap" if updating?
        // Actually, the easiest UX is usually: Insert at End if default, or Insert at Index.

        if (isEditing) {
          // Swap with the conflict
          const conflictSong = newSongs[orderConflictIndex];
          // If we swapped, we need to give the conflicting song the OLD order of the song we are editing...
          // This gets complicated. 

          // Simpler approach: Just re-calculate orders if needed, or allow duplicates temporarily and sort?
          // Let's follow original logic: 
          // If Add: shift subsequent.
          // If Update: swap.

          // BUT we already removed the old entry from `newSongs`.
          // So now we effectively are "Adding" the updated song back.

          // Let's just use the "Shift Insert" logic for simplicity, or 
          // re-implement the Swap logic if it was preferred.
          // The previous code had specific swap logic for Edit. 

          // Let's try to KEEP it simple:
          // Just map everything that is >= finalOrder to order + 1
          newSongs = newSongs.map(s =>
            s.order >= finalOrder ? { ...s, order: s.order + 1 } : s
          );
        } else {
          // Adding new
          newSongs = newSongs.map(s =>
            s.order >= finalOrder ? { ...s, order: s.order + 1 } : s
          );
        }
      }

      // Add valid song
      newSongs.push({ ...song, order: finalOrder });

      // Sort and normalize orders just in case (optional, but good for safety)
      return newSongs.sort((a, b) => a.order - b.order);
    });

    toast.success(isEditing ? "Song updated successfully" : "Song added");
    resetForm();
  };

  const startEditingSong = (index: number) => {
    const songToEdit = songs[index];
    setEditingSongIndex(index);
    setSong({
      title: songToEdit.title,
      genreIds: [...songToEdit.genreIds],
      artistIds: [...songToEdit.artistIds],
      totalDuration: songToEdit.totalDuration,
      order: songToEdit.order,
      coverUrl: songToEdit.coverUrl,
    });

    // We don't set currentFile here because we don't have the File object easily accessible 
    // unless we fetch it from songFiles. 
    // AND `currentFile` state implies "New File Selected".
    // If we want to show the file name, we rely on the component knowing we are in edit mode
    // and using the existing file if `currentFile` is null.
    // The `SongFilePicker` needs to handle this visually if we want it to show "Current file: ..."

    // Let's retrieve the file if possible to pass to picker? 
    // The picker accepts `selectedFile`.
    setCurrentFile(songFiles.get(songToEdit.title.trim()));

    // Force re-render of components to reflect new state
    setArtistSelectorKey(prev => prev + 1);
    setGenreSelectorKey(prev => prev + 1);
    setFilePickerKey(prev => prev + 1);
  };

  const removeSong = (index: number) => {
    if (editingSongIndex === index) {
      resetForm();
    }

    setSongs((prev) => {
      const songToRemove = prev[index];

      if (songToRemove) {
        setSongFiles((fileMap) => {
          const newMap = new Map(fileMap);
          newMap.delete(songToRemove.title.trim());
          return newMap;
        });
      }

      // Remove and reassign order
      return prev
        .filter((_, i) => i !== index)
        .map((song, idx) => ({
          ...song,
          order: idx + 1,
        }));
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canSave =
    song.title.trim() &&
    hasGenre &&
    song.totalDuration <= 600 &&
    (editingSongIndex !== null || (!hasReachedLimit && currentFile)); // If adding, need file + limit check. If editing, file is optional (keep existing)

  const togglePlaySong = (songIndex: number) => {
    const song = songs[songIndex];
    const audioFile = songFiles.get(song.title.trim());

    if (!audioFile) {
      console.warn("No audio file found for song:", song.title.trim());
      return;
    }

    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (playingSongIndex === songIndex) {
      setPlayingSongIndex(null);
    } else {
      const audio = new Audio(URL.createObjectURL(audioFile));
      audio.addEventListener('ended', () => {
        setPlayingSongIndex(null);
        setAudioElement(null);
      });

      audio.play().catch(err => {
        console.error("Error playing audio:", err);
        setPlayingSongIndex(null);
      });

      setAudioElement(audio);
      setPlayingSongIndex(songIndex);
    }
  };

  const getArtistNames = (artistIds: string[]) => {
    return artistIds
      .map(id => selectedArtists.find(artist => artist.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "Unknown Artist";
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Add Songs</h1>
          <p className="text-gray-300">Upload and manage your music library</p>
        </div>

        <div className="bg-gray-800/80 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">
            {editingSongIndex !== null ? "Edit Song" : "Add New Song"}
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-100">
              Song Title
            </label>
            <input
              placeholder={
                recordType === RecordType.SINGLE
                  ? "Same as record title"
                  : "Enter song title..."
              }
              value={song.title}
              onChange={(e) => {
                if (recordType !== RecordType.SINGLE) {
                  setSong({ ...song, title: e.target.value });
                }
              }}
              disabled={recordType === RecordType.SINGLE}
              className="w-full bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none transition-colors placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {recordType === RecordType.SINGLE && (
              <p className="mt-2 text-sm text-gray-300">
                Song title will be the same as the record title
              </p>
            )}
          </div>

          {(recordType === RecordType.ALBUM || recordType === RecordType.EP) && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-100">
                Track Order
              </label>
              <input
                type="number"
                min="1"
                max={maxSongsAllowed}
                value={song.order}
                onChange={(e) => {
                  const order = parseInt(e.target.value) || 1;
                  setSong({ ...song, order: Math.max(1, Math.min(maxSongsAllowed, order)) });
                }}
                className="w-full bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                placeholder="Enter track number..."
              />
              <p className="mt-2 text-sm text-gray-300">
                Track number (1-{maxSongsAllowed})
              </p>
            </div>
          )}

          <ArtistSelector
            key={`artist-${artistSelectorKey}`}
            selectedArtistIds={song.artistIds}
            setSelectedArtistIds={(ids) =>
              setSong((prev) => ({ ...prev, artistIds: ids }))
            }
            recordArtistIds={recordArtistIds}
          />

          <SongFilePicker
            key={`file-${filePickerKey}`}
            selectedFile={currentFile}
            // Logic: if editing and no new file selected, we might want to show "Keep existing" text in picker?
            // But picker props are simple. 
            // If currentFile is passed as undefined but we are editing, standard picker might show "No file selected".
            // We can improve this if needed, but for now passing currentFile (which is set from map on edit) should work.
            onFileSelect={(file, duration) => {
              setCurrentFile(file);
              setSong((prev) => ({
                ...prev,
                totalDuration: duration,
                title:
                  recordType === RecordType.SINGLE
                    ? prev.title || recordTitle.trim()
                    : prev.title || file.name.replace(/\.[^/.]+$/, ""),
              }));
            }}
          />

          {song.totalDuration > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Music className="w-4 h-4 text-red-500" />
                <span className="text-gray-200">
                  Duration:{" "}
                  <span
                    className={`font-semibold ${song.totalDuration > 600 ? "text-red-500" : "text-white"
                      }`}
                  >
                    {formatDuration(song.totalDuration)}
                  </span>
                </span>
              </div>
              {song.totalDuration > 600 && (
                <p className="mt-2 text-sm text-red-500">
                  Song duration cannot exceed 10 minutes
                </p>
              )}
            </div>
          )}

          <GenreSelector
            key={`genre-${genreSelectorKey}`}
            selectedGenreIds={song.genreIds}
            setSelectedGenreIds={(ids) => {
              setSong((prev) => ({
                ...prev,
                genreIds: typeof ids === "function" ? ids(prev.genreIds) : ids,
              }));
            }}
          />

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSaveSong}
              disabled={!canSave}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-full transition-all"
            >
              {editingSongIndex !== null
                ? "Update Song"
                : hasReachedLimit
                  ? `Only ${maxSongsAllowed} song${maxSongsAllowed > 1 ? "s" : ""} allowed`
                  : "Add Song to List"
              }
            </button>

            {editingSongIndex !== null && (
              <button
                onClick={resetForm}
                className="px-8 py-4 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {songs.length > 0 && (
          <div className="mt-8 bg-gray-800/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Added Songs</h3>
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </span>
            </div>

            <div className="space-y-2">
              {songs.map((s, idx) => (
                <div
                  key={s.order}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors group ${editingSongIndex === idx
                    ? "bg-red-500/10 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-zinc-900 hover:bg-zinc-800"
                    }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                    {songFiles.has(s.title.trim()) ? (
                      <button
                        onClick={() => togglePlaySong(idx)}
                        className="w-full h-full flex items-center justify-center hover:bg-zinc-700 rounded-lg transition-colors"
                        title={playingSongIndex === idx ? "Pause" : "Play"}
                      >
                        {playingSongIndex === idx ? (
                          <Pause className="w-6 h-6 text-red-500" />
                        ) : (
                          <Play className="w-6 h-6 text-red-500 ml-0.5" />
                        )}
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <Music className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${playingSongIndex === idx ? "text-red-500" : "text-white"}`}>
                      {s.title}
                    </div>
                    <div className="text-sm text-gray-300">
                      {getArtistNames(s.artistIds)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDuration(s.totalDuration)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditingSong(idx)}
                      disabled={editingSongIndex === idx}
                      className={`p-2 rounded-lg transition-all ${editingSongIndex === idx
                        ? "opacity-100 cursor-not-allowed text-red-500"
                        : "opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-400 hover:text-blue-500"
                        }`}
                      title="Edit song"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        toast("Are you sure you want to delete this song?", {
                          action: {
                            label: "Delete",
                            onClick: () => removeSong(idx),
                          },
                          cancel: {
                            label: "Cancel",
                            onClick: () => { },
                          },
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-zinc-700 rounded-lg transition-all"
                      title="Remove song"
                    >
                      <X className="w-5 h-5 text-zinc-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSongSection;
