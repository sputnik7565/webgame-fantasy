import { loadGameData } from './dataLoader.js';
import { Game } from './game/Game.js';
import { UIManager } from './managers/UIManager.js';
import { BackgroundManager } from './managers/BackgroundManager.js';
import { HallOfFame } from './game/HallOfFame.js';
import { HallOfFameManager } from './managers/HallOfFameManager.js';


let game;
let uiManager;
let backgroundManager;
let hallOfFame;
let hallOfFameManager;
let selectedPlayerImage = 'player_01.jpg';
let playerStats = { hp: 100, attack: 20, defense: 10 };


async function initGame() {
    try {
        const gameData = await loadGameData();
        console.log('Loaded game data:', gameData);
        if (!gameData || !gameData.textData) {
            throw new Error('Game data or text data is missing');
        }
        uiManager = new UIManager(gameData.textData);
        backgroundManager = new BackgroundManager();
        hallOfFameManager = new HallOfFameManager();
        
        const hallOfFameContainer = document.createElement('div');
        hallOfFameContainer.id = 'hall-of-fame-container';
        document.body.insertBefore(hallOfFameContainer, document.body.firstChild);
        hallOfFame = new HallOfFame(hallOfFameContainer);
        hallOfFame.init();
        
        const initialRecords = await hallOfFameManager.loadRecords();
        console.log('Initial records:', initialRecords);
        if (initialRecords.length > 0) {
            hallOfFame.updateRecords(initialRecords);
        } else {
            console.log('No initial records found');
        }

        game = new Game(gameData, uiManager, backgroundManager, hallOfFameManager, hallOfFame);

        document.getElementById('start-game').addEventListener('click', startGame);
        document.getElementById('attack').addEventListener('click', () => game.attack());
        document.getElementById('run').addEventListener('click', () => game.run());
        document.getElementById('continue').addEventListener('click', handleContinueClick);
        document.getElementById('share').addEventListener('click', () => game.shareResult());
    
        // 이미지 선택 이벤트 리스너 수정
        const playerImages = document.querySelectorAll('.player-image');
        playerImages.forEach(img => {
            img.addEventListener('click', selectPlayerImage);
        });
    
        console.log('Game initialization completed');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('게임 초기화 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
    }
}

function selectPlayerImage(event) {
    const playerImages = document.querySelectorAll('.player-image');
    playerImages.forEach(img => img.classList.remove('selected'));
    event.target.classList.add('selected');
    selectedPlayerImage = event.target.dataset.image;

    // 새로운 스탯 생성 및 표시
    generateRandomStats();
    displayStats(event.target);
}

function generateRandomStats() {
    const minHp = 50;
    const minAttack = 10;
    const minDefense = 10;
    const additionalPoints = 50;

    // 최소 스탯 설정
    playerStats = {
        hp: minHp,
        attack: minAttack,
        defense: minDefense
    };

    // 추가 포인트 랜덤 배분
    for (let i = 0; i < additionalPoints; i++) {
        const randomStat = Math.floor(Math.random() * 3);
        switch (randomStat) {
            case 0:
                playerStats.hp++;
                break;
            case 1:
                playerStats.attack++;
                break;
            case 2:
                playerStats.defense++;
                break;
        }
    }
}

function displayStats(imageElement) {
    const statsOverlay = document.createElement('div');
    statsOverlay.className = 'stats-overlay';
    statsOverlay.style.position = 'absolute';
    statsOverlay.style.top = `${imageElement.offsetTop}px`;
    statsOverlay.style.left = `${imageElement.offsetLeft}px`;
    statsOverlay.style.width = `${imageElement.offsetWidth}px`;
    statsOverlay.style.height = `${imageElement.offsetHeight}px`;
    statsOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    statsOverlay.style.color = 'white';
    statsOverlay.style.display = 'flex';
    statsOverlay.style.flexDirection = 'column';
    statsOverlay.style.justifyContent = 'center';
    statsOverlay.style.alignItems = 'center';
    statsOverlay.style.zIndex = '1000';

    statsOverlay.innerHTML = `
        <p>HP: ${playerStats.hp}</p>
        <p>공격력: ${playerStats.attack}</p>
        <p>방어력: ${playerStats.defense}</p>
    `;

    document.body.appendChild(statsOverlay);

    setTimeout(() => {
        document.body.removeChild(statsOverlay);
    }, 1500);
}


function startGame() {
    const playerName = document.getElementById('player-name').value;
    if (playerName) {
        game.start(playerName, selectedPlayerImage, playerStats);
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('main-game').style.display = 'block';
        backgroundManager.setBackground(game.currentStage.background);
    } else {
        alert('캐릭터 이름을 입력하세요.');
    }
}


function handleContinueClick() {
    if (game.monstersDefeated === 0 && game.currentStage.level === 1) {
        game.startFirstTurn();
    } else {
        game.nextTurn();
    }
}


window.addEventListener('load', initGame);

// 게임 재시작 함수 추가
function restartGame() {
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('main-game').style.display = 'none';
    selectedPlayerImage = 'player_01.jpg';
    playerStats = { hp: 100, attack: 20, defense: 10 };
    const playerImages = document.querySelectorAll('.player-image');
    playerImages.forEach(img => img.classList.remove('selected'));
    document.querySelector('.player-image[data-image="player_01.jpg"]').classList.add('selected');
    document.getElementById('player-name').value = '';
}

// 전역 스코프에 restartGame 함수 추가
window.restartGame = restartGame;