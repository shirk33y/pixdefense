import React from 'react';
import { Card } from '../types';
import TowerCard from './TowerCard';

interface CardHandProps {
  cards: Card[];
  onBuyCard: (card: Card) => void;
  onLockCard: (id: string) => void;
  onReroll: () => void;
  onStartWave: () => void;
  rerollCost: number;
  playerGold: number;
}

const CardHand: React.FC<CardHandProps> = ({ cards, onBuyCard, onLockCard, onReroll, onStartWave, rerollCost, playerGold }) => {
  const canAffordReroll = playerGold >= rerollCost;

  return (
    <div className="flex justify-center items-end gap-12 h-full">
      {/* Cards container */}
      <div className="flex justify-center items-end gap-4">
        {cards.map((card) => (
          <TowerCard 
            key={card.id}
            card={card}
            onBuy={onBuyCard}
            onLock={onLockCard}
            playerGold={playerGold}
          />
        ))}
      </div>
      
      {/* Controls */}
      <div className="flex flex-col gap-2 items-center">
         <div className="text-center text-2xl text-yellow-400 font-bold mb-2">
          GOLD:<br/><span className="text-white">{playerGold}</span>
        </div>
        <button
          onClick={onReroll}
          disabled={!canAffordReroll}
          className={`w-40 px-6 py-4 text-lg font-bold rounded-lg transition-colors uppercase ${canAffordReroll ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
        >
          Reroll
          <span className="block text-sm">(${rerollCost})</span>
        </button>
        <button onClick={onStartWave} className="w-40 px-6 py-4 bg-green-600 hover:bg-green-700 rounded-md font-bold text-lg uppercase">
              Start Wave
         </button>
      </div>
    </div>
  );
};

export default CardHand;