export enum RecordType {
  ALBUM = "ALBUM",
  SINGLE = "SINGLE",
  EP = "EP",
}

export const RECORD_LIMITS = {
  SINGLE: 1,
  EP: 6,    
  ALBUM: Number.MAX_SAFE_INTEGER,
};


export interface TrackRecordInfo {
  id: string;
  title: string;
}

export interface RecordPreviewDTO {
  id: string;
  title: string;
  coverUrl: string;
  releaseTimestamp: number;
  recordType: RecordType;
}

export interface NewRecordDTO {
  title: string;
  releaseTimestamp: string;
  recordType: RecordType;
  artistIds: string[];
}

export interface NewRecordRequestDTO {
  title: string;
  releaseTimestamp: number;
  recordType: RecordType;
  artistIds: string[];
}

export interface UpdateRecordDTO {
  title: string;
  releaseTimestamp: number;
  artistIds: string[];
}