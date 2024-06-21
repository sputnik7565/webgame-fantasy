// character.js
class Character {
    constructor(name, maxHp, attack, defense, level = 1, img = paths.playerImage) {
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.attack = attack;
        this.defense = defense;
        this.level = level;
        this.experience = 0;
        this.nextLevelExp = 100; // 초기 레벨업에 필요한 경험치
        this.runTickets = 10; // 도망 티켓 초기값
        this.monsterKills = 0; // 처치한 몬스터 수
        this.img = img; // 이미지 파일 이름
        this.hasRegenRing = false; // 재생의 반지 보유 상태
    }

    isAlive() {
        return this.hp > 0;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(damage - this.defense, 1); // 최소 피해 1
        this.hp = Math.max(this.hp - actualDamage, 0);
        return actualDamage;
    }

    dealDamage(enemy) {
        const critChance = Math.random() < 0.1; // 10% 확률로 크리티컬 히트
        let damage = Math.floor(Math.random() * this.attack);
        damage = Math.max(damage, 1); // 최소 피해 1
        let logMessage = "";
        if (critChance) {
            damage = Math.floor(damage * 1.5); // 크리티컬 히트 시 1.5배 데미지
            logMessage = "회심의 일격! ";
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

        // 레벨이 5의 배수일 때 레벨업에 필요한 총 경험치 10% 증가
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
}

class Monster extends Character {
    constructor(name, maxHp, attack, defense, level, dialog, img) {
        super(name, maxHp, attack, defense, level, img);
        this.dialog = dialog;
        this.borderColor = this.calculateBorderColor();
    }

    calculateBorderColor() {
        const playerStats = calculateStats(player);
        const monsterStats = calculateStats(this);
        let borderColor = 'yellow'; // 기본값: 비슷한 전투력
        if (playerStats > monsterStats * 1.5) {
            borderColor = 'green'; // 주인공이 매우 유리한 경우
        } else if (playerStats < monsterStats * 0.5) {
            borderColor = 'orange'; // 몬스터가 매우 유리한 경우
        }
        return borderColor;
    }
}