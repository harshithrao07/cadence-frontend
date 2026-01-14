import { ArtistPreviewDTO } from "./Artists";
import { GenrePreviewDTO } from "./Genre";

export interface SongItem {
  id: string;
  title: string;
  songUrl: string;
  totalDuration: number;
  coverUrl: string;
  createdBy: Artist[];
  recordId: string;
}

interface Artist {
  id: string;
  name: string;
}

export interface TrackPreviewDTO {
  songId: string;
  title: string;
  coverUrl: string;
  totalDuration: number;
  totalPlays: number;
  recordId: string;
  recordTitle: string;
  artists: ArtistPreviewDTO[];
}


export interface EachNewSongDTO {
  title: string;
  genreIds: string[];
  artistIds: string[];
  totalDuration: number;
  order: number;
  coverUrl: string
}

export interface NewSongsDTO {
  recordId: string;
  songs: EachNewSongDTO[];
}

export interface AddSongResponseDTO {
  id: string;
  title: string;
}

export interface SongInRecordDTO {
  songId: string;
  title: string;
  totalDuration: number;
  coverUrl: string;
  createdBy: Artist[];
  songUrl: string;
  order: number;
  artists: ArtistPreviewDTO[];
  genres: GenrePreviewDTO[];
}

export interface UpdateSongDTO {
  title: string;
  genreIds: string[];
  artistIds: string[];
  totalDuration: number;
  coverUrl: string
}