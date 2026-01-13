import { RecordPreviewDTO } from "./Record";
import { TrackPreviewDTO } from "./Song";

export interface NewArtistDTO {
  name: string;
  description?: string;
}

export interface ArtistPreviewDTO {
  id: string;
  name: string;
  profileUrl?: string;
}

export interface ArtistProfileDTO {
  id: string;
  name: string;
  description: string;
  profileUrl: string;
  followers: number;
  monthlyListeners: number;
  popularSongs: TrackPreviewDTO[];
  artistRecords: RecordPreviewDTO[];
}


