// share.js
document.getElementById("share").addEventListener("click", () => {
    const playerName = player.name;
    const dateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const gameTitle = "판타지 세계에서 레벨업";
    const finalLog = `${playerName}님이 ${gameTitle}에서 최종 레벨 ${player.level}, 처치한 몬스터 수 ${player.monsterKills}의 기록을 달성했습니다. - ${dateTime}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(finalLog).then(() => {
            alert(`${playerName}님의 위대한 여정이 클립보드에 복사되었습니다. 지인에게 이 소식을 공유해보세요.`);
        }).catch(err => {
            console.error("클립보드에 복사하는 데 실패했습니다:", err);
            alert("클립보드에 복사하는 데 실패했습니다. 다시 시도해주세요.");
        });
    } else {
        console.error("클립보드 API를 지원하지 않는 브라우저입니다.");
        alert("클립보드에 복사하는 기능을 지원하지 않는 브라우저입니다.");
    }
});