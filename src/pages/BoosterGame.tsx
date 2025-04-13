import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import BoosterPack from '@/components/BoosterPack';
import { toast } from 'sonner';
import { CardWithCollectionStatus, CardSet } from '@/types/database';
import { getUserGameCollection, getGameCollectionCount, addCardToGameCollection } from '@/types/database';

type CardWithSet = CardWithCollectionStatus & {
  set: CardSet;
};

const BoosterGame = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [boosterCards, setBoosterCards] = useState<CardWithSet[]>([]);
  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gameCollectionCount, setGameCollectionCount] = useState(0);

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setUsername(session.user.id);
        fetchGameCollectionCount(session.user.id);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsLoggedIn(true);
          setUsername(session.user.id);
          fetchGameCollectionCount(session.user.id);
        } else {
          setIsLoggedIn(false);
          setUsername('');
          setGameCollectionCount(0);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchGameCollectionCount = async (userId: string) => {
    try {
      // Use our helper function
      const { count, error } = await getGameCollectionCount(userId);
      
      if (error) {
        console.error('Error fetching game collection count:', error);
        return;
      }
      
      setGameCollectionCount(count || 0);
    } catch (error) {
      console.error('Error in fetchGameCollectionCount:', error);
    }
  };

  const handleLogin = (userId: string) => {
    setIsLoggedIn(true);
    setUsername(userId);
    setShowAuthModal(false);
    fetchGameCollectionCount(userId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setGameCollectionCount(0);
  };

  const openBoosterPack = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      // Récupérer toutes les cartes avec pagination
      let allCards: CardWithSet[] = [];
      let hasMore = true;
      let page = 0;
      const pageSize = 1000;

      while (hasMore) {
        const { data: cards, error } = await supabase
          .from('cards')
          .select(`
            *,
            set:card_sets!inner(*)
          `)
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('id');

        if (error) throw error;
        if (!cards) throw new Error('No cards returned');

        allCards = [...allCards, ...cards.map(card => ({
          ...card,
          owned: false
        }))];
        
        if (cards.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      // Mélanger les cartes aléatoirement
      const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);

      // Définir les groupes de raretés et leurs poids
      const rarityGroups = {
        common: {
          rarities: ['Common', 'Promo'],
          count: 3 // 3 cartes communes ou promo
        },
        uncommon: {
          rarities: ['Uncommon', 'Rare'],
          count: 1 // 1 carte uncommon ou rare
        },
        rarePlus: {
          categories: {
            rareHolo: {
              rarities: [
                'Rare Holo',
                'Rare Holo EX',
                'Rare Holo GX',
                'Rare Holo V',
                'Rare Holo VSTAR',
                'Rare Holo VMAX',
                'Rare BREAK',
                'Rare Prime',
                'Rare Ultra',
                'Rare Shiny',
                'Rare Shiny GX',
                'Trainer Gallery Rare Holo'
              ],
              weight: 0.7 // 70% de chance d'obtenir une carte de cette catégorie
            },
            ultraRare: {
              rarities: [
                'Ultra Rare',
                'Rare Rainbow',
                'Rare Holo Star',
                'Rare Holo LV.X',
                'Rare Prism Star',
                'Rare Secret',
                'Rare Shining',
                'Rare ACE',
                'ACE SPEC Rare',
                'Double Rare',
                'Amazing Rare',
                'Radiant Rare'
              ],
              weight: 0.25 // 25% de chance d'obtenir une carte de cette catégorie
            },
            hyperRare: {
              rarities: [
                'Hyper Rare',
                'Special Illustration Rare',
                'Illustration Rare',
                'Shiny Ultra Rare',
                'LEGEND',
                'Classic Collection'
              ],
              weight: 0.05 // 5% de chance d'obtenir une carte de cette catégorie
            }
          },
          count: 1 // 1 carte rare ou mieux
        }
      };

      // Grouper les cartes par rareté
      const cardsByRarity = shuffledCards.reduce((acc, card) => {
        const rarity = card.rarity;
        
        // Grouper les cartes communes et uncommon
        for (const [group, data] of Object.entries(rarityGroups)) {
          if (group === 'rarePlus') continue;
          if ('rarities' in data && data.rarities.includes(rarity)) {
            if (!acc[group]) {
              acc[group] = [];
            }
            acc[group].push(card);
            break;
          }
        }

        // Grouper les cartes rares par sous-catégorie
        if (rarityGroups.rarePlus) {
          for (const [category, data] of Object.entries(rarityGroups.rarePlus.categories)) {
            if (data.rarities.includes(rarity)) {
              if (!acc.rarePlus) {
                acc.rarePlus = {};
              }
              if (!acc.rarePlus[category]) {
                acc.rarePlus[category] = [];
              }
              acc.rarePlus[category].push(card);
              break;
            }
          }
        }

        return acc;
      }, {} as Record<string, any>);

      // Sélectionner les cartes selon la distribution
      const selectedCards: CardWithSet[] = [];

      // Sélectionner les cartes communes
      for (let i = 0; i < rarityGroups.common.count; i++) {
        if (cardsByRarity.common?.length) {
          const randomIndex = Math.floor(Math.random() * cardsByRarity.common.length);
          selectedCards.push(cardsByRarity.common[randomIndex]);
        }
      }

      // Sélectionner une carte uncommon/rare
      if (cardsByRarity.uncommon?.length) {
        const randomIndex = Math.floor(Math.random() * cardsByRarity.uncommon.length);
        selectedCards.push(cardsByRarity.uncommon[randomIndex]);
      }

      // Sélectionner une carte rare ou mieux selon les poids
      if (cardsByRarity.rarePlus) {
        const random = Math.random();
        let selectedCategory = null;
        let cumulativeWeight = 0;

        // Déterminer la catégorie en fonction des poids
        for (const [category, data] of Object.entries(rarityGroups.rarePlus.categories)) {
          cumulativeWeight += data.weight;
          if (random <= cumulativeWeight) {
            selectedCategory = category;
            break;
          }
        }

        // Si aucune catégorie n'a été sélectionnée (à cause des arrondis), prendre la dernière
        if (!selectedCategory) {
          selectedCategory = Object.keys(rarityGroups.rarePlus.categories).pop();
        }

        // Sélectionner une carte de la catégorie choisie
        if (cardsByRarity.rarePlus[selectedCategory]?.length) {
          const randomIndex = Math.floor(Math.random() * cardsByRarity.rarePlus[selectedCategory].length);
          selectedCards.push(cardsByRarity.rarePlus[selectedCategory][randomIndex]);
        }
      }

      // Si on n'a pas assez de cartes, compléter avec des cartes aléatoires
      while (selectedCards.length < 5) {
        const remainingCards = shuffledCards.filter(card => !selectedCards.includes(card));
        if (remainingCards.length === 0) break;
        const randomIndex = Math.floor(Math.random() * remainingCards.length);
        selectedCards.push(remainingCards[randomIndex]);
      }

      // Vérifier le statut de possession et collecter automatiquement les nouvelles cartes
      const { data: gameCollection, error: collectionError } = await getUserGameCollection(username);
      if (!collectionError && gameCollection) {
        const ownedCardIds = new Set(gameCollection.map(item => item.card_id));
        const newCards = selectedCards.filter(card => !ownedCardIds.has(card.id));

        // Collecter automatiquement les nouvelles cartes
        for (const card of newCards) {
          const { error: addError } = await addCardToGameCollection(username, card.id);
          if (!addError) {
            setGameCollectionCount(prev => prev + 1);
          }
        }

        // Mettre à jour le statut de possession pour l'affichage
        const cardsWithStatus = selectedCards.map(card => ({
          ...card,
          owned: true // Toutes les cartes sont maintenant possédées
        }));
        setBoosterCards(cardsWithStatus);
      } else {
        // Si on ne peut pas vérifier la collection, collecter toutes les cartes
        for (const card of selectedCards) {
          const { error: addError } = await addCardToGameCollection(username, card.id);
          if (!addError) {
            setGameCollectionCount(prev => prev + 1);
          }
        }
        setBoosterCards(selectedCards.map(card => ({ ...card, owned: true })));
      }
      
      setIsOpened(true);
      toast.success('New cards have been added to your collection!');
    } catch (error) {
      console.error('Error opening booster pack:', error);
      toast.error('Failed to open booster pack');
    } finally {
      setIsLoading(false);
    }
  };

  const addToGameCollection = async (cardId: string) => {
    // Cette fonction n'est plus nécessaire car les cartes sont collectées automatiquement
    // Mais nous la gardons pour la compatibilité avec le composant BoosterPack
    return;
  };

  const resetBooster = () => {
    setBoosterCards([]);
    setIsOpened(false);
  };

  return (
    <>
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-pokemon-red">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Booster Pack Game</h1>
          <p className="text-gray-600 mb-4">Open booster packs to build your virtual collection!</p>
          
          {isLoggedIn && (
            <div className="mb-6">
              <p className="text-lg font-medium">Your Game Collection: <span className="text-pokemon-blue">{gameCollectionCount}</span> cards</p>
            </div>
          )}
          
          {!isOpened ? (
            <div className="flex flex-col items-center">
              <Button 
                onClick={openBoosterPack} 
                disabled={isLoading}
                className="bg-pokemon-red hover:bg-pokemon-red/90 text-white px-8 py-6 text-xl rounded-2xl shadow-lg mb-4"
              >
                <Package size={24} className="mr-2" />
                Open Booster Pack
              </Button>
              {isLoading && <p>Opening pack...</p>}
              {!isLoggedIn && <p className="text-sm text-gray-500 mt-2">Please login to open boosters</p>}
            </div>
          ) : (
            <BoosterPack 
              cards={boosterCards} 
              onAddToCollection={addToGameCollection}
              onOpenAnother={resetBooster}
            />
          )}
        </div>
      </Layout>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin}
      />
    </>
  );
};

export default BoosterGame;
