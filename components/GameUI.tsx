import React from 'react';
import { GameState } from '../types';

interface GameUIProps {
  health: number;
  gold: number;
  wave: number;
  totalWaves: number;
  onSpeedChange: (speed: number) => void;
  gameSpeed: number;
  gameState: GameState;
  enemiesRemaining: number;
  waveTimer: number;
}

const GameUI: React.FC<GameUIProps> = ({ health, gold, wave, totalWaves, onSpeedChange, gameSpeed, gameState, enemiesRemaining, waveTimer }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-40 flex justify-between items-center text-lg">
      <div className="flex gap-6">
        <div>Health: <span className="text-red-500 font-bold">{health}</span></div>
        <div>Gold: <span className="text-yellow-400 font-bold">{gold}</span></div>
      </div>
      <div className="text-center">
        <div>Wave: <span className="text-blue-400 font-bold">{Math.min(wave + 1, totalWaves)} / {totalWaves}</span></div>
        {gameState === GameState.WAVE_ACTIVE && <div className="text-sm">Enemies: <span className="font-bold">{enemiesRemaining}</span></div>}
      </div>
       <div className="flex items-center gap-4">
        {gameState === GameState.WAVE_ACTIVE && (
            <div className="text-xl font-bold text-orange-400">
                Time: {formatTime(waveTimer)}
            </div>
        )}
        <div className="flex gap-1 bg-gray-700 p-1 rounded-md">
            {[1, 2, 4].map(speed => (
                <button
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className={`px-3 py-1 rounded-md text-sm ${gameSpeed === speed ? 'bg-blue-500' : 'hover:bg-gray-600'}`}
                >
                    {speed}x
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GameUI;
