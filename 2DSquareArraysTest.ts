<<<<<<< HEAD
//test to see how two-dimensional arrays in JS can be appended

class SquareA {
    value: number;
    constructor(val:number) {
        if (val >= 0) this.value = val;
    }
}

class BoardA {
    rows: number;
    columns: number;
    state: SquareA[][]; // other def: SquareA[][];
    constructor(rowz: number,cols: number){
        this.rows = rowz;
        this.columns = cols;
        for (let i = 0; i <= this.rows; i++)
            for (let j = 0; j <= this.columns; j++)
                this.state[i].push(new SquareA(0));
    }
}

var board = new BoardA(2,2);
console.log(board);
=======
//test to see how two-dimensional arrays in JS can be appended

class SquareA {
    value: number;
    constructor(val:number) {
        if (val >= 0) this.value = val;
    }
}

class BoardA {
    rows: number;
    columns: number;
    state: SquareA[][]; // other def: SquareA[][];
    constructor(rowz: number,cols: number){
        this.rows = rowz;
        this.columns = cols;
        for (let i = 0; i <= this.rows; i++)
            for (let j = 0; j <= this.columns; j++)
                this.state[i].push(new SquareA(0));
    }
}

var board = new BoardA(2,2);
console.log(board);
>>>>>>> d0ae080a3edbf4cb51c618f3291e06ee1f895986
