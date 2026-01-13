"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Disc, Album, Trash2, ArrowLeft, X } from "lucide-react";
import {
  NewRecordDTO,
  NewRecordRequestDTO,
  RecordType,
  RECORD_LIMITS,
} from "@/types/Record";
import { useArtists } from "@/context/ArtistContext";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import api from "@/lib/api";
import AddSongSection from "@/components/songs/AddSongSection";
import { AddSongResponseDTO, EachNewSongDTO, NewSongsDTO, SongInRecordDTO, UpdateSongDTO } from "@/types/Song";
import { ArtistPreviewDTO } from "@/types/Artists";
import { RecordPreviewDTO } from "@/types/Record";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";
import { FileUploadResult, FileWithMetadata } from "@/types/Aws";

interface AddRecordPageProps {
  isUpdate?: boolean;
  existingRecord?: RecordPreviewDTO;
  existingSongs?: SongInRecordDTO[];
  onUpdateSuccess?: () => void;
}

export default function AddRecordPage({ isUpdate = false, existingRecord, existingSongs = [], onUpdateSuccess }: AddRecordPageProps) {
  const router = useRouter();
  const { searchArtists } = useArtists();
  const { isAdmin } = useUser();

  const [selectedType, setSelectedType] = useState<RecordType>(existingRecord?.recordType || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(existingRecord?.coverUrl || null);
  const fileInputRef = useRef<File | null>(null);
  const fileInputDomRef = useRef<HTMLInputElement>(null);
  const [newRecord, setNewRecord] = useState<NewRecordDTO>({
    title: existingRecord?.title || "",
    releaseTimestamp: existingRecord ? new Date(existingRecord.releaseTimestamp).toISOString().split('T')[0] : "",
    recordType: existingRecord?.recordType || null,
    artistIds: isUpdate && existingSongs ? [...new Set(existingSongs.flatMap(song => song.artists?.map(a => a.id) || []))] : [],
  });
  // ... (existing code)


  // ... (existing code)


  const [songs, setSongs] = useState<EachNewSongDTO[]>(() => {
    if (isUpdate && existingSongs) {
      return existingSongs.map((song, index) => ({
        title: song.title,
        genreIds: song.genres?.map(g => g.id) || [], // Extract genre IDs from existing genres
        artistIds: song.artists?.map(a => a.id) || [],
        totalDuration: song.totalDuration,
        order: song.order || index + 1,
        coverUrl: song.coverUrl,
      }));
    }
    return [];
  });
  const [songFiles, setSongFiles] = useState<Map<string, File>>(new Map());
  const [artistSearch, setArtistSearch] = useState("");
  const [artistResults, setArtistResults] = useState<ArtistPreviewDTO[]>([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<ArtistPreviewDTO[]>(() => {
    if (isUpdate && existingSongs) {
      // Collect unique artists from all existing songs
      const artistMap = new Map<string, ArtistPreviewDTO>();
      existingSongs.forEach(song => {
        song.artists?.forEach(artist => {
          if (!artistMap.has(artist.id)) {
            artistMap.set(artist.id, artist);
          }
        });
      });
      return Array.from(artistMap.values());
    }
    return [];
  });

  const handleSongsChange = (updatedSongs: EachNewSongDTO[]) => {
    setSongs(updatedSongs);
  };

  const handleSongFilesChange = (updatedSongFiles: Map<string, File>) => {
    setSongFiles(updatedSongFiles);
  };

  const handleSongUpdate = async (updatedSong: EachNewSongDTO) => {
    // TODO: Implement individual song update API call
    // For now, just return a resolved promise
    console.log("Updating song:", updatedSong);
    // Example: await api.put(`/api/v1/song/update/${updatedSong.id}`, updatedSong);
  };

  const recordTypes = [
    { type: RecordType.SINGLE, label: "Single", icon: Music },
    { type: RecordType.EP, label: "EP", icon: Disc },
    { type: RecordType.ALBUM, label: "Album", icon: Album },
  ];

  const recordTypeMap = {
    [RecordType.SINGLE]: { label: "Single", icon: Music },
    [RecordType.EP]: { label: "EP", icon: Disc },
    [RecordType.ALBUM]: { label: "Album", icon: Album },
  };

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (!artistSearch.trim()) {
        setArtistResults([]);
        return;
      }

      setArtistLoading(true);
      try {
        const data = await searchArtists(artistSearch.trim());
        setArtistResults(data || []);
      } finally {
        setArtistLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [artistSearch]);

  const handleBack = () => {
    // If in update mode, close the modal instead of navigating back
    if (isUpdate) {
      if (onUpdateSuccess) {
        onUpdateSuccess(); // This will close the modal
      }
      return;
    }

    // If no record type selected, behave like normal back
    if (!selectedType) {
      router.back();
      return;
    }

    // Ask only if something was entered
    if (!hasUnsavedChanges()) {
      setSelectedType(null);
      return;
    }

    if (window.confirm("Going back will clear your entered data. Continue?")) {
      setSelectedType(null);
      setCoverPreview(null);
      setNewRecord({
        title: "",
        releaseTimestamp: "",
        recordType: null,
        artistIds: [],
      });
    }
  };

  const hasUnsavedChanges = () => {
    return (
      newRecord.title.trim() !== "" ||
      newRecord.releaseTimestamp !== "" ||
      newRecord.artistIds.length > 0 ||
      coverPreview !== null
    );
  };

  const handleSubmit = async () => {
    const recordDTO: NewRecordRequestDTO = {
      ...newRecord,
      recordType: selectedType,
      releaseTimestamp: newRecord.releaseTimestamp
        ? new Date(`${newRecord.releaseTimestamp}T00:00:00`).getTime()
        : new Date().getTime(),
    };

    if (songs.length > RECORD_LIMITS[selectedType]) {
      toast.error(
        `You can only add up to ${RECORD_LIMITS[selectedType]
        } songs to a ${selectedType.toLowerCase()}.`
      );
      return;
    }

    try {
      if (isUpdate && existingRecord) {
        let coverUrl = existingRecord.coverUrl; // Start with existing cover URL

        const updateRecord = {
          title: recordDTO.title,
          releaseTimestamp: recordDTO.title,
          artistIds: recordDTO.artistIds
        }
        const res = await api.put(`/api/v1/record/update/${existingRecord.id}`, updateRecord);
        if (res.status == 200) {
          if (fileInputRef.current) {
            const file = fileInputRef.current;
            const extension = file.name.split(".").pop();

            const formData = new FormData();
            formData.append(
              "file",
              file,
              `record cover_url ${existingRecord.id} ${extension}`
            );

            const uploadRes = await api.post<ApiResponse<FileUploadResult[]>>("/api/v1/files", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            coverUrl = uploadRes.data.data[0].url;
          }
          toast.success("Record updated successfully");
        }
      } else {
        // Handle create logic (existing code)
        const res = await api.post("/api/v1/record/add", recordDTO);
        let recordId = null;

        if (res.status == 201) {
          recordId = res.data.data;
          let coverUrl = null;
          if (res.status === 201 && fileInputRef.current) {
            const file = fileInputRef.current;
            const extension = file.name.split(".").pop();

            const formData = new FormData();
            formData.append(
              "file",
              file,
              `record cover_url ${recordId} ${extension}`
            );

            const uploadRes = await api.post<ApiResponse<FileUploadResult[]>>("/api/v1/files", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            let coverUrl = uploadRes.data.data[0].url;

            // Update existing songs
            for (let i = 0; i < existingSongs.length; i++) {
              const existingSong = existingSongs[i];
              const updatedSongData = songs[i];

              if (existingSong && updatedSongData) {
                const updatedSong: UpdateSongDTO = {
                  title: updatedSongData.title,
                  genreIds: updatedSongData.genreIds,
                  artistIds: updatedSongData.artistIds,
                  totalDuration: updatedSongData.totalDuration,
                  coverUrl: coverUrl
                };

                await api.post<ApiResponse<AddSongResponseDTO[]>>(
                  `/api/v1/song/update/${existingSong.songId}`,
                  updatedSong
                );
              }
            }
          }

          if (songs.length > 0) {
            const songsDTO: NewSongsDTO = {
              recordId: recordId,
              songs: [] as EachNewSongDTO[],
            };

            for (const song of songs) {
              const eachNewSongRequestDTO: EachNewSongDTO = {
                title: song.title,
                genreIds: song.genreIds,
                artistIds: song.artistIds,
                totalDuration: song.totalDuration,
                order: song.order,
                coverUrl: coverUrl
              };
              songsDTO.songs.push(eachNewSongRequestDTO);
            }

            const songsRes = await api.post<ApiResponse<AddSongResponseDTO[]>>(
              "/api/v1/song/add",
              songsDTO
            );

            if (songsRes.status == 201) {
              for (const song of songsRes.data.data) {
                const title = song.title;
                const file = songFiles.get(title);

                if (!file) {
                  console.error(`File not found for song: ${title}`);
                  continue;
                }

                const extension = file.name.split(".").pop();

                const formData = new FormData();
                formData.append(
                  "file",
                  file,
                  `song song_url ${song.id} ${extension}`
                );
                await api.post("/api/v1/files", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
              }
            }

            toast.success("Record and songs created successfully");
            router.push(`/records/${recordId}`);
          }

          setNewRecord({
            title: "",
            releaseTimestamp: "",
            recordType: null,
            artistIds: [],
          });
          setCoverPreview(null);
          setSelectedType(null);

          toast.success("Record created successfully");
          router.push(`/records/${recordId}`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleArtist = (artist: any) => {
    setNewRecord((prev) => ({
      ...prev,
      artistIds: prev.artistIds.includes(artist.id)
        ? prev.artistIds.filter((id) => id !== artist.id)
        : [...prev.artistIds, artist.id],
    }));

    setSelectedArtists((prev) =>
      prev.some((a) => a.id === artist.id)
        ? prev.filter((a) => a.id !== artist.id)
        : [...prev, artist]
    );

    setArtistSearch("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    fileInputRef.current = file;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    setCoverPreview(null);
    fileInputRef.current = null;
    if (fileInputDomRef.current) {
      fileInputDomRef.current.value = "";
    }
    setNewRecord({
      ...newRecord,
    });
  };

  // Check admin access
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white transition"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">{isUpdate ? "Update Record" : "Add New Record"}</h1>
        </div>
      </div>

      {selectedType && (
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            {(() => {
              const Icon = recordTypeMap[selectedType].icon;
              return <Icon className="w-5 h-5 text-red-500" />;
            })()}

            <span className="text-sm text-gray-400">Creating</span>
            <span className="font-semibold text-white">
              {recordTypeMap[selectedType].label}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {!selectedType ? (
          <div>
            <h2 className="text-lg font-semibold mb-6">Select Record Type</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recordTypes.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="p-8 bg-gray-800 hover:bg-gray-700 rounded-xl flex flex-col items-center transition"
                >
                  <Icon className="w-12 h-12 text-red-500 mb-4" />
                  <span className="font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Title */}
            <div>
              <label className="block mb-2 text-sm text-gray-300">Title</label>
              <input
                type="text"
                value={newRecord.title}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 outline-none"
              />
            </div>

            {/* Release date */}
            <div>
              <label className="block mb-2 text-sm text-gray-300">
                Release Date
              </label>
              <input
                type="date"
                value={newRecord.releaseTimestamp}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    releaseTimestamp: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image
              </label>

              {/* File upload only */}
              <input
                ref={fileInputDomRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
      text-white focus:outline-none focus:border-red-500 transition
      file:mr-4 file:py-2 file:px-4 file:rounded
      file:border-0 file:bg-red-500 file:text-white
      file:cursor-pointer hover:file:bg-red-600"
              />

              {coverPreview && (
                <div className="mt-3 relative inline-block">
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-40 h-40 object-cover rounded-lg border-2 border-gray-700"
                    width={160}
                    height={160}
                  />
                  <button
                    onClick={removeCover}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Artists */}
            <div>
              <label className="block mb-2 text-sm text-gray-300">
                Artists
              </label>

              {/* Search input */}
              <div className="relative">
                <input
                  placeholder="Search artist..."
                  value={artistSearch}
                  onChange={(e) => setArtistSearch(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-red-500"
                />

                {artistSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setArtistSearch("");
                      setArtistResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                {artistLoading && (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    Searching...
                  </div>
                )}

                {!artistLoading &&
                  artistSearch &&
                  artistResults.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      No artists found
                    </div>
                  )}

                {artistResults.map((artist) => {
                  const isSelected = newRecord.artistIds.includes(artist.id);

                  return (
                    <button
                      key={artist.id}
                      onClick={() => toggleArtist(artist)}
                      className={`
            w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200
            ${isSelected
                          ? "bg-gray-700 border border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.6)]"
                          : "hover:bg-gray-700 border border-transparent"
                        }
            active:scale-[0.98]
          `}
                    >
                      {/* Avatar */}
                      <div
                        className={`relative ${isSelected
                          ? "ring-2 ring-red-500 ring-offset-2 ring-offset-gray-800 rounded-full"
                          : ""
                          }`}
                      >
                        <Image
                          src={
                            artist.profileUrl ||
                            "/images/artists/artist-placeholder.png"
                          }
                          className="w-9 h-9 rounded-full object-cover"
                          alt={artist.name}
                          width={36}
                          height={36}
                        />
                      </div>

                      <span className="flex-1 text-left font-medium">
                        {artist.name}
                      </span>

                      <div
                        className={`
              w-6 h-6 rounded-full border flex items-center justify-center transition-all
              ${isSelected
                            ? "bg-red-500 border-red-500 scale-100 opacity-100"
                            : "border-gray-600 scale-75 opacity-0"
                          }
            `}
                      >
                        ✓
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedArtists.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-2">Selected artists</p>

                <div className="flex flex-wrap gap-2">
                  {selectedArtists.map((artist) => (
                    <span
                      key={artist.id}
                      className="flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-white px-4 py-2 rounded-full text-sm"
                    >
                      <Image
                        src={
                          artist.profileUrl ||
                          "/images/artists/artist-placeholder.png"
                        }
                        alt={artist.name}
                        className="w-5 h-5 rounded-full"
                        width={20}
                        height={20}
                      />
                      {artist.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <AddSongSection
              recordArtistIds={selectedArtists.map((a) => a.id)}
              recordType={selectedType}
              recordTitle={newRecord.title}
              onSongsChange={handleSongsChange}
              onSongFilesChange={handleSongFilesChange}
              initialSongs={songs}
              isUpdate={isUpdate}
              onSongUpdate={isUpdate ? handleSongUpdate : undefined}
              selectedArtists={selectedArtists}
            />

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-800 py-3 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-lg font-semibold"
              >
                {isUpdate ? "Update Record" : "Create Record"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
