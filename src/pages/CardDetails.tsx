import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CardDetails = Database['public']['Tables']['cards']['Row'] & {
  artist?: string;
};
type SetDetails = Database['public']['Tables']['card_sets']['Row'];

const CardDetails = () => {
  const { setId, cardId } = useParams<{ setId: string; cardId: string }>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [setDetails, setSetDetails] = useState<SetDetails | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!setId || !cardId) return;

      try {
        // Fetch card details
        const { data: cardData, error: cardError } = await supabase
          .from('cards')
          .select('*')
          .eq('id', cardId)
          .single();

        if (cardError) throw cardError;
        setCardDetails(cardData);

        // Fetch set details
        const { data: setData, error: setError } = await supabase
          .from('card_sets')
          .select('*')
          .eq('id', setId)
          .single();

        if (setError) throw setError;
        setSetDetails(setData);

        // Check if card is in user's collection
        if (isLoggedIn) {
          const { data: collectionData, error: collectionError } = await supabase
            .from('user_collections')
            .select('*')
            .eq('card_id', cardId)
            .eq('user_id', username)
            .single();

          if (!collectionError && collectionData) {
            setIsOwned(true);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load card details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setId, cardId, isLoggedIn, username]);

  if (!setId || !cardId) {
    return <div>Set ID and Card ID are required</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!cardDetails || !setDetails) {
    return <div>Card not found</div>;
  }

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setUsername(username);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  const handleToggleOwned = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (!isOwned) {
        // Add to collection
        const { error } = await supabase
          .from('user_collections')
          .insert({
            card_id: cardId,
            user_id: username,
            collected_at: new Date().toISOString()
          });

        if (error) throw error;
        setIsOwned(true);
        toast.success(`Added ${cardDetails.name} to your collection!`);
      } else {
        // Remove from collection
        const { error } = await supabase
          .from('user_collections')
          .delete()
          .eq('card_id', cardId)
          .eq('user_id', username);

        if (error) throw error;
        setIsOwned(false);
        toast.info(`Removed ${cardDetails.name} from your collection`);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    }
  };

  // Determine rarity color
  const rarityColor = () => {
    switch(cardDetails.rarity.toLowerCase()) {
      case 'common': return 'bg-gray-200 text-gray-700';
      case 'uncommon': return 'bg-green-200 text-green-700';
      case 'rare': return 'bg-blue-200 text-blue-700';
      case 'ultra rare': return 'bg-purple-200 text-purple-700';
      case 'secret rare': return 'bg-yellow-200 text-yellow-700';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  // Determine type color
  const typeColor = () => {
    switch(cardDetails.type.toLowerCase()) {
      case 'fire': return 'bg-pokemon-red text-white';
      case 'water': return 'bg-pokemon-blue text-white';
      case 'grass': return 'bg-pokemon-lightBlue text-white';
      case 'electric': return 'bg-pokemon-yellow text-gray-800';
      case 'psychic': return 'bg-pokemon-purple text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      <Layout isLoggedIn={isLoggedIn} onLogin={() => setShowAuthModal(true)} onLogout={handleLogout}>
        <div className="mb-6">
          <Link to={`/sets/${setId}`} className="inline-flex items-center text-gray-600 hover:text-pokemon-red">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to {setDetails.name}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex justify-center">
            <div className="pokemon-card max-w-[350px] w-full">
              <div className="aspect-[2.5/3.5] overflow-hidden">
                <img 
                  src={cardDetails.image_url} 
                  alt={cardDetails.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={rarityColor()}>
                {cardDetails.rarity}
              </Badge>
              <Badge className={typeColor()}>
                {cardDetails.type}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-1">{cardDetails.name}</h1>
            <p className="text-gray-500 mb-4">#{cardDetails.number} • {setDetails.name}</p>
            
            <div className="mb-6">
              <p className="text-gray-700">{cardDetails.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Card Information</h2>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-600">HP:</div>
                <div>{cardDetails.hp}</div>
                <div className="text-gray-600">Type:</div>
                <div>{cardDetails.type}</div>
                <div className="text-gray-600">Set:</div>
                <div>{setDetails.name}</div>
                <div className="text-gray-600">Card Number:</div>
                <div>{cardDetails.number}</div>
                <div className="text-gray-600">Rarity:</div>
                <div>{cardDetails.rarity}</div>
                <div className="text-gray-600">Artist:</div>
                <div>{cardDetails.artist || 'Unknown'}</div>
              </div>
            </div>

            {cardDetails.attacks && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Attacks</h2>
                {Array.isArray(cardDetails.attacks) && cardDetails.attacks.map((attack: any, index: number) => (
                  <Card key={index} className="mb-2">
                    <CardHeader className="py-2 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{attack.name}</CardTitle>
                        <div className="text-sm text-gray-700">
                          {attack.damage}
                        </div>
                      </div>
                    </CardHeader>
                    {attack.text && (
                      <CardContent className="py-2 px-4">
                        <p className="text-sm text-gray-600">{attack.text}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            <Button 
              onClick={handleToggleOwned}
              className={`w-full ${
                isOwned 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pokemon-blue hover:bg-pokemon-blue/90'
              }`}
            >
              {isOwned ? (
                <>
                  <Check size={16} className="mr-2" /> 
                  In Your Collection
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" /> 
                  Add to Collection
                </>
              )}
            </Button>
          </div>
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

export default CardDetails;
