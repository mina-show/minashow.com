import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { Track } from '../data/sounds';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (ratio: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
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
    (track: Track, fromTime: number) => {
      clearTimer();
      startTimeRef.current = Date.now() - fromTime * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const clamped = Math.min(elapsed, track.duration);
        setCurrentTime(clamped);
        setProgress(clamped / track.duration);
        if (clamped >= track.duration) {
          clearTimer();
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }
      }, 500);
    },
    []
  );

  const play = useCallback(
    (track: Track) => {
      clearTimer();
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);
      pausedAtRef.current = 0;
      startTimer(track, 0);
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
    startTimer(currentTrack, pausedAtRef.current);
  }, [currentTrack, startTimer]);

  const seek = useCallback(
    (ratio: number) => {
      if (!currentTrack) return;
      const time = ratio * currentTrack.duration;
      pausedAtRef.current = time;
      setCurrentTime(time);
      setProgress(ratio);
      if (isPlaying) {
        startTimer(currentTrack, time);
      }
    },
    [currentTrack, isPlaying, startTimer]
  );

  const close = useCallback(() => {
    clearTimer();
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    pausedAtRef.current = 0;
  }, []);

  return (
    <PlayerContext.Provider
      value={{ currentTrack, isPlaying, progress, currentTime, play, pause, resume, seek, close }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
