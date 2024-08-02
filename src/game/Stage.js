import { Monster } from './Monster.js';
import { CONFIG } from '../config.js';

export class Stage {
    constructor(stageData, monsterData, game)  {
        this.level = stageData.level;
        this.name = stageData.name;
        this.description = stageData.description;
        this.background = `${CONFIG.PATHS.BACKGROUND_IMAGES}${stageData.background}`;
        this.monsterTypes = stageData.monsters;
        this.bossType = stageData.boss;
        this.monsterData = monsterData;
        this.statRatio = stageData.statRatio;
        this.resetMonstersUntilBoss();
        this.game = game;
        this.playerStats = null; // 플레이어 스탯 저장을 위한 속성 추가
        this.baseMonsterStats = null;
        this.baseBossStats = null;
    }
    setPlayerStats(playerStats) {
        this.playerStats = playerStats;
    }


    initializeMonsterStats(playerStats, gameRound) {
        const normalMultiplier = this.calculateStatMultiplier(playerStats, 'normal');
        const bossMultiplier = this.calculateStatMultiplier(playerStats, 'boss');

        this.baseMonsterStats = {
            hp: Math.floor(playerStats.maxHp * normalMultiplier.hp * this.statRatio.hp),
            attack: Math.floor(playerStats.attack * normalMultiplier.attack * this.statRatio.attack),
            defense: Math.floor(playerStats.defense * normalMultiplier.defense * this.statRatio.defense)
        };

        this.baseBossStats = {
            hp: Math.floor(playerStats.maxHp * bossMultiplier.hp * this.statRatio.hp),
            attack: Math.floor(playerStats.attack * bossMultiplier.attack * this.statRatio.attack),
            defense: Math.floor(playerStats.defense * bossMultiplier.defense * this.statRatio.defense)
        };

        // 스테이지 레벨과 게임 라운드에 따른 추가 보정
        const levelAdjustment = 1 + (this.level - 1) * 0.01;
        const roundAdjustment = 1 + (gameRound - 1) * 0.02;

        Object.keys(this.baseMonsterStats).forEach(stat => {
            this.baseMonsterStats[stat] = Math.floor(this.baseMonsterStats[stat] * levelAdjustment * roundAdjustment);
            this.baseBossStats[stat] = Math.floor(this.baseBossStats[stat] * levelAdjustment * roundAdjustment);
        });
    }

    calculateStatMultiplier(playerStats, type) {
        const baseMultiplier = type === 'boss' ? CONFIG.MONSTER.BOSS_PLAYER_STAT_MULTIPLIER : CONFIG.MONSTER.NORMAL_PLAYER_STAT_MULTIPLIER;
        return {
            hp: baseMultiplier.hp,
            attack: baseMultiplier.attack,
            defense: baseMultiplier.defense
        };
    }

    resetMonstersUntilBoss() {
        this.monstersUntilBoss = this.getRandomMonstersUntilBoss();
    }

    getRandomMonstersUntilBoss() {
        return Math.floor(Math.random() * 5) + 14; // 8에서 20 사이의 랜덤한 수
        // return Math.floor(Math.random() * 1) + 1; // 8에서 20 사이의 랜덤한 수
    }

    spawnMonster(gameRound) {
        const monsterType = this.getRandomMonsterType();
        const monsterData = this.monsterData.find(m => m.name === monsterType && m.type === 'normal');
        
        if (!monsterData || !this.baseMonsterStats) {
            console.error(`Monster data not found or base stats not initialized`);
            return null;
        }
        
        return new Monster(monsterData, this.baseMonsterStats, this.level, gameRound, 'normal', this.game);
    }
    
    spawnBossMonster(gameRound) {
        const bossData = this.monsterData.find(m => m.name === this.bossType && m.type === 'boss');
        
        if (!bossData || !this.baseBossStats) {
            console.error(`Boss data not found or base stats not initialized`);
            return null;
        }
        
        return new Monster(bossData, this.baseBossStats, this.level, gameRound, 'boss', this.game);
    }

    getRandomMonsterType() {
        return this.monsterTypes[Math.floor(Math.random() * this.monsterTypes.length)];
    }

    getRandomMonsterLevel() {
        const minLevel = Math.max(1, this.level - 1);
        const maxLevel = this.level + 1;
        return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    }

    getLastStageMonsters() {
        const normalMonster = this.spawnMonster(10, this.game.gameRound);
        const bossMonster = this.spawnBossMonster(10, this.game.gameRound);
        return { normal: normalMonster, boss: bossMonster };
    }
}