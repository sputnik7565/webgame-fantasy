class Monster {
    constructor(name, maxHp, attack, defense, level, dialog, img, abilities) {
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.attack = attack;
        this.defense = defense;
        this.level = level;
        this.dialog = dialog;
        this.img = img;
        this.abilities = abilities;
    }

    isAlive() {
        return this.hp > 0;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(damage - this.defense, 1);
        this.hp = Math.max(this.hp - actualDamage, 0);
        return actualDamage;
    }

    dealDamage(target) {
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
        const actualDamage = target.takeDamage(damage);
        return { damage: actualDamage, logMessage };
    }

    useAbility() {
        if (this.abilities.length > 0) {
            const ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];
            log(`${this.name}이(가) ${ability} 능력을 사용했습니다!`);
        }
    }
}