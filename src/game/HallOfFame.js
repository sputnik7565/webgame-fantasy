export class HallOfFame {
    constructor(container) {
        this.container = container;
        this.records = [];
        this.mask = null;
        this.flowText = null;
    }

    init() {
        this.container.className = 'flow-container';
        this.setContainerStyles();

        const style = document.createElement('style');
        style.textContent = `
            .flow-container {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                overflow: hidden !important;
                width: 100% !important;
                height: 40px !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 1000 !important;
                background-color: rgba(0, 0, 0, 0.7) !important;
            }

            .mask {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                position: relative !important;
                width: 600px !important;
                height: 40px !important;
                overflow: hidden !important;
            }

            .flow-text {
                display: flex !important;
                align-items: center !important;
                animation: flowAnimation 30s linear infinite !important;
                font-weight: 300 !important;
                white-space: nowrap !important;
                height: 100% !important;
            }
            .flow-wrap {
                flex: 0 0 auto !important;
                padding: 0 20px !important;
            }

            @keyframes flowAnimation {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
            }
        `;
        document.head.appendChild(style);

        this.createMaskAndFlowText();

        console.log('HallOfFame initialized, container:', this.container);
    }

    setContainerStyles() {
        const styles = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '1000',
            overflow: 'hidden'
        };

        Object.assign(this.container.style, styles);
    }

    createMaskAndFlowText() {
        if (!this.mask) {
            this.mask = document.createElement('div');
            this.mask.className = 'mask';
            this.container.appendChild(this.mask);
        }

        if (!this.flowText) {
            this.flowText = document.createElement('div');
            this.flowText.className = 'flow-text';
            this.mask.appendChild(this.flowText);
        }
    }

    updateRecords(newRecords) {
        console.log('Updating records:', newRecords);
        this.records = newRecords.slice(0, 5);  // 최대 5개의 기록만 사용
        this.refreshDisplay();
    }

    refreshDisplay() {
        console.log('Refreshing display with records:', this.records);
        
        // 플로우 텍스트의 내용만 업데이트
        this.flowText.innerHTML = '';

        if (!this.records || this.records.length === 0) {
            const wrap = document.createElement('div');
            wrap.className = 'flow-wrap';
            wrap.textContent = "아직 기록이 없습니다.";
            this.flowText.appendChild(wrap);
        } else {
            const createRecordElement = (record, index) => {
                const wrap = document.createElement('div');
                wrap.className = 'flow-wrap';
                
                let content = `${index + 1}등 `;
                if (index === 0) {
                    content = `<span style="color: gold; font-weight: bold;">${content}</span>`;
                }
                content += `'${record.playerName}' 님의 기록 / 레벨: ${record.playerLevel} / 도달 스테이지: ${record.stageName} #${record.gameRound}회차 / 처치한 몬스터: ${record.monstersKilled} 마리`;
                
                wrap.innerHTML = content;
                return wrap;
            };

            // 기록을 두 번 반복하여 추가 (연속적인 흐름을 위해)
            this.records.forEach((record, index) => {
                this.flowText.appendChild(createRecordElement(record, index));
            });
            this.records.forEach((record, index) => {
                this.flowText.appendChild(createRecordElement(record, index));
            });
        }

        // 애니메이션 재시작
        this.flowText.style.animation = 'none';
        this.flowText.offsetHeight; // Trigger reflow
        this.flowText.style.animation = null;

        console.log('Display refreshed:', this.flowText.innerHTML);
    }
}