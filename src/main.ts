import { Board as board } from "./mainfile"

window.onload = function() {
    var settings = new board.GameSettings(board.GameDifficulty.Medium, 5, 5, true);

    board.MinesweeperGame.prototype.initializeBoard(settings);

    
}

