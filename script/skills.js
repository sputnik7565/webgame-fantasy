class Skill {
    constructor(name, effect, count = 1) {
        this.name = name;
        this.effect = effect;
        this.count = count;
    }

    use(target) {
        if (this.count > 0) {
            const result = this.effect(target);
            this.count--;
            return `${this.name} 스킬을 사용했습니다. ${result}`;
        } else {
            return `${this.name} 스킬이 없습니다.`;
        }
    }
}

const healingSkill = new Skill("치유", (target) => {
    const healAmount = 30;
    target.hp = Math.min(target.hp + healAmount, target.maxHp);
    return `${target.name}의 체력이 ${healAmount} 회복되었습니다.`;
});

const shieldSkill = new Skill("방어 강화", (target) => {
    const defenseIncrease = 10;
    target.defense += defenseIncrease;
    target.statusEffects.push(new StatusEffect("방어력 증가", 1, (target) => target.defense -= defenseIncrease));
    return `${target.name}의 방어력이 임시로 ${defenseIncrease} 증가했습니다.`;
});

const fireballSkill = new Skill("화염구", (target) => {
    const damage = 50;
    target.hp = Math.max(target.hp - damage, 0);
    return `${target.name}이(가) 화염구 공격을 받아 ${damage}의 피해를 입었습니다.`;
});