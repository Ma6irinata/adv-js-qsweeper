(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mainfile_1 = require("./mainfile");
window.onload = function () {
    var settings = new mainfile_1.Board.GameSettings(true, mainfile_1.Board.GameDifficulty.Medium, 5, 5, true);
    mainfile_1.Board.MinesweeperGame.prototype.initializeBoard(settings);
    //document.getElementById("board").
};
},{"./mainfile":2}],2:[function(require,module,exports){
"use strict";
//import { Function } from "./module.ts"
Object.defineProperty(exports, "__esModule", { value: true });
var Board;
(function (Board) {
    var Square = /** @class */ (function () {
        //bomb - 0-8 for how many bombs are in adjacent squares, 
        //         9 for still uncovered
        //        10 for bomb itself
        function Square(x, y) {
            this.location = [x, y];
            this.discovered = false;
            this.bombs = 0;
        }
        return Square;
    }());
    var GameSettings = /** @class */ (function () {
        function GameSettings(gameMode, diff, rows, columns, verbosity) {
            this.gameMode = gameMode;
            this.difficulty = diff;
            this.rows = rows;
            this.columns = columns;
            this.verbosity = verbosity;
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
            this.drawBoard(settings);
            if (settings.verbosity) {
                console.log("Playing on " + this.rows + " x " + this.columns + " board on " + settings.difficulty + " difficulty!");
            }
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
        MinesweeperGame.prototype.getBoardValues = function () {
            var newstate = [];
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.columns; col++) {
                    // TODO: check if marking the uncovered values with 9
                    // is not superfluous (there's a boolean flag for that)
                    var sq = this.state[row][col];
                    if (sq.discovered = false)
                        newstate.push(9);
                    else
                        newstate.push(sq.bombs);
                }
            }
            return newstate;
        };
        // TODO: Check if we can optimize the process by not visiting
        // configurations that are simply a rotated variants of a learned one
        MinesweeperGame.prototype.rotate90Clockwise = function (cover_state) {
            // let rotatedState = [];
            // for (let row = 0; row < this.rows; row++) {
            //     for (let col = 0; col < this.columns; col++) {
            //         rotatedState.push(cover_state[])
            //     }
            // }
            // return rotatedState;
        };
        MinesweeperGame.prototype.getFrontier = function () {
            return this.frontier;
        };
        //Helper function, returns the index of the element in 
        MinesweeperGame.prototype.containedAt = function (square_list, square) {
            // for (let [sq, index] of square_list.entries()) {
            //     if (sq.location[0] === square.location[0] && 
            //         sq.location[1] === square.location[1]) 
            //     return sq.
            // }
            // return -1;
        };
        //Recursive method for updating the current state of the board
        MinesweeperGame.prototype.updateBoardAfterMove = function (selected_square) {
            if (selected_square.discovered)
                return;
            var front = this.frontier;
            /*if front.some( function (sq, index) {
                if (sq.location[0] === selected_square.location[0] &&
                    sq.location[1] === selected_square.location[1])
                return index;
            }
            }*/
            //updateUI();
        };
        MinesweeperGame.prototype.updateUI = function () {
            // let table:HTMLTableElement = document.getElementById("SweeperGame");
            // let current_row = [];
            // if (table) {
            //     for (let row = 0; row < this.rows; row++) {
            //         for (let col = 0; col < this.columns; col++) {
            //             if (this.state[row][col].discovered) table.rows[row].cells[col].firstChild.nodeValue = this.state[row][col].bombs.toString();
            //             else table.rows[row].cells[col].innerHTML = "";
            //         }
            //     }
            // }
        };
        MinesweeperGame.prototype.drawBoard = function (settings) {
            var x, y, tr, td;
            var bbody = document.getElementById("board");
            bbody.innerHTML = "";
            var table = document.createElement("table");
            table.id = "SweeperGame";
            table.style.width = "100%";
            table.setAttribute('border', '1');
            var tbody = document.createElement("tbody");
            for (y = 0; y < settings.rows; y++) {
                tr = document.createElement('tr');
                for (x = 0; x < settings.columns; x++) {
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode(""));
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            bbody.appendChild(table);
        };
        MinesweeperGame.prototype.handleEvents = function () {
            var newGameBtn = document.getElementById("newGame");
            var settingsSection = document.getElementById("settings-panel");
            var rowsDecrCtrl = document.getElementById("rows-decr");
            var rowsIncrCtrl = document.getElementById("rows-incr");
            var colsDecrCtrl = document.getElementById("cols-decr");
            var colsIncrCtrl = document.getElementById("rows-incr");
            var rowsLabel = document.getElementById("settings_rows");
            var colsLabel = document.getElementById("settings_cols");
            settingsSection.addEventListener("onclick", function (e) {
                var target = e.target;
                var current_rows, current_cols;
                current_rows = parseInt(rowsLabel.innerHTML, 10);
                current_cols = parseInt(colsLabel.innerHTML, 10);
                if (target === rowsDecrCtrl) {
                    if (current_rows > 3)
                        rowsLabel.innerHTML = (--current_rows).toString();
                    return;
                }
                if (target === rowsIncrCtrl) {
                    if (current_rows < 150)
                        rowsLabel.innerHTML = (++current_rows).toString();
                    return;
                }
                if (target === colsDecrCtrl) {
                    if (current_cols > 3)
                        colsLabel.innerHTML = (--current_cols).toString();
                    return;
                }
                if (target === rowsIncrCtrl) {
                    if (current_cols < 150)
                        colsLabel.innerHTML = (++current_cols).toString();
                    return;
                }
                if (target === newGameBtn) {
                    var difficulty = document.getElementById("settings_difficulty").nodeValue;
                    var gameDifficulty = void 0;
                    if (difficulty === "Beginner")
                        gameDifficulty = Board.GameDifficulty.Easy;
                    if (difficulty === "Intermediate")
                        gameDifficulty = Board.GameDifficulty.Medium;
                    if (difficulty === "Expert")
                        gameDifficulty = Board.GameDifficulty.Hard;
                    var settings = new Board.GameSettings(true, gameDifficulty, current_rows, current_cols, false);
                    this.initializeBoard(settings);
                }
            });
        };
        return MinesweeperGame;
    }());
    Board.MinesweeperGame = MinesweeperGame;
})(Board = exports.Board || (exports.Board = {}));
},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyIsInNyYy9tYWluZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsdUNBQTJDO0FBRTNDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7SUFDWixJQUFJLFFBQVEsR0FBRyxJQUFJLGdCQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxnQkFBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVyRixnQkFBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBSzFELG1DQUFtQztBQUN2QyxDQUFDLENBQUE7OztBQ1hELHdDQUF3Qzs7QUFFeEMsSUFBaUIsS0FBSyxDQWlWckI7QUFqVkQsV0FBaUIsS0FBSztJQUNsQjtRQUlJLHlEQUF5RDtRQUN6RCxnQ0FBZ0M7UUFDaEMsNEJBQTRCO1FBQzVCLGdCQUFZLENBQVEsRUFBRSxDQUFRO1lBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUVMLGFBQUM7SUFBRCxDQWJBLEFBYUMsSUFBQTtJQUVEO1FBTUksc0JBQWEsUUFBaUIsRUFBRSxJQUFtQixFQUFFLElBQVcsRUFBRSxPQUFjLEVBQUUsU0FBaUI7WUFDL0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDL0IsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0FiQSxBQWFDLElBQUE7SUFiWSxrQkFBWSxlQWF4QixDQUFBO0lBRUQsaUVBQWlFO0lBQ2pFLElBQVksY0FJWDtJQUpELFdBQVksY0FBYztRQUN0QixtREFBSSxDQUFBO1FBQ0osdURBQU0sQ0FBQTtRQUNOLG1EQUFJLENBQUEsQ0FBSSxjQUFjO0lBQzFCLENBQUMsRUFKVyxjQUFjLEdBQWQsb0JBQWMsS0FBZCxvQkFBYyxRQUl6QjtJQUVEO1FBeUJJLDhEQUE4RDtRQUM5RCwyREFBMkQ7UUFFM0QseUJBQVksUUFBc0I7WUFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUVoQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQseUNBQWUsR0FBZixVQUFnQixRQUFzQjtZQUVsQyxxREFBcUQ7WUFFckQscUJBQXFCO1lBQ3JCLEdBQUc7WUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBRWhDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBRWhCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3BDLDhGQUE4RjtvQkFDOUYsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLGVBQWUsR0FBRyxHQUFHLENBQUM7WUFDMUIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLGVBQWUsR0FBRyxHQUFHLENBQUM7WUFDMUIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLGVBQWUsR0FBRyxHQUFHLENBQUM7WUFDMUIsQ0FBQztZQUVELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUM7WUFDcEYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixJQUFJLENBQUMsQ0FBQztnQkFBQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1lBRWhFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUV2QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXpCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVSxHQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3ZILENBQUM7UUFDTCxDQUFDO1FBRUQseUNBQWUsR0FBZjtZQUVJLCtFQUErRTtZQUMvRSxxRUFBcUU7WUFDckUsdUZBQXVGO1lBQ3ZGLGlDQUFpQztZQUNqQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUM7WUFDbkMsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1lBQy9DLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBRTFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUVuQyxhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUVyQixPQUFPLGFBQWEsRUFDcEIsQ0FBQztvQkFDRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUUzQyxhQUFhLEdBQUcsS0FBSyxDQUFDO29CQUV0QixHQUFHLENBQUMsQ0FBUyxVQUFvQixFQUFwQixLQUFBLElBQUksQ0FBQyxlQUFlLEVBQXBCLGNBQW9CLEVBQXBCLElBQW9CO3dCQUE1QixJQUFJLFNBQUE7d0JBQ0wsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7NEJBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztxQkFDaEY7Z0JBQ0wsQ0FBQztnQkFBQSxDQUFDO2dCQUNGLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pDLGVBQWUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsV0FBVztnQkFFdkMsK0NBQStDO2dCQUMvQyxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN4RCxHQUFHLENBQUMsQ0FBVyxVQUFlLEVBQWYsbUNBQWUsRUFBZiw2QkFBZSxFQUFmLElBQWU7b0JBQXpCLElBQUksRUFBRSx3QkFBQTtvQkFDUCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUM7d0JBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDL0Q7Z0JBRUwsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFFTCxDQUFDO1FBRUQscUNBQVcsR0FBWCxVQUFZLENBQVE7WUFFaEIsSUFBSSxlQUFlLEdBQVksRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3pCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDL0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUUvQixlQUFlLENBQVEsRUFBRSxDQUFRO2dCQUM3QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO29CQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkcsQ0FBQztZQUVELEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQixLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQixLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDcEIsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQixLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVoQixNQUFNLENBQUMsZUFBZSxDQUFDO1FBQzNCLENBQUM7UUFFRCx3Q0FBYyxHQUFkO1lBQ0ksSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO2dCQUN2QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztvQkFDMUMscURBQXFEO29CQUNyRCx1REFBdUQ7b0JBQ3ZELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO3dCQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLElBQUk7d0JBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDTCxDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNwQixDQUFDO1FBRUQsNkRBQTZEO1FBQzdELHFFQUFxRTtRQUNyRSwyQ0FBaUIsR0FBakIsVUFBa0IsV0FBZ0I7WUFDOUIseUJBQXlCO1lBQ3pCLDhDQUE4QztZQUM5QyxxREFBcUQ7WUFDckQsMkNBQTJDO1lBRTNDLFFBQVE7WUFDUixJQUFJO1lBRUosdUJBQXVCO1FBQzNCLENBQUM7UUFFRCxxQ0FBVyxHQUFYO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQztRQUVELHVEQUF1RDtRQUN2RCxxQ0FBVyxHQUFYLFVBQVksV0FBeUIsRUFBRSxNQUFhO1lBQ2hELG1EQUFtRDtZQUNuRCxvREFBb0Q7WUFDcEQsa0RBQWtEO1lBQ2xELGlCQUFpQjtZQUNqQixJQUFJO1lBQ0osYUFBYTtRQUNqQixDQUFDO1FBQ0QsOERBQThEO1FBQzlELDhDQUFvQixHQUFwQixVQUFxQixlQUFzQjtZQUN2QyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUN2QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBRTFCOzs7OztlQUtHO1lBQ0gsYUFBYTtRQUNqQixDQUFDO1FBRUQsa0NBQVEsR0FBUjtZQUNJLHVFQUF1RTtZQUN2RSx3QkFBd0I7WUFDeEIsZUFBZTtZQUNmLGtEQUFrRDtZQUNsRCx5REFBeUQ7WUFDekQsNElBQTRJO1lBQzVJLDhEQUE4RDtZQUM5RCxZQUFZO1lBQ1osUUFBUTtZQUNSLElBQUk7UUFDUixDQUFDO1FBRUQsbUNBQVMsR0FBVCxVQUFVLFFBQXFCO1lBQzNCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ2pCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxLQUFLLENBQUMsRUFBRSxHQUFDLGFBQWEsQ0FBQztZQUN2QixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDM0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEMsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7Z0JBQ2hDLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7b0JBQ25DLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDNUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELHNDQUFZLEdBQVo7WUFDSSxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BELElBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVoRSxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3hELElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEQsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN4RCxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3hELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekQsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUV6RCxlQUFlLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVMsQ0FBQztnQkFDbEQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsSUFBSSxZQUFZLEVBQUUsWUFBWSxDQUFDO2dCQUUvQixZQUFZLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELFlBQVksR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFakQsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQzFCLEVBQUUsQ0FBQSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7d0JBQ2hCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN0RCxNQUFNLENBQUM7Z0JBQ1gsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDMUIsRUFBRSxDQUFBLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQzt3QkFDbEIsU0FBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3RELE1BQU0sQ0FBQztnQkFDWCxDQUFDO2dCQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUEsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO3dCQUNoQixTQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDdEQsTUFBTSxDQUFDO2dCQUNYLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7b0JBQzFCLEVBQUUsQ0FBQSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7d0JBQ2xCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN0RCxNQUFNLENBQUM7Z0JBQ1gsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQztvQkFDMUUsSUFBSSxjQUFjLFNBQXFCLENBQUM7b0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUM7d0JBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO29CQUMxRSxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssY0FBYyxDQUFDO3dCQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQztvQkFDaEYsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQzt3QkFBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7b0JBRXhFLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLFlBQVksQ0FDakMsSUFBSSxFQUNKLGNBQWMsRUFDZCxZQUFZLEVBQ1osWUFBWSxFQUNaLEtBQUssQ0FDUixDQUFDO29CQUNGLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ25DLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTCxzQkFBQztJQUFELENBeFNBLEFBd1NDLElBQUE7SUF4U1kscUJBQWUsa0JBd1MzQixDQUFBO0FBR0wsQ0FBQyxFQWpWZ0IsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBaVZyQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiaW1wb3J0IHsgQm9hcmQgYXMgYm9hcmQgfSBmcm9tIFwiLi9tYWluZmlsZVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2V0dGluZ3MgPSBuZXcgYm9hcmQuR2FtZVNldHRpbmdzKHRydWUsIGJvYXJkLkdhbWVEaWZmaWN1bHR5Lk1lZGl1bSwgNSwgNSwgdHJ1ZSk7XHJcblxyXG4gICAgYm9hcmQuTWluZXN3ZWVwZXJHYW1lLnByb3RvdHlwZS5pbml0aWFsaXplQm9hcmQoc2V0dGluZ3MpO1xyXG5cclxuICAgIFxyXG5cclxuICAgIFxyXG4gICAgLy9kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpLlxyXG59XHJcblxyXG4iLCIvL2ltcG9ydCB7IEZ1bmN0aW9uIH0gZnJvbSBcIi4vbW9kdWxlLnRzXCJcblxuZXhwb3J0IG5hbWVzcGFjZSBCb2FyZCB7XG4gICAgY2xhc3MgU3F1YXJlIHtcbiAgICAgICAgZGlzY292ZXJlZDogYm9vbGVhbjtcbiAgICAgICAgbG9jYXRpb246IFtudW1iZXIsIG51bWJlcl07XG4gICAgICAgIGJvbWJzOiBudW1iZXI7XG4gICAgICAgIC8vYm9tYiAtIDAtOCBmb3IgaG93IG1hbnkgYm9tYnMgYXJlIGluIGFkamFjZW50IHNxdWFyZXMsIFxuICAgICAgICAvLyAgICAgICAgIDkgZm9yIHN0aWxsIHVuY292ZXJlZFxuICAgICAgICAvLyAgICAgICAgMTAgZm9yIGJvbWIgaXRzZWxmXG4gICAgICAgIGNvbnN0cnVjdG9yKHg6bnVtYmVyLCB5Om51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbiA9IFt4LHldO1xuICAgICAgICAgICAgdGhpcy5kaXNjb3ZlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmJvbWJzID0gMDsgXG4gICAgICAgIH1cbiAgICAgICAgLy9ERUJVRzogVEVTVD8gaWYgdW5jb3ZlcmVkIGFuZCBhIGJvbWIsIGVuZCB0aGUgZ2FtZVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBHYW1lU2V0dGluZ3Mge1xuICAgICAgICBnYW1lTW9kZTogYm9vbGVhbjsgLy8wIGZvciBzcGVjdGF0aW5nLCAxIGZvciByZWFsIHBsYXlcbiAgICAgICAgZGlmZmljdWx0eTogR2FtZURpZmZpY3VsdHk7XG4gICAgICAgIHJvd3M6IG51bWJlcjtcbiAgICAgICAgY29sdW1uczogbnVtYmVyO1xuICAgICAgICB2ZXJib3NpdHk6IGJvb2xlYW47XG4gICAgICAgIGNvbnN0cnVjdG9yIChnYW1lTW9kZTogYm9vbGVhbiwgZGlmZjpHYW1lRGlmZmljdWx0eSwgcm93czpudW1iZXIsIGNvbHVtbnM6bnVtYmVyLCB2ZXJib3NpdHk6Ym9vbGVhbikge1xuICAgICAgICAgICAgdGhpcy5nYW1lTW9kZSA9IGdhbWVNb2RlO1xuICAgICAgICAgICAgdGhpcy5kaWZmaWN1bHR5ID0gZGlmZjtcbiAgICAgICAgICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbnMgPSBjb2x1bW5zO1xuICAgICAgICAgICAgdGhpcy52ZXJib3NpdHkgPSB2ZXJib3NpdHk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL0RFQlVHOiBUT0RPOiBjYW4gYmUgbW9kaWZpZWQgdG8gdGFrZSBjdXN0b20gc2l6ZXMgaW4gdGhlIGZ1dHVyZVxuICAgIGV4cG9ydCBlbnVtIEdhbWVEaWZmaWN1bHR5IHtcbiAgICAgICAgRWFzeSwgICAvLyBNaW5lcyB4IDAuMVxuICAgICAgICBNZWRpdW0sIC8vIE1pbmVzIHggMC4zXG4gICAgICAgIEhhcmQgICAgLy8gTWluZXMgeCAwLjRcbiAgICB9IFxuXG4gICAgZXhwb3J0IGNsYXNzIE1pbmVzd2VlcGVyR2FtZSB7XG5cbiAgICAgICAgXG4gICAgICAgIHJvd3M6IG51bWJlcjtcbiAgICAgICAgY29sdW1uczogbnVtYmVyO1xuXG4gICAgICAgIHN0YXRlOiBTcXVhcmVbXVtdO1xuXG4gICAgICAgIC8vSW4gb3JkZXIgdG8gcG9wdWxhdGUgdGhlIG1pbmVzIGV2ZW5seSwgd2UgaGF2ZSB0byBnaXZlIHRoZSBmaXJzdCBtaW5lIGEgcmFuZG9tIHBvc2l0aW9uLCB0aGVuIHRoZSBuZXh0IG9uZSB0aGF0IGlzbid0IGZpbGxlZCxcbiAgICAgICAgLy9ldGMuIFNvIHdlIGhhdmUgdG8ga2VlcCBhIGxpc3Qgb2YgdGhlIHJlbWFpbmluZyBib21icyByYXRoZXIgdGhhbiBvbmx5IGNvbnRhaW5pbmcgdGhlaXIgY291bnRcbiAgICAgICAgcmVtYWluaW5nX2JvbWJzX251bTogbnVtYmVyO1xuICAgICAgICByZW1haW5pbmdfYm9tYnM6IFNxdWFyZVtdOyBcblxuICAgICAgICAvL1RoZXNlIGFyZSB0aGUgc3F1YXJlcyBhZGphY2VudCB0byB0aGUgZGlzY292ZXJlZCBvbmVzIGJ1dCBub3QgZGlzY292ZXJlZCB5ZXRcbiAgICAgICAgcHJpdmF0ZSBmcm9udGllcjogU3F1YXJlW107XG5cbiAgICAgICAgaXNfYm9tYjogYm9vbGVhbjtcbiAgICAgICAgY292ZXJlZDogYm9vbGVhbjtcbiAgICAgICAgLy9ERUJVRzogbm90IHN1cmUgaWYgd2UgbmVlZCB0aGlzLCBhbnl3YXksIFxuICAgICAgICAvLyAgIDAgZm9yIG5vdCBzdGFydGVkIHlldCwgXG4gICAgICAgIC8vICAgMSBmb3Igc3RhcnRlZCwgXG4gICAgICAgIC8vICAgMiBmb3IgbG9zcywgXG4gICAgICAgIC8vICAgMyBmb3Igd2luXG4gICAgICAgIGdhbWVfZW5kOiBudW1iZXI7XG4gICAgICAgIGNvdmVyX3N0YXRlOiBhbnk7XG4gICAgICAgIC8vY29uc3RydWN0b3Iocm93czogbnVtYmVyLCBjb2x1bW5zOiBudW1iZXIsIGNvdmVyX3N0YXRlOiBhbnkpXG4gICAgICAgIC8vcmVtYWluaW5nIG1pbmVzID0gTWF0aC5jZWlsKHJvd3MgKiBjb2x1bW5zICogZGlmZmljdWx0eSk7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2V0dGluZ3M6IEdhbWVTZXR0aW5ncykge1xuICAgICAgICAgICAgdGhpcy5yb3dzID0gc2V0dGluZ3Mucm93cztcbiAgICAgICAgICAgIHRoaXMuY29sdW1ucyA9IHNldHRpbmdzLmNvbHVtbnM7XG5cbiAgICAgICAgICAgIHRoaXMuZnJvbnRpZXIgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluaXRpYWxpemVCb2FyZChzZXR0aW5nczogR2FtZVNldHRpbmdzKSB7XG5cbiAgICAgICAgICAgIC8vVE9ETzogYWRkIHRlc3RzIGZvciB2YWxpZGl0eSBvZiBpbnB1dCBkYXRhLCBzaG91bGQ6XG5cbiAgICAgICAgICAgIC8vIC0gcm93cy9jb2x1bW5zID4gMFxuICAgICAgICAgICAgLy8gXG4gICAgICAgICAgICB0aGlzLnJvd3MgPSBzZXR0aW5ncy5yb3dzO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5zID0gc2V0dGluZ3MuY29sdW1ucztcblxuICAgICAgICAgICAgdGhpcy5mcm9udGllciA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93czsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZVtpXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5jb2x1bW5zOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBzZWUgaWYgdGhpcyBjYW4gYmUgb3B0aW1pemVkIGJ5IGNhbGxpbmcgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiAoaW5pdGlhbGl6ZU1pbmVzKSB0aGVyZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlW2ldW2pdID0gbmV3IFNxdWFyZShpLGopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGJvbWJfbXVsdGlwbGllciA9IDA7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuZGlmZmljdWx0eSA9PSBHYW1lRGlmZmljdWx0eS5FYXN5KSB7IFxuICAgICAgICAgICAgICAgIGJvbWJfbXVsdGlwbGllciA9IDAuMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmRpZmZpY3VsdHkgPT0gR2FtZURpZmZpY3VsdHkuTWVkaXVtKSB7XG4gICAgICAgICAgICAgICAgYm9tYl9tdWx0aXBsaWVyID0gMC4zO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuZGlmZmljdWx0eSA9PSBHYW1lRGlmZmljdWx0eS5IYXJkKSB7IFxuICAgICAgICAgICAgICAgIGJvbWJfbXVsdGlwbGllciA9IDAuNTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZW1haW5pbmdfYm9tYnNfbnVtID0gTWF0aC5mbG9vcigodGhpcy5yb3dzICogdGhpcy5jb2x1bW5zKSAqIGJvbWJfbXVsdGlwbGllcik7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdfYm9tYnNfbnVtIDw9IDApIHRoaXMucmVtYWluaW5nX2JvbWJzX251bSA9IDE7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZU1pbmVzKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhd0JvYXJkKHNldHRpbmdzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnZlcmJvc2l0eSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUGxheWluZyBvbiBcIiArIHRoaXMucm93cyArIFwiIHggXCIgKyB0aGlzLmNvbHVtbnMgKyBcIiBib2FyZCBvbiBcIiArIHNldHRpbmdzLmRpZmZpY3VsdHkgK1wiIGRpZmZpY3VsdHkhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5pdGlhbGl6ZU1pbmVzKCkge1xuXG4gICAgICAgICAgICAvL1dlIHRha2UgYSByYW5kb20gcG9zaXRpb24gb24gdGhlIGJvYXJkIGFuZCBpZiB0aGVyZSBpcyBhbHJlYWR5IGEgbWluZSB0aGVyZSwgXG4gICAgICAgICAgICAvLyB3ZSBjaGVjayB3aXRoIGFub3RoZXIgcmFuZG9tIHBvc2l0aW9uLCB1bnRpbCBhbGwgbWluZXMgYXJlIHBsYWNlZC5cbiAgICAgICAgICAgIC8vVGhpcyBlbnN1cmVzIGEgbW9yZSB1bmlmb3JtIGRpc3RyaWJ1dGlvbiB0aGFuIGdvaW5nIHRocm91Z2ggYWxsIHNxdWFyZXMgaW4gYW55IG9yZGVyIFxuICAgICAgICAgICAgLy8gYW5kIHJhbmRvbWx5IHBsYWNpbmcgdGhlIG1pbmVzXG4gICAgICAgICAgICBsZXQgaSwgcmMsIHJyLCBib21iLCBzaG91bGRfcmVwZWF0O1xuICAgICAgICAgICAgbGV0IGJvbWJzTGVmdFRvRmlsbCA9IHRoaXMucmVtYWluaW5nX2JvbWJzX251bTtcbiAgICAgICAgICAgIHRoaXMucmVtYWluaW5nX2JvbWJzID0gW107XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBib21ic0xlZnRUb0ZpbGw7IGkrKykge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNob3VsZF9yZXBlYXQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHNob3VsZF9yZXBlYXQpIFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmNvbHVtbnMpO1xuICAgICAgICAgICAgICAgICAgICByciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMucm93cyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzaG91bGRfcmVwZWF0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBmb3IgKGJvbWIgb2YgdGhpcy5yZW1haW5pbmdfYm9tYnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChib21iLmxvY2F0aW9uWzBdID09PSByYyAmJiBib21iLmxvY2F0aW9uWzFdID09PSBycikgc2hvdWxkX3JlcGVhdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZF9zcXVhcmUgPSB0aGlzLnN0YXRlW3JjXVtycl07XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRfc3F1YXJlLmJvbWJzID0gMTA7IC8vSXMgYSBib21iXG5cbiAgICAgICAgICAgICAgICAvL0luY3JlbWVudGluZyB0aGUgYWRqYWNlbnQgc3F1YXJlcycgYm9tYiBjb3VudFxuICAgICAgICAgICAgICAgIGxldCBhZGphY2VudFNxdWFyZXMgPSB0aGlzLmdldEFkamFjZW50KHNlbGVjdGVkX3NxdWFyZSk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3Egb2YgYWRqYWNlbnRTcXVhcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBYID0gc3EubG9jYXRpb25bMF07XG4gICAgICAgICAgICAgICAgICAgIGxldCBZID0gc3EubG9jYXRpb25bMV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlW1hdW1ldLmJvbWJzICE9PSAxMCkgdGhpcy5zdGF0ZVtYXVtZXS5ib21icysrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZW1haW5pbmdfYm9tYnMucHVzaCh0aGlzLnN0YXRlW3JjXVtycl0pOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICBnZXRBZGphY2VudChzOlNxdWFyZSkge1xuXG4gICAgICAgICAgICBsZXQgYWRqYWNlbnRTcXVhcmVzOlNxdWFyZVtdID0gW107XG4gICAgICAgICAgICBsZXQgWCA9IHMubG9jYXRpb25bMF07XG4gICAgICAgICAgICBsZXQgWSA9IHMubG9jYXRpb25bMV07XG4gICAgICAgICAgICBsZXQgbWF4X3Jvd3MgPSB0aGlzLnJvd3M7XG4gICAgICAgICAgICBsZXQgbWF4X2NvbHVtbnMgPSB0aGlzLmNvbHVtbnM7XG4gICAgICAgICAgICBsZXQgY3VycmVudF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHByb2JlKHg6bnVtYmVyLCB5Om51bWJlcikge1xuICAgICAgICAgICAgICAgIGlmICh4ID49IDAgJiYgeCA8IG1heF9jb2x1bW5zICYmIHkgPj0gMCAmJiB5IDwgbWF4X3Jvd3MpIGFkamFjZW50U3F1YXJlcy5wdXNoKGN1cnJlbnRfc3RhdGVbeF1beV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcm9iZShYIC0gMSwgWSAtIDEpO1xuICAgICAgICAgICAgcHJvYmUoWCAtIDEsIFkpO1xuICAgICAgICAgICAgcHJvYmUoWCAtIDEsIFkgKyAxKTtcbiAgICAgICAgICAgIHByb2JlKFggKyAxLCBZICsgMSk7XG4gICAgICAgICAgICBwcm9iZShYICsgMSwgWSAtIDEpO1xuICAgICAgICAgICAgcHJvYmUoWCArIDEsIFkpO1xuICAgICAgICAgICAgcHJvYmUoWCwgWSAtIDEpO1xuICAgICAgICAgICAgcHJvYmUoWCwgWSArIDEpO1xuXG4gICAgICAgICAgICByZXR1cm4gYWRqYWNlbnRTcXVhcmVzO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0Qm9hcmRWYWx1ZXMoKSB7XG4gICAgICAgICAgICBsZXQgbmV3c3RhdGUgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMucm93czsgcm93KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmNvbHVtbnM7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIG1hcmtpbmcgdGhlIHVuY292ZXJlZCB2YWx1ZXMgd2l0aCA5XG4gICAgICAgICAgICAgICAgICAgIC8vIGlzIG5vdCBzdXBlcmZsdW91cyAodGhlcmUncyBhIGJvb2xlYW4gZmxhZyBmb3IgdGhhdClcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNxID0gdGhpcy5zdGF0ZVtyb3ddW2NvbF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcS5kaXNjb3ZlcmVkID0gZmFsc2UpIG5ld3N0YXRlLnB1c2goOSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgbmV3c3RhdGUucHVzaChzcS5ib21icyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld3N0YXRlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogQ2hlY2sgaWYgd2UgY2FuIG9wdGltaXplIHRoZSBwcm9jZXNzIGJ5IG5vdCB2aXNpdGluZ1xuICAgICAgICAvLyBjb25maWd1cmF0aW9ucyB0aGF0IGFyZSBzaW1wbHkgYSByb3RhdGVkIHZhcmlhbnRzIG9mIGEgbGVhcm5lZCBvbmVcbiAgICAgICAgcm90YXRlOTBDbG9ja3dpc2UoY292ZXJfc3RhdGU6IGFueSkge1xuICAgICAgICAgICAgLy8gbGV0IHJvdGF0ZWRTdGF0ZSA9IFtdO1xuICAgICAgICAgICAgLy8gZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5yb3dzOyByb3crKykge1xuICAgICAgICAgICAgLy8gICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHRoaXMuY29sdW1uczsgY29sKyspIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgcm90YXRlZFN0YXRlLnB1c2goY292ZXJfc3RhdGVbXSlcblxuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgLy8gcmV0dXJuIHJvdGF0ZWRTdGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldEZyb250aWVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZnJvbnRpZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvL0hlbHBlciBmdW5jdGlvbiwgcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgaW4gXG4gICAgICAgIGNvbnRhaW5lZEF0KHNxdWFyZV9saXN0OkFycmF5PFNxdWFyZT4sIHNxdWFyZTpTcXVhcmUpIHtcbiAgICAgICAgICAgIC8vIGZvciAobGV0IFtzcSwgaW5kZXhdIG9mIHNxdWFyZV9saXN0LmVudHJpZXMoKSkge1xuICAgICAgICAgICAgLy8gICAgIGlmIChzcS5sb2NhdGlvblswXSA9PT0gc3F1YXJlLmxvY2F0aW9uWzBdICYmIFxuICAgICAgICAgICAgLy8gICAgICAgICBzcS5sb2NhdGlvblsxXSA9PT0gc3F1YXJlLmxvY2F0aW9uWzFdKSBcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gc3EuXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgLy9SZWN1cnNpdmUgbWV0aG9kIGZvciB1cGRhdGluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYm9hcmRcbiAgICAgICAgdXBkYXRlQm9hcmRBZnRlck1vdmUoc2VsZWN0ZWRfc3F1YXJlOlNxdWFyZSkge1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkX3NxdWFyZS5kaXNjb3ZlcmVkKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgZnJvbnQgPSB0aGlzLmZyb250aWVyO1xuXG4gICAgICAgICAgICAvKmlmIGZyb250LnNvbWUoIGZ1bmN0aW9uIChzcSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3EubG9jYXRpb25bMF0gPT09IHNlbGVjdGVkX3NxdWFyZS5sb2NhdGlvblswXSAmJiBcbiAgICAgICAgICAgICAgICAgICAgc3EubG9jYXRpb25bMV0gPT09IHNlbGVjdGVkX3NxdWFyZS5sb2NhdGlvblsxXSkgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgfSovXG4gICAgICAgICAgICAvL3VwZGF0ZVVJKCk7XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVVSSgpIHtcbiAgICAgICAgICAgIC8vIGxldCB0YWJsZTpIVE1MVGFibGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJTd2VlcGVyR2FtZVwiKTtcbiAgICAgICAgICAgIC8vIGxldCBjdXJyZW50X3JvdyA9IFtdO1xuICAgICAgICAgICAgLy8gaWYgKHRhYmxlKSB7XG4gICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5yb3dzOyByb3crKykge1xuICAgICAgICAgICAgLy8gICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmNvbHVtbnM7IGNvbCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZVtyb3ddW2NvbF0uZGlzY292ZXJlZCkgdGFibGUucm93c1tyb3ddLmNlbGxzW2NvbF0uZmlyc3RDaGlsZC5ub2RlVmFsdWUgPSB0aGlzLnN0YXRlW3Jvd11bY29sXS5ib21icy50b1N0cmluZygpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgZWxzZSB0YWJsZS5yb3dzW3Jvd10uY2VsbHNbY29sXS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG5cbiAgICAgICAgZHJhd0JvYXJkKHNldHRpbmdzOkdhbWVTZXR0aW5ncykge1xuICAgICAgICAgICAgbGV0IHgsIHksIHRyLCB0ZDtcbiAgICAgICAgICAgIGxldCBiYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRcIik7XG4gICAgICAgICAgICBiYm9keS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRhYmxlXCIpO1xuICAgICAgICAgICAgdGFibGUuaWQ9XCJTd2VlcGVyR2FtZVwiO1xuICAgICAgICAgICAgdGFibGUuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHRhYmxlLnNldEF0dHJpYnV0ZSgnYm9yZGVyJywgJzEnKTtcbiAgICAgICAgICAgIGxldCB0Ym9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0Ym9keVwiKTtcbiAgICAgICAgICAgIGZvciAoeSA9IDA7IHkgPCBzZXR0aW5ncy5yb3dzOyB5Kyspe1xuICAgICAgICAgICAgICAgIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICAgICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgc2V0dGluZ3MuY29sdW1uczsgeCsrKXtcbiAgICAgICAgICAgICAgICAgICAgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICAgICAgICAgICAgICB0ZC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKSk7XG4gICAgICAgICAgICAgICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGJvZHkuYXBwZW5kQ2hpbGQodHIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZS5hcHBlbmRDaGlsZCh0Ym9keSk7XG4gICAgICAgICAgICBiYm9keS5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBoYW5kbGVFdmVudHMoKSB7XG4gICAgICAgICAgICBsZXQgbmV3R2FtZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3R2FtZVwiKTtcbiAgICAgICAgICAgIGxldCBzZXR0aW5nc1NlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNldHRpbmdzLXBhbmVsXCIpO1xuXG4gICAgICAgICAgICBsZXQgcm93c0RlY3JDdHJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb3dzLWRlY3JcIik7XG4gICAgICAgICAgICBsZXQgcm93c0luY3JDdHJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb3dzLWluY3JcIik7XG4gICAgICAgICAgICBsZXQgY29sc0RlY3JDdHJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb2xzLWRlY3JcIik7XG4gICAgICAgICAgICBsZXQgY29sc0luY3JDdHJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb3dzLWluY3JcIik7XG4gICAgICAgICAgICBsZXQgcm93c0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZXR0aW5nc19yb3dzXCIpO1xuICAgICAgICAgICAgbGV0IGNvbHNMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2V0dGluZ3NfY29sc1wiKTtcblxuICAgICAgICAgICAgc2V0dGluZ3NTZWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoXCJvbmNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRfcm93cywgY3VycmVudF9jb2xzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGN1cnJlbnRfcm93cyA9IHBhcnNlSW50KHJvd3NMYWJlbC5pbm5lckhUTUwsIDEwKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50X2NvbHMgPSBwYXJzZUludChjb2xzTGFiZWwuaW5uZXJIVE1MLCAxMCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09PSByb3dzRGVjckN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudF9yb3dzID4gMykgXG4gICAgICAgICAgICAgICAgICAgICAgICByb3dzTGFiZWwuaW5uZXJIVE1MID0gKC0tY3VycmVudF9yb3dzKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IHJvd3NJbmNyQ3RybCkge1xuICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50X3Jvd3MgPCAxNTApIFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93c0xhYmVsLmlubmVySFRNTCA9ICgrK2N1cnJlbnRfcm93cykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBjb2xzRGVjckN0cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudF9jb2xzID4gMykgXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xzTGFiZWwuaW5uZXJIVE1MID0gKC0tY3VycmVudF9jb2xzKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IHJvd3NJbmNyQ3RybCkge1xuICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50X2NvbHMgPCAxNTApIFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sc0xhYmVsLmlubmVySFRNTCA9ICgrK2N1cnJlbnRfY29scykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBuZXdHYW1lQnRuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkaWZmaWN1bHR5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZXR0aW5nc19kaWZmaWN1bHR5XCIpLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVEaWZmaWN1bHR5OkJvYXJkLkdhbWVEaWZmaWN1bHR5O1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGlmZmljdWx0eSA9PT0gXCJCZWdpbm5lclwiKSBnYW1lRGlmZmljdWx0eSA9IEJvYXJkLkdhbWVEaWZmaWN1bHR5LkVhc3k7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaWZmaWN1bHR5ID09PSBcIkludGVybWVkaWF0ZVwiKSBnYW1lRGlmZmljdWx0eSA9IEJvYXJkLkdhbWVEaWZmaWN1bHR5Lk1lZGl1bTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpZmZpY3VsdHkgPT09IFwiRXhwZXJ0XCIpIGdhbWVEaWZmaWN1bHR5ID0gQm9hcmQuR2FtZURpZmZpY3VsdHkuSGFyZDtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgc2V0dGluZ3MgPSBuZXcgQm9hcmQuR2FtZVNldHRpbmdzKFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVEaWZmaWN1bHR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9yb3dzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplQm9hcmQoc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgfVxuXG5cbn1cbiJdfQ==
