import React, { useState } from 'react';
import { Card } from '../types';
import { TOWER_STATS } from '../constants';
import PixelArt from './PixelArt';

interface TowerCardProps {
  card: Card;
  onBuy: (card: Card) => void;
  onLock: (id: string) => void;
  playerGold: number;
}

const LockIcon: React.FC<{ locked: boolean; className?: string }> = ({ locked, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {locked ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    )}
  </svg>
);

const TowerCard: React.FC<TowerCardProps> = ({ card, onBuy, onLock, playerGold }) => {
  const stats = TOWER_STATS[card.type];
  const canAfford = playerGold >= stats.cost;
  const [isHovered, setIsHovered] = useState(false);

  const nameParts = stats.name.split(' ');
  const displayName = nameParts.length > 1 ? <>{nameParts[0]}<br/>{nameParts[1]}</> : stats.name;

  return (
    <div
      className={`relative w-40 h-52 bg-[#354156] border rounded-lg p-2 flex flex-col justify-start items-center transition-colors 
        ${card.locked ? 'border-cyan-400' : 'border-[#4a5568]'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute bottom-full mb-2 w-full left-0 bg-gray-900 bg-opacity-95 border border-gray-500 rounded-lg p-3 text-xs z-20 pointer-events-none">
          <p className="text-center text-gray-400 mb-2 h-10">{stats.description}</p>
          <div className="space-y-1 text-gray-300">
            <p>DMG: <span className="text-white font-semibold">{stats.damage}</span></p>
            <p>RNG: <span className="text-white font-semibold">{stats.range}</span></p>
            <p>SPD: <span className="text-white font-semibold">{stats.fireRate}/s</span></p>
          </div>
        </div>
      )}

      <div className="text-center mt-1 h-10 flex items-center justify-center">
        <h3 className="text-md font-bold text-yellow-300 leading-tight uppercase">{displayName}</h3>
      </div>
      
      <div className="flex-grow flex justify-center items-center my-1">
         <PixelArt data={stats.pixelArt} size={64}/>
      </div>
      
       <div className="mt-auto flex w-full items-center justify-center gap-2 px-1 pb-1">
          <button 
            onClick={() => onLock(card.id)} 
            className={`p-2 rounded-md transition-colors text-white ${card.locked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <LockIcon locked={card.locked} className="h-5 w-5" />
          </button>

          <button
              onClick={() => onBuy(card)}
              disabled={!canAfford}
              className={`flex-grow font-bold rounded-md transition-colors text-lg py-2 ${
                  canAfford 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
          >
              ${stats.cost}
          </button>
      </div>
    </div>
  );
};

export default TowerCard;