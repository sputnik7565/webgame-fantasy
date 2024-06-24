function log(message) {
    const gameLog = document.getElementById("game-log");
    gameLog.innerHTML = `<p>${message}</p>`; // 기존 내용을 지우고 새로운 로그만 추가
}

function updateStatus() {
    const playerStatus = document.getElementById("player-status");
    const monsterStatus = document.getElementById("monster-status");
    let skillsText = player.skills.map(skill => `${skill.name}: ${skill.count}`).join(', ');

    playerStatus.innerHTML = `
        <img src="${paths.playerImage}" alt="주인공 이미지" class="status-img">
        <div class="status-text">
            ${player.name}<br>
            레벨: ${player.level}, 체력: ${player.hp}/${player.maxHp}, 공격력: ${player.attack}, 방어력: ${player.defense}, 도망 티켓: ${player.runTickets}<br>
            스킬: ${skillsText}
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