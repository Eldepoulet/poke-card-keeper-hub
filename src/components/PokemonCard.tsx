
import React, { useState } from 'react';
import { Check, X, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export interface PokemonCardProps {
  id: string;
  name: string;
  number: string;
  imageUrl: string;
  rarity: string;
  owned: boolean;
  setId: string;
  type: string;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ 
  id, 
  name, 
  number, 
  imageUrl, 
  rarity, 
  owned, 
  setId,
  type 
}) => {
  const [isOwned, setIsOwned] = useState(owned);

  const handleToggleOwned = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsOwned(!isOwned);
    
    if (!isOwned) {
      toast.success(`Added ${name} to your collection!`);
    } else {
      toast.info(`Removed ${name} from your collection`);
    }
  };

  // Determine rarity color
  const rarityColor = () => {
    switch(rarity.toLowerCase()) {
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
    switch(type.toLowerCase()) {
      case 'fire': return 'bg-pokemon-red text-white';
      case 'water': return 'bg-pokemon-blue text-white';
      case 'grass': return 'bg-pokemon-lightBlue text-white';
      case 'electric': return 'bg-pokemon-yellow text-gray-800';
      case 'psychic': return 'bg-pokemon-purple text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="pokemon-card group relative">
      <Link to={`/sets/${setId}/card/${id}`}>
        <div className="relative aspect-[2.5/3.5] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rarityColor()}`}>
              {rarity}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor()}`}>
              {type}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleToggleOwned}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isOwned 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white text-gray-400 border border-gray-300'
                    }`}
                  >
                    {isOwned ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isOwned ? 'Remove from collection' : 'Add to collection'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="p-3">
          <p className="font-medium text-gray-700 truncate">{name}</p>
          <p className="text-sm text-gray-500">#{number}</p>
        </div>
      </Link>
    </div>
  );
};

export default PokemonCard;
