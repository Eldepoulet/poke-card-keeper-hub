import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  LogOut,
  Home,
  BookOpen,
  Package,
  Library
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavBarProps = {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

const NavBar: React.FC<NavBarProps> = ({ isLoggedIn, onLogin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                className="h-8 w-auto" 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                alt="Poke Card Keeper" 
              />
              <span className="ml-2 text-xl font-bold text-pokemon-red">PokeKeeper</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/" className="text-gray-700 hover:text-pokemon-red px-3 py-2 rounded-md flex items-center">
                <Home size={18} className="mr-1" />
                <span>Home</span>
              </Link>
              <Link to="/sets" className="text-gray-700 hover:text-pokemon-red px-3 py-2 rounded-md flex items-center">
                <BookOpen size={18} className="mr-1" />
                <span>Card Sets</span>
              </Link>
              <Link to="/inventory" className="text-gray-700 hover:text-pokemon-red px-3 py-2 rounded-md flex items-center">
                <Library size={18} className="mr-1" />
                <span>Inventory</span>
              </Link>
              <Link to="/booster-game" className="text-gray-700 hover:text-pokemon-red px-3 py-2 rounded-md flex items-center">
                <Package size={18} className="mr-1" />
                <span>Booster Game</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex md:items-center">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/profile" className="flex w-full">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/collection" className="flex w-full">My Collection</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" className="bg-pokemon-red hover:bg-pokemon-red/90" onClick={onLogin}>
                  Sign In
                </Button>
              )}
            </div>
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pokemon-red hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 px-2">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-pokemon-red block px-3 py-2 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/sets" 
              className="text-gray-700 hover:text-pokemon-red block px-3 py-2 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Card Sets
            </Link>
            <Link 
              to="/inventory" 
              className="text-gray-700 hover:text-pokemon-red block px-3 py-2 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Inventory
            </Link>
            <Link 
              to="/booster-game" 
              className="text-gray-700 hover:text-pokemon-red block px-3 py-2 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Booster Game
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="space-y-1 px-2">
                <Link 
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-pokemon-red font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/collection"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-pokemon-red font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  My Collection
                </Link>
                <button 
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-pokemon-red font-medium"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="px-2">
                <Button 
                  variant="default" 
                  className="w-full bg-pokemon-red hover:bg-pokemon-red/90"
                  onClick={() => {
                    onLogin();
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
