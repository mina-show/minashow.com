import { Play, Pause, X, Music } from "lucide-react";
import { usePlayer } from "~/components/providers/player-provider";
import { formatDuration } from "~/lib/data/sounds";

export function MiniPlayer() {
  const { currentTrack, isPlaying, progress, currentTime, isPreview, pause, resume, seek, close } =
    usePlayer();

  if (!currentTrack) return null;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, ratio)));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-brand-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-brand-green-light">
          {currentTrack.thumbnail ? (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-5 h-5 text-brand-green" />
          )}
        </div>

        {/* Track info + preview badge */}
        <div className="shrink-0 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 truncate font-sans font-bold">
              {currentTrack.title}
            </p>
            {isPreview && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-sans font-bold shrink-0">
                Preview
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate font-sans">{currentTrack.artist}</p>
        </div>

        {/* Play / Pause */}
        <button
          onClick={isPlaying ? pause : resume}
          className="w-9 h-9 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0 transition-colors hover:opacity-90"
          aria-label={isPlaying ? "Pause" : "Resume"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-400 shrink-0 font-sans">
            {formatDuration(Math.floor(currentTime))}
          </span>
          <div
            className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
            onClick={handleSeek}
            role="slider"
            aria-label="Seek"
            aria-valuenow={Math.round(progress * 100)}
          >
            {/* width is dynamic — must stay in style; color moved to className */}
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all bg-brand-green"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0 font-sans">
            {formatDuration(currentTrack.duration)}
          </span>
        </div>

        {/* Close */}
        <button
          onClick={close}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
          aria-label="Close player"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
