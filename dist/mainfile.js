"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Board;
(function (Board) {
    var Square = /** @class */ (function () {
        //bomb - 0-8 for how many bombs are in adjacent squares, 10 for bomb itself
        function Square(x, y) {
            this.location = [x, y];
            this.discovered = false;
            this.bombs = 0;
        }
        return Square;
    }());
    var GameSettings = /** @class */ (function () {
        function GameSettings() {
        }
        return GameSettings;
    }());
    Board.GameSettings = GameSettings;
    //DEBUG: TODO: can be modified to take custom sizes in the future
    var GameDifficulty;
    (function (GameDifficulty) {
        GameDifficulty[GameDifficulty["Easy"] = 0] = "Easy";
        GameDifficulty[GameDifficulty["Medium"] = 1] = "Medium";
        GameDifficulty[GameDifficulty["Hard"] = 2] = "Hard"; // Mines x 0.4
    })(GameDifficulty = Board.GameDifficulty || (Board.GameDifficulty = {}));
    var MinesweeperGame = /** @class */ (function () {
        //constructor(rows: number, columns: number, cover_state: any)
        //remaining mines = Math.ceil(rows * columns * difficulty);
        function MinesweeperGame(settings) {
            this.rows = settings.rows;
            this.columns = settings.columns;
            this.frontier = [];
        }
        MinesweeperGame.prototype.initializeBoard = function (settings) {
            //TODO: add tests for validity of input data, should:
            // - rows/columns > 0
            // 
            this.rows = settings.rows;
            this.columns = settings.columns;
            this.frontier = [];
            this.state = [];
            for (var i = 0; i < this.rows; i++) {
                this.state[i] = [];
                for (var j = 0; j < this.columns; j++) {
                    //TODO: see if this can be optimized by calling the generator function (initializeMines) there
                    this.state[i][j] = new Square(i, j);
                }
            }
            var bomb_multiplier = 0;
            if (settings.difficulty == GameDifficulty.Easy) {
                bomb_multiplier = 0.1;
            }
            if (settings.difficulty == GameDifficulty.Medium) {
                bomb_multiplier = 0.3;
            }
            if (settings.difficulty == GameDifficulty.Hard) {
                bomb_multiplier = 0.5;
            }
            this.remaining_bombs_num = Math.floor((this.rows * this.columns) * bomb_multiplier);
            if (this.remaining_bombs_num <= 0)
                this.remaining_bombs_num = 1;
            this.initializeMines();
            if (settings.verbosity) {
                console.log("Playing on " + this.rows + " x " + this.columns + " board on " + settings.difficulty + " difficulty!");
            }
        };
        MinesweeperGame.prototype.updateAfterMove = function (s) {
            if (!s.discovered)
                return;
            //if (this.frontier.contains(s)) 
            //this.
        };
        MinesweeperGame.prototype.rotate90Clockwise = function (cover_state) {
            var rotatedState = 0;
        };
        MinesweeperGame.prototype.initializeMines = function () {
            //We take a random position on the board and if there is already a mine there, 
            // we check with another random position, until all mines are placed.
            //This ensures a more uniform distribution than going through all squares in any order 
            // and randomly placing the mines
            var i, rc, rr, bomb, should_repeat;
            var bombsLeftToFill = this.remaining_bombs_num;
            this.remaining_bombs = [];
            for (i = 0; i < bombsLeftToFill; i++) {
                should_repeat = true;
                while (should_repeat) {
                    rc = Math.floor(Math.random() * this.columns);
                    rr = Math.floor(Math.random() * this.rows);
                    should_repeat = false;
                    for (var _i = 0, _a = this.remaining_bombs; _i < _a.length; _i++) {
                        bomb = _a[_i];
                        if (bomb.location[0] === rc && bomb.location[1] === rr)
                            should_repeat = true;
                    }
                }
                ;
                var selected_square = this.state[rc][rr];
                selected_square.bombs = 10; //Is a bomb
                //Incrementing the adjacent squares' bomb count
                var adjacentSquares = this.getAdjacent(selected_square);
                for (var _b = 0, adjacentSquares_1 = adjacentSquares; _b < adjacentSquares_1.length; _b++) {
                    var sq = adjacentSquares_1[_b];
                    var X = sq.location[0];
                    var Y = sq.location[1];
                    if (this.state[X][Y].bombs !== 10)
                        this.state[X][Y].bombs++;
                }
                this.remaining_bombs.push(this.state[rc][rr]);
            }
        };
        MinesweeperGame.prototype.getAdjacent = function (s) {
            var adjacentSquares = [];
            var X = s.location[0];
            var Y = s.location[1];
            var max_rows = this.rows;
            var max_columns = this.columns;
            var current_state = this.state;
            function probe(x, y) {
                if (x >= 0 && x < max_columns && y >= 0 && y < max_rows)
                    adjacentSquares.push(current_state[x][y]);
            }
            probe(X - 1, Y - 1);
            probe(X - 1, Y);
            probe(X - 1, Y + 1);
            probe(X + 1, Y + 1);
            probe(X + 1, Y - 1);
            probe(X + 1, Y);
            probe(X, Y - 1);
            probe(X, Y + 1);
            return adjacentSquares;
        };
        return MinesweeperGame;
    }());
    Board.MinesweeperGame = MinesweeperGame;
})(Board = exports.Board || (exports.Board = {}));
