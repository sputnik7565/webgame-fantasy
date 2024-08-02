export const CONFIG = {
    PLAYER: {
        INITIAL_HP: 100,
        INITIAL_ATTACK: 20,
        INITIAL_DEFENSE: 10,
        INITIAL_LEVEL: 1,
        INITIAL_EXP: 0,
        INITIAL_LEVEL_UP_EXP: 100,
        EXP_INCREASE_RATE: 1.01,
        ATTACK_INCREASE_PER_LEVEL: 5,
        DEFENSE_INCREASE_PER_LEVEL: 5,
        HP_INCREASE_PER_LEVEL: 20,
        BOSS_ATTACK_INCREASE_MULTIPLIER: 1.01,
        BOSS_DEFENSE_INCREASE_MULTIPLIER: 1.01,
        BOSS_HP_INCREASE_MULTIPLIER: 1.1,

        BASE_STAT_INCREASE: { attack: 5, defense: 5, hp: 20 },
        MAX_ROUNDS: 10, // 최대 회차 수 설정
        getStatIncreasePerRound() {
            const statIncrease = [];
            for (let i = 0; i < this.MAX_ROUNDS; i++) {
                const multiplier = Math.pow(1.000, i); // 회차마다 1.001배씩 기본 스텟 증가 
                statIncrease.push({
                    attack: this.BASE_STAT_INCREASE.attack * multiplier,
                    defense: this.BASE_STAT_INCREASE.defense * multiplier,
                    hp: this.BASE_STAT_INCREASE.hp * multiplier
                });
            }
            return statIncrease;
        }
    },
    GAME: {
        INITIAL_RUN_TICKETS: 10,
        MONSTER_APPEAR_CHANCE: 0.4,
        ESCAPE_CHANCE: 0.9,
        CRITICAL_HIT_CHANCE: 0.1,
        BOSS_DEFAULT_CRITICAL_HIT_CHANCE: 0.2,
        MISS_CHANCE: 0.05,
        MONSTERS_PER_STAGE: 20,
        TOTAL_STAGES: 10,
    },
    DIFFICULTY: {
        BASE_MULTIPLIER: 1.03,
        ACCELERATION_RATE: 1.01,
        MAX_STAGES: 10
    },
    MONSTER: {
        EXP_MULTIPLIER: 4,
        BOSS_EXP_MULTIPLIER: 2,
        MIN_NORMAL_EXP: 30,
        MIN_BOSS_EXP: 100,


        NORMAL_PLAYER_STAT_MULTIPLIER: {
            hp: 1.5,
            attack: 0.9,
            defense: 0.9
        },
        BOSS_PLAYER_STAT_MULTIPLIER: {
            hp: 2.0,
            attack: 1.5,
            defense: 1.5
        },

        INITIAL: {
            NORMAL: {
                HP: 50,
                ATTACK: 28,
                DEFENSE: 26
            },
            BOSS: {
                HP: 126,
                ATTACK: 32,
                DEFENSE: 30
            }
        },

        GROWTH_RATE: {
            NORMAL: {
                HP: 1.2,
                ATTACK: 1.42,
                DEFENSE: 1.42
            },
            BOSS: {
                HP: 1.2,
                ATTACK: 1.42,
                DEFENSE: 1.42
            }
        },
        BOSS_MULTIPLIER: {
            HP: 1.001,    // 보스 추가 보정 제거
            ATTACK: 1.001,
            DEFENSE: 1.001
        }
    },
    REGEN_RING: {
        INITIAL_HEAL_PERCENTAGE: 0.03,
        ADDITIONAL_HEAL_PERCENTAGE: 0.001
    },
    PATHS: {
        PLAYER_IMAGES: './img/player/',
        MONSTER_IMAGES: './img/monsters/',
        BACKGROUND_IMAGES: './img/backgrounds/',
    },
};

// STAT_INCREASE_PER_ROUND를 동적으로 생성
CONFIG.PLAYER.STAT_INCREASE_PER_ROUND = CONFIG.PLAYER.getStatIncreasePerRound();