export class HallOfFameManager {
    constructor() {
        this.records = [];
        this.apiUrl = 'https://kc1979.mycafe24.com/levelup/hall_of_fame_api.php';
    }

    async loadRecords() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            this.records = await response.json();
            // 새로운 정렬 규칙 적용
            this.records.sort((a, b) => {
                if (a.playerLevel !== b.playerLevel) {
                    return b.playerLevel - a.playerLevel; // 레벨 내림차순
                }
                if (a.gameRound !== b.gameRound) {
                    return b.gameRound - a.gameRound; // 회차 내림차순
                }
                if (a.stageName !== b.stageName) {
                    return b.stageName.localeCompare(a.stageName); // 스테이지 이름 내림차순
                }
                return b.monstersKilled - a.monstersKilled; // 처치한 몬스터 수 내림차순
            });
            console.log('Loaded and sorted records:', this.records);
            return this.records;
        } catch (error) {
            console.error('Failed to load records:', error);
            return [];
        }
    }

    async addRecord(playerName, playerLevel, stageName, gameRound, monstersKilled) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName,
                    playerLevel,
                    stageName,
                    gameRound,
                    monstersKilled
                }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await this.loadRecords(); // 기록 추가 후 최신 기록 로드 및 반환
        } catch (error) {
            console.error('Failed to add record:', error);
        }
    }

    getRecords() {
        return this.records;
    }
}