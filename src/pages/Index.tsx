
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import AuthModal from '@/components/AuthModal';
import CardSet from '@/components/CardSet';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { seedDatabase } from '@/utils/seedDatabase';
import { CardSetWithCollectionStats } from '@/types/database';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');

  // Check auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
        if (session?.user) {
          setUsername(session.user.email || '');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUsername(session.user.email || '');
      }
    });

    // Attempt to seed the database when the app starts
    seedDatabase().then(seeded => {
      if (seeded) {
        toast.success('Sample card data has been loaded!');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setUsername(username);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUsername('');
  };

  // Fetch featured card sets
  const { data: featuredSets = [], isLoading } = useQuery({
    queryKey: ['featuredSets'],
    queryFn: async () => {
      const { data: sets, error } = await supabase
        .from('card_sets')
        .select('*')
        .limit(3);
      
      if (error) throw error;
      
      if (isLoggedIn) {
        // If user is logged in, get their collection stats for each set
        const { data: collections } = await supabase
          .from('user_collections')
          .select('card_id');
        
        const collectedCardIds = new Set(collections?.map(c => c.card_id) || []);
        
        const { data: cards } = await supabase
          .from('cards')
          .select('id, set_id');
        
        return sets.map(set => {
          const setCards = cards.filter(card => card.set_id === set.id);
          const collectedCards = setCards.filter(card => collectedCardIds.has(card.id)).length;
          
          return {
            ...set,
            collectedCards,
          } as CardSetWithCollectionStats;
        });
      } else {
        // If not logged in, set collected cards to 0
        return sets.map(set => ({
          ...set,
          collectedCards: 0,
        })) as CardSetWithCollectionStats[];
      }
    },
  });

  return (
    <>
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <section className="relative overflow-hidden mb-12 py-16 md:py-24 bg-gradient-to-br from-pokemon-blue to-pokemon-red rounded-2xl">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-10">
            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
              alt="Pikachu" 
              className="w-80 h-80 animate-float"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Manage Your Pokémon Card Collection
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Keep track of all your Pokémon cards, organize by sets, and build your ultimate collection with PokeKeeper.
              </p>
              {isLoggedIn ? (
                <div className="space-y-4">
                  <p className="text-lg">Welcome back, <span className="font-bold">{username}</span>!</p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/sets">
                      <Button className="bg-white text-pokemon-red hover:bg-white/90">
                        View My Collection
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Button 
                  className="bg-white text-pokemon-red hover:bg-white/90" 
                  onClick={() => setShowAuthModal(true)}
                >
                  Start Your Collection
                </Button>
              )}
            </div>
          </div>
        </section>

        {isLoggedIn && !isLoading && featuredSets.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Collection Overview</h2>
              <Link to="/sets">
                <Button variant="outline" className="flex items-center gap-1">
                  <span>View All Sets</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSets.map(set => (
                <CardSet 
                  key={set.id}
                  {...set}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Sets</h2>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">Loading featured sets...</p>
            </div>
          ) : featuredSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSets.map(set => (
                <CardSet 
                  key={set.id}
                  {...set}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No card sets found. Please try again later.</p>
            </div>
          )}
        </section>

        <section className="bg-gray-100 p-8 rounded-lg">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">How PokeKeeper Works</h2>
            <p className="text-gray-600 mb-8">
              PokeKeeper helps you organize and track your Pokémon card collection with ease, offering features for collectors of all levels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-pokemon-red/10 text-pokemon-red flex items-center justify-center mx-auto mb-4">
                  <Search size={24} />
                </div>
                <h3 className="font-bold mb-2">Browse Sets</h3>
                <p className="text-gray-600 text-sm">
                  Explore all Pokémon card sets from Base Set to the latest expansions.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-pokemon-blue/10 text-pokemon-blue flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                    <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" fill="currentColor"/>
                    <path d="M12 13C9.33 13 7.25 14.3 7.25 16H16.75C16.75 14.3 14.67 13 12 13Z" fill="currentColor"/>
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Track Collection</h3>
                <p className="text-gray-600 text-sm">
                  Easily mark cards as collected and view your collection progress.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-pokemon-yellow/10 text-pokemon-yellow flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <h3 className="font-bold mb-2">View Details</h3>
                <p className="text-gray-600 text-sm">
                  See detailed information about each card in your collection.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin}
      />
    </>
  );
};

export default Index;
