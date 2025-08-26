import React, { useState, memo } from 'react';
import { GridCellType, PlacedTower, ActiveEnemy, TowerType, Projectile, Vector2D, DeathEffect, StatusEffectType, ChainLightningEffect } from '../types';
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, TOWER_STATS, ENEMY_STATS } from '../constants';
import PixelArt from './PixelArt';

interface GameBoardProps {
  map: GridCellType[][];
  towers: PlacedTower[];
  enemies: ActiveEnemy[];
  projectiles: Projectile[];
  deathEffects: DeathEffect[];
  chainLightningEffects: ChainLightningEffect[];
  onPlaceTower: (position: Vector2D) => void;
  selectedTowerType: TowerType | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ map, towers, enemies, projectiles, deathEffects, chainLightningEffects, onPlaceTower, selectedTowerType }) => {
  const [hoveredCell, setHoveredCell] = useState<Vector2D | null>(null);

  const isTowerSpot = (x: number, y: number): boolean => {
    return map[y]?.[x] === GridCellType.TOWER_SPOT && !towers.some(t => t.position.x === x && t.position.y === y);
  };

  const handleCellClick = (x: number, y: number) => {
    if (selectedTowerType && isTowerSpot(x, y)) {
      onPlaceTower({ x, y });
    }
  };

  
  const range = selectedTowerType ? TOWER_STATS[selectedTowerType].range * TILE_SIZE : 0;
  const ENEMY_SIZE = TILE_SIZE * 0.6;
  const HEALTH_BAR_WIDTH = TILE_SIZE * 0.6;

  const getStatusEffectColor = (enemy: ActiveEnemy) => {
    if (enemy.statusEffects.some(e => e.type === StatusEffectType.POISON)) return 'bg-green-500/30';
    if (enemy.statusEffects.some(e => e.type === StatusEffectType.BURN)) return 'bg-orange-500/30';
    if (enemy.statusEffects.some(e => e.type === StatusEffectType.SLOW)) return 'bg-blue-300/30';
    return '';
  }

  return (
    <div
      className="relative bg-gray-900 border-4 border-gray-700"
      style={{ width: GRID_WIDTH * TILE_SIZE, height: GRID_HEIGHT * TILE_SIZE }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor(((e.clientX - rect.left) / rect.width) * GRID_WIDTH);
        const y = Math.floor(((e.clientY - rect.top) / rect.height) * GRID_HEIGHT);

        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            setHoveredCell({ x, y });
        } else {
            setHoveredCell(null);
        }
      }}
      onMouseLeave={() => setHoveredCell(null)}
    >
      {/* Grid and Path */}
      {map.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="absolute"
            style={{
              top: y * TILE_SIZE,
              left: x * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: cell === GridCellType.PATH ? '#533c2f' : '#3a542a',
              border: '1px solid #1a1a1a',
            }}
            onClick={() => handleCellClick(x,y)}
          />
        ))
      )}
      
      {/* Placement Preview */}
      {selectedTowerType && hoveredCell && isTowerSpot(hoveredCell.x, hoveredCell.y) && (
        <>
        <div 
          className="absolute opacity-50" 
          style={{ 
            left: hoveredCell.x * TILE_SIZE, 
            top: hoveredCell.y * TILE_SIZE, 
            width: TILE_SIZE, 
            height: TILE_SIZE, 
            pointerEvents: 'none' 
          }}>
             <PixelArt data={TOWER_STATS[selectedTowerType].pixelArt} size={TILE_SIZE} />
        </div>
        <div 
           className="absolute rounded-full bg-blue-500 bg-opacity-20 border-2 border-blue-400"
           style={{
             left: (hoveredCell.x + 0.5) * TILE_SIZE - range,
             top: (hoveredCell.y + 0.5) * TILE_SIZE - range,
             width: range * 2,
             height: range * 2,
             pointerEvents: 'none'
           }}
         />
        </>
      )}


      {/* Towers */}
      {towers.map(tower => (
        <div
          key={tower.id}
          className="absolute flex justify-center items-center"
          style={{
            left: tower.position.x * TILE_SIZE,
            top: tower.position.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
        >
          <PixelArt data={TOWER_STATS[tower.type].pixelArt} size={TILE_SIZE * 0.9} />
        </div>
      ))}
      
      {/* Enemies */}
      {enemies.map(enemy => (
        <div
            key={enemy.id}
            className="absolute"
            style={{ 
                left: enemy.position.x - ENEMY_SIZE / 2, 
                top: enemy.position.y - ENEMY_SIZE / 2,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
            }}
        >
          <PixelArt data={ENEMY_STATS[enemy.type].pixelArt} size={ENEMY_SIZE} />
           <div className={`absolute inset-0 rounded-full ${getStatusEffectColor(enemy)}`}></div>
          {/* Health Bar */}
          {enemy.health < enemy.maxHealth && (
            <div className="absolute -top-1.5 w-full h-1 bg-red-800 rounded-full" style={{width: HEALTH_BAR_WIDTH, left: (ENEMY_SIZE - HEALTH_BAR_WIDTH)/2}}>
                <div 
                className="h-full bg-red-500 rounded-full"
                style={{width: `${(enemy.health / enemy.maxHealth) * 100}%`}}
                ></div>
            </div>
          )}
        </div>
      ))}

      {/* Projectiles */}
      {projectiles.map(p => {
        let content;
        switch (p.visual) {
          case 'arrow':
            content = (
              <div
                className="absolute"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderBottom: `12px solid ${p.color}`,
                  transform: `rotate(${p.rotation}deg)`,
                }}
              />
            );
            break;
          case 'spark':
            content = (
              <div className="absolute animate-pulse">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color, filter: 'blur(2px)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
              </div>
            );
            break;
          case 'circle':
          default:
            content = (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              />
            );
            break;
        }
        return (
          <div
            key={p.id}
            className="absolute flex justify-center items-center"
            style={{
              left: p.position.x,
              top: p.position.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {content}
          </div>
        );
      })}

       {/* Death Effects */}
       {deathEffects.map(effect => (
         // FIX: Changed effect.y to effect.position.y to correctly access the y-coordinate.
         <div key={effect.id} className="absolute" style={{ left: effect.position.x, top: effect.position.y, transform: 'translate(-50%, -50%)'}}>
            {/* Simple particle explosion */}
            <div className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
            <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse"></div>
         </div>
      ))}

      {/* Chain Lightning Effects */}
        <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        {chainLightningEffects.map(effect => (
            <line
            key={effect.id}
            x1={effect.from.x}
            y1={effect.from.y}
            x2={effect.to.x}
            y2={effect.to.y}
            stroke="#a78bfa"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-pulse"
            />
        ))}
        </svg>

    </div>
  );
};

export default memo(GameBoard);