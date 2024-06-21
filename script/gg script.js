class Character {
    constructor(name, maxHp, attack, defense, level = 1, img = "/img/player.jpg") {
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

document.getElementById("start-game").addEventListener("click", () => {
    const playerName = document.getElementById("player-name").value;
    if (playerName) {
        player = new Character(playerName, 100, 20, 5);
        log(`${player.name}님, 환영합니다! 모험을 시작하세요.`);

        // 초기 화면을 숨기고 메인 게임 화면을 표시
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("main-game").style.display = "block";

        document.getElementById("controls").style.display = "none";
        document.getElementById("battle-controls").style.display = "none";
        document.getElementById("continue-controls").style.display = "block";
        updateStatus();
        nextTurn();
    } else {
        alert("캐릭터 이름을 입력하세요.");
    }
});

document.getElementById("attack").addEventListener("click", () => {
    if (currentMonster && currentMonster.isAlive() && player.isAlive()) {
        let logMessage = "";

        if (player.hasRegenRing) {
            const healAmount = Math.floor(player.hp * 0.05); // 현재 체력의 5%
            player.hp = Math.min(player.hp + healAmount, player.maxHp);
            logMessage += `재생의 반지 효과로 ${healAmount} 만큼 체력이 회복되었습니다.<br>`;
        }

        const playerAttack = player.dealDamage(currentMonster);
        logMessage += `${playerAttack.logMessage}${player.name}이(가) ${currentMonster.name}에게 ${playerAttack.damage}의 피해를 입혔습니다!`;
        
        if (currentMonster.isAlive()) {
            const monsterAttack = currentMonster.dealDamage(player);
            logMessage += `<br>${monsterAttack.logMessage}${currentMonster.name}이(가) ${player.name}에게 ${monsterAttack.damage}의 피해를 입혔습니다!`;
        } else {
            const expGained = currentMonster.level * 20; // 몬스터 레벨에 따라 경험치 획득량 결정
            player.monsterKills++;
            const leveledUp = player.gainExperience(expGained);
            logMessage += `<br>${currentMonster.name}을(를) 물리쳤습니다! 획득한 경험치: ${expGained}`;
            if (leveledUp) {
                logMessage += `<br>주인공의 레벨이 올랐습니다! 현재 레벨: ${player.level}`;
            }
            currentMonster = null;
            document.getElementById("battle-controls").style.display = "none";
            document.getElementById("continue-controls").style.display = "block";
        }
        
        log(logMessage);
        updateStatus();

        if (!player.isAlive()) {
            log(`${player.name}이(가) 쓰러졌습니다. 게임 오버!`);
            displayFinalResult();
        }
    }
});

document.getElementById("run").addEventListener("click", () => {
    if (player.runTickets > 0) {
        player.runTickets--;
        log(`${player.name}이(가) ${currentMonster.name}으로부터 도망쳤습니다. 남은 도망 티켓: ${player.runTickets}개`);
        currentMonster = null;
        document.getElementById("battle-controls").style.display = "none";
        document.getElementById("continue-controls").style.display = "block";
    } else {
        log("도망 티켓이 모두 소진되었습니다. 더 이상 도망칠 수 없습니다!");
    }
    updateStatus();
});

document.getElementById("continue").addEventListener("click", () => {
    nextTurn();
});

document.getElementById("share").addEventListener("click", () => {
    const playerName = player.name;
    const dateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const gameTitle = "판타지 세계에서 레벨업"; // 게임 타이틀
    const finalLog = `${playerName}님이 ${gameTitle}에서 최종 레벨 ${player.level}, 처치한 몬스터 수 ${player.monsterKills}의 기록을 달성했습니다. - ${dateTime}`;
    navigator.clipboard.writeText(finalLog).then(() => {
        alert(`${playerName}님의 위대한 여정이 클립보드에 복사되었습니다. 지인에게 이 소식을 공유해보세요.`);
    }).catch(err => {
        alert("클립보드에 복사하는 데 실패했습니다. 다시 시도해주세요.");
    });
});

function nextTurn() {
    if (Math.random() < 0.7) {
        const monsters = createMonsters(player.level);
        currentMonster = monsters[Math.floor(Math.random() * monsters.length)];
        log(`${currentMonster.name}이(가) 나타났다!`);
        log(`${currentMonster.name}: "${currentMonster.dialog}"`);
        document.getElementById("game-container").classList.add("shake");
        setTimeout(() => {
            document.getElementById("game-container").classList.remove("shake");
        }, 500);
        document.getElementById("battle-controls").style.display = "block";
        document.getElementById("continue-controls").style.display = "none";
    } else {
        randomEvent(player);
        document.getElementById("battle-controls").style.display = "none";
        document.getElementById("continue-controls").style.display = "block";
    }
    updateStatus();
}

function randomEvent(player) {
    const event = Math.random();
    let logMessage = "";
    const luckyChance = Math.random() < 0.1; // 10% 확률로 운이 좋은 경우

    if (event < 0.3) {
        if (player.hp === player.maxHp) {
            logMessage += "아름다운 풍경을 감상하며 휴식을 취했습니다. 하지만 체력이 이미 가득 찼습니다.";
        } else {
            player.hp = Math.min(player.hp + 10, player.maxHp);
            const actualHeal = Math.min(10, player.maxHp - player.hp);
            logMessage += `아름다운 풍경을 감상하며 휴식을 취했습니다. 체력이 ${actualHeal} 회복됩니다.`;
        }
    } else if (event < 0.6) {
        let healAmount = 20;
        logMessage += `회복 아이템을 발견했습니다!`;
        if (luckyChance) {
            healAmount *= 2;
            logMessage += ` 운이 좋게도 약빨이 잘 들어서`;
        }
        const actualHeal = Math.min(healAmount, player.maxHp - player.hp);
        if (player.hp === player.maxHp) {
            logMessage += ` 체력이 이미 가득 찼습니다.`;
        } else {
            player.hp = Math.min(player.hp + healAmount, player.maxHp);
            logMessage += ` 체력이 ${actualHeal} 회복됩니다.`;
        }
    } else if (event < 0.85) {
        if (player.hp === player.maxHp) {
            logMessage += "신비한 약초를 발견했습니다! 체력이 이미 가득 찼습니다.";
        } else {
            player.hp = player.maxHp;
            logMessage += "신비한 약초를 발견했습니다! 체력이 완전히 회복됩니다.";
        }
    } else {
        const items = ["공격력 강화 약초", "방어력 강화 약초", "재생의 반지", "도망 티켓"];
        const foundItem = items[Math.floor(Math.random() * (items.length - 1))]; // 재생의 반지 확률 감소
        let amount = 1;
        if (foundItem === "도망 티켓") {
            amount = Math.floor(Math.random() * 3) + 1;
            player.addRunTickets(amount);
        } else if (foundItem === "공격력 강화 약초") {
            const attackIncrease = 5;
            player.attack += attackIncrease;
            logMessage += `${foundItem}를(을) 발견했습니다! 허겁지겁 먹고 공격력이 ${attackIncrease} 증가합니다.`;
        } else if (foundItem === "방어력 강화 약초") {
            const defenseIncrease = 3;
            player.defense += defenseIncrease;
            logMessage += `${foundItem}를(을) 발견했습니다! 허겁지겁 먹고 방어력이 ${defenseIncrease} 증가합니다.`;
        } else if (foundItem === "재생의 반지") {
            if (!player.hasRegenRing) { // 재생의 반지 중복 획득 방지
                player.hasRegenRing = true; // 재생의 반지 보유 상태 추가
                logMessage += `${foundItem}를(을) 발견했습니다! 전투 중 턴마다 체력이 현재 체력의 5% 회복됩니다.`;
            } else {
                logMessage += "이미 재생의 반지를 보유하고 있습니다!";
            }
        }
    }
    log(logMessage);
    updateStatus();
}

function displayFinalResult() {
    const dateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const gameTitle = "판타지 전투 게임"; // 게임 타이틀
    const finalLog = `${player.name}님이 ${gameTitle}에서 최종 레벨 ${player.level}, 처치한 몬스터 수 ${player.monsterKills}의 기록을 달성했습니다. - ${dateTime}`;
    log(finalLog);
    setTimeout(() => {
        document.getElementById("game-container").classList.add("shake");
        setTimeout(() => {
            document.getElementById("game-container").classList.remove("shake");
            const retry = confirm("다시 진행하시겠습니까?");
            if (retry) {
                player = new Character(player.name, 100, 20, 5);
                document.getElementById("game-log").innerHTML = "";
                log(`${player.name}님, 다시 모험을 시작하세요.`);
                updateStatus();
                document.getElementById("battle-controls").style.display = "none";
                document.getElementById("continue-controls").style.display = "block";
                document.getElementById("share-controls").style.display = "none";
                nextTurn();
            } else {
                document.getElementById("battle-controls").style.display = "none";
                document.getElementById("continue-controls").style.display = "none";
                document.getElementById("share-controls").style.display = "block";
            }
        }, 500);
    }, 100); // 약간의 지연을 추가하여 로그가 먼저 출력되도록 함
}

function log(message) {
    const gameLog = document.getElementById("game-log");
    gameLog.innerHTML = `<p>${message}</p>`;
    gameLog.style.display = 'flex';
    gameLog.style.alignItems = 'center';
    gameLog.style.justifyContent = 'center';
}

function updateStatus() {
    const playerStatus = document.getElementById("player-status");
    const monsterStatus = document.getElementById("monster-status");
    playerStatus.innerHTML = `
        <img src="${player.img}" alt="주인공 이미지" class="status-img">
        <div class="status-text">
            ${player.name}<br>
            레벨: ${player.level}, 체력: ${player.hp}/${player.maxHp}, 공격력: ${player.attack}, 방어력: ${player.defense}, 도망 티켓: ${player.runTickets}
            <div class="health-bar-container">
                <div class="health-bar" style="width: ${player.hp / player.maxHp * 100}%;"></div>
            </div>
        </div>`;
    if (currentMonster) {
        monsterStatus.innerHTML = `
            <img src="${currentMonster.img}" alt="몬스터 이미지" class="status-img">
            <div class="status-text">
                ${currentMonster.name}<br>
                레벨: ${currentMonster.level}, 체력: ${currentMonster.hp}/${currentMonster.maxHp}, 공격력: ${currentMonster.attack}, 방어력: ${currentMonster.defense}
                <div class="health-bar-container">
                    <div class="health-bar" style="width: ${currentMonster.hp / currentMonster.maxHp * 100}%;"></div>
                </div>
            </div>`;
    } else {
        monsterStatus.innerHTML = '';
    }
}

function createMonsters(playerLevel) {
    return [
        new Monster("고블린", 30 + 5 * playerLevel, 10 + 2 * playerLevel, 1, 1, "고블린이 으르렁거린다!", "/img/goblin.jpg"),
        new Monster("오크", 50 + 10 * playerLevel, 15 + 3 * playerLevel, 3, 2, "오크가 분노한다!", "/img/orc.jpg"),
        new Monster("트롤", 80 + 15 * playerLevel, 20 + 4 * playerLevel, 5, 3, "트롤이 거대하게 다가온다!", "/img/troll.jpg"),
        new Monster("드래곤", 150 + 20 * playerLevel, 25 + 5 * playerLevel, 10, 4, "드래곤이 불을 뿜는다!", "/img/dragon.jpg"),
        new Monster("뱀파이어", 60 + 12 * playerLevel, 18 + 4 * playerLevel, 4, 2, "뱀파이어가 웃으며 다가온다!", "/img/vampire.jpg"),
        new Monster("웨어울프", 70 + 14 * playerLevel, 20 + 5 * playerLevel, 6, 3, "웨어울프가 포효한다!", "/img/werewolf.jpg"),
        new Monster("해골", 20 + 4 * playerLevel, 8 + 2 * playerLevel, 1, 1, "해골이 덜그럭거린다!", "/img/skeleton.jpg"),
        new Monster("좀비", 40 + 8 * playerLevel, 12 + 3 * playerLevel, 2, 2, "좀비가 비틀거리며 다가온다!", "/img/zombie.jpg"),
        new Monster("악마", 100 + 20 * playerLevel, 22 + 6 * playerLevel, 8, 4, "악마가 불길하게 웃는다!", "/img/demon.jpg"),
        new Monster("유령", 50 + 10 * playerLevel, 16 + 3 * playerLevel, 3, 2, "유령이 어두운 속삭임을 한다!", "/img/ghost.jpg")
    ];
}

class Monster extends Character {
    constructor(name, maxHp, attack, defense, level, dialog, img) {
        super(name, maxHp, attack, defense, level, img);
        this.dialog = dialog;
    }
}