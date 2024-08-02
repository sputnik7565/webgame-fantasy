import { CONFIG } from '../config.js';
import { formatStat } from '../utils/formatter.js';


export class UIManager {
    constructor(textData) {
        this.textData = textData;
        this.gameLogElement = document.getElementById('game-log');
        this.playerStatusElement = document.getElementById('player-status');
        this.monsterStatusElement = document.getElementById('monster-status');
        this.battleControlsElement = document.getElementById('battle-controls');
        this.continueControlsElement = document.getElementById('continue-controls');
        this.shareControlsElement = document.getElementById('share-controls');
        this.stageInfoElement = document.getElementById('stage-info');
        this.gameContainerElement = document.getElementById('game-container');
        this.gameOverOverlay = null;
        this.shareScreenOverlay = null;
        this.dragonRageButton = document.getElementById('dragon-rage');
    }

    updateUI(player, monster, stage, monstersDefeated, gameRound, monstersUntilBoss) {
        this.updatePlayerStatus(player);
        this.updateMonsterStatus(monster);
        this.updateStageInfo(stage, monstersDefeated, gameRound, monstersUntilBoss);
        this.updateDragonRageButton(player);
    }

    updatePlayerStatus(player) {
        this.playerStatusElement.innerHTML = `
            <img src="${player.image}" alt="플레이어 이미지" class="status-img">
            <div class="status-text">
                ${player.name}<br>
                레벨 ${player.level} (${formatStat(player.experience)}/${formatStat(player.nextLevelExp)} Exp)<br>
                체력: ${formatStat(player.hp)}/${formatStat(player.maxHp)}, 
                공격력: ${formatStat(player.attack)}, 
                방어력: ${formatStat(player.defense)}<br>
                드래곤의 분노: ${player.dragonRage}, 
                도망 티켓: ${player.runTickets}
                <div class="health-bar-container">
                    <div class="health-bar" style="width: ${player.hp / player.maxHp * 100}%;"></div>
                </div>
                <div class="exp-bar-container">
                    <div class="exp-bar" style="width: ${(player.experience / player.nextLevelExp) * 100}%;"></div>
                </div>
            </div>`;
    }


    updateMonsterStatus(monster) {
        if (monster) {
            this.monsterStatusElement.innerHTML = `
                <img src="${monster.image}" alt="몬스터 이미지" class="status-img">
                <div class="status-text">
                    ${monster.name} ${monster.type === 'boss' ? '(보스)' : ''}<br>
                    레벨: ${monster.level}, 
                    체력: ${formatStat(monster.hp)}/${formatStat(monster.maxHp)}, 
                    공격력: ${formatStat(monster.attack)}, 
                    방어력: ${formatStat(monster.defense)}
                    <div class="health-bar-container">
                        <div class="health-bar" style="width: ${monster.hp / monster.maxHp * 100}%;"></div>
                    </div>
                </div>`;
            
            this.setBossBorder(monster.type === 'boss');
        } else {
            this.monsterStatusElement.innerHTML = '';
            this.setBossBorder(false);
        }
    }


    updateStageInfo(stage, monstersDefeated, gameRound, monstersUntilBoss) {
        if (stage) {
            const remainingMonsters = Math.max(0, monstersUntilBoss - monstersDefeated);
            this.stageInfoElement.innerHTML = `
                <h2>${stage.name} #${gameRound}회차</h2>
                <p>보스 등장까지 남은 몬스터: ${remainingMonsters}/${monstersUntilBoss}</p>`;
        }
    }

    updateLog(messages) {
        this.gameLogElement.innerHTML = messages.map(message => 
            `<p>${message.trim().replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;')}</p>`
        ).join('');
        this.gameLogElement.scrollTop = this.gameLogElement.scrollHeight;
    }


    clearLog() {
        this.gameLogElement.innerHTML = '';
    }

    showBattleControls(player) {
        this.battleControlsElement.style.display = 'block';
        this.continueControlsElement.style.display = 'none';
        this.shareControlsElement.style.display = 'none';
        this.updateDragonRageButton(player);
    }

    updateDragonRageButton(player) {
        if (this.dragonRageButton) {
            if (player && player.dragonRage > 0) {
                this.dragonRageButton.disabled = false;
                this.dragonRageButton.style.display = 'inline-block';
            } else {
                this.dragonRageButton.disabled = true;
                this.dragonRageButton.style.display = 'inline-block'; // 항상 표시하되 비활성화
            }
        }
    }

    showContinueControls() {
        this.battleControlsElement.style.display = 'none';
        this.continueControlsElement.style.display = 'block';
        this.shareControlsElement.style.display = 'none';
    }

    showShareControls() {
        this.battleControlsElement.style.display = 'none';
        this.continueControlsElement.style.display = 'none';
        this.shareControlsElement.style.display = 'block';
    }
    shakeScreen(intensity = 'normal') {
        const shakeClass = intensity === 'strong' ? 'shake-strong' : 'shake';
        this.gameContainerElement.classList.add(shakeClass);
        setTimeout(() => {
            this.gameContainerElement.classList.remove(shakeClass);
        }, 500);
    }

    setBossBorder(isBoss) {
        if (isBoss) {
            this.gameContainerElement.style.border = '2px solid red';
            this.gameContainerElement.style.boxShadow = '0 0 10px red';
        } else {
            this.gameContainerElement.style.border = '';
            this.gameContainerElement.style.boxShadow = '';
        }
    }


    showGameOverDialog(restartCallback, shareCallback) {
        if (this.gameOverOverlay) {
            this.hideGameOverDialog();
        }
        this.gameOverOverlay = document.createElement('div');
        this.gameOverOverlay.className = 'overlay';

        const gameOverDialog = document.createElement('div');
        gameOverDialog.className = 'dialog-content';
        gameOverDialog.innerHTML = `
            <h2>게임 오버</h2>
            <p>다시 진행하시겠습니까?</p>
            <button id="share-result">결과 공유</button>
            <button id="restart-game">다시 시작</button>
        `;

        this.gameOverOverlay.appendChild(gameOverDialog);

        const restartButton = gameOverDialog.querySelector('#restart-game');
        restartButton.addEventListener('click', () => {
            this.hideGameOverDialog();
            restartCallback();
        });

        const shareButton = gameOverDialog.querySelector('#share-result');
        shareButton.addEventListener('click', () => {
            shareCallback();
            document.body.removeChild(this.gameOverOverlay);
        });

        document.body.appendChild(this.gameOverOverlay);
    }

    hideGameOverDialog() {
        if (this.gameOverOverlay && this.gameOverOverlay.parentNode) {
            this.gameOverOverlay.parentNode.removeChild(this.gameOverOverlay);
        }
        this.gameOverOverlay = null;
    }


    showShareScreen(player, currentStage, gameRound, restartCallback) {
        if (this.shareScreenOverlay) {
            this.hideShareScreen();
        }

        this.shareScreenOverlay = document.createElement('div');
        this.shareScreenOverlay.className = 'overlay';

        const shareContent = document.createElement('div');
        shareContent.id = 'share-content';
        shareContent.className = 'dialog-content';
        shareContent.innerHTML = `
            <h2>${player.name} 님의 기록</h2>
            <img src="${player.image}" alt="플레이어 이미지" class="status-img">
            <p>도달 스테이지: ${currentStage.name} #${gameRound}회차</p>
            <p>처치한 몬스터: ${player.monsterKills} 마리</p>
            <span style = "color: gold; font-weight: bold:">최종 스테이터스</span>
            <p>레벨: ${player.level}</p>
            <p>공격력: ${player.attack}</p>
            <p>방어력: ${player.defense}</p>
            <p>체력: ${player.maxHp}</p>
            <p>${new Date().toLocaleString()}</p>
            <div class="button-group">
                <button id="download-record">기록 다운로드</button>
                <button id="copy-record">기록 클립보드 복사</button>
                <button id="restart-from-share">다시 하기</button>
            </div>
        `;

        this.shareScreenOverlay.appendChild(shareContent);
        document.body.appendChild(this.shareScreenOverlay);

        // DOM에 요소가 추가된 후에 이벤트 리스너를 추가합니다.
        const downloadButton = document.getElementById('download-record');
        const copyButton = document.getElementById('copy-record');

        if (downloadButton && copyButton) {
            downloadButton.addEventListener('click', async () => {
                await this.downloadRecord();
            });
            copyButton.addEventListener('click', async () => {
                await this.copyRecordToClipboard();
            });
        } else {
            console.error('One or more buttons not found in the share screen');
        }

        const restartButton = document.getElementById('restart-from-share');
        restartButton.addEventListener('click', () => {
            this.hideShareScreen();
            restartCallback();
        });
    }

    hideShareScreen() {
        if (this.shareScreenOverlay && this.shareScreenOverlay.parentNode) {
            this.shareScreenOverlay.parentNode.removeChild(this.shareScreenOverlay);
        }
        this.shareScreenOverlay = null;
    }

    async downloadRecord() {
        try {
            const shareContent = document.getElementById('share-content');
            if (!shareContent) {
                throw new Error('Share content element not found');
            }
            
            // 버튼 숨기기
            const buttonGroup = shareContent.querySelector('.button-group');
            if (buttonGroup) buttonGroup.style.display = 'none';

            const canvas = await html2canvas(shareContent, {
                backgroundColor: '#000000',  // 배경색을 검정색으로 설정
                windowWidth: shareContent.scrollWidth + 40,  // 좌우 여백 추가
                windowHeight: shareContent.scrollHeight + 40,  // 상하 여백 추가
            });

            // 버튼 다시 표시
            if (buttonGroup) buttonGroup.style.display = 'block';

            const link = document.createElement('a');
            link.download = 'game_record.png';
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Failed to download record:', error);
            alert('기록 다운로드에 실패했습니다.');
        }
    }
    async copyRecordToClipboard() {
        try {
            const shareContent = document.getElementById('share-content');
            if (!shareContent) {
                throw new Error('Share content element not found');
            }

            // 버튼 숨기기
            const buttonGroup = shareContent.querySelector('.button-group');
            if (buttonGroup) buttonGroup.style.display = 'none';

            const canvas = await html2canvas(shareContent, {
                backgroundColor: '#000000',  // 배경색을 검정색으로 설정
                windowWidth: shareContent.scrollWidth + 40,  // 좌우 여백 추가
                windowHeight: shareContent.scrollHeight + 40,  // 상하 여백 추가
            });

            // 버튼 다시 표시
            if (buttonGroup) buttonGroup.style.display = 'block';

            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    alert('클립보드에 기록이 복사되었습니다.');
                } catch (err) {
                    console.error('클립보드 복사 실패:', err);
                    alert('클립보드 복사에 실패했습니다.');
                }
            });
        } catch (error) {
            console.error('Failed to copy record to clipboard:', error);
            alert('기록 복사에 실패했습니다.');
        }
    }

    showLevelUpPopup(player, callback, isBossDefeated) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const popup = document.createElement('div');
        popup.className = 'dialog-content';
        popup.innerHTML = `
            <h2>레벨 업!</h2>
            <p>${isBossDefeated ? '보스 처치 보너스! 스탯 증가량 2배' : '상승시킬 스테이터스를 선택해 주세요.'}</p>
            <button id="attack-up">공격력 ${player.getStatIncreaseAmount('attack')} 상승</button>
            <button id="defense-up">방어력 ${player.getStatIncreaseAmount('defense')} 상승</button>
            <button id="hp-up">체력 ${player.getStatIncreaseAmount('hp')} 상승</button>
            <button id="pray">신이시여...</button>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        const attackBtn = popup.querySelector('#attack-up');
        const defenseBtn = popup.querySelector('#defense-up');
        const hpBtn = popup.querySelector('#hp-up');
        const prayBtn = popup.querySelector('#pray');

        const handleChoice = (choice) => {
            document.body.removeChild(overlay);
            callback(choice, isBossDefeated);
        };

        attackBtn.addEventListener('click', () => handleChoice('attack'));
        defenseBtn.addEventListener('click', () => handleChoice('defense'));
        hpBtn.addEventListener('click', () => handleChoice('hp'));
        prayBtn.addEventListener('click', () => handleChoice('pray'));
    }

}