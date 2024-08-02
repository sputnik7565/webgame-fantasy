export class LogManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentTurnLogs = [];
    }

    log(message) {
        // '\n'으로 분리한 후, 각 줄에 대해 문장 단위로 분리
        const lines = message.split('\n');
        lines.forEach(line => {
            const sentences = line.match(/[^.!?]+[.!?]+/g) || [line];
            this.currentTurnLogs.push(...sentences);
        });
    }

    displayCurrentTurnLogs() {
        if (this.currentTurnLogs.length > 0) {
            this.uiManager.updateLog(this.currentTurnLogs);
            this.currentTurnLogs = []; // 현재 턴의 로그를 표시한 후 초기화
        }
    }

    clearLogs() {
        this.currentTurnLogs = [];
        this.uiManager.clearLog();
    }

    logStageChange(stageName) {
        this.clearLogs();
        this.log(`=== ${stageName}에 입장했습니다 ===`);
        this.displayCurrentTurnLogs();
    }

    logBossAppear(bossName) {
        this.clearLogs();
        this.log(`!!! 보스 몬스터 ${bossName}이(가) 등장했습니다 !!!`);
    }

    logGameClear(playerName, stageCleared, round) {
        this.clearLogs();
        this.log(`축하합니다! ${playerName}님이 ${stageCleared}번째 스테이지를 클리어하셨습니다! ${round}회차 게임을 완료하셨습니다.`);
        this.displayCurrentTurnLogs();
    }
}