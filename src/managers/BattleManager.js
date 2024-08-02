import { CONFIG } from '../config.js';

export class BattleManager {
    constructor(logManager, skillManager, uiManager) {
        this.logManager = logManager;
        this.skillManager = skillManager;
        this.uiManager = uiManager;
    }

    performBattle(player, monster) {
        const healAmount = player.applyRegenRingEffect();
        if (healAmount > 0) {
            this.logManager.log(`재생의 반지 효과로 ${healAmount} 만큼 체력이 회복되었습니다.`);
        }

        if (player.skills.length > 0) {
            const randomSkill = player.skills[Math.floor(Math.random() * player.skills.length)];
            const skillEffect = player.useSkill(randomSkill.name, monster);
            if (skillEffect) {
                this.logManager.log(skillEffect);
                if (randomSkill.type === 'damage') {
                    this.uiManager.shakeScreen();
                }
            }
        }

        const playerAttack = this.performAttack(player, monster);
        this.logManager.log(playerAttack.message);
        if (playerAttack.isCritical) {
            this.uiManager.shakeScreen();
        }

        if (monster.isAlive()) {
            const monsterAbility = monster.useAbility();
            if (monsterAbility) {
                this.logManager.log(`${monster.name}이(가) ${monsterAbility} 능력을 사용했습니다!`);
            }

            const monsterAttack = this.performAttack(monster, player, monster.criticalChance);
            this.logManager.log(monsterAttack.message);
            if (monsterAttack.isCritical) {
                this.uiManager.shakeScreen();
            }
        }

        return {
            monsterDefeated: !monster.isAlive(),
            playerDefeated: !player.isAlive()
        };
    }

    performDragonRageAttack(player, monster, damage) {
        const actualDamage = monster.takeDamage(damage);
        this.logManager.log(`${player.name}이(가) 드래곤의 분노를 사용하여 ${monster.name}에게 ${actualDamage}의 피해를 입혔습니다!`);
        this.uiManager.shakeScreen('strong');

        return {
            monsterDefeated: !monster.isAlive()
        };
    }
    
    performAttack(attacker, defender, criticalChance = CONFIG.GAME.CRITICAL_HIT_CHANCE) {
        console.log(`--- 공격 상세 정보 ---`);
        console.log(`공격자: ${attacker.name}, 공격력: ${attacker.attack}`);
        console.log(`방어자: ${defender.name}, 방어력: ${defender.defense}`);

        if (Math.random() < CONFIG.GAME.MISS_CHANCE) {
            console.log("공격 빗나감!");
            return { 
                damage: 0, 
                message: `${attacker.name}의 공격이 빗나갔습니다!`,
                isCritical: false
            };
        }

        let damage = Math.max(attacker.attack - defender.defense, 1);
        console.log(`기본 데미지 계산: ${attacker.attack} - ${defender.defense} = ${damage}`);

        let message = '';
        let isCritical = false;

        if (Math.random() < criticalChance) {
            damage = Math.floor(damage * 1.8);
            message = '치명타! ';
            isCritical = true;
            console.log(`치명타 발생! 데미지 1.8배 증가: ${damage}`);
        }

        const actualDamage = Math.min(defender.hp, damage);
        console.log(`최종 데미지: ${actualDamage}`);

        message += `${attacker.name}이(가) ${defender.name}에게 ${actualDamage}의 피해를 입혔습니다!`;

        // 방어자의 HP 감소
        defender.hp -= actualDamage;
        console.log(`${defender.name}의 남은 HP: ${defender.hp}`);

        console.log(`--- 공격 종료 ---`);

        return { damage: actualDamage, message, isCritical };
    }
}