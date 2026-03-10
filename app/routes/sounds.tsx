import { useState } from "react";
import { Play, Pause, Music, Clock } from "lucide-react";
import { tracks, formatDuration, type Track } from "~/lib/data/sounds";
import { usePlayer } from "~/components/providers/player-provider";
import { ImageWithFallback } from "~/components/misc/image-with-fallback";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Sounds — Minashow" }];
}

const CATEGORIES = ["All", "Praise", "Story Songs", "Seasonal"];

function TrackCard({ track }: { track: Track }) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isActive && isPlaying;

  const handlePlay = () => {
    if (isActive) {
      isPlaying ? pause() : resume();
    } else {
      play(track);
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${isActive
          ? "border-green-200 bg-green-50"
          : "border-gray-100 bg-white hover:border-green-100 hover:bg-green-50/50"
        }`}
      onClick={handlePlay}
      role="button"
      aria-label={`${isCurrentlyPlaying ? "Pause" : "Play"} ${track.title}`}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-green-100">
        <ImageWithFallback
          src={track.thumbnail ?? ""}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all ${isActive
              ? "opacity-100 bg-black/40"
              : "opacity-0 group-hover:opacity-100 bg-black/30"
            }`}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`truncate font-sans font-bold ${isActive ? "text-green-700" : "text-gray-900"}`}
        >
          {track.title}
        </p>
        <p className="text-gray-500 text-sm truncate font-sans">{track.artist}</p>
      </div>

      {/* Category pill */}
      <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0 font-sans font-semibold">
        {track.category}
      </span>

      {/* Duration */}
      <div className="flex items-center gap-1 text-gray-400 text-sm shrink-0 font-sans">
        <Clock className="w-3.5 h-3.5" />
        <span>{formatDuration(track.duration)}</span>
      </div>

      {/* Play button */}
      <button
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${isActive ? "text-white" : "bg-gray-100 text-gray-500 group-hover:text-white"
          }`}
        style={{ backgroundColor: isActive ? "#a9d937" : undefined }}
        onMouseEnter={(e) => {
          if (!isActive)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#a9d937";
        }}
        onMouseLeave={(e) => {
          if (!isActive)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
        }}
        aria-label={isCurrentlyPlaying ? "Pause" : "Play"}
      >
        {isCurrentlyPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
    </div>
  );
}

export default function SoundsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? tracks
      : tracks.filter((t) => t.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative py-14 bg-brand-green">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-white"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "2.25rem", fontWeight: 700 }}
            >
              Sounds
            </h1>
          </div>
          <p
            className="max-w-xl font-sans"
            style={{ lineHeight: 1.7, color: "#e8f5bc" }}
          >
            Stream our library of Arabic kids' praise tracks and show music. Streaming only — no
            downloads.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Category tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-full p-1.5 mb-6 w-fit">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all font-sans ${activeCategory === cat
                  ? "text-white font-bold shadow-sm"
                  : "text-gray-600 font-semibold hover:text-gray-900"
                }`}
              style={{
                backgroundColor: activeCategory === cat ? "#a9d937" : undefined,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tracks list */}
        <div className="flex flex-col gap-2">
          {filtered.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>

        {/* Note */}
        <div
          className="mt-8 p-4 rounded-2xl border"
          style={{ backgroundColor: "#f2fae3", borderColor: "#cfe87a" }}
        >
          <p className="text-sm font-sans" style={{ color: "#3d5200" }}>
            These tracks are available for streaming only. To purchase a full digital download,
            visit the{" "}
            <Link to="/shop/soundtracks" className="font-bold underline">
              Soundtracks
            </Link>{" "}
            section in the shop.
          </p>
        </div>
      </div>
    </div>
  );
}
