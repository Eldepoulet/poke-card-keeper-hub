import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import CardSet from '@/components/CardSet';
import AuthModal from '@/components/AuthModal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CardSetWithCollectionStats } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { seedDatabase } from '@/utils/seedDatabase';
import { Button } from '@/components/ui/button';

const Sets = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isSeeding, setIsSeeding] = useState(false);
  const navigate = useNavigate();

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

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const attemptSeed = async () => {
      setIsSeeding(true);
      try {
        const success = await seedDatabase();
        if (success) {
          toast.success('Sample card data has been loaded!');
          refetch();
        }
      } catch (error) {
        console.error('Failed to seed database:', error);
      } finally {
        setIsSeeding(false);
      }
    };
    
    attemptSeed();
  }, []);

  const handleForceRefresh = async () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser et recharger toutes les données? Cela supprimera toutes les données existantes.')) {
      setIsSeeding(true);
      try {
        const success = await seedDatabase(true);
        if (success) {
          toast.success('La base de données a été réinitialisée et rechargée avec succès!');
          refetch();
        } else {
          toast.error('Échec de la réinitialisation de la base de données.');
        }
      } catch (error) {
        console.error('Failed to reset database:', error);
        toast.error('Une erreur est survenue lors de la réinitialisation.');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const { data: cardSets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cardSets'],
    queryFn: async () => {
      const { data: sets, error: setsError } = await supabase
        .from('card_sets')
        .select('*');
      
      if (setsError) throw setsError;
      
      if (isLoggedIn) {
        const { data: collections, error: collectionsError } = await supabase
          .from('user_collections')
          .select('card_id');
        
        if (collectionsError) throw collectionsError;
        
        const collectedCardIds = new Set(collections?.map(c => c.card_id) || []);
        
        const { data: cards, error: cardsError } = await supabase
          .from('cards')
          .select('id, set_id');
        
        if (cardsError) throw cardsError;
        
        return sets.map(set => {
          const setCards = cards.filter(card => card.set_id === set.id);
          const collectedCards = setCards.filter(card => collectedCardIds.has(card.id)).length;
          
          return {
            ...set,
            collectedCards,
          } as CardSetWithCollectionStats;
        });
      } else {
        return sets.map(set => ({
          ...set,
          collectedCards: 0,
        })) as CardSetWithCollectionStats[];
      }
    },
  });

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

  const filteredSets = cardSets.filter(set => 
    set.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSets = [...filteredSets].sort((a, b) => {
    const dateA = new Date(a.release_date);
    const dateB = new Date(b.release_date);
    
    if (sortOrder === 'newest') {
      return dateB.getTime() - dateA.getTime();
    } else if (sortOrder === 'oldest') {
      return dateA.getTime() - dateB.getTime();
    } else if (sortOrder === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === 'name-desc') {
      return b.name.localeCompare(a.name);
    } else if (sortOrder === 'completion-high') {
      return (b.collectedCards / b.total_cards) - (a.collectedCards / a.total_cards);
    } else if (sortOrder === 'completion-low') {
      return (a.collectedCards / a.total_cards) - (b.collectedCards / a.total_cards);
    }
    return 0;
  });

  return (
    <>
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pokémon Card Sets</h1>
          <p className="text-gray-600">
            Browse all Pokémon card sets and track your collection progress.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search sets..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={sortOrder} 
              onValueChange={setSortOrder}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="completion-high">Completion (High-Low)</SelectItem>
                <SelectItem value="completion-low">Completion (Low-High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleForceRefresh} 
            disabled={isSeeding}
            title="Réinitialiser et recharger la base de données"
          >
            <RefreshCw size={18} className={isSeeding ? "animate-spin" : ""} />
          </Button>
        </div>

        {isLoading || isSeeding ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              {isSeeding ? 'Loading card data into database...' : 'Loading card sets...'}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-xl text-red-500">Error loading card sets. Please try again.</p>
          </div>
        ) : sortedSets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSets.map(set => (
              <CardSet
                key={set.id}
                {...set}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No sets found matching "{searchQuery}"</p>
          </div>
        )}
      </Layout>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin}
      />
    </>
  );
};

export default Sets;
