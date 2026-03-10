import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Track } from "~/lib/data/sounds";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  /** Playback progress ratio 0–1 */
  progress: number;
  currentTime: number;
  /** Whether current playback is in preview mode (2-min cap) */
  isPreview: boolean;
  play: (track: Track, preview?: boolean) => void;
  pause: () => void;
  resume: () => void;
  seek: (ratio: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

/**
 * Simulates audio playback with a timer.
 * Phase 2: replaced with real <audio> element + CloudFront signed URL.
 * Preview mode caps playback at track.previewDuration (default 120 s).
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPreview, setIsPreview] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = useCallback(
    (track: Track, fromTime: number, preview: boolean) => {
      clearTimer();
      const maxDuration = preview
        ? (track.previewDuration ?? 120)
        : track.duration;

      startTimeRef.current = Date.now() - fromTime * 1000;

      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const clamped = Math.min(elapsed, maxDuration);
        setCurrentTime(clamped);
        setProgress(clamped / track.duration);

        if (clamped >= maxDuration) {
          clearTimer();
          setIsPlaying(false);
          setProgress(preview ? maxDuration / track.duration : 0);
          setCurrentTime(preview ? maxDuration : 0);
        }
      }, 300);
    },
    []
  );

  const play = useCallback(
    (track: Track, preview = true) => {
      clearTimer();
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);
      setIsPreview(preview);
      pausedAtRef.current = 0;
      startTimer(track, 0, preview);
    },
    [startTimer]
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    pausedAtRef.current = currentTime;
  }, [currentTime]);

  const resume = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying(true);
    startTimer(currentTrack, pausedAtRef.current, isPreview);
  }, [currentTrack, isPreview, startTimer]);

  const seek = useCallback(
    (ratio: number) => {
      if (!currentTrack) return;
      const maxDuration = isPreview
        ? (currentTrack.previewDuration ?? 120)
        : currentTrack.duration;
      const time = Math.min(ratio * currentTrack.duration, maxDuration);
      pausedAtRef.current = time;
      setCurrentTime(time);
      setProgress(time / currentTrack.duration);
      if (isPlaying) startTimer(currentTrack, time, isPreview);
    },
    [currentTrack, isPlaying, isPreview, startTimer]
  );

  const close = useCallback(() => {
    clearTimer();
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setIsPreview(false);
    pausedAtRef.current = 0;
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        isPreview,
        play,
        pause,
        resume,
        seek,
        close,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
