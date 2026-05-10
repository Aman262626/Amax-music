export interface Song {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  year?: string;
  duration: number;
  image: string;
  imageHigh?: string;
  url: string;
  downloadUrl: DownloadUrl[];
  hasLyrics?: boolean;
  language?: string;
  playCount?: string;
}

export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  image: string;
  year?: string;
  songCount?: number;
  songs?: Song[];
  language?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  image: string;
  songCount?: number;
  songs?: Song[];
  followerCount?: string;
  username?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followerCount?: string;
  isVerified?: boolean;
  bio?: string;
  topSongs?: Song[];
  topAlbums?: Album[];
}

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export interface Lyrics {
  lyrics: string;
  copyright?: string;
}

export type RepeatMode = "off" | "all" | "one";

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
}
