import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { MiniPlayer } from './MiniPlayer';
import { usePlayer } from '../context/PlayerContext';

export function Layout() {
  const { currentTrack } = usePlayer();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      <Header />
      <main className={`flex-1 pt-16 ${currentTrack ? 'pb-20' : ''}`}>
        <Outlet />
      </main>
      <Footer />
      <MiniPlayer />
    </div>
  );
}
