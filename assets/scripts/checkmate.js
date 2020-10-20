class Board {
    constructor() {
        this.size = 8;
        this.board = new Array(this.size);
        this.whites = [];
        this.blacks = [];
        this.whiteKing = {};
        this.blackKing = {};
        this.lastMovedFigure = {};

        for (let i = 0; i < this.size; i++) {
            this.board[i] = new Array(this.size)
        }
        this.init();
    }

    init() {
        const figuresOrder = ['Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Bishop', 'Knight', 'Rook'];
        const pawn = "Pawn";
        let color = "black";

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (i < 2) {
                    if (i == 1) {
                        this.board[i][j] = new Pawn(i, j, color, pawn);
                    }
                    else {
                        this.board[i][j] = this.returnInstant(i, j, color, figuresOrder);
                    }
                    this.blacks.push(this.board[i][j]);
                }
                else if (i > 5) {
                    color = "white";
                    if (i == 6) {
                        this.board[i][j] = new Pawn(i, j, color, pawn);
                    }
                    else {
                        this.board[i][j] = this.returnInstant(i, j, color, figuresOrder);
                    }

                    this.whites.push(this.board[i][j]);
                }
                else {
                    this.board[i][j] = null;
                }

                if (!this.isCellEmpty(i, j)) {
                    this.setCellPossibleMoves(i, j);
                }
            }
        }
    }
    checkMate(color) {
        return !this.isAnyPossibleMove(this.getOpponentFigures(color));
    }

    isAnyPossibleMove(figs) {
        for (let i = 0; i < figs.length; i++) {
            this.setCellPossibleMoves(figs[i].row, figs[i].col);
            if (this.getCellPossibleMoves(figs[i].row, figs[i].col).length > 0) {
                return true;
            }
        }
        return false;
    }

    staleMate(color) {

        if (!this.isAnyPossibleMove(this.getOpponentFigures(color))) {
            return true;
        }

        return false;
    }

    checkSufficency() {
        if (this.blacks.length == 2 && this.whites.length == 2) {
            let current = this.blacks;

            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < current.length; j++) {
                    if (current[j].type == "Pawn" || current[j].type == "Queen" || current[j].type == "Rook") {
                        return true;
                    }
                }
                current = this.whites;
            }
            return false;
        }
        return true;
    }

    show() {
        let str = "";
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.isCellEmpty(i, j) ? str += "o " : this.getCellColor(i, j) == "white" ? str += "w " : str += "b ";
            }
            str += "\n";
        }
        console.log(str);
    }

    returnInstant(row, col, color, types) {
        switch (col) {
            case 0:
            case 7: {
                return new Rook(row, col, color, types[col]);
            }
            case 1:
            case 6: {
                return new Knight(row, col, color, types[col]);
            }
            case 2:
            case 5: {
                return new Bishop(row, col, color, types[col]);
            }
            case 3:
                return new Queen(row, col, color, types[col]);
            case 4:
                if (color == "black") {
                    this.blackKing = { row: row, col: col }
                }
                else {
                    this.whiteKing = { row: row, col: col }
                }
                return new King(row, col, color, types[col]);
            default:
                return null;
        }
    }
    deteleFigure(row, col) {
        if (this.board[row][col].getColor() == "white") {
            this.whites.splice(this.whites.indexOf(this.board[row][col]), 1);
        }
        else {
            this.blacks.splice(this.blacks.indexOf(this.board[row][col]), 1);
        }
    }

    setCellPossibleMoves(row, col) {
        this.board[row][col].setPossibleMoves(this);
    }

    isCellEmpty(row, col) {
        return this.board[row][col] == null;
    }

    removeOwnKingCheckedMoves(cellRow, cellCol, color, moves) {
        let saveObject = null;
        let king = this.isKing(cellRow, cellCol);


        for (let i = 0; i < moves.length; i++) {
            let { row, col } = moves[i];

            if (king) {
                if (color == "white") {
                    this.whiteKing.row = row;
                    this.whiteKing.col = col;
                }
                else {
                    this.blackKing.row = row;
                    this.blackKing.col = col;
                }
            }


            saveObject = this.board[row][col];

            this.board[row][col] = this.board[cellRow][cellCol];
            this.board[cellRow][cellCol].row = row;
            this.board[cellRow][cellCol].col = col;
            this.board[cellRow][cellCol] = null;


            if (!this.isOwnKingSafe(color)) {
                moves.splice(i, 1);
                i--;
            }

            this.board[cellRow][cellCol] = this.board[row][col];
            this.board[row][col].row = cellRow;
            this.board[row][col].col = cellCol;
            this.board[cellRow][cellCol].possibleMoves = [...moves];


            this.board[row][col] = saveObject

            if (king) {
                if (color == "white") {
                    this.whiteKing.row = cellRow;
                    this.whiteKing.col = cellCol;
                }
                else {
                    this.blackKing.row = cellRow;
                    this.blackKing.col = cellCol;
                }
            }
        }
    }
    promote(type, row, col, color) {
        let ownFigs = this.getOwnFigures(color);
        ownFigs.splice(ownFigs.indexOf(this.board[row][col]), 1);

        this.board[row][col] = this.getInstantOfType(type, row, col, color);

        ownFigs.push(this.board[row][col]);
    }

    getLastMove() {
        return {
            fromRow: this.lastMovedFigure.from.row,
            fromCol: this.lastMovedFigure.from.col,
            toRow: this.lastMovedFigure.to.row,
            toCol: this.lastMovedFigure.to.col,
        }
    }

    isCellMoved(row, col) {
        if (this.isCellEmpty(row, col)) {
            return null;
        }
        return this.board[row][col].isMoved();
    }

    getOppositeColor(color) {
        if (color == "white")
            return "black";
        return "white";
    }

    getInstantOfType(type, row, col, color) {
        switch (type) {
            case "Rook":
                return new Rook(row, col, color, type);
            case "Knight":
                return new Knight(row, col, color, type);
            case "BIshop":
                return new Bishop(row, col, color, type);
            case "Queen":
                return new Queen(row, col, color, type);
            default:
                return null;
        }
    }

    setCastlingToKingAsPossibleMove(king, move) {
        this.board[king.row][king.col].setCastlingAsPossibleMove(move);
    }

    isPossibleCellMove(row, col, newRow, newCol) {
        return this.board[row][col].isPossibleMove(newRow, newCol);
    }

    getCellPossibleMoves(row, col) {
        return this.board[row][col].getPossibleMoves(this);
    }
    isCellCheckingOpponentKing(color) {
        let { row, col } = this.getOpponentKing(color);
        let figures = this.getOwnFigures(color);

        for (let i = 0; i < figures.length; i++) {
            if (this.board[figures[i].row][figures[i].col].isCheckingOpponentKing(this, row, col)) {
                return true;
            }
        }

        return false;
    }

    isOwnKingSafe(color) {
        return !this.isCellCheckingOpponentKing(this.getOppositeColor(color));
    }

    getOpponentKing(color) {
        if (color == "white") {
            return this.getBlackKing();
        }

        return this.getWhiteKing();
    }

    getOpponentFigures(color) {
        if (color == "black") {
            return this.whites;
        }

        return this.blacks;
    }

    getOwnFigures(color) {
        return this.getOpponentFigures(this.getOppositeColor(color));
    }

    getOwnKing(color) {
        return this.getOpponentKing(this.getOppositeColor(color));
    }

    isOwnKingMoved(color) {
        let { row, col } = this.getOwnKing(color);

        return this.board[row][col].isMoved();
    }

    isCastlingPossible(color) {
        if (this.isOwnKingMoved(color) || this.isOwnKingCastled(color) || !this.isAnyOwnRookNotMoved(color)) {
            return false;
        }

        let king = this.getOwnKing(color);


        if (!this.isAnyFigureBetween({ row: king.row, col: king.col - 4 }, king)) {
            if (!this.board[king.row][king.col].isInPossibleMoves({ row: king.row, col: king.col - 1 })) {
                return false;
            }
            this.setCastlingToKingAsPossibleMove(king, { row: king.row, col: king.col - 2 })
        }
        if (!this.isAnyFigureBetween({ row: king.row, col: king.col + 3 }, king)) {
            if (!this.board[king.row][king.col].isInPossibleMoves({ row: king.row, col: king.col + 1 })) {
                return false;
            }
            this.setCastlingToKingAsPossibleMove(king, { row: king.row, col: king.col + 2 })
        }

        return true;
    }
    isMoveCastling(currentPos, newPos) {
        return Math.abs(currentPos.col - newPos.col) == 2;
    }
    isMoveEnPassant(currentPos, newPos) {
        if (this.isPawn(currentPos.row, currentPos.col)) {
            if (currentPos.col != newPos.col) {
                return true;
            }
        }

        return false;
    }
    isAnyFigureBetween(rook, king) {
        let col = rook.col + 1;
        let endCol = king.col;

        if (rook.col > king.col) {
            col = king.col + 1;
            endCol = rook.col;
        }

        for (col; col < endCol; col++) {
            if (!this.isCellEmpty(king.row, col)) {
                return true;
            }
        }
        return false;
    }

    isAnyOwnRookNotMoved(color) {
        let { row, col } = this.getOwnKing(color);

        return !this.isCellMoved(row, col - 4) || !this.isCellMoved(row, col + 3)
    }

    isEnPassantPossible(row, col, color) {
        if (!this.lastMovedFigure || !this.lastMovedFigure.didDoubleStep || !this.isPawn(row, col)) {
            return false;
        }

        if (color == this.lastMovedFigure.figure.color) {
            return false;
        }


        if (Math.abs(col - this.lastMovedFigure.figure.col) == 1 && this.lastMovedFigure.figure.row == row) {
            let change = color == "white" ? -1 : 1;

            if (this.isCellEmpty(row + change, this.lastMovedFigure.figure.col)) {
                let move = { row: row + change, col: this.lastMovedFigure.figure.col }
                if (!this.board[row][col].isInPossibleMoves(move)) {
                    this.board[row][col].setEnPassantAsPossibleMove(move);
                }
                else {
                    return true;
                }
            }
        }

        return false;
    }
    enPassant(row, col, color, change) {
        let oppFigs = this.getOpponentFigures(color);
        oppFigs.splice(oppFigs.indexOf(this.board[row + change][col]), 1);
        this.board[row + change][col] = null;

    }

    isOwnKingCastled(color) {
        let { row, col } = this.getOwnKing(color);

        return this.board[row][col].isCastled();
    }

    isOwnKingChecked(color) {
        let { row, col } = this.getOwnKing(color);

        return this.board[row][col].isChecked();
    }

    getBlackKing() {
        return { row: this.blackKing.row, col: this.blackKing.col };
    }

    getWhiteKing() {
        return { row: this.whiteKing.row, col: this.whiteKing.col };
    }

    setToCheckedOpponentKing(color) {
        let { row, col } = this.getOpponentKing(color);

        this.board[row][col].setChecked();
    }

    setToUncheckedOwntKing(color) {
        let { row, col } = this.getOwnKing(color);

        this.board[row][col].setUncheked();
    }

    getCellProperty(row, col) {
        if (this.isCellEmpty(row, col)) {
            return null;
        }

        return {
            color: this.board[row][col].getColor(), type: this.board[row][col].getType()
        }
    }

    getCellColor(row, col) {
        if (this.isCellEmpty(row, col)) {
            return false;
        }

        return this.board[row][col].getColor();
    }

    isOwnKing(selectedRow, selectedCol, color) {
        let { row, col } = board.getOwnKing(color);

        return selectedRow == row && selectedCol == col;
    }

    isKing(row, col) {
        return (this.whiteKing.row == row && this.whiteKing.col == col) || (this.blackKing.row == row && this.blackKing.col == col);
    }

    isPawn(row, col) {
        return this.board[row][col] instanceof Pawn;
    }

    isPawnReachedEightsRank(row, col) {
        return this.board[row][col].isReachedEightsRank();
    }

    getCastlingRook(position) {
        if (position.col == 2) {
            return { row: position.row, col: 0 };
        }
        return { row: position.row, col: this.size - 1 };

    }

    castle(king, newPos) {
        let { row, col } = this.getCastlingRook(newPos);
        let rookNewPos = { row: row };

        if (newPos.col < king.col) {
            this.board[newPos.row][newPos.col + 1] = this.board[row][col];
            this.board[row][col].move(newPos.row, newPos.col + 1);
            rookNewPos.col = newPos.col + 1;
        }
        else {
            this.board[newPos.row][newPos.col - 1] = this.board[row][col];
            this.board[row][col].move(newPos.row, newPos.col - 1);
            rookNewPos.col = newPos.col - 1;

        }

        this.updateKingPosition(this.getCellColor(row, col), newPos.row, newPos.col);

        this.board[newPos.row][newPos.col] = this.board[king.row][king.col];
        this.board[king.row][king.col].move(newPos.row, newPos.col);
        this.board[king.row][king.col] = null;
        this.board[row][col] = null;



        return rookNewPos;
    }

    moveCell(row, col, newRow, newCol) {
        this.lastMovedFigure = { figure: this.board[row][col], from: { row: row, col: col }, to: { row: newRow, col: newCol } };

        if (this.isKing(row, col)) {
            this.updateKingPosition(this.getCellColor(row, col), newRow, newCol);
        }
        if (this.isPawn(row, col)) {
            if (this.board[row][col].isDoubleStep(newRow)) {
                this.board[row][col].setDoubleStep();
                this.lastMovedFigure.didDoubleStep = true;
            }
        }

        this.board[newRow][newCol] = this.board[row][col];
        this.board[row][col].move(newRow, newCol);
        this.board[row][col] = null;
    }

    updateKingPosition(color, newRow, newCol) {
        if (color == "white") {
            this.whiteKing = { row: newRow, col: newCol };
        }
        else {
            this.blackKing = { row: newRow, col: newCol };
        }
    }
}


class Figure {
    constructor(row, col, color, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.color = color;
        this.moved = false;
        this.possibleMoves = [];
    }

    isInPossibleMoves(move) {
        return this.possibleMoves.some(posMove => posMove.row == move.row && posMove.col == move.col);
    }

    isCheckingOpponentKing(board, row, col) {
        this.setPossibleMoves(board);

        for (let i = 0; i < this.possibleMoves.length; i++) {
            if (row == this.possibleMoves[i].row && col == this.possibleMoves[i].col) {
                return true;
            }
        }
        return false;
    }

    setToMoved() {
        this.moved = true;
    }

    setPossibleMoves(board) {
    }

    removeFromPossibleMoves(unwantedMove) {
        this.possibleMoves.splice(this.possibleMoves.indexOf(unwantedMove), 1);
    }

    getPossibleMoves(board) {
        board.isEnPassantPossible(this.row, this.col, this.color);
        board.removeOwnKingCheckedMoves(this.row, this.col, this.color, this.possibleMoves);
        board.isCastlingPossible(this.color);

        return this.possibleMoves;
    }

    getColor() {
        return this.color;
    }

    getType() {
        return this.type;
    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }

    isMoved() {
        return this.moved;
    }

    isPossibleMove(newRow, newCol) {
        for (let i = 0; i < this.possibleMoves.length; i++) {
            let { row, col } = this.possibleMoves[i];
            if (row == newRow && col == newCol) {
                return true;
            }
        }

        return false;
    }

    move(row, col) {
        this.row = row;
        this.col = col;

        this.setToMoved();
    }
}


class King extends Figure {
    constructor(row, col, color, type) {
        super(row, col, color, type);
        this.checked = false;
        this.castled = false;
    }
    setPossibleMoves(board) {
        this.possibleMoves = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if ((i == 0 && j == 0) || this.row + i < 0 || this.col + j < 0 || this.row + i == board.size || this.col + j == board.size) {
                    continue;
                }

                if (board.getCellColor(this.row + i, this.col + j) != this.color) {
                    this.possibleMoves.push({ row: this.row + i, col: this.col + j })
                }
            }
        }

    }
    setCastlingAsPossibleMove(move) {
        this.possibleMoves.push(move);
    }

    isChecked() {
        return this.checked;
    }
    setChecked() {
        this.checked = true;
    }
    setUncheked() {
        this.checked = false;
    }
    isCastled() {
        return this.castled;
    }
    setCastled() {
        this.castled = true;
    }
}

class Queen extends Figure {
    constructor(row, col, color, type) {
        super(row, col, color, type);
    }


    setPossibleMoves(board) {
        this.possibleMoves = [];

        let cRow = this.row + 1;
        let cCol = this.col + 1;

        while (cRow < board.size && cCol < board.size && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow++, col: cCol++ });
        }

        if (cRow < board.size && cCol < board.size) {
            if (board.getCellColor(cRow, cCol) != this.color) {
                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }

        cRow = this.row - 1;
        cCol = this.col + 1;

        while (cRow >= 0 && cCol < board.size && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow--, col: cCol++ });
        }

        if (cRow >= 0 && cCol < board.size) {
            if (board.getCellColor(cRow, cCol) != this.color) {
                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }

        cRow = this.row + 1;
        cCol = this.col - 1;

        while (cRow < board.size && cCol >= 0 && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow++, col: cCol-- });
        }

        if (cRow < board.size && cCol >= 0) {
            if (board.getCellColor(cRow, cCol) != this.color) {

                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }

        cRow = this.row - 1;
        cCol = this.col - 1;

        while (cRow >= 0 && cCol >= 0 && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow--, col: cCol-- });
        }

        if (cRow >= 0 && cCol >= 0) {
            if (board.getCellColor(cRow, cCol) != this.color) {

                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }


        cRow = this.row - 1;
        cCol = this.col - 1;


        while (cRow >= 0 && board.isCellEmpty(cRow, this.col)) {
            this.possibleMoves.push({ row: cRow--, col: this.col });
        }

        if (cRow >= 0) {
            if (board.getCellColor(cRow, this.col) != this.color) {
                this.possibleMoves.push({ row: cRow, col: this.col });
            }
        }

        cRow = this.row + 1;
        while (cRow < board.size && board.isCellEmpty(cRow, this.col)) {

            this.possibleMoves.push({ row: cRow++, col: this.col });
        }
        if (cRow < board.size) {
            if (board.getCellColor(cRow, this.col) != this.color) {

                this.possibleMoves.push({ row: cRow, col: this.col });
            }
        }

        while (cCol >= 0 && board.isCellEmpty(this.row, cCol)) {
            this.possibleMoves.push({ row: this.row, col: cCol-- });
        }
        if (cCol >= 0) {
            if (board.getCellColor(this.row, cCol) != this.color) {
                this.possibleMoves.push({ row: this.row, col: cCol });
            }
        }

        cCol = this.col + 1;
        while (cCol < board.size && board.isCellEmpty(this.row, cCol)) {
            this.possibleMoves.push({ row: this.row, col: cCol++ });
        }
        if (cCol < board.size) {
            if (board.getCellColor(this.row, cCol) != this.color) {
                this.possibleMoves.push({ row: this.row, col: cCol });
            }
        }
    }
}

class Bishop extends Figure {
    constructor(row, col, color, type) {
        super(row, col, color, type);
    }

    setPossibleMoves(board) {
        this.possibleMoves = [];

        let cRow = this.row + 1;
        let cCol = this.col + 1;

        while (cRow < board.size && cCol < board.size && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow++, col: cCol++ });
        }

        if (cRow < board.size && cCol < board.size) {
            if (board.getCellColor(cRow, cCol) != this.color) {
                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }

        cRow = this.row - 1;
        cCol = this.col + 1;

        while (cRow >= 0 && cCol < board.size && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow--, col: cCol++ });
        }

        if (cRow >= 0 && cCol < board.size) {
            if (board.getCellColor(cRow, cCol) != this.color) {
                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }

        cRow = this.row + 1;
        cCol = this.col - 1;

        while (cRow < board.size && cCol >= 0 && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow++, col: cCol-- });
        }

        if (cRow < board.size && cCol >= 0) {
            if (board.getCellColor(cRow, cCol) != this.color) {

                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }

        cRow = this.row - 1;
        cCol = this.col - 1;

        while (cRow >= 0 && cCol >= 0 && board.isCellEmpty(cRow, cCol)) {
            this.possibleMoves.push({ row: cRow--, col: cCol-- });
        }

        if (cRow >= 0 && cCol >= 0) {
            if (board.getCellColor(cRow, cCol) != this.color) {

                this.possibleMoves.push({ row: cRow, col: cCol });
            }
        }
    }
}

class Knight extends Figure {
    constructor(row, col, color, type) {
        super(row, col, color, type);
    }

    setPossibleMoves(board) {
        this.possibleMoves = [];
        if (this.row > 0) {
            if (this.col > 1) {
                if (board.getCellColor(this.row - 1, this.col - 2) != this.color) {
                    this.possibleMoves.push({ row: this.row - 1, col: this.col - 2 });
                }
            }
            if (this.col < board.size - 2) {
                if (board.getCellColor(this.row - 1, this.col + 2) != this.color) {
                    this.possibleMoves.push({ row: this.row - 1, col: this.col + 2 });
                }
            }
        }

        if (this.row > 1) {
            if (this.col > 0) {
                if (board.getCellColor(this.row - 2, this.col - 1) != this.color) {
                    this.possibleMoves.push({ row: this.row - 2, col: this.col - 1 });
                }
            }
            if (this.col < board.size - 1) {
                if (board.getCellColor(this.row - 2, this.col + 1) != this.color) {
                    this.possibleMoves.push({ row: this.row - 2, col: this.col + 1 });
                }
            }
        }

        if (this.row < board.size - 1) {
            if (this.col > 1) {
                if (board.getCellColor(this.row + 1, this.col - 2) != this.color) {
                    this.possibleMoves.push({ row: this.row + 1, col: this.col - 2 });
                }
            }
            if (this.col < board.size - 2) {
                if (board.getCellColor(this.row + 1, this.col + 2) != this.color) {
                    this.possibleMoves.push({ row: this.row + 1, col: this.col + 2 });
                }
            }
        }

        if (this.row < board.size - 2) {
            if (this.col > 0) {
                if (board.getCellColor(this.row + 2, this.col - 1) != this.color) {
                    this.possibleMoves.push({ row: this.row + 2, col: this.col - 1 });
                }
            }
            if (this.col < board.size - 1) {
                if (board.getCellColor(this.row + 2, this.col + 1) != this.color) {
                    this.possibleMoves.push({ row: this.row + 2, col: this.col + 1 });
                }
            }
        }
    }
}

class Rook extends Figure {
    constructor(row, col, color, type) {
        super(row, col, color, type);
    }


    setPossibleMoves(board) {
        this.possibleMoves = [];

        let cRow = this.row - 1;
        let cCol = this.col - 1;


        while (cRow >= 0 && board.isCellEmpty(cRow, this.col)) {
            this.possibleMoves.push({ row: cRow--, col: this.col });
        }

        if (cRow >= 0) {
            if (board.getCellColor(cRow, this.col) != this.color) {
                this.possibleMoves.push({ row: cRow, col: this.col });
            }
        }

        cRow = this.row + 1;
        while (cRow < board.size && board.isCellEmpty(cRow, this.col)) {

            this.possibleMoves.push({ row: cRow++, col: this.col });
        }
        if (cRow < board.size) {
            if (board.getCellColor(cRow, this.col) != this.color) {

                this.possibleMoves.push({ row: cRow, col: this.col });
            }
        }

        while (cCol >= 0 && board.isCellEmpty(this.row, cCol)) {
            this.possibleMoves.push({ row: this.row, col: cCol-- });
        }
        if (cCol >= 0) {
            if (board.getCellColor(this.row, cCol) != this.color) {
                this.possibleMoves.push({ row: this.row, col: cCol });
            }
        }

        cCol = this.col + 1;
        while (cCol < board.size && board.isCellEmpty(this.row, cCol)) {
            this.possibleMoves.push({ row: this.row, col: cCol++ });
        }
        if (cCol < board.size) {
            if (board.getCellColor(this.row, cCol) != this.color) {
                this.possibleMoves.push({ row: this.row, col: cCol });
            }
        }
    }
}

class Pawn extends Figure {
    constructor(row, col, color, type) {
        super(row, col, color, type);
        this.didDoubleStep = false;
    }
    isDoubleStep(row) {
        return Math.abs(this.row - row) == 2
    }
    setDoubleStep() {
        this.didDoubleStep = true;
    }
    isReachedEightsRank() {
        return this.row == 0 || this.row == 7;
    }
    setEnPassantAsPossibleMove(move) {
        this.possibleMoves.push(move);
    }

    setPossibleMoves(board) {
        this.possibleMoves = [];

        let change = this.color == "black" ? 1 : -1;

        if (this.row + change < board.size && this.row + change >= 0 && board.isCellEmpty(this.row + change, this.col)) {

            if (this.row + change * 2 < board.size && this.row + change * 2 >= 0 && !board.isCellMoved(this.row, this.col) && board.isCellEmpty(this.row + change * 2, this.col)) {
                this.possibleMoves.push({ row: this.row + change * 2, col: this.col });
            }
            this.possibleMoves.push({ row: this.row + change, col: this.col });
        }

        if (this.row + change >= 0 && this.row + change < board.size) {
            if (this.col - 1 >= 0 && !board.isCellEmpty(this.row + change, this.col - 1) && board.getCellColor(this.row + change, this.col - 1) != this.color) {
                this.possibleMoves.push({ row: this.row + change, col: this.col - 1 });
            }
            if (this.col + 1 < board.size && !board.isCellEmpty(this.row + change, this.col + 1) && board.getCellColor(this.row + change, this.col + 1) != this.color) {
                this.possibleMoves.push({ row: this.row + change, col: this.col + 1 });
            }
        }
    }
}

