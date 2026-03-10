import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PlayerProvider>
          <RouterProvider router={router} />
        </PlayerProvider>
      </CartProvider>
    </AuthProvider>
  );
}
