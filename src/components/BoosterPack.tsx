
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardWithCollectionStatus } from '@/types/database';
import { Check, Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface BoosterPackProps {
  cards: CardWithCollectionStatus[];
  onAddToCollection: (cardId: string) => void;
  onOpenAnother: () => void;
}

const BoosterPack: React.FC<BoosterPackProps> = ({ 
  cards, 
  onAddToCollection,
  onOpenAnother
}) => {
  const [revealedCards, setRevealedCards] = useState(0);
  const [revealAll, setRevealAll] = useState(false);

  const handleRevealNext = () => {
    if (revealedCards < cards.length) {
      setRevealedCards(revealedCards + 1);
    }
  };

  const handleRevealAll = () => {
    setRevealAll(true);
    setRevealedCards(cards.length);
  };

  const getCardRarityColor = (rarity: string) => {
    switch(rarity.toLowerCase()) {
      case 'common': return 'border-gray-300';
      case 'uncommon': return 'border-green-400';
      case 'rare': return 'border-blue-400';
      case 'ultra rare': return 'border-purple-400';
      case 'secret rare': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="booster-pack">
      {revealedCards === 0 ? (
        <div className="text-center">
          <motion.div 
            className="w-64 h-96 mx-auto bg-pokemon-red rounded-lg shadow-xl cursor-pointer mb-8"
            whileHover={{ scale: 1.05 }}
            onClick={handleRevealNext}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Package size={64} className="text-white" />
            </div>
          </motion.div>
          <p className="text-lg font-medium mb-4">Click to reveal your cards!</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className={`relative rounded-lg overflow-hidden border-2 ${getCardRarityColor(card.rarity)}`}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ 
                    rotateY: revealAll || index < revealedCards ? 0 : 180,
                    opacity: revealAll || index < revealedCards ? 1 : 0
                  }}
                  transition={{ delay: revealAll ? index * 0.1 : 0, duration: 0.5 }}
                >
                  <div className="aspect-[2/3] bg-white">
                    <img 
                      src={card.image_url} 
                      alt={card.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 bg-white">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">#{card.number}</span>
                      <span className="text-xs font-medium text-gray-700 capitalize">{card.rarity}</span>
                    </div>
                    <h3 className="font-medium text-sm truncate" title={card.name}>{card.name}</h3>
                  </div>
                  
                  {!card.owned ? (
                    <button
                      onClick={() => onAddToCollection(card.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white bg-pokemon-blue hover:bg-pokemon-blue/90"
                      title="Add to collection"
                    >
                      <Plus size={16} />
                    </button>
                  ) : (
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-0.5 font-medium">
                      Collected
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {revealedCards < cards.length && !revealAll && (
              <Button 
                onClick={handleRevealNext}
                variant="outline"
                className="border-pokemon-blue text-pokemon-blue hover:bg-pokemon-blue hover:text-white"
              >
                Reveal Next Card
              </Button>
            )}
            
            {revealedCards < cards.length && !revealAll && (
              <Button 
                onClick={handleRevealAll}
                variant="outline"
                className="border-pokemon-red text-pokemon-red hover:bg-pokemon-red hover:text-white"
              >
                Reveal All Cards
              </Button>
            )}
            
            {(revealedCards === cards.length || revealAll) && (
              <Button 
                onClick={onOpenAnother}
                className="bg-pokemon-red hover:bg-pokemon-red/90 text-white"
              >
                <Package size={16} className="mr-2" />
                Open Another Pack
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BoosterPack;
