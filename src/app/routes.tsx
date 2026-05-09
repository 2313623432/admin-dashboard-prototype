import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import { CharacterLibrary } from './pages/CharacterLibrary';
import PostManagement from './pages/PostManagement';
import { Navigation } from './components/Navigation';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {children}
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><PostManagement /></Layout>,
  },
  {
    path: '/characters',
    element: <Layout><CharacterLibrary /></Layout>,
  },
  {
    path: '/generate',
    element: <Layout><Home /></Layout>,
  },
]);
