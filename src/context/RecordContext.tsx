"use client";

import React, { createContext, useContext, useState } from "react";
import api from "../lib/api";
import { ApiResponse } from "@/types/ApiResponse";
import { RecordPreviewDTO } from "@/types/Record";

type RecordContextType = {
  records: RecordPreviewDTO[];
  loading: boolean;
  fetchRecordsByArtistId: (
    artistId: string,
    forceRefresh?: boolean
  ) => Promise<RecordPreviewDTO[] | null>;
  getRecordById: (recordId: string) => Promise<RecordPreviewDTO | null>;
};

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export const useRecords = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error("useRecords must be used within a RecordProvider");
  }
  return context;
};

export const RecordProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [records, setRecords] = useState<RecordPreviewDTO[]>([]);
  const [recordsByArtistId, setRecordsByArtistId] = useState<
    Record<string, RecordPreviewDTO[]>
  >({});
  const [loading, setLoading] = useState(false);

  const fetchRecordsByArtistId = async (
    artistId: string,
    forceRefresh = false
  ): Promise<RecordPreviewDTO[] | null> => {
    // ✅ Cache hit
    if (!forceRefresh && recordsByArtistId[artistId]) {
      setRecords(recordsByArtistId[artistId]);
      return recordsByArtistId[artistId];
    }

    setLoading(true);
    try {
      const res = await api.get<ApiResponse<RecordPreviewDTO[]>>(
        "/api/v1/record/all",
        { params: { artistId } }
      );

      if (res.data.success) {
        const data = res.data.data;

        setRecords(data);
        setRecordsByArtistId((prev) => ({
          ...prev,
          [artistId]: data,
        }));

        return data;
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      setLoading(false);
    }

    return null;
  };

  const getRecordById = async (
    recordId: string
  ): Promise<RecordPreviewDTO | null> => {
    // 🔍 Optional: try cache first
    // Note: The cache stores RecordPreviewDTO.

    try {
      const res = await api.get<ApiResponse<RecordPreviewDTO>>(
        `/api/v1/record/${recordId}`
      );

      if (res.data.success) {
        return res.data.data;
      }
    } catch (err) {
      console.error("Failed to fetch record:", err);
    }

    return null;
  };

  return (
    <RecordContext.Provider
      value={{
        records,
        loading,
        fetchRecordsByArtistId,
        getRecordById,
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};
