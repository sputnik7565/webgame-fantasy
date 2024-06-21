// status-log.js
function log(message) {
    const gameLog = document.getElementById("game-log");
    gameLog.innerHTML = `<p>${message}</p>`;
    gameLog.style.display = 'flex';
    gameLog.style.alignItems = 'center';
    gameLog.style.justifyContent = 'center';
}

// 주인공과 몬스터의 종합적인 스텟을 계산하는 함수 추가
function calculateStats(character) {
    return character.level * 10 + character.hp + character.attack * 2 + character.defense * 2;
}

// 기존 updateStatus 함수 업데이트
function updateStatus() {
    const playerStatus = document.getElementById("player-status");
    const monsterStatus = document.getElementById("monster-status");
    playerStatus.innerHTML = `
        <img src="${paths.playerImage}" alt="주인공 이미지" class="status-img">
        <div class="status-text">
            ${player.name}<br>
            레벨: ${player.level}, 체력: ${player.hp}/${player.maxHp}, 공격력: ${player.attack}, 방어력: ${player.defense}, 도망 티켓: ${player.runTickets}
            <div class="health-bar-container">
                <div class="health-bar" style="width: ${player.hp / player.maxHp * 100}%;"></div>
            </div>
        </div>`;
    if (currentMonster) {
        monsterStatus.innerHTML = `
            <img src="${currentMonster.img}" alt="몬스터 이미지" class="status-img" style="border-color: ${currentMonster.borderColor};">
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