document.getElementById("start-game").addEventListener("click", () => {
    const playerName = document.getElementById("player-name").value;
    if (playerName) {
        player = new Character(playerName, 100, 20, 5);
        log(`${player.name}님, 환영합니다! 모험을 시작하세요.`);

        document.getElementById("start-screen").style.display = "none";
        document.getElementById("main-game").style.display = "block";

        document.getElementById("controls").style.display = "none";
        document.getElementById("battle-controls").style.display = "none";
        document.getElementById("continue-controls").style.display = "block";
        updateStatus();
        nextTurn();

        // 마우스 오버 상태 제거
        document.getElementById("start-game").classList.remove("hover");
    } else {
        alert("캐릭터 이름을 입력하세요.");
    }
});

document.getElementById("start-game").addEventListener("touchend", () => {
    document.getElementById("start-game").classList.remove("hover");
});