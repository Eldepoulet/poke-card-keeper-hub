
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CardWithCollectionStatus } from '@/types/database';
import { Check, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type PokemonCardProps = CardWithCollectionStatus;

const PokemonCard: React.FC<PokemonCardProps> = ({ 
  id, 
  name, 
  number, 
  image_url, 
  rarity, 
  owned = false,
  set_id 
}) => {
  const [isCollected, setIsCollected] = useState(owned);
  const [isUpdating, setIsUpdating] = useState(false);

  const getCardColorClass = () => {
    switch(rarity.toLowerCase()) {
      case 'common': return 'border-gray-300';
      case 'uncommon': return 'border-green-400';
      case 'rare': return 'border-blue-400';
      case 'ultra rare': return 'border-purple-400';
      case 'secret rare': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const toggleCollection = async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to collect cards');
      return;
    }

    setIsUpdating(true);
    
    try {
      if (isCollected) {
        // Remove card from collection
        const { error } = await supabase
          .from('user_collections')
          .delete()
          .eq('card_id', id)
          .eq('user_id', session.user.id);
          
        if (error) throw error;
        toast.success(`${name} removed from your collection`);
      } else {
        // Add card to collection
        const { error } = await supabase
          .from('user_collections')
          .insert({
            card_id: id,
            user_id: session.user.id,
            collected_at: new Date().toISOString()
          });
          
        if (error) throw error;
        toast.success(`${name} added to your collection`);
      }
      setIsCollected(!isCollected);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update collection');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className={`pokemon-card relative rounded-lg overflow-hidden border-2 ${getCardColorClass()} transition-all duration-300 hover:shadow-lg ${
        isCollected 
          ? 'bg-green-50 ring-2 ring-green-300 ring-offset-2 scale-[1.02]' 
          : 'bg-white opacity-80'
      }`}
    >
      <Link to={`/sets/${set_id}/card/${id}`} className="block">
        <div className="aspect-[2/3] bg-gray-100">
          <img 
            src={image_url} 
            alt={name} 
            className={`w-full h-full object-cover ${isCollected ? 'brightness-110' : 'grayscale-[30%]'}`}
            loading="lazy"
          />
        </div>
        <div className={`p-2 ${isCollected ? 'bg-green-50' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">#{number}</span>
            <span className="text-xs font-medium text-gray-700 capitalize">{rarity}</span>
          </div>
          <h3 className={`font-medium text-sm truncate ${isCollected ? 'text-green-700' : ''}`} title={name}>{name}</h3>
        </div>
      </Link>
      {isCollected && (
        <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-0.5 font-medium">
          Collected
        </div>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isUpdating) toggleCollection();
        }}
        disabled={isUpdating}
        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
          isCollected 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-pokemon-red hover:bg-pokemon-red/90'
        }`}
        title={isCollected ? 'Remove from collection' : 'Add to collection'}
      >
        {isUpdating ? (
          <span className="block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
        ) : isCollected ? (
          <Check size={16} />
        ) : (
          <Plus size={16} />
        )}
      </button>
    </div>
  );
};

export default PokemonCard;
