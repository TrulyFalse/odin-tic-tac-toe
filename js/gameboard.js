import Player from './player.js';
import { CONSOLE_OUTPUT, GRID_SIZE } from './config.js';



// Model

// properties
const states = {
    // enum of all game states possible: ROUND_ONGOING, ROUND_END, MATCH-END
    ROUND_ONGOING: `ROUND_ONGOING`,
    ROUND_END: `ROUND_END`,
    MATCH_END: `MATCH_END`,
};
let currentState = states.MATCH_END;

let moveHistory = [];
let numOfRounds, lastRoundWinner, matchWinner, currentRound, moves;
let players;
let grid = new Array(GRID_SIZE).fill(null).map(() => new Array(GRID_SIZE).fill(null));

// methods
let firstMoverCoinToss = () => {
    let winningPlayer = (Math.floor(Math.random() * 2) === 0) ? 'A' : 'B';
    return winningPlayer;
}
let initializeMatch = (playerInfo, inputNumOfRounds = 2) => {
    if (currentState !== states.MATCH_END)
        return `Can't initialize, game is ongoing!`;

    // initializing all properties
    numOfRounds = inputNumOfRounds;
    lastRoundWinner = undefined;
    matchWinner = undefined;
    currentRound = 1;
    moves = 0;

    let firstMover = firstMoverCoinToss(); // returns 'A' or 'B'
    let markOfplayerA = (firstMover === 'A') ? 'X' : 'O';
    let markOfplayerB = (firstMover === 'B') ? 'X' : 'O';
    let turnOfPlayerA = (firstMover === 'A');
    let turnOfPlayerB = (firstMover === 'B');

    players = {
        A: new Player(playerInfo.A.name, markOfplayerA, turnOfPlayerA),
        B: new Player(playerInfo.B.name, markOfplayerB, turnOfPlayerB),
    }
    // players = {
    //     A: {
    //         name: playerInfo.A.name,
    //         score: 0,
    //         mark: (firstMover === 'A') ? 'X' : 'O',
    //         isTheirTurn: (firstMover === 'A'),
    //     },
    //     B: {
    //         name: playerInfo.B.name,
    //         score: 0,
    //         mark: (firstMover === 'B') ? 'X' : 'O',
    //         isTheirTurn: (firstMover === 'B'),
    //     }
    // }
    currentState = states.ROUND_ONGOING;
}

let getGrid = () => grid.slice();

let whoseTurn = () => {
    for (let player in players)
        if (players[player].state.isTheirTurn)
            return player;
}
let makeMove = (row, col, playerID = "auto") => {
    if (currentState !== states.ROUND_ONGOING)
        return `Round has not started!`;

    // gameboard knows which player is making the current move, so playerID isn't mandatory to mention
    let player = (playerID === 'auto') ? players[whoseTurn()] : players[playerID];

    if (player.state.isTheirTurn === false)
        return `Not player ${playerID}'s turn!`;
    if (grid[row][col] === undefined)
        return `Can't set cell out of 3x3 grid bounds`;
    else if (grid[row][col] !== null)
        return `Can't set ${player.state.mark} mark in cell(${row}, ${col}) as it is occupied!`;
    else {
        grid[row][col] = player.state.mark;
        moveHistory.push({
            row: row,
            col: col,
            mark: player.state.mark,
        });
        moves++;

        // toggling player turns
        players.A.isTheirTurn = !players.A.state.isTheirTurn;
        players.B.isTheirTurn = !players.B.state.isTheirTurn;

        checkWin();
    }
}

let checkWin = () => {
    if (moves < 5) return false; // wins not possible before 5th move

    let firstMark;
    let threeOfSameMark;

    // check all rows
    for (let row of grid) {
        firstMark = row[0];
        if (firstMark === null) continue;
        threeOfSameMark = row.every((cell) => cell === firstMark);
        if (threeOfSameMark) break;
    }

    // check all columns
    if (!threeOfSameMark) {
        for (let i = 0; i < GRID_SIZE; i++) {
            firstMark = grid[0][i];
            if (firstMark === null) continue;
            threeOfSameMark = true; // using as a flag so start by assuming true
            for (let j = 1; j < GRID_SIZE; j++) {
                if (grid[j][i] !== firstMark)
                    threeOfSameMark = false;
            }
            if (threeOfSameMark) break;
        }
    }

    // check diagonals
    if (!threeOfSameMark) {
        firstMark = grid[0][0];
        if (firstMark !== null) {
            threeOfSameMark = true;
            for (let i = 1; i < GRID_SIZE; i++) {
                if (grid[i][i] !== firstMark)
                    threeOfSameMark = false;
            }
        }
    }
    if (!threeOfSameMark) {
        firstMark = grid[0][GRID_SIZE - 1];
        if (firstMark !== null) {
            threeOfSameMark = true;
            for (let i = 1; i < GRID_SIZE; i++) {
                if (grid[i][GRID_SIZE - 1 - i] !== firstMark)
                    threeOfSameMark = false;
            }
        }
    }

    // if three of the same mark are found in either rows, cols or diagonals, then return round winner
    if (threeOfSameMark) {
        currentState = states.ROUND_END;
        lastRoundWinner = (firstMark === players.A.state.mark) ? players.A : players.B;
        lastRoundWinner.incrementScore();
        if (CONSOLE_OUTPUT) {
            console.log(`Round #${currentRound} won by ${lastRoundWinner.state.name} (${lastRoundWinner.state.mark})!`);
            console.log(getGameState().players);
        }
    } else if (moves === 9) {
        currentState = states.ROUND_END;
        lastRoundWinner = null;
        if (CONSOLE_OUTPUT) console.log(`Round #${currentRound} drawn!`);
    }
}

let resetGrid = () => {
    grid = grid.map(row => row.map(() => null));
}
let nextRound = () => {
    if (currentState !== states.ROUND_END)
        return `Cannot start next round, current round hasn't ended!`;

    resetGrid();
    moveHistory = [];
    currentRound++;
    moves = 0;

    if (currentRound > numOfRounds) {
        endMatch();
        return;
    }

    // reassigning O and X marks
    let firstMover = firstMoverCoinToss();
    players.A.isTheirTurn = (firstMover === 'A');
    players.B.isTheirTurn = (firstMover === 'B');
    if (firstMover === 'A') {
        players.A.setMarkToCross();
        players.B.setMarkToCircle();
    } else if (firstMover === 'B') {
        players.B.setMarkToCross();
        players.A.setMarkToCircle();
    }

    currentState = states.ROUND_ONGOING;
}
let endMatch = () => {
    currentState = states.MATCH_END;

    if (players.A.state.score > players.B.state.score) {
        matchWinner = players.A;
        if (CONSOLE_OUTPUT) console.log(`The match has been won by ${matchWinner.state.name}!`);
    } else if (players.A.state.score < players.B.state.score) {
        matchWinner = players.B;
        if (CONSOLE_OUTPUT) console.log(`The match has been won by ${matchWinner.state.name}!`);
    } else {
        matchWinner = null;
        if (CONSOLE_OUTPUT) console.log(`The match has been drawn!`);
    }


}

let getGameState = () => {
    // return {currentState, currentRound, numOfRounds, lastRoundWinner, matchWinner};
    let stateInfo = {
        state: currentState,
        grid: getGrid(),
        players: {
            A: players.A.state,
            B: players.B.state
        },
        moves: moveHistory.slice(),
        round: currentRound,
        numOfRounds: numOfRounds,
    };
    switch (currentState) {
        case states.ROUND_ONGOING:
            stateInfo.currentTurn = whoseTurn();
            break;
        case states.ROUND_END:
            stateInfo.roundWinner = (lastRoundWinner) ? lastRoundWinner.state : null;
            break;
        case states.MATCH_END:
            stateInfo.matchWinner = (matchWinner) ? matchWinner.state : null;
            break;
        default:
            console.log("Unknown state!");
            return;
    }
    return stateInfo;
}



// commenting out the interface so you can simply export them out as an object in ES6 module syntax

// // public
// // aiming to expose a few complex methods (as opposed to many simple methods) to minimize coupling and have a coarse-grained interface
// return { initializeMatch, makeMove, nextRound, getGameState };

export default { initializeMatch, makeMove, nextRound, getGameState };