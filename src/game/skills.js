export class Skill {
    constructor(name, effect, count) {
        this.name = name;
        this.effect = effect;
        this.count = count;
    }

    use(target) {
        if (this.count > 0) {
            this.count--;
            return this.effect(target);
        }
        return null;
    }
}

export const skillList = [
    {
        name: "치유",
        effect: (player) => {
            const healAmount = 30;
            player.heal(healAmount);
            return `${player.name}의 체력이 ${healAmount} 회복되었습니다.`;
        }
    },
    {
        name: "방어 강화",
        effect: (player) => {
            const defenseIncrease = 10;
            player.temporaryDefenseBoost = defenseIncrease;
            return `${player.name}의 방어력이 ${defenseIncrease} 증가했습니다.`;
        }
    },
    {
        name: "화염구",
        effect: (monster) => {
            const damage = 50;
            monster.takeDamage(damage);
            return `화염구가 ${monster.name}에게 ${damage}의 피해를 입혔습니다.`;
        }
    }
];