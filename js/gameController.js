import { CONSOLE_OUTPUT, GRID_SIZE } from './config.js';

// controller
let gameboard, boardRenderer;

let initialize = (givenGameboard, givenBoardRenderer, containers) => {
    gameboard = givenGameboard;
    boardRenderer = givenBoardRenderer;

    // initialize view
    let controllerMethods = { initialize, startMatch, cellClicked, nextRound };
    boardRenderer.initialize(controllerMethods, containers);

    // start off the game's flow with the naming
    boardRenderer.renderNaming();
}

let startMatch = (playersInfo, rounds) => {
    gameboard.initializeMatch(playersInfo, rounds);
    let gameState = gameboard.getGameState();
    boardRenderer.renderScores(gameState.players, gameState.round, gameState.numOfRounds);
    boardRenderer.renderBoard(gameState.grid);
}

let cellClicked = (row, col) => {
    gameboard.makeMove(row, col);

    let gameState = gameboard.getGameState();
    boardRenderer.renderBoard(gameState.grid);
    if (gameState.state === `ROUND_END`) {
        boardRenderer.renderScores(gameState.players, gameState.round, gameState.numOfRounds);
        boardRenderer.renderResults(gameState);
    }
}

let nextRound = () => {
    gameboard.nextRound();
    let gameState = gameboard.getGameState();
    console.log(gameState.state);
    if (gameState.state === `ROUND_ONGOING`) {
        boardRenderer.renderScores(gameState.players, gameState.round, gameState.numOfRounds);
        boardRenderer.renderBoard(gameState.grid);
    } else if (gameState.state === `MATCH_END`) {
        boardRenderer.renderResults(gameState);
    }
}

export default { initialize, startMatch, cellClicked, nextRound };