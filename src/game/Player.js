import { CONFIG } from '../config.js';

export class Player {
    constructor(name, textData, stats, image) {
        this.name = name;
        this.textData = textData;
        this.maxHp = stats.hp;
        this.hp = this.maxHp;
        this.attack = stats.attack;
        this.defense = stats.defense;
        this.level = 1;
        this.experience = 0;
        this.nextLevelExp = CONFIG.PLAYER.INITIAL_LEVEL_UP_EXP;
        this.runTickets = CONFIG.GAME.INITIAL_RUN_TICKETS;
        this.monsterKills = 0;
        this.hasRegenRing = false;
        this.skills = [];
        this.statusEffects = [];
        this.leveledUp = false;
        this.image = `${CONFIG.PATHS.PLAYER_IMAGES}${image}`;

        this.pendingLevelUps = 0;
        this.isBossDefeated = false;

        this.regenRingEffect = 0;
        this.dragonRage = 0; // 드래곤의 분노 수치 추가
    }

    takeDamage(damage) {
        const actualDamage = Math.max(damage - this.defense, 1);
        this.hp = Math.max(this.hp - actualDamage, 0);
        return actualDamage;
    }

    heal(amount) {
        const actualHeal = Math.min(amount, this.maxHp - this.hp);
        this.hp = Math.min(this.hp + amount, this.maxHp);
        return actualHeal;
    }

    useDragonRage() {
        let damageMultiplier;
        switch(this.dragonRage) {
            case 1:
                damageMultiplier = 2;
                break;
            case 2:
                damageMultiplier = 3;
                break;
            case 3:
                damageMultiplier = 3.5;
                break;
            case 4:
                damageMultiplier = 3.8;
                break;
            case 5:
                damageMultiplier = 4;
                break;
            default:
                // 5를 초과하는 경우, 추가 증가량을 더 작게 설정
                damageMultiplier = 4 + (this.dragonRage - 5) * 0.1;
        }

        const damage = Math.floor(this.attack * damageMultiplier);
        this.dragonRage = 0; // 사용 후 초기화
        return damage;
    }

    gainExperienceFromAttack() {
        const maxGainableExp = this.nextLevelExp - this.experience - 1;
        if (maxGainableExp > 0) {
            this.experience += 1;
            return true;
        }
        return false;
    }

    // 기존 메서드 수정
    gainExperience(amount, isBossDefeated = false) {
        if (isBossDefeated) {
            this.isBossDefeated = true;
            this.levelUp(true);
        } else {
            this.experience += amount;
            while (this.experience >= this.nextLevelExp) {
                this.levelUp(false);
            }
        }
    }



    levelUp(isBossDefeated) {
        this.level += 1;
        if (isBossDefeated) {
            // 보스 클리어 시 현재 경험치 유지, 다음 레벨 경험치 계산
            this.nextLevelExp = Math.floor(this.nextLevelExp * CONFIG.PLAYER.EXP_INCREASE_RATE);
        } else {
            // 일반 레벨업 시 초과 경험치 이월
            this.experience -= this.nextLevelExp;
            this.nextLevelExp = Math.floor(this.nextLevelExp * CONFIG.PLAYER.EXP_INCREASE_RATE);
        }
        this.pendingLevelUps++;
    }

    applyLevelUp(statChoice) {
        if (this.pendingLevelUps > 0) {
            const increaseAmount = this.getStatIncreaseAmount(statChoice);
    
            switch (statChoice) {
                case 'attack':
                    this.attack += increaseAmount;
                    break;
                case 'defense':
                    this.defense += increaseAmount;
                    break;
                case 'hp':
                    this.maxHp += increaseAmount;
                    this.hp += increaseAmount;
                    break;
            }
            this.pendingLevelUps--;
            return true;
        }
        return false;
    }

    // getStatIncreaseAmount(stat) {
    //     const baseIncrease = CONFIG.PLAYER[`${stat.toUpperCase()}_INCREASE_PER_LEVEL`];
    //     return this.isBossDefeated ? baseIncrease * 2 : baseIncrease;
    // }

    getStatIncreaseAmount(stat) {
        const roundIndex = Math.min(this.game.gameRound - 1, CONFIG.PLAYER.STAT_INCREASE_PER_ROUND.length - 1);
        let baseIncrease = CONFIG.PLAYER.STAT_INCREASE_PER_ROUND[roundIndex][stat];
        
        // 현재 스탯의 3% 추가
        let percentIncrease = 0;
        switch(stat) {
            case 'attack':
                percentIncrease = Math.floor(this.attack * 0.03);
                break;
            case 'defense':
                percentIncrease = Math.floor(this.defense * 0.03);
                break;
            case 'hp':
                percentIncrease = Math.floor(this.maxHp * 0.03);
                break;
        }

        baseIncrease += percentIncrease;
        return this.isBossDefeated ? baseIncrease * 2 : baseIncrease;
    }

    hasPendingLevelUps() {
        return this.pendingLevelUps > 0;
    }

    // levelUp() {
    //     this.level += 1;
    //     this.maxHp += CONFIG.PLAYER.HP_INCREASE_PER_LEVEL;
    //     this.hp = this.maxHp;
    //     this.attack += CONFIG.PLAYER.ATTACK_INCREASE_PER_LEVEL;
    //     this.defense += CONFIG.PLAYER.DEFENSE_INCREASE_PER_LEVEL;
    //     this.experience -= this.nextLevelExp;
    //     this.nextLevelExp = Math.floor(this.nextLevelExp * 1.1);
    // }

    addSkill(skill) {
        const existingSkill = this.skills.find(s => s.name === skill.name);
        if (existingSkill) {
            existingSkill.count += skill.count;
        } else {
            this.skills.push(skill);
        }
    }

    useSkill(skillName, target) {
        const skill = this.skills.find(s => s.name === skillName);
        if (skill && skill.count > 0) {
            const effect = skill.use(target);
            skill.count--;
            if (skill.count === 0) {
                this.skills = this.skills.filter(s => s.name !== skillName);
            }
            return effect;
        }
        return null;
    }

    applyStatusEffects() {
        this.statusEffects.forEach(effect => effect.apply(this));
        this.statusEffects = this.statusEffects.filter(effect => !effect.isExpired());
    }

    isAlive() {
        return this.hp > 0;
    }

    addRegenRing() {
        if (this.regenRingEffect === 0) {
            this.regenRingEffect = CONFIG.REGEN_RING.INITIAL_HEAL_PERCENTAGE;
            return `재생의 반지를 획득했습니다! 전투 중 턴마다 체력의 ${(this.regenRingEffect * 100).toFixed(2)}%가 회복됩니다.`;
        } else {
            this.regenRingEffect += CONFIG.REGEN_RING.ADDITIONAL_HEAL_PERCENTAGE;
            return `재생의 반지 효과가 강화되었습니다! 현재 턴마다 체력의 ${(this.regenRingEffect * 100).toFixed(2)}%가 회복됩니다.`;
        }
    }

    applyRegenRingEffect() {
        if (this.regenRingEffect > 0) {
            const healAmount = Math.floor(this.maxHp * this.regenRingEffect);
            return this.heal(healAmount);
        }
        return 0;
    }

    // updateAllStatsPercent(percent) {
    //     const multiplier = 1 + (percent / 100);
    //     this.attack = Math.floor(this.attack * multiplier);
    //     this.defense = Math.floor(this.defense * multiplier);
    //     const oldMaxHp = this.maxHp;
    //     this.maxHp = Math.floor(this.maxHp * multiplier);
    //     const hpIncrease = this.maxHp - oldMaxHp;
    //     this.hp = Math.min(this.hp + hpIncrease, this.maxHp);
        
    //     return {
    //         attackIncrease: this.attack - Math.floor(this.attack / multiplier),
    //         defenseIncrease: this.defense - Math.floor(this.defense / multiplier),
    //         hpIncrease: hpIncrease
    //     };
    // }
    updateAllStatsPercent(percent) {
        const multiplier = 1 + (percent / 100);
        const oldAttack = this.attack;
        const oldDefense = this.defense;
        const oldMaxHp = this.maxHp;
    
        // 최소 1 증가를 보장하면서 퍼센트 증가 적용
        this.attack = Math.max(this.attack + 1, Math.floor(this.attack * multiplier));
        this.defense = Math.max(this.defense + 1, Math.floor(this.defense * multiplier));
        this.maxHp = Math.max(this.maxHp + 1, Math.floor(this.maxHp * multiplier));
    
        const hpIncrease = this.maxHp - oldMaxHp;
        this.hp = Math.min(this.hp + hpIncrease, this.maxHp);
    
        return {
            attackIncrease: this.attack - oldAttack,
            defenseIncrease: this.defense - oldDefense,
            hpIncrease: hpIncrease
        };
    }

    buffAttack(percentage) {
        const increaseAmount = Math.floor(this.attack * percentage);
        this.attack += increaseAmount;
        return increaseAmount;
    }

    buffDefense(percentage) {
        const increaseAmount = Math.floor(this.defense * percentage);
        this.defense += increaseAmount;
        return increaseAmount;
    }

    buffHp(percentage) {
        const increaseAmount = Math.floor(this.maxHp * percentage);
        this.maxHp += increaseAmount;
        this.hp += increaseAmount;
        return increaseAmount;
    }
}