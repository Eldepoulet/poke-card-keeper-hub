import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import PokemonCard from '@/components/PokemonCard';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { ArrowLeft, Search, RefreshCw } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { CardWithCollectionStatus, CardSet } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { seedDatabase } from '@/utils/seedDatabase';
import { toast } from 'sonner';

const SetDetails = () => {
  const { setId } = useParams<{ setId: string }>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [sortOrder, setSortOrder] = useState('number-asc');
  const [activeTab, setActiveTab] = useState('all');
  const [isSeeding, setIsSeeding] = useState(false);

  if (!setId) return <div>Set ID is required</div>;

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

    return () => subscription.unsubscribe();
  }, []);

  // Fetch set details and cards
  const { data: setDetails, isLoading: isLoadingSetDetails } = useQuery({
    queryKey: ['setDetails', setId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('card_sets')
        .select('*')
        .eq('id', setId)
        .single();
      
      if (error) throw error;
      
      return data as CardSet;
    }
  });

  const { data: cards = [], isLoading: isLoadingCards, refetch: refetchCards } = useQuery({
    queryKey: ['setCards', setId, isLoggedIn],
    queryFn: async () => {
      const { data: cards, error } = await supabase
        .from('cards')
        .select('*')
        .eq('set_id', setId);
      
      if (error) throw error;
      
      // If user is logged in, get their collection info
      if (isLoggedIn) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: collections } = await supabase
            .from('user_collections')
            .select('card_id')
            .eq('user_id', session.user.id);
          
          const collectedCardIds = new Set(collections?.map(c => c.card_id) || []);
          
          return cards.map(card => ({
            ...card,
            owned: collectedCardIds.has(card.id)
          })) as CardWithCollectionStatus[];
        }
      }
      
      // If not logged in, set owned to false for all cards
      return cards.map(card => ({
        ...card,
        owned: false
      })) as CardWithCollectionStatus[];
    },
    enabled: !!setId
  });

  const isLoading = isLoadingSetDetails || isLoadingCards;

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

  const handleForceRefresh = async () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser et recharger les données de ce set? Cela peut prendre quelques instants.')) {
      setIsSeeding(true);
      try {
        // Force seed for this specific set
        await seedDatabase(false); // Don't reset everything, just ensure the set is loaded
        
        toast.success('Données du set rechargées avec succès!');
        refetchCards();
      } catch (error) {
        console.error('Failed to reload set data:', error);
        toast.error('Une erreur est survenue lors du rechargement des données.');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  // Filter cards based on search, filter, and tab
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         card.number.includes(searchQuery);
    
    const matchesFilter = filterValue === 'all' || 
                         (filterValue === 'owned' && card.owned) ||
                         (filterValue === 'missing' && !card.owned) ||
                         (filterValue === card.rarity.toLowerCase()) ||
                         (filterValue === card.type.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'collected' && card.owned) ||
                      (activeTab === 'missing' && !card.owned);
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  // Sort filtered cards
  const sortedCards = [...filteredCards].sort((a, b) => {
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

  // Calculate collection progress
  const collectedCards = isLoggedIn ? cards.filter(card => card.owned).length : 0;
  const totalCards = cards.length;
  const collectionProgress = totalCards > 0 ? Math.round((collectedCards / totalCards) * 100) : 0;
  
  // Helper function to determine progress bar color
  const getProgressColorClass = () => {
    if (collectionProgress === 100) return "bg-green-500";
    if (collectionProgress > 50) return "bg-pokemon-blue";
    return "bg-pokemon-red";
  };

  if (isLoading) {
    return (
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <div className="text-center py-16">
          <p className="text-lg text-gray-500">Loading set details...</p>
        </div>
      </Layout>
    );
  }

  if (!setDetails) {
    return (
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <div className="text-center py-16">
          <p className="text-lg text-red-500">Set not found</p>
          <Link to="/sets" className="inline-block mt-4">
            <Button variant="outline">Back to Sets</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <div className="mb-6">
          <Link to="/sets" className="inline-flex items-center text-gray-600 hover:text-pokemon-red">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Sets</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="aspect-video relative">
            <img 
              src={setDetails.image_url} 
              alt={setDetails.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-1">{setDetails.name}</h1>
                <p>Released: {setDetails.release_date}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex-grow max-w-2xl">
                {setDetails.description && (
                  <p className="text-gray-700 mb-3">{setDetails.description}</p>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Collection Progress: {collectedCards} / {totalCards} cards
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {collectionProgress}%
                  </span>
                </div>
                {/* Custom progress bar implementation */}
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full ${getProgressColorClass()} transition-all duration-300`}
                    style={{ width: `${collectionProgress}%` }}
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleForceRefresh} 
                disabled={isSeeding}
                title="Recharger les données du set"
                className="flex-shrink-0"
              >
                <RefreshCw size={18} className={isSeeding ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Cards ({cards.length})</TabsTrigger>
            <TabsTrigger value="collected">Collected ({cards.filter(c => c.owned).length})</TabsTrigger>
            <TabsTrigger value="missing">Missing ({cards.filter(c => !c.owned).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search cards by name or number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="w-full md:w-48">
              <Select 
                value={filterValue} 
                onValueChange={setFilterValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cards</SelectItem>
                  <SelectItem value="owned">Owned</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="ultra rare">Ultra Rare</SelectItem>
                  <SelectItem value="secret rare">Secret Rare</SelectItem>
                  <SelectItem value="fire">Fire Type</SelectItem>
                  <SelectItem value="water">Water Type</SelectItem>
                  <SelectItem value="grass">Grass Type</SelectItem>
                  <SelectItem value="electric">Electric Type</SelectItem>
                  <SelectItem value="psychic">Psychic Type</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="number-asc">Number (Ascending)</SelectItem>
                  <SelectItem value="number-desc">Number (Descending)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="rarity">Rarity (Highest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-amber-600 mb-4">Aucune carte trouvée pour ce set</p>
            <p className="text-gray-500 mb-6">Cliquez sur le bouton de rechargement pour essayer de charger les cartes de ce set.</p>
            <Button 
              onClick={handleForceRefresh} 
              disabled={isSeeding}
              className="mx-auto"
            >
              {isSeeding ? "Chargement..." : "Recharger les cartes"}
              <RefreshCw size={18} className={`ml-2 ${isSeeding ? "animate-spin" : ""}`} />
            </Button>
          </div>
        ) : sortedCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedCards.map(card => (
              <PokemonCard
                key={card.id}
                {...card}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No cards found matching your criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterValue('all');
                setSortOrder('number-asc');
                setActiveTab('all');
              }}
            >
              Clear Filters
            </Button>
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

export default SetDetails;