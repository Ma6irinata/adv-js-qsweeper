//import { Function } from "./module.ts"

export module Board {
    class Square {
        discovered: boolean;
        location: [number, number];
        bombs: number;
        //bomb - 0-8 for how many bombs are in adjacent squares, 
        //         9 for still uncovered
        //        10 for bomb itself
        constructor(x:number, y:number) {
            this.location = [x,y];
            this.discovered = false;
            this.bombs = 0; 
        }
        //DEBUG: TEST? if uncovered and a bomb, end the game
    }

    export class GameSettings {
        difficulty: GameDifficulty;
        rows: number;
        columns: number;
        verbosity: boolean;
        constructor (diff:GameDifficulty, rows:number, columns:number, verbosity:boolean) {
            this.difficulty = diff;
            this.rows = rows;
            this.columns = columns;
            this.verbosity = verbosity;
        }
    }

    //DEBUG: TODO: can be modified to take custom sizes in the future
    export enum GameDifficulty {
        Easy,   // Mines x 0.1
        Medium, // Mines x 0.3
        Hard    // Mines x 0.4
    } 

    export class MinesweeperGame {

        rows: number;
        columns: number;

        state: Square[][];

        //In order to populate the mines evenly, we have to give the first mine a random position, then the next one that isn't filled,
        //etc. So we have to keep a list of the remaining bombs rather than only containing their count
        remaining_bombs_num: number;
        remaining_bombs: Square[]; 

        //These are the squares adjacent to the discovered ones but not discovered yet
        private frontier: Square[];

        is_bomb: boolean;
        covered: boolean;
        //DEBUG: not sure if we need this, anyway, 
        //   0 for not started yet, 
        //   1 for started, 
        //   2 for loss, 
        //   3 for win
        game_end: number;
        cover_state: any;
        //constructor(rows: number, columns: number, cover_state: any)
        //remaining mines = Math.ceil(rows * columns * difficulty);

        constructor(settings: GameSettings) {
            this.rows = settings.rows;
            this.columns = settings.columns;

            this.frontier = [];
        }

        initializeBoard(settings: GameSettings) {

            //TODO: add tests for validity of input data, should:

            // - rows/columns > 0
            // 
            this.rows = settings.rows;
            this.columns = settings.columns;

            this.frontier = [];
            this.state = [];

            for (let i = 0; i < this.rows; i++) {
                this.state[i] = [];
                for (let j = 0; j < this.columns; j++) {
                    //TODO: see if this can be optimized by calling the generator function (initializeMines) there
                    this.state[i][j] = new Square(i,j);
                }
            }

            let bomb_multiplier = 0;
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
            if (this.remaining_bombs_num <= 0) this.remaining_bombs_num = 1;

            this.initializeMines();
            
            if (settings.verbosity) {
                console.log("Playing on " + this.rows + " x " + this.columns + " board on " + settings.difficulty +" difficulty!");
            }
        }

        initializeMines() {

            //We take a random position on the board and if there is already a mine there, 
            // we check with another random position, until all mines are placed.
            //This ensures a more uniform distribution than going through all squares in any order 
            // and randomly placing the mines
            let i, rc, rr, bomb, should_repeat;
            let bombsLeftToFill = this.remaining_bombs_num;
            this.remaining_bombs = [];

            for (i = 0; i < bombsLeftToFill; i++) {
                
                should_repeat = true;

                while (should_repeat) 
                {
                    rc = Math.floor(Math.random() * this.columns);
                    rr = Math.floor(Math.random() * this.rows);
                    
                    should_repeat = false;
                    
                    for (bomb of this.remaining_bombs) {
                        if (bomb.location[0] === rc && bomb.location[1] === rr) should_repeat = true;
                    }
                };
                let selected_square = this.state[rc][rr];
                selected_square.bombs = 10; //Is a bomb

                //Incrementing the adjacent squares' bomb count
                let adjacentSquares = this.getAdjacent(selected_square);
                for (let sq of adjacentSquares) {
                    let X = sq.location[0];
                    let Y = sq.location[1];
                    if (this.state[X][Y].bombs !== 10) this.state[X][Y].bombs++;
                }

            this.remaining_bombs.push(this.state[rc][rr]);   
            }
            
        }

        getAdjacent(s:Square) {

            let adjacentSquares:Square[] = [];
            let X = s.location[0];
            let Y = s.location[1];
            let max_rows = this.rows;
            let max_columns = this.columns;
            let current_state = this.state;

            function probe(x:number, y:number) {
                if (x >= 0 && x < max_columns && y >= 0 && y < max_rows) adjacentSquares.push(current_state[x][y]);
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
        }

        getBoardValues() {
            let newstate = [];
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.columns; col++) {
                    // TODO: check if marking the uncovered values with 9
                    // is not superfluous (there's a boolean flag for that)
                    let sq = this.state[row][col];
                    if (sq.discovered = false) newstate.push(9);
                    else newstate.push(sq.bombs);
                }
            }
            return newstate;
        }

        // TODO: Check if we can optimize the process by not visiting
        // configurations that are simply a rotated variants of a learned one
        rotate90Clockwise(cover_state: any) {
            // let rotatedState = [];
            // for (let row = 0; row < this.rows; row++) {
            //     for (let col = 0; col < this.columns; col++) {
            //         rotatedState.push(cover_state[])

            //     }
            // }

            // return rotatedState;
        }

        getFrontier() {
            return this.frontier;
        }

        //Helper function, returns the index of the element in 
        containedAt(square_list:Array<Square>, square:Square) {
            // for (let [sq, index] of square_list.entries()) {
            //     if (sq.location[0] === square.location[0] && 
            //         sq.location[1] === square.location[1]) 
            //     return sq.
            // }
            // return -1;
        }
        //Recursive method for updating the current state of the board
        updateBoardAfterMove(selected_square:Square) {
            if (selected_square.discovered) return;
            let front = this.frontier;

            /*if front.some( function (sq, index) {
                if (sq.location[0] === selected_square.location[0] && 
                    sq.location[1] === selected_square.location[1]) 
                return index;
            })

                
            }*/
            
            
            
        }

    }


}
