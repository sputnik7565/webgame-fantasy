function nextTurn() {
    if (Math.random() < 0.2) {
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

function createMonsters(playerLevel) {
    function getRandomLevel(baseLevel) {
        return Math.max(baseLevel + Math.floor(Math.random() * 3) - 1, 1);
    }

    function getRandomStat(baseStat, variability) {
        return baseStat + Math.floor(Math.random() * variability) - Math.floor(variability / 2);
    }

    return [
        new Monster("고블린", getRandomStat(30 + 5 * playerLevel, 10), getRandomStat(10 + 2 * playerLevel, 4), getRandomStat(1 + Math.floor(playerLevel / 2), 1), getRandomLevel(playerLevel), "고블린이 으르렁거린다!", paths.goblinImage, ["빠른 공격"]),
        new Monster("오크", getRandomStat(50 + 10 * playerLevel, 20), getRandomStat(15 + 3 * playerLevel, 6), getRandomStat(3 + Math.floor(playerLevel / 2), 2), getRandomLevel(playerLevel), "오크가 분노한다!", paths.orcImage, ["강력한 방어"]),
        new Monster("트롤", getRandomStat(80 + 15 * playerLevel, 30), getRandomStat(20 + 4 * playerLevel, 8), getRandomStat(5 + Math.floor(playerLevel / 2), 3), getRandomLevel(playerLevel), "트롤이 거대하게 다가온다!", paths.trollImage, ["회복"]),
        new Monster("드래곤", getRandomStat(150 + 20 * playerLevel, 40), getRandomStat(25 + 5 * playerLevel, 10), getRandomStat(10 + Math.floor(playerLevel / 2), 5), getRandomLevel(playerLevel), "드래곤이 불을 뿜는다!", paths.dragonImage, ["불길"]),
        new Monster("뱀파이어", getRandomStat(60 + 12 * playerLevel, 24), getRandomStat(18 + 4 * playerLevel, 7), getRandomStat(4 + Math.floor(playerLevel / 2), 2), getRandomLevel(playerLevel), "뱀파이어가 웃으며 다가온다!", paths.vampireImage, ["흡혈"]),
        new Monster("웨어울프", getRandomStat(70 + 14 * playerLevel, 28), getRandomStat(20 + 5 * playerLevel, 8), getRandomStat(6 + Math.floor(playerLevel / 2), 3), getRandomLevel(playerLevel), "웨어울프가 포효한다!", paths.werewolfImage, ["치명타"]),
        new Monster("해골", getRandomStat(20 + 4 * playerLevel, 8), getRandomStat(8 + 2 * playerLevel, 3), getRandomStat(1 + Math.floor(playerLevel / 2), 1), getRandomLevel(playerLevel), "해골이 덜그럭거린다!", paths.skeletonImage, ["다중 공격"]),
        new Monster("좀비", getRandomStat(40 + 8 * playerLevel, 16), getRandomStat(12 + 3 * playerLevel, 5), getRandomStat(2 + Math.floor(playerLevel / 2), 1), getRandomLevel(playerLevel), "좀비가 비틀거리며 다가온다!", paths.zombieImage, ["독"]),
        new Monster("악마", getRandomStat(100 + 20 * playerLevel, 40), getRandomStat(22 + 6 * playerLevel, 9), getRandomStat(8 + Math.floor(playerLevel / 2), 4), getRandomLevel(playerLevel), "악마가 불길하게 웃는다!", paths.demonImage, ["불타는 주먹"]),
        new Monster("유령", getRandomStat(50 + 10 * playerLevel, 20), getRandomStat(16 + 3 * playerLevel, 6), getRandomStat(3 + Math.floor(playerLevel / 2), 2), getRandomLevel(playerLevel), "유령이 어두운 속삭임을 한다!", paths.ghostImage, ["혼란"])
    ];
}

function randomEvent(player) {
    const event = Math.random();
    let logMessage = "";
    const luckyChance = Math.random() < 0.1;

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
        const items = ["스킬"];
        const foundItem = items[Math.floor(Math.random() * items.length)];
        let amount = 1;
        if (foundItem === "도망 티켓") {
            amount = Math.floor(Math.random() * 3) + 1;
            player.addRunTickets(amount);
            logMessage += `도망 티켓을 ${amount}개 발견했습니다! 현재 도망 티켓: ${player.runTickets}개`;
        } else if (foundItem === "공격력 강화 약초") {
            const attackIncrease = 5;
            player.attack += attackIncrease;
            logMessage += `${foundItem}를(을) 발견했습니다! 허겁지겁 먹고 공격력이 ${attackIncrease} 증가합니다.`;
            player.statusEffects.push(new StatusEffect("공격력 증가", 1, (target) => target.attack -= attackIncrease));
        } else if (foundItem === "방어력 강화 약초") {
            const defenseIncrease = 3;
            player.defense += defenseIncrease;
            logMessage += `${foundItem}를(을) 발견했습니다! 허겁지겁 먹고 방어력이 ${defenseIncrease} 증가합니다.`;
            player.statusEffects.push(new StatusEffect("방어력 증가", 1, (target) => target.defense -= defenseIncrease));
        } else if (foundItem === "재생의 반지") {
            if (!player.hasRegenRing) {
                player.hasRegenRing = true;
                logMessage += `${foundItem}를(을) 발견했습니다! 전투 중 턴마다 체력이 현재 체력의 5% 회복됩니다.`;
            } else {
                logMessage += "이미 재생의 반지를 보유하고 있습니다!";
            }
        } else if (foundItem === "스킬") {
            const skillOptions = [
                new Skill("치유", (target) => {
                    const healAmount = 30;
                    player.hp = Math.min(player.hp + healAmount, player.maxHp);
                    return `${player.name}의 체력이 ${healAmount} 회복되었습니다.`;
                }),
                new Skill("방어 강화", (target) => {
                    const defenseIncrease = 10;
                    player.defense += defenseIncrease;
                    player.statusEffects.push(new StatusEffect("방어력 증가", 1, (target) => target.defense -= defenseIncrease));
                    return `${player.name}의 방어력이 ${defenseIncrease} 증가했습니다.`;
                }),
                new Skill("화염구", (target) => {
                    const damage = 50;
                    target.hp = Math.max(target.hp - damage, 0);
                    return `${target.name}이(가) 화염구 공격을 받아 ${damage}의 피해를 입었습니다.`;
                })
            ];
            const newSkill = skillOptions[Math.floor(Math.random() * skillOptions.length)];
            newSkill.count = Math.floor(Math.random() * 3) + 1;
            player.addSkill(newSkill);  // 수정된 부분
            logMessage += `${newSkill.name} 스킬을 ${newSkill.count}개 발견했습니다!`;
        }
    }
    log(logMessage);
    updateStatus();
}

function displayFinalResult() {
    const dateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const gameTitle = "판타지 전투 게임";
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
    }, 100);
}