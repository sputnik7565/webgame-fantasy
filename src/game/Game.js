import { CONFIG } from '../config.js';
import { Player } from './Player.js';
import { Monster } from './Monster.js';
import { Stage } from './Stage.js';

import { BattleManager } from '../managers/BattleManager.js';
import { EventManager } from '../managers/EventManager.js';
import { LogManager } from '../managers/LogManager.js';
import { SkillManager } from '../managers/SkillManager.js';
import { StageManager } from '../managers/StageManager.js';
import { GameOverManager } from '../managers/GameOverManager.js';

export class Game {
    constructor(gameData, uiManager, backgroundManager, hallOfFameManager, hallOfFame) {
        this.gameData = gameData;
        this.uiManager = uiManager;
        this.backgroundManager = backgroundManager;
        this.logManager = new LogManager(uiManager);
        this.skillManager = new SkillManager(gameData.skillData, this.logManager);
        this.eventManager = new EventManager(gameData.eventData, this.logManager);
        this.battleManager = new BattleManager(this.logManager, this.skillManager, uiManager);
        this.hallOfFameManager = hallOfFameManager;
        this.hallOfFame = hallOfFame;
        this.playerImage = null; // 새로운 속성 추가

        this.dragonRageButton = document.getElementById('dragon-rage');
        this.dragonRageButton.addEventListener('click', () => {
            if (!this.dragonRageButton.disabled) {
                this.useDragonRage();
            }
        });

        
        console.log('Game constructor - monsterData:', gameData.monsterData); // 디버깅용 로그
        
        this.gameOverManager = new GameOverManager(this, uiManager);

        this.player = null;
        this.currentMonster = null;
        this.monstersDefeated = 0;
        this.gameRound = 1;

        this.roundInitialStats = JSON.parse(JSON.stringify(CONFIG.MONSTER.INITIAL));
        this.stageManager = new StageManager(gameData.stageData, gameData.monsterData, this.logManager, this);
    }

    start(playerName, playerImage, playerStats) {
        this.playerImage = playerImage;
        this.player = new Player(playerName, this.gameData.textData, playerStats, playerImage);
        this.player.game = this;  // 게임 객체 참조 추가

        this.currentStage = this.stageManager.getCurrentStage();
        this.currentStage.initializeMonsterStats({
            maxHp: this.player.maxHp,
            attack: this.player.attack,
            defense: this.player.defense
        }, this.gameRound);

        this.monstersDefeated = 0;
        // this.roundInitialStats = JSON.parse(JSON.stringify(CONFIG.INITIAL_MONSTER_STATS));

        this.logManager.clearLogs();
        this.logManager.log(this.gameData.textData.startMessage.replace('{playerName}', playerName));
        
        this.logManager.log(this.gameData.textData.stageEnterMessage.replace('{stageName}', this.currentStage.name));
        this.logManager.log(`이 스테이지에서는 보스 등장 전까지 ${this.currentStage.monstersUntilBoss}마리의 몬스터를 처치해야 합니다.`);

        this.backgroundManager.setBackground(this.currentStage.background);
        this.gameRound = 1;

        this.updateUI();
        this.logManager.displayCurrentTurnLogs();
        
        // HallOfFame 컨테이너 스타일 재확인
        const hallOfFameContainer = document.getElementById('hall-of-fame-container');
        if (hallOfFameContainer) {
            hallOfFameContainer.style.display = 'flex';
            hallOfFameContainer.style.justifyContent = 'center';
            hallOfFameContainer.style.alignItems = 'center';
            console.log('HallOfFame container styles checked in Game.start()');
        }

        this.uiManager.showContinueControls();
    }


    useDragonRage() {
        if (this.player.dragonRage > 0) {
            const originalAttack = this.player.attack;
            const damage = this.player.useDragonRage();
            const multiplier = (damage / originalAttack).toFixed(1);
            const result = this.battleManager.performDragonRageAttack(this.player, this.currentMonster, damage);
            this.logManager.log(`드래곤의 분노 발동! 공격력이 ${multiplier}배로 증가하여 ${damage}의 데미지를 입혔습니다.`);
            if (result.monsterDefeated) {
                this.handleMonsterDefeat();
            }
            this.updateUI();
            this.logManager.displayCurrentTurnLogs();
        }
    }


    // 새로운 메서드: 첫 번째 턴을 시작합니다.
    startFirstTurn() {
        this.nextTurn();
    }

    nextTurn() {
        this.currentStage.setPlayerStats({
            maxHp: this.player.maxHp,
            attack: this.player.attack,
            defense: this.player.defense
        });

        if (this.monstersDefeated >= this.currentStage.monstersUntilBoss) {
            this.spawnBossMonster();
        } else if (Math.random() < CONFIG.GAME.MONSTER_APPEAR_CHANCE) {
            this.spawnMonster();
        } else {
            this.triggerEvent();
        }
        this.updateUI();
        this.logManager.displayCurrentTurnLogs();
    }

    calculateDifficultyMultiplier() {
        const baseMultiplier = 2.8; // 1회차 마지막 스테이지의 난이도 승수
        const stageMultiplier = 0.2; // 각 스테이지별 난이도 증가율
        const roundMultiplier = Math.pow(baseMultiplier, this.gameRound - 1);
        
        return roundMultiplier * (1 + (this.currentStage.level - 1) * stageMultiplier);
    }

    spawnMonster() {
        const difficultyMultiplier = this.calculateDifficultyMultiplier();
        this.currentMonster = this.currentStage.spawnMonster(this.gameRound);
        this.logManager.log(this.gameData.textData.monsterAppearMessage.replace('{monsterName}', this.currentMonster.name));
        this.uiManager.showBattleControls(this.player);  // player 객체 전달
        this.uiManager.shakeScreen();
        this.uiManager.setBossBorder(false);  // 일반 몬스터일 경우 테두리 제거
    }

    spawnBossMonster() {
        const difficultyMultiplier = this.calculateDifficultyMultiplier();
        this.currentMonster = this.currentStage.spawnBossMonster(this.gameRound);
        this.logManager.log(this.gameData.textData.bossAppearMessage.replace('{bossName}', this.currentMonster.name));
        this.uiManager.showBattleControls(this.player);  // player 객체 전달
        this.uiManager.shakeScreen('strong');
        this.uiManager.setBossBorder(true);  // 보스 테두리 설정
    }

    triggerEvent() {
        this.eventManager.triggerRandomEvent(this.player);
        this.uiManager.showContinueControls();
        this.uiManager.setBossBorder(false);  // 몬스터 처치 후 테두리 제거
    }

    attack() {
        // 플레이어의 경험치를 1 증가시킵니다.
        // this.slash();
        const expGained = this.player.gainExperienceFromAttack();
        if (!expGained) {
            this.logManager.log("다음 레벨업까지 공격으로 쌓을 수 있는 경험치가 최대입니다.");
        }
        
        const result = this.battleManager.performBattle(this.player, this.currentMonster);
        if (result.monsterDefeated) {
            this.handleMonsterDefeat();
        } else if (result.playerDefeated) {
            this.handleGameOver();
        }
        this.updateUI();
        this.logManager.displayCurrentTurnLogs();
    }

    slash() {
        const monsterStatusElement = document.getElementById('monster-status');
        const monsterImage = monsterStatusElement.querySelector('img');
    
        if (!monsterImage) {
            console.error('Monster image not found');
            return;
        }
    
        // Create a new slash element
        const slash = document.createElement('div');
        slash.className = 'slashEffect';
        
        // Get the dimensions of the monster image
        const rect = monsterImage.getBoundingClientRect();
        
        // Set the size of the slash effect (adjust as needed)
        const slashSize = Math.min(rect.width, rect.height) * 2.8; // 80% of the smaller dimension
        
        // Position the slash element in the center of the monster image
        slash.style.position = 'absolute';
        slash.style.left = `${rect.left + (rect.width - slashSize) / 2}px`;
        slash.style.top = `${rect.top + (rect.height - slashSize) / 2}px`;
        slash.style.width = `${slashSize}px`;
        slash.style.height = `${slashSize}px`;
    
        // Randomly choose a slash animation
        const animations = ['slashTopLeft', 'slashTopRight', 'slashBottomLeft', 'slashBottomRight'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        slash.style.animationName = randomAnimation;
    
        // Add the slash element to the document body
        document.body.appendChild(slash);
    
        // Remove the slash element after animation is complete
        slash.addEventListener('animationend', () => {
            slash.remove();
        });
    }





    run() {
        if (this.player.runTickets > 0 && Math.random() < CONFIG.GAME.ESCAPE_CHANCE) {
            this.player.runTickets--;
            this.logManager.log(this.gameData.textData.escapeSuccessMessage
                .replace('{playerName}', this.player.name)
                .replace('{monsterName}', this.currentMonster.name)
                .replace('{tickets}', this.player.runTickets));
            
            if (this.currentMonster.type === 'boss') {
                // 보스로부터 도망친 경우
                if (Math.random() < 0.8) {
                    // 50% 확률로 랜덤 이벤트 발생
                    this.triggerEvent();
                } else {
                    // 50% 확률로 보스 재등장
                    this.logManager.log("보스가 다시 나타났습니다!");
                    this.spawnBossMonster();
                }
            } else {
                // 일반 몬스터로부터 도망친 경우
                this.currentMonster = null;
                this.uiManager.showContinueControls();
            }
        } else if (this.player.runTickets <= 0) {
            this.logManager.log(this.gameData.textData.escapeFailMessage);
        } else {
            this.logManager.log(this.gameData.textData.escapeUnluckyMessage.replace('{playerName}', this.player.name));
            this.attack();
        }
        this.updateUI();
        this.logManager.displayCurrentTurnLogs();
    }

    handleMonsterDefeat() {
        const isBossDefeated = this.currentMonster.type === 'boss';
        
        if (isBossDefeated) {
            this.player.gainExperience(0, true);  // 보스 처치 시 무조건 레벨업
            this.logManager.log(`보스 ${this.currentMonster.name}을(를) 물리쳤습니다! 레벨이 상승했습니다!`);
        } else {
            const expGained = this.currentMonster.getExpReward();
            this.player.gainExperience(expGained, false);
            this.logManager.log(this.gameData.textData.monsterDefeatMessage
                .replace('{monsterName}', this.currentMonster.name)
                .replace('{exp}', expGained));
        }

        this.player.monsterKills++;
        this.monstersDefeated++;
        
        this.handlePendingLevelUps();
        
        if (isBossDefeated) {
            this.handleBossDefeat();
        }
        
        this.currentMonster = null;
        this.uiManager.showContinueControls();
        this.uiManager.setBossBorder(false);
        this.updateUI();
    }


    handlePendingLevelUps() {
        if (this.player.pendingLevelUps > 0) {
            const isBossDefeated = this.player.isBossDefeated;
            this.uiManager.showLevelUpPopup(this.player, (choice) => {
                if (choice === 'pray') {
                    this.handlePrayerChoice(isBossDefeated);
                } else {
                    this.player.applyLevelUp(choice);
                    this.logManager.log(this.gameData.textData.levelUpMessage
                        .replace('{playerName}', this.player.name)
                        .replace('{level}', this.player.level));
                }
                this.player.isBossDefeated = false; // 레벨업 처리 후 플래그 초기화
                this.updateUI();
                
                if (this.player.pendingLevelUps > 0) {
                    this.handlePendingLevelUps();
                } else {
                    this.uiManager.showContinueControls();
                }
            }, isBossDefeated);
        }
    }

    handlePrayerChoice(isBossDefeated) {
        if (Math.random() < 0.5) { // 50% 성공 확률
            const buffPercent = isBossDefeated ? 4 : 2;
            const statIncreases = this.player.updateAllStatsPercent(buffPercent);
            this.logManager.log(`신이 ${this.player.name}의 응답에 답해 전체 스테이터스가 ${buffPercent}% 상승했습니다.`);
            this.logManager.log(`공격력 +${statIncreases.attackIncrease}, 방어력 +${statIncreases.defenseIncrease}, 최대 체력 +${statIncreases.hpIncrease}`);
        } else {
            this.logManager.log("신이시여어어어어어어!! 레벨업 효과가 없습니다;");
        }
        this.player.pendingLevelUps--; // 레벨업 처리 완료
    }


    handleBossDefeat() {
        this.logManager.log(this.gameData.textData.bossDefeatMessage.replace('{bossName}', this.currentMonster.name));
        // 보스 특별 보상 로직 추가
        if (this.currentStage.level === CONFIG.GAME.TOTAL_STAGES) {
            this.handleGameClear();
        } else {
            this.goToNextStage();
        }
    }


    goToNextStage() {
        this.logManager.displayCurrentTurnLogs();

        const nextStageLevel = this.currentStage.level + 1;
        this.currentStage = this.stageManager.getStage(nextStageLevel);
        
        if (this.currentStage) {
            this.currentStage.initializeMonsterStats({
                maxHp: this.player.maxHp,
                attack: this.player.attack,
                defense: this.player.defense
            }, this.gameRound);
            this.monstersDefeated = 0;
            this.backgroundManager.setBackground(this.currentStage.background);
            this.logManager.log(this.gameData.textData.stageEnterMessage.replace('{stageName}', this.currentStage.name));
            this.logManager.log(`이 스테이지에서는 보스 등장 전까지 ${this.currentStage.monstersUntilBoss}마리의 몬스터를 처치해야 합니다.`);
        } else {
            // 모든 스테이지를 클리어한 경우
            this.handleGameClear();
        }
    }

    // handleGameClear() {
    //     this.logManager.log(this.gameData.textData.gameClearMessage.replace('{playerName}', this.player.name));
    //     this.gameRound++;
    //     this.currentStage = this.stageManager.getStage(1);
    //     this.monstersDefeated = 0;
    //     this.backgroundManager.setBackground(this.currentStage.background);
    //     this.logManager.log(this.gameData.textData.gameRestartMessage.replace('{round}', this.gameRound));
    // }

    handleGameClear() {
        this.logManager.log(this.gameData.textData.gameClearMessage.replace('{playerName}', this.player.name));
        this.gameRound++;
        this.currentStage = this.stageManager.getStage(1);
        if (this.currentStage) {
            this.currentStage.initializeMonsterStats({
                maxHp: this.player.maxHp,
                attack: this.player.attack,
                defense: this.player.defense
            }, this.gameRound);
            this.monstersDefeated = 0;
            this.backgroundManager.setBackground(this.currentStage.background);
            this.logManager.log(this.gameData.textData.gameRestartMessage.replace('{round}', this.gameRound));
        } else {
            // 게임 완전 종료 또는 에러 처리
            console.error("No stages available");
            // 여기에 게임 종료 로직을 추가할 수 있습니다.
        }
    }
    
    async handleGameOver() {
        this.logManager.log(this.gameData.textData.gameOverMessage.replace('{playerName}', this.player.name));
        this.uiManager.shakeScreen('strong');
        
        if (this.player && this.currentStage) {
            try {
                // 기록 추가 및 새 기록 로드
                await this.hallOfFameManager.addRecord(
                    this.player.name,
                    this.player.level,
                    this.currentStage.name,
                    this.gameRound,
                    this.player.monsterKills
                );
                
                // 최신 기록 로드
                const updatedRecords = await this.hallOfFameManager.loadRecords();
                
                // Hall of Fame 업데이트
                this.hallOfFame.updateRecords(updatedRecords);
            } catch (error) {
                console.error('Failed to update Hall of Fame:', error);
            }
        } else {
            console.error('Invalid player or stage data for Hall of Fame record');
        }
    
        this.gameOverManager.showGameOverDialog();
    }

    showShareScreen() {
        this.uiManager.showShareScreen(
            this.player,
            this.currentStage,
            this.gameRound,
            this.restartGame.bind(this)
        );
    }

    async restartGame() {
        // 게임 상태 초기화
        this.player = null;
        this.currentStage = this.stageManager.resetStages();
        this.monstersDefeated = 0;
        this.gameRound = 1;
        this.currentMonster = null;
    
        // UI 초기화
        this.uiManager.hideGameOverDialog();
        this.uiManager.hideShareScreen();
    
        // 시작 화면으로 돌아가기
        window.restartGame();
    }


    updateUI() {
        this.uiManager.updateUI(
            this.player,
            this.currentMonster,
            this.currentStage,
            this.monstersDefeated,
            this.gameRound,
            this.currentStage.monstersUntilBoss
        );
    }

    shareResult() {
        const shareMessage = this.gameData.textData.shareMessage
            .replace('{playerName}', this.player.name)
            .replace('{gameTitle}', this.gameData.textData.gameTitle)
            .replace('{level}', this.player.level)
            .replace('{kills}', this.player.monsterKills)
            .replace('{stage}', this.currentStage.level)
            .replace('{round}', this.gameRound)
            .replace('{dateTime}', new Date().toLocaleString());
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareMessage)
                .then(() => alert('게임 결과가 클립보드에 복사되었습니다.'))
                .catch(err => console.error('클립보드 복사 실패:', err));
        } else {
            console.log('클립보드 API를 지원하지 않는 브라우저입니다.');
            alert(shareMessage);
        }
    }


    updateRoundInitialStats() {
        const lastStageMonsters = this.currentStage.getLastStageMonsters();
        this.roundInitialStats.NORMAL = {
            HP: lastStageMonsters.normal.maxHp,
            ATTACK: lastStageMonsters.normal.attack,
            DEFENSE: lastStageMonsters.normal.defense
        };
        this.roundInitialStats.BOSS = {
            HP: lastStageMonsters.boss.maxHp,
            ATTACK: lastStageMonsters.boss.attack,
            DEFENSE: lastStageMonsters.boss.defense
        };
    }

    startNewRound() {
        this.gameRound++;
        this.updateRoundInitialStats();
        // 새 라운드 시작 로직...
    }
}