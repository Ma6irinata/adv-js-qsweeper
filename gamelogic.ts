class Square {
    discovered: boolean;
    location: Location;
    bombs: number;
    //bomb - 0-8 for how many bombs are in adjacent squares, 10 for bomb itself
    constructor(numbomb: number, loc: Location) {
        this.location = loc;
        this.discovered = false;
        this.bombs = numbomb; 
    }
    //DEBUG: TEST? if uncovered and a bomb, end the game
}

class GameSettings {
    difficulty: GameDifficulty;
    rows: number;
    columns: number;
    verbosity: boolean;
}

class Location {
    x: number;
    y: number;
}


//DEBUG: TODO: can be modified to take custom sizes in the future
enum GameDifficulty {
    Easy,   // Mines x 0.1
    Medium, // Mines x 0.3
    Hard    // Mines x 0.4
} 

let Sq = new Square(0, [1,0]);

class Minesweeper {

    rows: number;
    columns: number;


    squares: Array<Array<Square>>;

    //In order to populate the mines evenly, we have to give the first mine a random position, then the next one that isn't filled,
    //etc. So we have to keep a list of the remaining bombs rather than only containing their count
    remaining_bombs: Array<Square>; 

    is_bomb: boolean;
    covered: boolean;
    //DEBUG: not sure if we need this, anyway, 
    //   0 for not started yet, 
    //   1 for started, 
    //   2 for loss, 
    //   3 for win
    game_end: number;
    frontier: Array<Square>;
    cover_state: any;
    //constructor(rows: number, columns: number, cover_state: any)
    //remaining mines = Math.ceil(rows * columns * difficulty);

    initialize(settings: GameSettings) {
        this.rows = settings.rows;
        this.columns = settings.columns;

        this.squares = [][];
        this.frontier = [];

        for ( let row = 0; row <= this.rows; row++) {
            this.squares.append([]);
        }

    }

    getCoverState() {
        let cover_state = [];
        for ( let row = 0; row <= this.rows; row++ )
            for (let column = 0; column <= this.columns; column++ ) {
                let current_square = this.squares[][]
            }

    }

    rotate90Clockwise(cover_state: any) {
        let rotatedState: any = 0;
        for ()
    }

    initializeMines() {
        //Math.floor(Math.random() * ) 
        //let bombs: any = Math.ceil()() 
    }

    fillBombAtRandomPosition() {
        let rr = Math.floor(Math.random() * this.columns);
        let rc = Math.floor(Math.random() * this.rows);

        for (let i = 0; i <= this.remaining_bombs.length; i++) {
            if (this.remaining_bombs[i].location)
        }
        
    }



}
