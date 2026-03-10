import { Play, Pause, X, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/sounds';

export function MiniPlayer() {
  const { currentTrack, isPlaying, progress, currentTime, pause, resume, seek, close } =
    usePlayer();

  if (!currentTrack) return null;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, ratio)));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 shadow-lg" style={{ borderColor: '#22C55E' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
          {currentTrack.thumbnail ? (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-5 h-5" style={{ color: '#22C55E' }} />
          )}
        </div>

        {/* Track Info */}
        <div className="shrink-0 min-w-0">
          <p
            className="text-sm text-gray-900 truncate"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
          >
            {currentTrack.title}
          </p>
          <p
            className="text-xs text-gray-500 truncate"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {currentTrack.artist}
          </p>
        </div>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? pause : resume}
          className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 transition-colors hover:opacity-90"
          style={{ backgroundColor: '#22C55E' }}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span
            className="text-xs text-gray-400 shrink-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {formatDuration(Math.floor(currentTime))}
          </span>
          <div
            className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all"
              style={{ width: `${progress * 100}%`, backgroundColor: '#22C55E' }}
            />
          </div>
          <span
            className="text-xs text-gray-400 shrink-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {formatDuration(currentTrack.duration)}
          </span>
        </div>

        {/* Close */}
        <button
          onClick={close}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}