"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { useGenres } from "@/context/GenreContext";
import { GenrePreviewDTO } from "@/types/Genre";

export const GenreSelector = ({ selectedGenreIds, setSelectedGenreIds }) => {
  const { addGenre, searchGenres } = useGenres();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GenrePreviewDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<GenrePreviewDTO[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const { genres: allGenres } = useGenres();

  // Initialize selectedGenres from IDs on mount
  useEffect(() => {
    if (allGenres.length > 0) {
      const initial = selectedGenreIds
        .map(id => allGenres.find(g => g.id === id))
        .filter((g): g is GenrePreviewDTO => g !== undefined);

      setSelectedGenres(initial);
    }
  }, [selectedGenreIds, allGenres]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      const data = await searchGenres(query);
      setResults(data);
      setLoading(false);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const toggleGenre = (genre) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genre.id)
        ? prev.filter((id) => id !== genre.id)
        : [...prev, genre.id]
    );

    setSelectedGenres((prev) =>
      prev.some((g) => g.id === genre.id)
        ? prev.filter((g) => g.id !== genre.id)
        : [...prev, genre]
    );

    setQuery("");
    setShowDropdown(false);
  };

  const handleAddGenre = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const formattedType = trimmed.toUpperCase();

    const alreadyExistsInResults = results.some(
      (g) => g.type.trim().toUpperCase() === formattedType
    );

    const alreadyExistsInAll = allGenres.some(
      (g) => g.type.trim().toUpperCase() === formattedType
    );

    if (alreadyExistsInResults || alreadyExistsInAll) return;

    const dto = { type: formattedType };
    const genre = await addGenre(dto);
    if (!genre) return;

    setSelectedGenreIds((prev) => [...prev, genre.id]);
    setSelectedGenres((prev) => [...prev, genre]);

    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-3 text-white">
        Genres
      </label>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedGenres.map((genre) => (
            <span
              key={genre.id}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              {genre.type}
              <button
                onClick={() => toggleGenre(genre)}
                className="hover:scale-110 transition-transform"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input
            value={query}
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
            placeholder="Search or add genres..."
            className="w-full bg-zinc-900 text-black px-10 py-3 rounded-lg border border-zinc-800 focus:border-red-500 focus:outline-none transition-colors"
          />
        </div>

        {showDropdown && (query || results.length > 0) && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-zinc-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-sm text-zinc-500">
                Searching...
              </div>
            )}

            {!loading && results.length === 0 && query && (
              <button
                onClick={handleAddGenre}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 transition-colors text-left"
              >
                <Plus size={18} className="text-red-500" />
                <span className="text-black">
                  Create &quot;{query.trim().toUpperCase()}&quot;
                </span>
              </button>
            )}

            {results.map((genre) => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-100 transition-colors text-left"
              >
                <span className="text-black">{genre.type}</span>
                {selectedGenreIds.includes(genre.id) && (
                  <span className="text-red-500 text-xs font-semibold">
                    ✓ Selected
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
