import { SongItem } from "@/types/Song"

export type PlayerContextType = {
  currentTrack: SongItem | null
  isPlaying: boolean
  volume: number // 0..100
  queue: SongItem[] // New: Queue of upcoming tracks
  setTrack: (track: SongItem) => void
  setTrackAndPlay: (track: SongItem) => void
  setIsPlaying: (playing: boolean) => void
  setVolume: (vol: number) => void
  addToQueue: (track: SongItem) => void // New: Add track to queue
  playNext: () => void // New: Play next track in queue
  clearQueue: () => void // New: Clear the queue
}

