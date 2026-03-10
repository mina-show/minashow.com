export interface Track {
  id: string;
  title: string;
  artist: string;
  /** Duration in seconds */
  duration: number;
  thumbnail: string;
  category: "Praise" | "Story Songs" | "Seasonal";
  /** Preview duration in seconds (default: 120 = 2 min) */
  previewDuration?: number;
}

export const TRACK_CATEGORIES = ["All", "Praise", "Story Songs", "Seasonal"] as const;

export const tracks: Track[] = [
  {
    id: "1",
    title: "Morning Joy",
    artist: "Minashow Ensemble",
    duration: 195,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    category: "Praise",
    previewDuration: 120,
  },
  {
    id: "2",
    title: "Little Shepherd",
    artist: "Kids Choir",
    duration: 165,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    category: "Story Songs",
    previewDuration: 120,
  },
  {
    id: "3",
    title: "God's Love Is Big",
    artist: "Minashow Ensemble",
    duration: 210,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    category: "Praise",
    previewDuration: 120,
  },
  {
    id: "4",
    title: "Christmas Is Here",
    artist: "Kids Choir",
    duration: 240,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    category: "Seasonal",
    previewDuration: 120,
  },
  {
    id: "5",
    title: "Easter Morning",
    artist: "Minashow Ensemble",
    duration: 175,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    category: "Seasonal",
    previewDuration: 120,
  },
  {
    id: "6",
    title: "We Are Friends",
    artist: "Kids Choir",
    duration: 155,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    category: "Story Songs",
    previewDuration: 120,
  },
  {
    id: "7",
    title: "Hosanna",
    artist: "Minashow Ensemble",
    duration: 220,
    thumbnail: "https://images.unsplash.com/photo-1571766752116-63b1e6514b53?w=400",
    category: "Praise",
    previewDuration: 120,
  },
  {
    id: "8",
    title: "The Brave Little David",
    artist: "Kids Choir",
    duration: 185,
    thumbnail: "https://images.unsplash.com/photo-1554343594-1c9d305bd51f?w=400",
    category: "Story Songs",
    previewDuration: 120,
  },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
