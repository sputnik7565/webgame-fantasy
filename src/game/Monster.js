import { CONFIG } from '../config.js';

export class Monster {
    constructor(data, baseStats, stageLevel, gameRound, type = 'normal', game) {
        this.name = data.name;
        this.type = type;
        this.level = stageLevel;
        
        // const baseStats = this.calculateBaseStats(stageLevel, gameRound, type, game ? game.roundInitialStats : null, playerStats);


        // const stageRatio = data.stageRatio || { attack: 1, defense: 1, hp: 1 };

        // 기본 스탯에 랜덤 변동 적용
        this.maxHp = Math.floor(this.applyRandomVariation(baseStats.hp));
        this.hp = this.maxHp;
        this.attack = Math.floor(this.applyRandomVariation(baseStats.attack));
        this.defense = Math.floor(this.applyRandomVariation(baseStats.defense));

        this.abilities = data.abilities || [];
        this.dialog = data.dialog || `${this.name}이(가) 나타났다!`;
        this.image = `${CONFIG.PATHS.MONSTER_IMAGES}${data.image}`;
        this.criticalChance = data.criticalChance || CONFIG.GAME.CRITICAL_HIT_CHANCE;
    }

    calculateLevel(stageLevel, gameRound) {
        return stageLevel + gameRound - 1;
    }

    calculateBaseStats(stageLevel, gameRound, type, roundInitialStats, playerStats) {
        let initialStats;
        if (roundInitialStats && roundInitialStats[type.toUpperCase()]) {
            initialStats = roundInitialStats[type.toUpperCase()];
        } else {
            initialStats = CONFIG.MONSTER.INITIAL[type.toUpperCase()];
        }
        const growthRate = CONFIG.MONSTER.GROWTH_RATE[type.toUpperCase()];
        
        // 플레이어 스탯 기반 계산 로직 추가
        const playerStatMultiplier = this.calculatePlayerStatMultiplier(playerStats, type);
        
        return {
            hp: initialStats.HP * Math.pow(growthRate.HP, (gameRound - 1) * 10 + stageLevel - 1) * playerStatMultiplier.hp,
            attack: initialStats.ATTACK * Math.pow(growthRate.ATTACK, (gameRound - 1) * 10 + stageLevel - 1) * playerStatMultiplier.attack,
            defense: initialStats.DEFENSE * Math.pow(growthRate.DEFENSE, (gameRound - 1) * 10 + stageLevel - 1) * playerStatMultiplier.defense
        };
    }

    calculatePlayerStatMultiplier(playerStats, type) {
        const baseMultiplier = type === 'boss' ? CONFIG.MONSTER.BOSS_PLAYER_STAT_MULTIPLIER : CONFIG.MONSTER.NORMAL_PLAYER_STAT_MULTIPLIER;
        return {
            hp: (playerStats.maxHp / 100) * baseMultiplier.hp,
            attack: (playerStats.attack / 20) * baseMultiplier.attack,
            defense: (playerStats.defense / 10) * baseMultiplier.defense
        };
    }


    calculateGrowth(min, max, growthRate, stageLevel) {
        const average = (min + max) / 2;
        return Math.floor(average * Math.pow(growthRate, stageLevel - 1));
    }
// 새로운 메서드: 스탯에 랜덤한 변화를 적용
    applyRandomVariation(stat) {
        const variation = 1 + (Math.random() * 0.1 - 0.05); // -5% to +5%
        return stat * variation;
    }

    

    takeDamage(damage) {
        const actualDamage = Math.max(damage - this.defense, 1);
        this.hp = Math.max(this.hp - actualDamage, 0);
        return actualDamage;
    }

    useAbility() {
        if (this.abilities.length > 0) {
            return this.abilities[Math.floor(Math.random() * this.abilities.length)];
        }
        return null;
    }

    isAlive() {
        return this.hp > 0;
    }

    getExpReward() {
        let baseExp = Math.floor(this.level * CONFIG.MONSTER.EXP_MULTIPLIER);
        
        // 몬스터 레벨에 따라 추가 경험치 부여
        let additionalExp = (this.level - 1) * 5;
        
        if (this.type === 'boss') {
            baseExp *= CONFIG.MONSTER.BOSS_EXP_MULTIPLIER;
            return Math.max(baseExp + additionalExp, CONFIG.MONSTER.MIN_BOSS_EXP);
        } else {
            return Math.max(baseExp + additionalExp, CONFIG.MONSTER.MIN_NORMAL_EXP);
        }
    }

    static createBossMonster(data, stageLevel, gameRound) {
        const boss = new Monster(data, stageLevel, gameRound, 'boss');
        boss.maxHp *= CONFIG.BOSS_MULTIPLIER.HP;
        boss.hp = boss.maxHp;
        boss.attack *= CONFIG.BOSS_MULTIPLIER.ATTACK;
        boss.defense *= CONFIG.BOSS_MULTIPLIER.DEFENSE;
        return boss;
    }
}