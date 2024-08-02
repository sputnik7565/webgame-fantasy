import { Stage } from '../game/Stage.js';
import { CONFIG } from '../config.js';

export class StageManager {
    constructor(stageData, monsterData, logManager, game) {
        console.log('StageManager constructor - monsterData:', monsterData); // 디버깅용 로그
        this.stages = stageData.stages.map(stage => new Stage(stage, monsterData.monsters, game));
        this.logManager = logManager;
        this.currentStageIndex = 0;
    }
    getCurrentStage() {
        return this.stages[this.currentStageIndex];
    }

    getStage(level) {
        return this.stages.find(stage => stage.level === level);
    }

    moveToNextStage() {
        if (this.currentStageIndex < this.stages.length - 1) {
            this.currentStageIndex++;
            const newStage = this.getCurrentStage();
            this.logManager.logStageChange(newStage.name);
            return newStage;
        } else {
            // 모든 스테이지를 클리어한 경우
            this.currentStageIndex = 0;
            const firstStage = this.getCurrentStage();
            this.logManager.log('모든 스테이지를 클리어했습니다! 다시 처음부터 시작합니다.');
            this.logManager.logStageChange(firstStage.name);
            return firstStage;
        }
    }

    resetStages() {
        this.currentStageIndex = 0;
        const firstStage = this.getCurrentStage();
        this.logManager.logStageChange(firstStage.name);
        return firstStage;
    }

    getTotalStages() {
        return this.stages.length;
    }

    isLastStage() {
        return this.currentStageIndex === this.stages.length - 1;
    }

    getStageProgress() {
        return `${this.currentStageIndex + 1} / ${this.stages.length}`;
    }
}