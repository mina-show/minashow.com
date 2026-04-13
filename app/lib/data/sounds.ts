export interface Track {
  id: string;
  title: string;
  artist: string;
  /** Duration in seconds */
  duration: number;
  thumbnail: string;
  /** Preview duration in seconds (default: 120 = 2 min) */
  previewDuration?: number;
}

export const tracks: Track[] = [
  {
    id: "1",
    title: "Soundtrack 1",
    artist: "Minashow",
    duration: 195,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    previewDuration: 120,
  },
  {
    id: "2",
    title: "Soundtrack 2",
    artist: "Minashow",
    duration: 165,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    previewDuration: 120,
  },
  {
    id: "3",
    title: "Soundtrack 3",
    artist: "Minashow",
    duration: 210,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    previewDuration: 120,
  },
  {
    id: "4",
    title: "Soundtrack 4",
    artist: "Minashow",
    duration: 240,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    previewDuration: 120,
  },
  {
    id: "5",
    title: "Soundtrack 5",
    artist: "Minashow",
    duration: 175,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    previewDuration: 120,
  },
  {
    id: "6",
    title: "Soundtrack 6",
    artist: "Minashow",
    duration: 155,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    previewDuration: 120,
  },
  {
    id: "7",
    title: "Soundtrack 7",
    artist: "Minashow",
    duration: 220,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    previewDuration: 120,
  },
  {
    id: "8",
    title: "Soundtrack 8",
    artist: "Minashow",
    duration: 185,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    previewDuration: 120,
  },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
