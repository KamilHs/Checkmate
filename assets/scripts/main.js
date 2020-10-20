const container = document.getElementById('board-container');

const board = new Board();

const folder = "assets/img/";
const format = ".svg";

const size = 8;
const boardColors = ["rgb(240,218,181)", "rgb(181,136,99)"];
const players = ["white", "black"];

let width = window.innerHeight / 8;

if (window.width < window.height || width * 8 > window.innerWidth) {
    width = window.innerWidth / 8;
}

let selectedCell;
let selectedRow;
let selectedCol;
let currentPossibleMoves = [];

let turnCount = 0;


container.style.width = width * 8 + "px";
container.style.height = width * 8 + "px";


function init() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let cell = document.createElement("div");
            let label = document.createElement("span");

            cell.classList.add('cell');
            label.classList.add('label');

            reDraw(cell, i, j)

            cell.style.width = width + "px";
            cell.style.height = width + "px";
            label.style.fontSize = width / 4 + "px";

            if ((i + j) % 2) {
                cell.style.backgroundColor = boardColors[1];
                cell.style.color = boardColors[0];
            }
            else {
                cell.style.backgroundColor = boardColors[0];
                cell.style.color = boardColors[1];
            }

            if (i + 1 == size && j + 1 == size) {
                let label2 = document.createElement("span");
                label2.classList.add('label');
                label2.classList.add('number');
                label2.style.fontSize = width / 4 + "px";
                label2.textContent = size - i;
                cell.appendChild(label2);
            }
            if (i + 1 == size) {
                label.textContent = String.fromCharCode(97 + j);
                label.classList.add('letter');
            }
            else if (j + 1 == size) {
                label.textContent = size - i;
                label.classList.add('number');
            }

            cell.addEventListener('click', function (e) {
                if (!board.isCellEmpty(i, j) && players[turnCount % 2] == board.getCellProperty(i, j).color) {
                    if (selectedCell != null) {
                        unsignPossibleMoves(currentPossibleMoves);
                        selectedCell.classList.remove('selected');
                    }

                    selectedCell = cell;
                    selectedRow = i;
                    selectedCol = j;
                    board.setCellPossibleMoves(selectedRow, selectedCol);

                    currentPossibleMoves = board.getCellPossibleMoves(selectedRow, selectedCol);

                    signPossibleMoves(currentPossibleMoves);
                    selectedCell.classList.add('selected');
                }
                else if (selectedCell && board.isPossibleCellMove(selectedRow, selectedCol, i, j)) {
                    let currentColor = board.getCellColor(selectedRow, selectedCol);

                    if (turnCount > 0) {
                        unsignLastMove(board.getLastMove());
                    }

                    if (!board.isCellEmpty(i, j)) {
                        board.deteleFigure(i, j);
                    }
                    if (board.isEnPassantPossible(selectedRow, selectedCol, currentColor) && board.isMoveEnPassant({ row: selectedRow, col: selectedCol }, { row: i, col: j })) {
                        let change = currentColor == "white" ? 1 : -1;

                        board.enPassant(i, j, currentColor, change);
                        reDraw(document.getElementsByClassName('cell')[(i + change) * size + j], i + change, j);
                    }
                    if (board.isKing(selectedRow, selectedCol)) {
                        if (board.isOwnKingChecked(currentColor)) {
                            unSignCheckedKing({ row: selectedRow, col: selectedCol });
                        }
                    }
                    if (board.isKing(selectedRow, selectedCol) && board.isMoveCastling({ row: selectedRow, col: selectedCol }, { row: i, col: j })) {
                        let { row, col } = board.getCastlingRook({ row: i, col: j });
                        let newRookPos = board.castle({ row: selectedRow, col: selectedCol }, { row: i, col: j });

                        reDraw(document.getElementsByClassName('cell')[row * size + col], row, col);
                        reDraw(document.getElementsByClassName('cell')[newRookPos.row * size + newRookPos.col], newRookPos.row, newRookPos.col);
                    }
                    else {
                        board.moveCell(selectedRow, selectedCol, i, j);

                        if (board.isPawn(i, j)) {
                            if (board.isPawnReachedEightsRank(i, j)) {
                                fillPromotionSelectionImages(currentColor, i, j);
                            }
                        }
                    }

                    if (board.isOwnKingChecked(currentColor)) {
                        if (board.isOwnKingSafe(currentColor)) {
                            unSignCheckedKing(board.getOwnKing(currentColor));
                            board.setToUncheckedOwntKing(currentColor);
                        }
                    }

                    reDraw(cell, i, j);
                    reDraw(selectedCell, selectedRow, selectedCol);


                    if (board.isCellCheckingOpponentKing(currentColor)) {
                        if (!board.isOwnKingChecked(board.getOppositeColor(currentColor))) {
                            board.setToCheckedOpponentKing(currentColor);
                            signCheckedKing(board.getOpponentKing(currentColor));
                        }
                        if (board.checkMate(currentColor)) {
                            endGame(currentColor);
                        }
                    }

                    unsignPossibleMoves(currentPossibleMoves);
                    signLastMove(board.getLastMove());

                    selectedCell.classList.remove('selected');

                    if (board.isOwnKingSafe(board.getOppositeColor(currentColor)) && board.staleMate(currentColor)) {
                        endGame(false, true);
                    }
                    else if (!board.checkSufficency()) {
                        endGame(false, false, true);
                    }

                    selectedCell = null;
                    selectedRow = null;
                    selectedCol = null;
                    turnCount++;
                }
            })

            cell.appendChild(label);
            container.appendChild(cell);
        }
    }

}

function reDraw(cell, row, col) {
    let properties = board.getCellProperty(row, col);

    if (properties)
        cell.style.backgroundImage = `url(${folder}${properties.color}${properties.type}${format})`;
    else
        cell.style.backgroundImage = 'none';
}

function signPossibleMoves(possibleMoves) {
    let cells = document.getElementsByClassName('cell');

    for (let i = 0; i < possibleMoves.length; i++) {
        let { row, col } = possibleMoves[i];

        let circle = document.createElement('span');

        circle.classList.add('circle');
        cells[row * size + col].classList.add('possible');

        cells[row * size + col].appendChild(circle);
    }
}


function unsignPossibleMoves(possibleMoves) {
    let cells = document.getElementsByClassName('cell');

    for (let i = 0; i < possibleMoves.length; i++) {
        let { row, col } = possibleMoves[i];

        cells[row * size + col].classList.remove('possible');

        if (cells[row * size + col].lastChild) {
            cells[row * size + col].removeChild(cells[row * size + col].lastChild);
        }
    }
}

function signCheckedKing({ row, col }) {
    let kingCell = document.getElementsByClassName('cell')[row * size + col];
    let check = document.createElement('span');

    check.classList.add('checked');

    kingCell.appendChild(check);
}

function unSignCheckedKing({ row, col }) {

    let kingCell = document.getElementsByClassName('cell')[row * size + col];

    kingCell.removeChild(kingCell.lastChild);
}

function fillPromotionSelectionImages(color, pawnRow, pawnCol) {
    document.getElementById('promotion-container').classList.remove('hidden');

    let blocksContainer = document.getElementById('selection');

    let child = blocksContainer.lastChild;

    while (child) {
        blocksContainer.removeChild(child);
        child = blocksContainer.lastChild;
    }

    let figures = ["Queen", "Rook", "Knight", "Bishop"];

    for (let i = 0; i < 4; i++) {
        const selectionBlock = document.createElement('div');
        const selectionImage = document.createElement('img');

        selectionImage.src = folder + color + figures[i] + format;

        selectionImage.alt = color + figures[i];

        selectionBlock.classList.add('selection-block');

        selectionBlock.style.width = width + 'px';
        selectionBlock.style.height = width + 'px';
        selectionBlock.style.backgroundColor = boardColors[(pawnRow + pawnCol) % 2];

        selectionBlock.appendChild(selectionImage);
        blocksContainer.appendChild(selectionBlock);

        selectionBlock.addEventListener('click', e => selectPromotedFigure(color, i, figures, pawnRow, pawnCol));
    }

    blocksContainer.style.padding = 20 + "px";



    if (pawnRow == 0) {
        blocksContainer.classList.add('top');
        blocksContainer.style.top = width + 40 + "px";
    }
    else {
        blocksContainer.classList.add('bottom');
        blocksContainer.style.bottom = width + 40 + "px";
    }

    let offset = document.getElementsByClassName('cell')[pawnRow * size + pawnCol].offsetLeft;

    if (pawnCol < 2) {
        blocksContainer.classList.add('left');
        blocksContainer.style.left = offset - parseInt(blocksContainer.style.padding) + width * 0.5 + "px";
    }
    else if (pawnCol > 5) {
        blocksContainer.classList.add('right');
        blocksContainer.style.right = window.innerWidth - offset - width * 0.5 - parseInt(blocksContainer.style.padding) + "px";
    }
    else {
        blocksContainer.classList.add('center');
        blocksContainer.style.left = offset - blocksContainer.style.width / 2 - width * 1.5 - parseInt(blocksContainer.style.padding) + "px";
    }
}


function selectPromotedFigure(color, indexOfSelectedFigures, figures, row, col) {
    document.getElementById('promotion-container').classList.add('hidden');
    let blocksContainer = document.getElementById('selection');

    blocksContainer.classList.remove('top');
    blocksContainer.classList.remove('bottom');
    blocksContainer.classList.remove('center');
    blocksContainer.classList.remove('left');
    blocksContainer.classList.remove('right');
    blocksContainer.style.removeProperty('top');
    blocksContainer.style.removeProperty('bottom');
    blocksContainer.style.removeProperty('left');
    blocksContainer.style.removeProperty('right');



    board.promote(figures[indexOfSelectedFigures], row, col, color);

    reDraw(document.getElementsByClassName('cell')[row * size + col], row, col);

    if (board.isCellCheckingOpponentKing(color)) {
        if (!board.isOwnKingChecked(board.getOppositeColor(color))) {
            board.setToCheckedOpponentKing(color);
            signCheckedKing(board.getOpponentKing(color));
        }
    }
}

function endGame(winner, stalemate, draw) {
    document.getElementById("endgame-title").style.fontSize = width + 'px';
    if (winner) {
        document.getElementById("endgame-title").textContent = "Wasted, " + winner + " is victorious";
        document.getElementById("endgame-title").style.color = winner;
    }
    else if (stalemate) {
        document.getElementById("endgame-title").textContent = "Stalemate";
    }
    else if (draw) {
        document.getElementById("endgame-title").textContent = "Draw";
    }

    document.getElementById("endgame-info").classList.remove("hidden");
}

function signLastMove({ fromRow, fromCol, toRow, toCol }) {
    let lastMoveMark = document.createElement('span');

    lastMoveMark.classList.add('last-move')

    document.getElementsByClassName('cell')[fromRow * size + fromCol].appendChild(lastMoveMark);

    lastMoveMark = document.createElement('span');

    lastMoveMark.classList.add('last-move')

    document.getElementsByClassName('cell')[toRow * size + toCol].appendChild(lastMoveMark);
}

function unsignLastMove({ fromRow, fromCol, toRow, toCol }) {
    document.getElementsByClassName('cell')[fromRow * size + fromCol].removeChild(document.getElementsByClassName('cell')[fromRow * size + fromCol].lastChild)
    document.getElementsByClassName('cell')[toRow * size + toCol].removeChild(document.getElementsByClassName('cell')[toRow * size + toCol].lastChild)
}

init();