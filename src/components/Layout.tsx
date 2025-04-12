
import React, { ReactNode } from 'react';
import NavBar from './NavBar';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isLoggedIn, 
  onLogin, 
  onLogout 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 PokeKeeper - A Pokémon Card Collection Tracker</p>
          <p className="text-sm mt-1">
            Pokémon and all related characters are © Nintendo, Game Freak, and The Pokémon Company.
            This app is not affiliated with Nintendo, Game Freak, or The Pokémon Company.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
