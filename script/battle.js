document.getElementById("attack").addEventListener("click", () => {
    if (currentMonster && currentMonster.isAlive() && player.isAlive()) {
        let logMessage = "";

        if (player.hasRegenRing) {
            const healAmount = Math.floor(player.hp * 0.05);
            player.hp = Math.min(player.hp + healAmount, player.maxHp);
            logMessage += `재생의 반지 효과로 ${healAmount} 만큼 체력이 회복되었습니다.<br>`;
        }

        const playerAttack = player.dealDamage(currentMonster);
        logMessage += `${playerAttack.logMessage}${player.name}이(가) ${currentMonster.name}에게 ${playerAttack.damage}의 피해를 입혔습니다!`;
        
        if (currentMonster.isAlive()) {
            const monsterAttack = currentMonster.dealDamage(player);
            logMessage += `<br>${monsterAttack.logMessage}${currentMonster.name}이(가) ${player.name}에게 ${monsterAttack.damage}의 피해를 입혔습니다!`;
        } else {
            const expGained = currentMonster.level * 20;
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

        // 마우스 오버 상태 제거
        document.getElementById("attack").classList.remove("hover");
    }
});

document.getElementById("attack").addEventListener("touchend", () => {
    document.getElementById("attack").classList.remove("hover");
});

document.getElementById("run").addEventListener("click", () => {
    if (Math.random() < 0.1) {
        const monsterAttack = currentMonster.dealDamage(player);
        const logMessage = `${player.name}이(가) 재수없게 발이 미끄러져 도망치다 넘어졌습니다.<br>${currentMonster.name}이(가) ${player.name}에게 ${monsterAttack.damage}의 피해를 입혔습니다!`;
        log(logMessage);
        updateStatus();
        if (!player.isAlive()) {
            log(`${player.name}이(가) 쓰러졌습니다. 게임 오버!`);
            displayFinalResult();
        }
    } else if (player.runTickets > 0) {
        player.runTickets--;
        log(`${player.name}이(가) ${currentMonster.name}으로부터 도망쳤습니다. 남은 도망 티켓: ${player.runTickets}개`);
        currentMonster = null;
        document.getElementById("battle-controls").style.display = "none";
        document.getElementById("continue-controls").style.display = "block";
        updateStatus();
    } else {
        log("도망 티켓이 모두 소진되었습니다. 더 이상 도망칠 수 없습니다!");
        updateStatus();
    }

    // 마우스 오버 상태 제거
    document.getElementById("run").classList.remove("hover");
});

document.getElementById("run").addEventListener("touchend", () => {
    document.getElementById("run").classList.remove("hover");
});

document.getElementById("continue").addEventListener("click", () => {
    nextTurn();
    // 마우스 오버 상태 제거
    document.getElementById("continue").classList.remove("hover");
});

document.getElementById("continue").addEventListener("touchend", () => {
    document.getElementById("continue").classList.remove("hover");
});