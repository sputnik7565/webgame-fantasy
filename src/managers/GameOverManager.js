export class GameOverManager {
    constructor(game, uiManager) {
        this.game = game;
        this.uiManager = uiManager;
    }

    showGameOverDialog() {
        this.uiManager.showGameOverDialog(
            this.restartGame.bind(this),
            this.showShareScreen.bind(this)
        );
    }

    showShareScreen() {
        this.uiManager.showShareScreen(
            this.game.player,
            this.game.currentStage,
            this.game.gameRound,
            this.restartGame.bind(this)
        );
    }

    restartGame() {
        this.game.restartGame();
    }
}