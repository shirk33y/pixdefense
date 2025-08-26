import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import GameUI from './components/GameUI';
import CardHand from './components/CardHand';
import { GameState, TowerType, Vector2D, Card, PlacedTower, ActiveEnemy, Projectile, EnemyType, DeathEffect, TowerAbilityType, StatusEffect, StatusEffectType, ChainLightningEffect } from './types';
import {
  GAME_MAP, TILE_SIZE, ENEMY_PATH, TOWER_STATS, WAVE_CONFIG, CARD_POOL,
  INITIAL_PLAYER_HEALTH, INITIAL_PLAYER_GOLD, INITIAL_REROLL_COST, ENEMY_STATS, GRID_WIDTH, GRID_HEIGHT
} from './constants';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
    const [waveNumber, setWaveNumber] = useState(0);
    const [playerHealth, setPlayerHealth] = useState(INITIAL_PLAYER_HEALTH);
    const [playerGold, setPlayerGold] = useState(INITIAL_PLAYER_GOLD);
    const [rerollCost, setRerollCost] = useState(INITIAL_REROLL_COST);

    const towers = useRef<PlacedTower[]>([]);
    const enemies = useRef<ActiveEnemy[]>([]);
    const projectiles = useRef<Projectile[]>([]);
    const deathEffects = useRef<DeathEffect[]>([]);
    const chainLightningEffects = useRef<ChainLightningEffect[]>([]);
    
    const [gameDataForRender, setGameDataForRender] = useState({
      towers: [] as PlacedTower[],
      enemies: [] as ActiveEnemy[],
      projectiles: [] as Projectile[],
      deathEffects: [] as DeathEffect[],
      chainLightningEffects: [] as ChainLightningEffect[],
    });

    const [cardHand, setCardHand] = useState<Card[]>([]);
    const [selectedCardForPlacement, setSelectedCardForPlacement] = useState<Card | null>(null);

    const [gameSpeed, setGameSpeed] = useState(1);
    const [waveMessage, setWaveMessage] = useState<string | null>(null);
    const [waveTimer, setWaveTimer] = useState(0);
    
    const spawnedEnemiesThisWave = useRef(0);
    const enemiesToSpawn = useRef<EnemyType[]>([]);
    const gameLoopRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number>(performance.now());
    const waveMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gameStateRef = useRef(gameState);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);
    
    const drawNewHand = useCallback(() => {
        const newHand: Card[] = cardHand.filter(c => c.locked);
        while (newHand.length < 4) {
            const randomType = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
            newHand.push({ id: crypto.randomUUID(), type: randomType, locked: false });
        }
        setCardHand(newHand);
    }, [cardHand]);

    useEffect(() => {
        drawNewHand();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancelPlacement = useCallback(() => {
        if (selectedCardForPlacement) {
            setSelectedCardForPlacement(null);
        }
    }, [selectedCardForPlacement]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCancelPlacement();
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            handleCancelPlacement();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [handleCancelPlacement]);


    const handleBuyCard = (card: Card) => {
        if (!selectedCardForPlacement) {
            setSelectedCardForPlacement(card);
        }
    };

    const handlePlaceTower = useCallback((position: Vector2D) => {
        if (!selectedCardForPlacement) return;
                
        const towerType = selectedCardForPlacement.type;
        const cost = TOWER_STATS[towerType].cost;

        if (playerGold < cost) {
            handleCancelPlacement();
            return;
        }

        const newTower: PlacedTower = {
            id: crypto.randomUUID(),
            type: towerType,
            position,
            cooldown: 0,
        };
        towers.current.push(newTower);
        setPlayerGold(prev => prev - cost);
        setCardHand(prev => prev.filter(c => c.id !== selectedCardForPlacement.id));
        setSelectedCardForPlacement(null);
        setGameDataForRender(prev => ({...prev, towers: [...towers.current]}));
    }, [playerGold, selectedCardForPlacement, handleCancelPlacement]);

    const handleLockCard = (id: string) => {
        setCardHand(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
    };

    const handleReroll = () => {
        if (playerGold >= rerollCost) {
            setPlayerGold(prev => prev - rerollCost);
            setRerollCost(prev => Math.floor(prev * 1.5));
            drawNewHand();
        }
    };
    
    const startWave = () => {
        if (selectedCardForPlacement) {
            handleCancelPlacement();
        }
        const currentWave = WAVE_CONFIG[waveNumber];
        if (!currentWave) return;

        setWaveTimer(currentWave.timeLimit);

        if (waveMessageTimeoutRef.current) clearTimeout(waveMessageTimeoutRef.current);
        setWaveMessage(`Wave ${waveNumber + 1} Started!`);
        waveMessageTimeoutRef.current = setTimeout(() => setWaveMessage(null), 1500);
        
        spawnedEnemiesThisWave.current = 0;
        enemiesToSpawn.current = currentWave.enemies.flatMap(group => Array(group.count).fill(group.type));
        
        const scheduleNextSpawn = () => {
            if (spawnedEnemiesThisWave.current >= enemiesToSpawn.current.length) return;
        
            const enemyType = enemiesToSpawn.current[spawnedEnemiesThisWave.current];
            const group = currentWave.enemies.find(g => g.type === enemyType && spawnedEnemiesThisWave.current < currentWave.enemies.filter(cg => cg.type === g.type).reduce((acc, val) => acc + val.count, 0) )
            const spawnDelay = group ? group.spawnDelay : 1000;

            setTimeout(() => {
                if (gameStateRef.current !== GameState.WAVE_ACTIVE) return;

                const stats = ENEMY_STATS[enemyType];
                const startPos = {x: ENEMY_PATH[0].x * TILE_SIZE + TILE_SIZE/2, y: ENEMY_PATH[0].y * TILE_SIZE + TILE_SIZE/2};
                
                enemies.current.push({
                    id: crypto.randomUUID(),
                    type: enemyType,
                    position: startPos,
                    health: stats.health,
                    maxHealth: stats.health,
                    pathIndex: 0,
                    statusEffects: [],
                });
                spawnedEnemiesThisWave.current++;
                scheduleNextSpawn();
            }, spawnDelay / gameSpeed);
        };
        
        setGameState(GameState.WAVE_ACTIVE);
        scheduleNextSpawn();
    };

    const gameLoop = useCallback((timestamp: number) => {
        const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000 * gameSpeed;
        lastFrameTimeRef.current = timestamp;
        
        if (gameStateRef.current !== GameState.WAVE_ACTIVE || deltaTime <= 0) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        const now = performance.now();
        let healthLost = 0;
        let goldGained = 0;
        const newDeathEffects: DeathEffect[] = [];
        const newChainLightningEffects: ChainLightningEffect[] = [];
        const damageMap = new Map<string, number>();

        // Update enemies and status effects
        const updatedEnemies = enemies.current.map(enemy => {
            let moveSpeedMultiplier = 1;
            const activeStatusEffects: StatusEffect[] = [];
            enemy.statusEffects.forEach(effect => {
                if(now - effect.startedAt < effect.duration * 1000) {
                    activeStatusEffects.push(effect);
                    if (effect.type === StatusEffectType.SLOW && effect.slowFactor) {
                        moveSpeedMultiplier = Math.min(moveSpeedMultiplier, effect.slowFactor);
                    } else if ((effect.type === StatusEffectType.POISON || effect.type === StatusEffectType.BURN) && effect.dps) {
                        const currentDamage = damageMap.get(enemy.id) || 0;
                        damageMap.set(enemy.id, currentDamage + effect.dps * deltaTime);
                    }
                }
            });
            
            if (enemy.pathIndex >= ENEMY_PATH.length - 1) {
                healthLost++;
                return null;
            }
            const targetNode = ENEMY_PATH[enemy.pathIndex + 1];
            const targetPos = { x: targetNode.x * TILE_SIZE + TILE_SIZE / 2, y: targetNode.y * TILE_SIZE + TILE_SIZE / 2 };
            
            const dirX = targetPos.x - enemy.position.x;
            const dirY = targetPos.y - enemy.position.y;
            const distance = Math.sqrt(dirX * dirX + dirY * dirY);
            
            const moveDist = ENEMY_STATS[enemy.type].speed * TILE_SIZE * deltaTime * moveSpeedMultiplier;
            
            const newEnemy = { ...enemy, statusEffects: activeStatusEffects };
            if (distance <= moveDist) {
                newEnemy.position = targetPos;
                newEnemy.pathIndex++;
            } else {
                newEnemy.position = {
                    x: enemy.position.x + (dirX / distance) * moveDist,
                    y: enemy.position.y + (dirY / distance) * moveDist
                };
            }
            return newEnemy;
        }).filter(e => e !== null) as ActiveEnemy[];

        const newProjectiles: Projectile[] = [];
        towers.current = towers.current.map(tower => {
            const newTower = { ...tower, cooldown: tower.cooldown - deltaTime };
            if (newTower.cooldown <= 0) {
                const stats = TOWER_STATS[tower.type];
                const towerPos = { x: (tower.position.x + 0.5) * TILE_SIZE, y: (tower.position.y + 0.5) * TILE_SIZE };
                const rangeSq = (stats.range * TILE_SIZE) * (stats.range * TILE_SIZE);

                let target: ActiveEnemy | null = null;
                for (const enemy of updatedEnemies) {
                    const dx = towerPos.x - enemy.position.x;
                    const dy = towerPos.y - enemy.position.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq <= rangeSq) {
                       target = enemy;
                       break;
                    }
                }

                if (target) {
                    newProjectiles.push({
                       id: crypto.randomUUID(),
                       position: { ...towerPos },
                       targetId: target.id,
                       damage: stats.damage,
                       color: stats.projectileColor,
                       speed: stats.projectileSpeed * TILE_SIZE,
                       velocity: { x: 0, y: 0 },
                       visual: stats.projectileVisual,
                       rotation: 0,
                       abilityData: stats.ability,
                    });
                    newTower.cooldown = 1 / stats.fireRate;
                }
            }
            return newTower;
        });
        
        const projectilesToKeep = projectiles.current.filter(proj => {
            const target = updatedEnemies.find(e => e.id === proj.targetId);
            if (!target) return false; 

            const dirX = target.position.x - proj.position.x;
            const dirY = target.position.y - proj.position.y;
            const distSq = dirX*dirX + dirY*dirY;
            const hitRadiusSq = (TILE_SIZE / 3) * (TILE_SIZE / 3);
            
            if (distSq < hitRadiusSq) {
                const currentDamage = damageMap.get(proj.targetId) || 0;
                damageMap.set(proj.targetId, currentDamage + proj.damage);

                const ability = proj.abilityData;
                switch (ability.type) {
                    case TowerAbilityType.POISON: case TowerAbilityType.BURN: case TowerAbilityType.SLOW:
                        const newEffect: StatusEffect = {
                            type: ability.type === TowerAbilityType.POISON ? StatusEffectType.POISON : (ability.type === TowerAbilityType.BURN ? StatusEffectType.BURN : StatusEffectType.SLOW),
                            duration: ability.duration, startedAt: now, dps: (ability as any).dps, slowFactor: (ability as any).factor,
                        };
                        target.statusEffects = [...target.statusEffects.filter(e => e.type !== newEffect.type), newEffect];
                        break;
                    case TowerAbilityType.SPLASH:
                        const splashRadiusSq = (ability.radius * TILE_SIZE) * (ability.radius * TILE_SIZE);
                        updatedEnemies.forEach(e => {
                            if (e.id !== target.id) {
                                const dx = target.position.x - e.position.x;
                                const dy = target.position.y - e.position.y;
                                if ((dx * dx + dy * dy) <= splashRadiusSq) {
                                    const splashDamage = damageMap.get(e.id) || 0;
                                    damageMap.set(e.id, splashDamage + proj.damage);
                                }
                            }
                        });
                        break;
                    case TowerAbilityType.CHAIN:
                         let lastTarget = target;
                         const hitTargets = new Set<string>([target.id]);
                         const chainRangeSq = (ability.range * TILE_SIZE) * (ability.range * TILE_SIZE);

                         for(let i=0; i < ability.targets; i++) {
                           let nextTarget: ActiveEnemy | null = null;
                           let minDistanceSq = chainRangeSq;

                           for(const potentialTarget of updatedEnemies) {
                              if(!hitTargets.has(potentialTarget.id)) {
                                const dx = lastTarget.position.x - potentialTarget.position.x;
                                const dy = lastTarget.position.y - potentialTarget.position.y;
                                const chainDistSq = dx * dx + dy * dy;
                                if (chainDistSq < minDistanceSq) {
                                    minDistanceSq = chainDistSq;
                                    nextTarget = potentialTarget;
                                }
                              }
                           }
                           
                           if(nextTarget) {
                              const chainDamage = damageMap.get(nextTarget.id) || 0;
                              damageMap.set(nextTarget.id, chainDamage + proj.damage * Math.pow(ability.damageFalloff, i + 1));
                              newChainLightningEffects.push({ id: crypto.randomUUID(), from: lastTarget.position, to: nextTarget.position, createdAt: now });
                              hitTargets.add(nextTarget.id);
                              lastTarget = nextTarget;
                           } else { break; }
                         }
                        break;
                }
                return false; 
            }
            
            const dist = Math.sqrt(distSq);
            proj.velocity = { x: (dirX / dist) * proj.speed, y: (dirY / dist) * proj.speed };
            proj.position.x += proj.velocity.x * deltaTime;
            proj.position.y += proj.velocity.y * deltaTime;
            proj.rotation = (Math.atan2(dirY, dirX) * 180 / Math.PI) + 90;

            return !(proj.position.x < 0 || proj.position.x > GRID_WIDTH * TILE_SIZE || proj.position.y < 0 || proj.position.y > GRID_HEIGHT * TILE_SIZE);
        });

        const enemiesAfterDamage = updatedEnemies.map(enemy => {
            if (damageMap.has(enemy.id)) {
                const newHealth = enemy.health - damageMap.get(enemy.id)!;
                if (newHealth <= 0) {
                    goldGained += ENEMY_STATS[enemy.type].goldValue;
                    newDeathEffects.push({ id: crypto.randomUUID(), position: enemy.position, createdAt: now });
                    return null;
                }
                return { ...enemy, health: newHealth };
            }
            return enemy;
        }).filter(e => e !== null) as ActiveEnemy[];
        
        if (healthLost > 0) setPlayerHealth(h => Math.max(0, h - healthLost));
        if (goldGained > 0) setPlayerGold(g => g + goldGained);
        
        enemies.current = enemiesAfterDamage;
        projectiles.current = [...projectilesToKeep, ...newProjectiles];
        deathEffects.current = [...deathEffects.current.filter(e => now - e.createdAt < 300), ...newDeathEffects];
        chainLightningEffects.current = [...chainLightningEffects.current.filter(e => now - e.createdAt < 150), ...newChainLightningEffects];
        
        setGameDataForRender({
            towers: towers.current,
            enemies: enemies.current,
            projectiles: projectiles.current,
            deathEffects: deathEffects.current,
            chainLightningEffects: chainLightningEffects.current,
        });

        const newTime = waveTimer - deltaTime;
        if (newTime <= 0) {
            setWaveTimer(0);
            if (enemiesAfterDamage.length > 1) {
                setGameState(GameState.GAME_OVER);
            } else {
                const remainingEnemiesCount = enemiesAfterDamage.length;
                if (remainingEnemiesCount > 0) setPlayerHealth(h => Math.max(0, h - remainingEnemiesCount));
                enemies.current = [];
                spawnedEnemiesThisWave.current = enemiesToSpawn.current.length;
            }
        } else {
            setWaveTimer(newTime);
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameSpeed, waveTimer]);

    useEffect(() => {
        if (gameState === GameState.WAVE_ACTIVE) {
            lastFrameTimeRef.current = performance.now();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);

    useEffect(() => {
        if (gameState === GameState.WAVE_ACTIVE && spawnedEnemiesThisWave.current >= enemiesToSpawn.current.length && enemies.current.length === 0) {
            setGameState(GameState.SETUP);
            projectiles.current = [];
            deathEffects.current = [];
            chainLightningEffects.current = [];
             setGameDataForRender(prev => ({...prev, projectiles: [], deathEffects: [], chainLightningEffects: [] }));
            const nextWave = waveNumber + 1;
            if (nextWave >= WAVE_CONFIG.length) {
                setGameState(GameState.VICTORY);
            } else {
                if (waveMessageTimeoutRef.current) clearTimeout(waveMessageTimeoutRef.current);
                setWaveMessage(`Wave ${waveNumber + 1} Complete!`);
                waveMessageTimeoutRef.current = setTimeout(() => setWaveMessage(null), 2500);
                setWaveNumber(nextWave);
                setPlayerGold(g => g + 100 + nextWave * 10); // End of wave bonus
                setCardHand(prev => prev.map(c => ({...c, locked: false})));
                drawNewHand();
            }
        }
    }, [gameDataForRender.enemies, gameState, waveNumber, drawNewHand]);
    
    useEffect(() => {
        if (playerHealth <= 0 && gameState !== GameState.GAME_OVER) {
            setGameState(GameState.GAME_OVER);
        }
    }, [playerHealth, gameState]);

    const restartGame = () => {
        setGameState(GameState.SETUP);
        setWaveNumber(0);
        setPlayerHealth(INITIAL_PLAYER_HEALTH);
        setPlayerGold(INITIAL_PLAYER_GOLD);
        setRerollCost(INITIAL_REROLL_COST);
        towers.current = [];
        enemies.current = [];
        projectiles.current = [];
        deathEffects.current = [];
        chainLightningEffects.current = [];
        setGameDataForRender({
          towers: [], enemies: [], projectiles: [], deathEffects: [], chainLightningEffects: []
        });
        setSelectedCardForPlacement(null);
        drawNewHand();
    };

    const renderOverlay = () => {
        if (gameState !== GameState.GAME_OVER && gameState !== GameState.VICTORY) return null;
        
        const isVictory = gameState === GameState.VICTORY;
        const gameOverReason = playerHealth <= 0 ? `You ran out of health.` : `Time ran out!`;

        return (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50">
                <h1 className={`text-6xl font-bold mb-4 ${isVictory ? 'text-green-500' : 'text-red-500'}`}>
                    {isVictory ? 'Victory!' : 'Game Over'}
                </h1>
                <p className="text-xl mb-8">
                    {isVictory ? `You conquered all ${WAVE_CONFIG.length} waves!` : `${gameOverReason} You survived until wave ${waveNumber + 1}.`}
                </p>
                <button onClick={restartGame} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-md font-bold text-2xl">
                    Play Again
                </button>
            </div>
        );
    };

    const renderBottomUIContent = () => {
        if (selectedCardForPlacement) {
            return (
                <div className="h-full flex justify-center items-center">
                    <button 
                        onClick={handleCancelPlacement} 
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-md font-bold text-lg text-white shadow-lg"
                    >
                        Cancel Placement (Esc)
                    </button>
                </div>
            );
        }
        if (gameState === GameState.SETUP) {
            return (
                <CardHand 
                    cards={cardHand}
                    onBuyCard={handleBuyCard}
                    onLockCard={handleLockCard}
                    onReroll={handleReroll}
                    onStartWave={startWave}
                    rerollCost={rerollCost}
                    playerGold={playerGold}
                />
            );
        }
        return null;
    }

    return (
        <div className="w-screen h-screen bg-[#2a3344] flex justify-center items-center font-silkscreen select-none">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {renderOverlay()}
                    {waveMessage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 pointer-events-none transition-opacity duration-500"
                            style={{ opacity: waveMessage ? 1 : 0 }}
                        >
                            <h2 className="text-5xl font-bold text-white text-center animate-pulse">{waveMessage}</h2>
                        </div>
                    )}
                    <GameUI 
                        health={playerHealth}
                        gold={playerGold}
                        wave={waveNumber}
                        totalWaves={WAVE_CONFIG.length}
                        onSpeedChange={setGameSpeed}
                        gameSpeed={gameSpeed}
                        gameState={gameState}
                        enemiesRemaining={enemies.current.length + (enemiesToSpawn.current.length - spawnedEnemiesThisWave.current)}
                        waveTimer={waveTimer}
                    />
                    <GameBoard 
                        map={GAME_MAP}
                        towers={gameDataForRender.towers}
                        enemies={gameDataForRender.enemies}
                        projectiles={gameDataForRender.projectiles}
                        deathEffects={gameDataForRender.deathEffects}
                        chainLightningEffects={gameDataForRender.chainLightningEffects}
                        onPlaceTower={handlePlaceTower}
                        selectedTowerType={selectedCardForPlacement?.type ?? null}
                    />
                </div>
                <div className="w-full max-w-7xl mx-auto p-4 h-[284px]">
                    {renderBottomUIContent()}
                </div>
            </div>
        </div>
    );
};

export default App;