import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import PokemonCard from '@/components/PokemonCard';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, Search, Package, Library, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CardWithCollectionStatus, CardSet } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

type SetWithCards = CardSet & {
  cards: CardWithCollectionStatus[];
  collectedCards: number;
};

const Inventory = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [activeTab, setActiveTab] = useState('physical');
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setUsername(session.user.id);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsLoggedIn(true);
          setUsername(session.user.id);
        } else {
          setIsLoggedIn(false);
          setUsername('');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch user's physical collection
  const { data: physicalCards = [], isLoading: isLoadingPhysical } = useQuery({
    queryKey: ['userPhysicalCollection', username],
    queryFn: async () => {
      if (!isLoggedIn) return [];

      // Get all cards in user's physical collection
      const { data: collections, error: collectionsError } = await supabase
        .from('user_collections')
        .select('card_id')
        .eq('user_id', username);

      if (collectionsError) throw collectionsError;
      if (!collections?.length) return [];

      const cardIds = collections.map(c => c.card_id);

      // Get full card details
      const { data: cardDetails, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds);

      if (cardsError) throw cardsError;

      // Mark all cards as owned since they're in the collection
      return cardDetails.map(card => ({
        ...card,
        owned: true
      })) as CardWithCollectionStatus[];
    },
    enabled: isLoggedIn
  });

  // Fetch user's game collection
  const { data: gameCards = [], isLoading: isLoadingGame } = useQuery({
    queryKey: ['userGameCollection', username],
    queryFn: async () => {
      if (!isLoggedIn) return [];

      // Get all cards in user's game collection
      const { data: collections, error: collectionsError } = await supabase
        .from('game_collections')
        .select('card_id')
        .eq('user_id', username);

      if (collectionsError) throw collectionsError;
      if (!collections?.length) return [];

      const cardIds = collections.map(c => c.card_id);

      // Get full card details
      const { data: cardDetails, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds);

      if (cardsError) throw cardsError;

      // Mark all cards as owned since they're in the collection
      return cardDetails.map(card => ({
        ...card,
        owned: true
      })) as CardWithCollectionStatus[];
    },
    enabled: isLoggedIn
  });

  // Fetch all sets
  const { data: allSets = [] } = useQuery({
    queryKey: ['sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('card_sets')
        .select('*')
        .order('release_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleLogin = (userId: string) => {
    setIsLoggedIn(true);
    setUsername(userId);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  // Filter and sort cards
  const filterAndSortCards = (cards: CardWithCollectionStatus[]) => {
    const filtered = cards.filter(card => 
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.number.includes(searchQuery)
    );

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'number-asc') {
        return a.number.localeCompare(b.number, undefined, { numeric: true });
      } else if (sortOrder === 'number-desc') {
        return b.number.localeCompare(a.number, undefined, { numeric: true });
      } else if (sortOrder === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'name-desc') {
        return b.name.localeCompare(a.name);
      } else if (sortOrder === 'rarity') {
        const rarityOrder = {
          'common': 1,
          'uncommon': 2,
          'rare': 3,
          'ultra rare': 4,
          'secret rare': 5
        };
        return (rarityOrder[b.rarity.toLowerCase()] || 0) - (rarityOrder[a.rarity.toLowerCase()] || 0);
      }
      return 0;
    });
  };

  const sortedPhysicalCards = filterAndSortCards(physicalCards);
  const sortedGameCards = filterAndSortCards(gameCards);

  // Group cards by set
  const groupCardsBySet = (cards: CardWithCollectionStatus[]): SetWithCards[] => {
    const setsMap = new Map<string, SetWithCards>();

    // Initialize sets
    allSets.forEach(set => {
      setsMap.set(set.id, {
        ...set,
        cards: [],
        collectedCards: 0
      });
    });

    // Add cards to their respective sets
    cards.forEach(card => {
      const set = setsMap.get(card.set_id);
      if (set) {
        set.cards.push(card);
        set.collectedCards++;
      }
    });

    // Filter out sets with no cards and sort by release date
    return Array.from(setsMap.values())
      .filter(set => set.cards.length > 0)
      .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
  };

  const physicalSets = groupCardsBySet(sortedPhysicalCards);
  const gameSets = groupCardsBySet(sortedGameCards);

  const isLoading = isLoadingPhysical || isLoadingGame;

  if (isLoading) {
    return (
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <div className="text-center py-16">
          <p className="text-lg text-gray-500">Loading your collections...</p>
        </div>
      </Layout>
    );
  }

  const toggleSet = (setId: string) => {
    setExpandedSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(setId)) {
        newSet.delete(setId);
      } else {
        newSet.add(setId);
      }
      return newSet;
    });
  };

  const renderSet = (set: SetWithCards) => {
    const isExpanded = expandedSets.has(set.id);
    const collectionProgress = Math.round((set.collectedCards / set.total_cards) * 100);

    return (
      <div key={set.id} className="mb-6 border rounded-lg overflow-hidden">
        <div 
          className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
          onClick={() => toggleSet(set.id)}
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{set.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{set.collectedCards}/{set.total_cards} cards</span>
              <span>Released: {new Date(set.release_date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Progress 
              value={collectionProgress} 
              className="w-32 h-2" 
              indicatorClassName={
                collectionProgress === 100 
                  ? "bg-green-500" 
                  : collectionProgress > 50 
                    ? "bg-pokemon-blue" 
                    : "bg-pokemon-red"
              }
            />
            <ChevronDown 
              className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              size={20}
            />
          </div>
        </div>
        {isExpanded && (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {set.cards.map(card => (
                <PokemonCard key={card.id} {...card} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-pokemon-red">
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Collections</h1>
        <p className="text-gray-600 mb-4">
          {isLoggedIn 
            ? `Manage your physical and virtual card collections`
            : 'Please sign in to view your collections'}
        </p>
      </div>

      {isLoggedIn && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="number-asc">Number (Low-High)</SelectItem>
                <SelectItem value="number-desc">Number (High-Low)</SelectItem>
                <SelectItem value="rarity">Rarity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="physical" className="flex items-center gap-2">
                <Library size={16} />
                <span>Physical Collection ({physicalCards.length})</span>
              </TabsTrigger>
              <TabsTrigger value="game" className="flex items-center gap-2">
                <Package size={16} />
                <span>Game Collection ({gameCards.length})</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="physical">
              {physicalSets.length > 0 ? (
                physicalSets.map(renderSet)
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery 
                      ? 'No cards found matching your search'
                      : 'No cards in your physical collection yet'}
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="game">
              {gameSets.length > 0 ? (
                gameSets.map(renderSet)
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery 
                      ? 'No cards found matching your search'
                      : 'No cards in your game collection yet'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin}
      />
    </Layout>
  );
};

export default Inventory; 