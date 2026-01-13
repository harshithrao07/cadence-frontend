"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ArtistPreviewDTO } from "../types/Artists";
import api from "../lib/api";
import { usePathname } from "next/navigation";
import { ApiResponse } from "@/types/ApiResponse";
import { Page } from "@/types/ApiResponse";

type ArtistsContextType = {
  artists: ArtistPreviewDTO[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshArtists: () => Promise<void>;
  searchArtists: (query: string) => Promise<ArtistPreviewDTO[]>;
  getArtistById: (id: string) => ArtistPreviewDTO | undefined;
};

const ArtistsContext = createContext<ArtistsContextType | undefined>(undefined);

export const useArtists = () => {
  const context = useContext(ArtistsContext);
  if (!context) {
    throw new Error("useArtists must be used within an ArtistsProvider");
  }
  return context;
};

const PAGE_SIZE = 24;

export const ArtistsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();

  const [artists, setArtists] = useState<ArtistPreviewDTO[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState<string | null>(null);

  const fetchArtists = async (pageToLoad: number, replace = false): Promise<ArtistPreviewDTO[]> => {
    if (pathname.startsWith("/auth")) return [];

    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Page<ArtistPreviewDTO>>>(
        "/api/v1/artist/all",
        {
          params: {
            page: pageToLoad,
            size: PAGE_SIZE,
            key: searchKey ?? undefined,
          },
        }
      );

      const pageData = res.data.data;

      setArtists((prev) =>
        replace ? pageData.content : [...prev, ...pageData.content]
      );
      setHasMore(!pageData.last);
      setPage(pageData.page);

      return pageData.content;
    } catch (err) {
      console.error("Failed to fetch artists:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const refreshArtists = async () => {
    setArtists([]);
    setPage(0);
    setHasMore(true);
    await fetchArtists(0, true);
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    await fetchArtists(page + 1);
  };

  const searchArtists = async (query: string): Promise<ArtistPreviewDTO[]> => {
    setSearchKey(query || null);
    setArtists([]);
    setPage(0);
    setHasMore(true);
    const results = await fetchArtists(0, true);
    return results;
  };

  const getArtistById = (id: string) =>
    artists.find((artist) => artist.id === id);

  useEffect(() => {
    refreshArtists();
  }, []);

  return (
    <ArtistsContext.Provider
      value={{
        artists,
        loading,
        hasMore,
        loadMore,
        refreshArtists,
        searchArtists,
        getArtistById,
      }}
    >
      {children}
    </ArtistsContext.Provider>
  );
};
