import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { SoundsPage } from './pages/SoundsPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { LoginPage } from './pages/LoginPage';
import { ContactPage } from './pages/ContactPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'shop', Component: ShopPage },
      { path: 'shop/:category', Component: ShopPage },
      { path: 'product/:id', Component: ProductPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'confirmation', Component: ConfirmationPage },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'admin', Component: AdminPage },
      { path: 'sounds', Component: SoundsPage },
      { path: 'volunteer', Component: VolunteerPage },
      { path: 'login', Component: LoginPage },
      { path: 'contact', Component: ContactPage },
    ],
  },
]);
