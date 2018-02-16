//test to see how two-dimensional arrays in JS can be appended
var SquareA = /** @class */ (function () {
    function SquareA(value) {
        if (value >= 0)
            this.value = value;
    }
    return SquareA;
}());
var BoardA = /** @class */ (function () {
    function BoardA(rowz, cols) {
        this.rows = rowz;
        this.columns = cols;
        for (var i = 0; i <= this.rows; i++)
            for (var j = 0; j <= this.columns; j++)
                this.state[i].push(new SquareA(0));
    }
    return BoardA;
}());
var board = new BoardA(2, 2);
console.log(board);
