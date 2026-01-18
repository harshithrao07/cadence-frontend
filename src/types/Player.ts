import { SongInRecordDTO } from "./Song";

export interface PlayerState {
  currentSong: SongInRecordDTO | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: SongInRecordDTO[];
  queueIndex: number;
}

export interface PlayerContextType extends PlayerState {
  playSong: (song: SongInRecordDTO) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
  playQueue: (songs: SongInRecordDTO[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  resetPlayer: () => void;
}
