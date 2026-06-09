import gameboard from "./gameboard.js";
import boardRenderer from "./boardRenderer.js";
import gameController from "./gameController.js";

console.log("It works!");

let containers = {
    naming: null,
    board: document.querySelector('#board-container'),
    scores: document.querySelector('#score-container'),
    results: document.querySelector('#results-container'),
};

// initialize controller
gameController.initialize(gameboard, boardRenderer, containers);