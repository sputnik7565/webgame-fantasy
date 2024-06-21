// game-init.js
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