console.log("It works!");

// We will use MVC architecture
// Model
let gameboard = (() => {
    // properties
    const GRID_SIZE = 3;
    // enum of all game states possible: PLAYER_NAMING, ROUND_START, ROUND_ONGOING, ROUND_END, MATCH-END
    const states = {
        PLAYER_NAMING: `PLAYER_NAMING`,
        ROUND_START:`ROUND_START`,
        ROUND_ONGOING:`ROUND_ONGOING`,
        ROUND_END:`ROUND_END`,
        MATCH_END:`MATCH_END`,
    };

    let currentState = states.PLAYER_NAMING;
    let moves, currentRounds, numOfRounds = 0;
    let firstMover, players;
    let grid = new Array(GRID_SIZE).fill(null);
    grid = grid.map(() => new Array(GRID_SIZE).fill(null));

    // methods
    let initializeMatch = (playerInfo, inputNumOfRounds) => {
        if(currentState !== states.PLAYER_NAMING)
            return `ERROR: Game is ongoing!`;

        currentRounds = 0;
        moves = 0;
        numOfRounds = inputNumOfRounds;
        firstMover = firstMoverCoinToss();
        players = {
            A: {
                name: playerInfo.A.name,
                score: 0,
                mark: (firstMover === 'A') ? 'X' : 'O',
                isTheirTurn: (firstMover === 'A'),
            },
            B: {
                name: playerInfo.B.name,
                score: 0,
                mark: (firstMover === 'B') ? 'X' : 'O',
                isTheirTurn: (firstMover === 'B'),
            }
        }
        currentState = states.ROUND_START;
        return structuredClone(players);
    }
    
    let firstMoverCoinToss = () => {
        let winningPlayer = (Math.floor(Math.random() * 2) === 0) ? 'A' : 'B';
        return winningPlayer;
    }
    
    let getCell = (row, col) => grid[row][col];
    let getGrid = () => grid.slice();
    
    let toggleTurn = () => {
        players.A.isTheirTurn = !players.A.isTheirTurn;
        players.B.isTheirTurn = !players.B.isTheirTurn;
    }
    let makeMove = (playerID, row, col) => {
        if(currentState !== states.ROUND_ONGOING)
            return  `Round has not started!`;
        let player = players[playerID];
        if(player.isTheirTurn === false)
            return `Not player ${playerID}'s turn!`;
        if(getCell(row, col) === undefined)
            return `Can't set cell out of 3x3 grid bounds`;
        else if(getCell(row, col) !== null)
            return `Can't set ${player.mark} mark in cell(${row}, ${col}) as it is occupied!`; 
        else {
            grid[row][col] = player.mark;
            moves++;
            toggleTurn();
            let anyWinner = checkWin();
            return anyWinner;
        }
    }
    
    let checkWin = () => {
        if(moves < 5) return false; // wins not possible before 5th move
        
        let firstMark;
        let sameMarks;

        // check all rows
        for(let row of grid){
            firstMark = row[0];
            if(firstMark === null) continue;
            sameMarks = row.every((cell) => cell === firstMark);
            if(sameMarks) break;
        }

        // check all columns
        if(!sameMarks){
            for(let i = 0; i < GRID_SIZE; i++){
                sameMarks = true;
                firstMark = grid[0][i];
                if(firstMark === null) continue;
                for(let j = 1; j < GRID_SIZE; j++){
                    if(grid[j][i] !== firstMark)
                        sameMarks = false;
                }
                if(sameMarks) break;
            }
        }

        // check diagonals
        if(!sameMarks){
            firstMark = grid[0][0];
            if (firstMark !== null){
                sameMarks = true;
                for(let i = 1; i < GRID_SIZE; i++){
                    if(grid[i][i] !== firstMark)
                        sameMarks = false;
                }
            }
            if(!sameMarks){
                firstMark = grid[0][GRID_SIZE - 1];
                if (firstMark !== null) {
                    sameMarks = true;
                    for (let i = 1; i < GRID_SIZE; i++) {
                        if (grid[i][GRID_SIZE - 1 - i] !== firstMark)
                            sameMarks = false;
                    }
                }
            }
        }

        if(sameMarks){
            nextRound();
            if(firstMark === players.A.mark) {
                players.A.score++;
                return players.A;
            } else {
                players.B.score++;
                return players.B;
            }
        } else if(moves === 9){
            nextRound();
            return `draw`;
        } else{
            return false;
        } 
    }
    
    let resetGrid = () => {
        grid = grid.map(row => row.map(() => null));
    }

    let nextRound = () => {
        resetGrid();
        firstMover = firstMoverCoinToss();
        players.A.isTheirTurn = (firstMover === 'A');
        players.B.isTheirTurn = (firstMover === 'B');
        currentRounds++;
    }

    
    // public methods
    // aiming to expose a few complex methods (as opposed to many simple methods) to minimize coupling and have a coarse-grained interface
    return {initializeMatch, getGrid, makeMove};
})();

// Viewer
let boardRenderer = (() => {
    let renderBoard = (boardContainer) => {
        for (let row of grid) {
            let printableRow = row.map(cell => {
                if (cell === undefined) return `[ ]`;
                return `[${cell}]`;
            }).join(" ");
            console.log(printableRow);
        }
    }

    // public
    return {renderBoard};
})();

let initializedPlayerInfo = gameboard.initializeMatch({A:{name: "David"}, B:{name: "Toptonov"}}, 5);

let firstMover;
for(let player in initializedPlayerInfo){
    if(initializedPlayerInfo[player].isTheirTurn)
        firstMover = player;
}
gameboard.makeMove(firstMover, 0, 0);
gameboard.makeMove("B", 1, 0);
gameboard.makeMove("A", 0, 1);
gameboard.makeMove("B", 2, 1);
boardRenderer.renderBoard();

gameboard.renderBoard();