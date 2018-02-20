(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mainfile_1 = require("./mainfile");
window.onload = function () {
    var settings = new mainfile_1.Board.GameSettings(mainfile_1.Board.GameDifficulty.Medium, 5, 5, true);
    mainfile_1.Board.MinesweeperGame.prototype.initializeBoard(settings);
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
        function GameSettings(diff, rows, columns, verbosity) {
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
            })

                
            }*/
        };
        return MinesweeperGame;
    }());
    Board.MinesweeperGame = MinesweeperGame;
})(Board = exports.Board || (exports.Board = {}));
},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyIsInNyYy9tYWluZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsdUNBQTJDO0FBRTNDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7SUFDWixJQUFJLFFBQVEsR0FBRyxJQUFJLGdCQUFLLENBQUMsWUFBWSxDQUFDLGdCQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRS9FLGdCQUFLLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7QUFHOUQsQ0FBQyxDQUFBOzs7QUNSRCx3Q0FBd0M7O0FBRXhDLElBQWMsS0FBSyxDQWlQbEI7QUFqUEQsV0FBYyxLQUFLO0lBQ2Y7UUFJSSx5REFBeUQ7UUFDekQsZ0NBQWdDO1FBQ2hDLDRCQUE0QjtRQUM1QixnQkFBWSxDQUFRLEVBQUUsQ0FBUTtZQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFFTCxhQUFDO0lBQUQsQ0FiQSxBQWFDLElBQUE7SUFFRDtRQUtJLHNCQUFhLElBQW1CLEVBQUUsSUFBVyxFQUFFLE9BQWMsRUFBRSxTQUFpQjtZQUM1RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMvQixDQUFDO1FBQ0wsbUJBQUM7SUFBRCxDQVhBLEFBV0MsSUFBQTtJQVhZLGtCQUFZLGVB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LCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiaW1wb3J0IHsgQm9hcmQgYXMgYm9hcmQgfSBmcm9tIFwiLi9tYWluZmlsZVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgc2V0dGluZ3MgPSBuZXcgYm9hcmQuR2FtZVNldHRpbmdzKGJvYXJkLkdhbWVEaWZmaWN1bHR5Lk1lZGl1bSwgNSwgNSwgdHJ1ZSk7XHJcblxyXG4gICAgYm9hcmQuTWluZXN3ZWVwZXJHYW1lLnByb3RvdHlwZS5pbml0aWFsaXplQm9hcmQoc2V0dGluZ3MpO1xyXG5cclxuICAgIFxyXG59XHJcblxyXG4iLCIvL2ltcG9ydCB7IEZ1bmN0aW9uIH0gZnJvbSBcIi4vbW9kdWxlLnRzXCJcblxuZXhwb3J0IG1vZHVsZSBCb2FyZCB7XG4gICAgY2xhc3MgU3F1YXJlIHtcbiAgICAgICAgZGlzY292ZXJlZDogYm9vbGVhbjtcbiAgICAgICAgbG9jYXRpb246IFtudW1iZXIsIG51bWJlcl07XG4gICAgICAgIGJvbWJzOiBudW1iZXI7XG4gICAgICAgIC8vYm9tYiAtIDAtOCBmb3IgaG93IG1hbnkgYm9tYnMgYXJlIGluIGFkamFjZW50IHNxdWFyZXMsIFxuICAgICAgICAvLyAgICAgICAgIDkgZm9yIHN0aWxsIHVuY292ZXJlZFxuICAgICAgICAvLyAgICAgICAgMTAgZm9yIGJvbWIgaXRzZWxmXG4gICAgICAgIGNvbnN0cnVjdG9yKHg6bnVtYmVyLCB5Om51bWJlcikge1xuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbiA9IFt4LHldO1xuICAgICAgICAgICAgdGhpcy5kaXNjb3ZlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmJvbWJzID0gMDsgXG4gICAgICAgIH1cbiAgICAgICAgLy9ERUJVRzogVEVTVD8gaWYgdW5jb3ZlcmVkIGFuZCBhIGJvbWIsIGVuZCB0aGUgZ2FtZVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBHYW1lU2V0dGluZ3Mge1xuICAgICAgICBkaWZmaWN1bHR5OiBHYW1lRGlmZmljdWx0eTtcbiAgICAgICAgcm93czogbnVtYmVyO1xuICAgICAgICBjb2x1bW5zOiBudW1iZXI7XG4gICAgICAgIHZlcmJvc2l0eTogYm9vbGVhbjtcbiAgICAgICAgY29uc3RydWN0b3IgKGRpZmY6R2FtZURpZmZpY3VsdHksIHJvd3M6bnVtYmVyLCBjb2x1bW5zOm51bWJlciwgdmVyYm9zaXR5OmJvb2xlYW4pIHtcbiAgICAgICAgICAgIHRoaXMuZGlmZmljdWx0eSA9IGRpZmY7XG4gICAgICAgICAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5zID0gY29sdW1ucztcbiAgICAgICAgICAgIHRoaXMudmVyYm9zaXR5ID0gdmVyYm9zaXR5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9ERUJVRzogVE9ETzogY2FuIGJlIG1vZGlmaWVkIHRvIHRha2UgY3VzdG9tIHNpemVzIGluIHRoZSBmdXR1cmVcbiAgICBleHBvcnQgZW51bSBHYW1lRGlmZmljdWx0eSB7XG4gICAgICAgIEVhc3ksICAgLy8gTWluZXMgeCAwLjFcbiAgICAgICAgTWVkaXVtLCAvLyBNaW5lcyB4IDAuM1xuICAgICAgICBIYXJkICAgIC8vIE1pbmVzIHggMC40XG4gICAgfSBcblxuICAgIGV4cG9ydCBjbGFzcyBNaW5lc3dlZXBlckdhbWUge1xuXG4gICAgICAgIHJvd3M6IG51bWJlcjtcbiAgICAgICAgY29sdW1uczogbnVtYmVyO1xuXG4gICAgICAgIHN0YXRlOiBTcXVhcmVbXVtdO1xuXG4gICAgICAgIC8vSW4gb3JkZXIgdG8gcG9wdWxhdGUgdGhlIG1pbmVzIGV2ZW5seSwgd2UgaGF2ZSB0byBnaXZlIHRoZSBmaXJzdCBtaW5lIGEgcmFuZG9tIHBvc2l0aW9uLCB0aGVuIHRoZSBuZXh0IG9uZSB0aGF0IGlzbid0IGZpbGxlZCxcbiAgICAgICAgLy9ldGMuIFNvIHdlIGhhdmUgdG8ga2VlcCBhIGxpc3Qgb2YgdGhlIHJlbWFpbmluZyBib21icyByYXRoZXIgdGhhbiBvbmx5IGNvbnRhaW5pbmcgdGhlaXIgY291bnRcbiAgICAgICAgcmVtYWluaW5nX2JvbWJzX251bTogbnVtYmVyO1xuICAgICAgICByZW1haW5pbmdfYm9tYnM6IFNxdWFyZVtdOyBcblxuICAgICAgICAvL1RoZXNlIGFyZSB0aGUgc3F1YXJlcyBhZGphY2VudCB0byB0aGUgZGlzY292ZXJlZCBvbmVzIGJ1dCBub3QgZGlzY292ZXJlZCB5ZXRcbiAgICAgICAgcHJpdmF0ZSBmcm9udGllcjogU3F1YXJlW107XG5cbiAgICAgICAgaXNfYm9tYjogYm9vbGVhbjtcbiAgICAgICAgY292ZXJlZDogYm9vbGVhbjtcbiAgICAgICAgLy9ERUJVRzogbm90IHN1cmUgaWYgd2UgbmVlZCB0aGlzLCBhbnl3YXksIFxuICAgICAgICAvLyAgIDAgZm9yIG5vdCBzdGFydGVkIHlldCwgXG4gICAgICAgIC8vICAgMSBmb3Igc3RhcnRlZCwgXG4gICAgICAgIC8vICAgMiBmb3IgbG9zcywgXG4gICAgICAgIC8vICAgMyBmb3Igd2luXG4gICAgICAgIGdhbWVfZW5kOiBudW1iZXI7XG4gICAgICAgIGNvdmVyX3N0YXRlOiBhbnk7XG4gICAgICAgIC8vY29uc3RydWN0b3Iocm93czogbnVtYmVyLCBjb2x1bW5zOiBudW1iZXIsIGNvdmVyX3N0YXRlOiBhbnkpXG4gICAgICAgIC8vcmVtYWluaW5nIG1pbmVzID0gTWF0aC5jZWlsKHJvd3MgKiBjb2x1bW5zICogZGlmZmljdWx0eSk7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioc2V0dGluZ3M6IEdhbWVTZXR0aW5ncykge1xuICAgICAgICAgICAgdGhpcy5yb3dzID0gc2V0dGluZ3Mucm93cztcbiAgICAgICAgICAgIHRoaXMuY29sdW1ucyA9IHNldHRpbmdzLmNvbHVtbnM7XG5cbiAgICAgICAgICAgIHRoaXMuZnJvbnRpZXIgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluaXRpYWxpemVCb2FyZChzZXR0aW5nczogR2FtZVNldHRpbmdzKSB7XG5cbiAgICAgICAgICAgIC8vVE9ETzogYWRkIHRlc3RzIGZvciB2YWxpZGl0eSBvZiBpbnB1dCBkYXRhLCBzaG91bGQ6XG5cbiAgICAgICAgICAgIC8vIC0gcm93cy9jb2x1bW5zID4gMFxuICAgICAgICAgICAgLy8gXG4gICAgICAgICAgICB0aGlzLnJvd3MgPSBzZXR0aW5ncy5yb3dzO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5zID0gc2V0dGluZ3MuY29sdW1ucztcblxuICAgICAgICAgICAgdGhpcy5mcm9udGllciA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93czsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZVtpXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5jb2x1bW5zOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBzZWUgaWYgdGhpcyBjYW4gYmUgb3B0aW1pemVkIGJ5IGNhbGxpbmcgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiAoaW5pdGlhbGl6ZU1pbmVzKSB0aGVyZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlW2ldW2pdID0gbmV3IFNxdWFyZShpLGopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGJvbWJfbXVsdGlwbGllciA9IDA7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuZGlmZmljdWx0eSA9PSBHYW1lRGlmZmljdWx0eS5FYXN5KSB7IFxuICAgICAgICAgICAgICAgIGJvbWJfbXVsdGlwbGllciA9IDAuMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmRpZmZpY3VsdHkgPT0gR2FtZURpZmZpY3VsdHkuTWVkaXVtKSB7XG4gICAgICAgICAgICAgICAgYm9tYl9tdWx0aXBsaWVyID0gMC4zO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuZGlmZmljdWx0eSA9PSBHYW1lRGlmZmljdWx0eS5IYXJkKSB7IFxuICAgICAgICAgICAgICAgIGJvbWJfbXVsdGlwbGllciA9IDAuNTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZW1haW5pbmdfYm9tYnNfbnVtID0gTWF0aC5mbG9vcigodGhpcy5yb3dzICogdGhpcy5jb2x1bW5zKSAqIGJvbWJfbXVsdGlwbGllcik7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdfYm9tYnNfbnVtIDw9IDApIHRoaXMucmVtYWluaW5nX2JvbWJzX251bSA9IDE7XG5cbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZU1pbmVzKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy52ZXJib3NpdHkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBsYXlpbmcgb24gXCIgKyB0aGlzLnJvd3MgKyBcIiB4IFwiICsgdGhpcy5jb2x1bW5zICsgXCIgYm9hcmQgb24gXCIgKyBzZXR0aW5ncy5kaWZmaWN1bHR5ICtcIiBkaWZmaWN1bHR5IVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGluaXRpYWxpemVNaW5lcygpIHtcblxuICAgICAgICAgICAgLy9XZSB0YWtlIGEgcmFuZG9tIHBvc2l0aW9uIG9uIHRoZSBib2FyZCBhbmQgaWYgdGhlcmUgaXMgYWxyZWFkeSBhIG1pbmUgdGhlcmUsIFxuICAgICAgICAgICAgLy8gd2UgY2hlY2sgd2l0aCBhbm90aGVyIHJhbmRvbSBwb3NpdGlvbiwgdW50aWwgYWxsIG1pbmVzIGFyZSBwbGFjZWQuXG4gICAgICAgICAgICAvL1RoaXMgZW5zdXJlcyBhIG1vcmUgdW5pZm9ybSBkaXN0cmlidXRpb24gdGhhbiBnb2luZyB0aHJvdWdoIGFsbCBzcXVhcmVzIGluIGFueSBvcmRlciBcbiAgICAgICAgICAgIC8vIGFuZCByYW5kb21seSBwbGFjaW5nIHRoZSBtaW5lc1xuICAgICAgICAgICAgbGV0IGksIHJjLCByciwgYm9tYiwgc2hvdWxkX3JlcGVhdDtcbiAgICAgICAgICAgIGxldCBib21ic0xlZnRUb0ZpbGwgPSB0aGlzLnJlbWFpbmluZ19ib21ic19udW07XG4gICAgICAgICAgICB0aGlzLnJlbWFpbmluZ19ib21icyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYm9tYnNMZWZ0VG9GaWxsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzaG91bGRfcmVwZWF0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChzaG91bGRfcmVwZWF0KSBcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJjID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5jb2x1bW5zKTtcbiAgICAgICAgICAgICAgICAgICAgcnIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnJvd3MpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkX3JlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZm9yIChib21iIG9mIHRoaXMucmVtYWluaW5nX2JvbWJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYm9tYi5sb2NhdGlvblswXSA9PT0gcmMgJiYgYm9tYi5sb2NhdGlvblsxXSA9PT0gcnIpIHNob3VsZF9yZXBlYXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRfc3F1YXJlID0gdGhpcy5zdGF0ZVtyY11bcnJdO1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkX3NxdWFyZS5ib21icyA9IDEwOyAvL0lzIGEgYm9tYlxuXG4gICAgICAgICAgICAgICAgLy9JbmNyZW1lbnRpbmcgdGhlIGFkamFjZW50IHNxdWFyZXMnIGJvbWIgY291bnRcbiAgICAgICAgICAgICAgICBsZXQgYWRqYWNlbnRTcXVhcmVzID0gdGhpcy5nZXRBZGphY2VudChzZWxlY3RlZF9zcXVhcmUpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHNxIG9mIGFkamFjZW50U3F1YXJlcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgWCA9IHNxLmxvY2F0aW9uWzBdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgWSA9IHNxLmxvY2F0aW9uWzFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZVtYXVtZXS5ib21icyAhPT0gMTApIHRoaXMuc3RhdGVbWF1bWV0uYm9tYnMrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVtYWluaW5nX2JvbWJzLnB1c2godGhpcy5zdGF0ZVtyY11bcnJdKTsgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgZ2V0QWRqYWNlbnQoczpTcXVhcmUpIHtcblxuICAgICAgICAgICAgbGV0IGFkamFjZW50U3F1YXJlczpTcXVhcmVbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IFggPSBzLmxvY2F0aW9uWzBdO1xuICAgICAgICAgICAgbGV0IFkgPSBzLmxvY2F0aW9uWzFdO1xuICAgICAgICAgICAgbGV0IG1heF9yb3dzID0gdGhpcy5yb3dzO1xuICAgICAgICAgICAgbGV0IG1heF9jb2x1bW5zID0gdGhpcy5jb2x1bW5zO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRfc3RhdGUgPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBwcm9iZSh4Om51bWJlciwgeTpudW1iZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoeCA+PSAwICYmIHggPCBtYXhfY29sdW1ucyAmJiB5ID49IDAgJiYgeSA8IG1heF9yb3dzKSBhZGphY2VudFNxdWFyZXMucHVzaChjdXJyZW50X3N0YXRlW3hdW3ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJvYmUoWCAtIDEsIFkgLSAxKTtcbiAgICAgICAgICAgIHByb2JlKFggLSAxLCBZKTtcbiAgICAgICAgICAgIHByb2JlKFggLSAxLCBZICsgMSk7XG4gICAgICAgICAgICBwcm9iZShYICsgMSwgWSArIDEpO1xuICAgICAgICAgICAgcHJvYmUoWCArIDEsIFkgLSAxKTtcbiAgICAgICAgICAgIHByb2JlKFggKyAxLCBZKTtcbiAgICAgICAgICAgIHByb2JlKFgsIFkgLSAxKTtcbiAgICAgICAgICAgIHByb2JlKFgsIFkgKyAxKTtcblxuICAgICAgICAgICAgcmV0dXJuIGFkamFjZW50U3F1YXJlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGdldEJvYXJkVmFsdWVzKCkge1xuICAgICAgICAgICAgbGV0IG5ld3N0YXRlID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCB0aGlzLnJvd3M7IHJvdysrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgdGhpcy5jb2x1bW5zOyBjb2wrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBtYXJraW5nIHRoZSB1bmNvdmVyZWQgdmFsdWVzIHdpdGggOVxuICAgICAgICAgICAgICAgICAgICAvLyBpcyBub3Qgc3VwZXJmbHVvdXMgKHRoZXJlJ3MgYSBib29sZWFuIGZsYWcgZm9yIHRoYXQpXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcSA9IHRoaXMuc3RhdGVbcm93XVtjb2xdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3EuZGlzY292ZXJlZCA9IGZhbHNlKSBuZXdzdGF0ZS5wdXNoKDkpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIG5ld3N0YXRlLnB1c2goc3EuYm9tYnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdzdGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IENoZWNrIGlmIHdlIGNhbiBvcHRpbWl6ZSB0aGUgcHJvY2VzcyBieSBub3QgdmlzaXRpbmdcbiAgICAgICAgLy8gY29uZmlndXJhdGlvbnMgdGhhdCBhcmUgc2ltcGx5IGEgcm90YXRlZCB2YXJpYW50cyBvZiBhIGxlYXJuZWQgb25lXG4gICAgICAgIHJvdGF0ZTkwQ2xvY2t3aXNlKGNvdmVyX3N0YXRlOiBhbnkpIHtcbiAgICAgICAgICAgIC8vIGxldCByb3RhdGVkU3RhdGUgPSBbXTtcbiAgICAgICAgICAgIC8vIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMucm93czsgcm93KyspIHtcbiAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmNvbHVtbnM7IGNvbCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJvdGF0ZWRTdGF0ZS5wdXNoKGNvdmVyX3N0YXRlW10pXG5cbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIC8vIHJldHVybiByb3RhdGVkU3RhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRGcm9udGllcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZyb250aWVyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9IZWxwZXIgZnVuY3Rpb24sIHJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IGluIFxuICAgICAgICBjb250YWluZWRBdChzcXVhcmVfbGlzdDpBcnJheTxTcXVhcmU+LCBzcXVhcmU6U3F1YXJlKSB7XG4gICAgICAgICAgICAvLyBmb3IgKGxldCBbc3EsIGluZGV4XSBvZiBzcXVhcmVfbGlzdC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIC8vICAgICBpZiAoc3EubG9jYXRpb25bMF0gPT09IHNxdWFyZS5sb2NhdGlvblswXSAmJiBcbiAgICAgICAgICAgIC8vICAgICAgICAgc3EubG9jYXRpb25bMV0gPT09IHNxdWFyZS5sb2NhdGlvblsxXSkgXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIHNxLlxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIC8vUmVjdXJzaXZlIG1ldGhvZCBmb3IgdXBkYXRpbmcgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGJvYXJkXG4gICAgICAgIHVwZGF0ZUJvYXJkQWZ0ZXJNb3ZlKHNlbGVjdGVkX3NxdWFyZTpTcXVhcmUpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZF9zcXVhcmUuZGlzY292ZXJlZCkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGZyb250ID0gdGhpcy5mcm9udGllcjtcblxuICAgICAgICAgICAgLyppZiBmcm9udC5zb21lKCBmdW5jdGlvbiAoc3EsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNxLmxvY2F0aW9uWzBdID09PSBzZWxlY3RlZF9zcXVhcmUubG9jYXRpb25bMF0gJiYgXG4gICAgICAgICAgICAgICAgICAgIHNxLmxvY2F0aW9uWzFdID09PSBzZWxlY3RlZF9zcXVhcmUubG9jYXRpb25bMV0pIFxuICAgICAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICB9XG5cblxufVxuIl19
