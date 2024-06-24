class Character {
    constructor(name, maxHp, attack, defense, level = 1, img = paths.playerImage) {
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.attack = attack;
        this.defense = defense;
        this.level = level;
        this.experience = 0;
        this.nextLevelExp = 100;
        this.runTickets = 10;
        this.monsterKills = 0;
        this.img = img;
        this.hasRegenRing = false;
        this.skills = [];
        this.statusEffects = [];
    }

    isAlive() {
        return this.hp > 0;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(damage - this.defense, 1);
        this.hp = Math.max(this.hp - actualDamage, 0);
        return actualDamage;
    }

    dealDamage(enemy) {
        const hitChance = Math.random();
        if (hitChance < 0.1) {
            log(`${this.name}의 공격이 빗나갔습니다!`);
            return { damage: 0, logMessage: "빗나감!" };
        }
        const critChance = Math.random() < 0.1;
        let damage = Math.floor(Math.random() * this.attack);
        damage = Math.max(damage, 1);
        let logMessage = "";
        if (critChance) {
            damage = Math.floor(damage * 1.5);
            logMessage = "치명타! ";
        }
        const actualDamage = enemy.takeDamage(damage);
        return { damage: actualDamage, logMessage };
    }

    gainExperience(amount) {
        this.experience += amount;
        let leveledUp = false;
        while (this.experience >= this.nextLevelExp) {
            this.experience -= this.nextLevelExp;
            this.levelUp();
            leveledUp = true;
        }
        return leveledUp;
    }

    levelUp() {
        this.level += 1;
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.attack += 5;
        this.defense += 2;

        if (this.level % 5 === 0) {
            this.nextLevelExp = Math.floor(this.nextLevelExp * 1.1);
        }

        this.experience = 0;
    }

    addRunTickets(amount) {
        this.runTickets += amount;
        log(`도망 티켓을 ${amount}개 얻었습니다! 현재 도망 티켓: ${this.runTickets}개`);
        updateStatus();
    }

    applyStatusEffects() {
        this.statusEffects.forEach(effect => effect.apply(this));
        this.statusEffects = this.statusEffects.filter(effect => !effect.isExpired());
    }

    addSkill(newSkill) {
        const existingSkill = this.skills.find(skill => skill.name === newSkill.name);
        if (existingSkill) {
            existingSkill.count += newSkill.count;
        } else {
            this.skills.push(newSkill);
        }
        updateStatus(); // 스킬 목록이 변경되면 상태 업데이트
    }
}

class StatusEffect {
    constructor(name, duration, applyEffect) {
        this.name = name;
        this.duration = duration;
        this.applyEffect = applyEffect;
    }

    apply(target) {
        this.applyEffect(target);
        this.duration--;
    }

    isExpired() {
        return this.duration <= 0;
    }
}

// class Monster extends Character {
//     constructor(name, maxHp, attack, defense, level, dialog, img, abilities = []) {
//         super(name, maxHp, attack, defense, level, img);
//         this.dialog = dialog;
//         this.borderColor = this.calculateBorderColor();
//         this.abilities = abilities;
//     }

//     useAbility() {
//         if (this.abilities.length > 0) {
//             const ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];
//             log(`${this.name}이(가) ${ability}을(를) 사용했습니다!`);
//         }
//     }

//     calculateBorderColor() {
//         const playerStats = calculateStats(player);
//         const monsterStats = calculateStats(this);
//         let borderColor = 'yellow';
//         if (playerStats > monsterStats * 1.5) {
//             borderColor = 'green';
//         } else if (playerStats < monsterStats * 0.5) {
//             borderColor = 'orange';
//         }
//         return borderColor;
//     }
// }

