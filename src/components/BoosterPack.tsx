import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardWithCollectionStatus, CardSet } from '@/types/database';
import { Check, Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

type CardWithSet = CardWithCollectionStatus & {
  set: CardSet;
};

type BoosterPackProps = {
  cards: CardWithSet[];
  onAddToCollection: (cardId: string) => void;
  onOpenAnother: () => void;
};

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
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium">{card.name}</span>
                      <span className="capitalize">{card.rarity}</span>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {card.set?.name || 'Unknown Set'}
                    </div>
                  </div>
                  {!card.owned && (
                    <button
                      onClick={() => onAddToCollection(card.id)}
                      className="absolute top-2 right-2 bg-pokemon-blue text-white text-xs px-2 py-1 rounded hover:bg-pokemon-blue/90"
                    >
                      Collect
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          <div className="text-center">
            {revealedCards < cards.length ? (
              <button
                onClick={handleRevealNext}
                className="bg-pokemon-blue text-white px-4 py-2 rounded hover:bg-pokemon-blue/90"
              >
                Reveal Next Card
              </button>
            ) : (
              <button
                onClick={onOpenAnother}
                className="bg-pokemon-red text-white px-4 py-2 rounded hover:bg-pokemon-red/90"
              >
                Open Another Pack
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BoosterPack;
