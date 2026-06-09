import { CONSOLE_OUTPUT, GRID_SIZE } from './config.js';

// View
let gameController;

let containers = {
    naming: null,
    board: null,
    scores: null,
    results: null,
};

let lastRenderedGrid = [];
const crossImgPath = './img/cross.png';
const circleImgPath = './img/circle.png';
const emptyImgPath = './img/nothing.png';

let initialize = (givenGameController, givenContainers) => {
    gameController = givenGameController;

    const { naming, board, scores, results } = givenContainers;
    containers = { naming, board, scores, results };

    // containers.naming.innerHTML = "";
    // containers.board.innerHTML = "";
    // containers.scores.innerHTML = "";
    // containers.results.innerHTML = "";

    for (let i = 0; i < GRID_SIZE ** 2; i++)
        containers.board.append(createGridCell(null));

    lastRenderedGrid = new Array(GRID_SIZE).fill(null).map(() => new Array(GRID_SIZE).fill(null));

    containers.board.addEventListener('click', (e) => {
        if (e.target.classList.contains('filled') || e.target.parentElement.classList.contains('filled'))
            return;

        let cellBtnList = containers.board.querySelectorAll('button');
        cellBtnList = [...cellBtnList];
        for (let i = 0; i < cellBtnList.length; i++) {
            if (e.target === cellBtnList[i] || e.target.parentElement === cellBtnList[i]) {
                let row = Math.floor(i / GRID_SIZE);
                let col = i % GRID_SIZE;
                gameController.cellClicked(row, col);
            }
        }
    });
}

let createGridCell = (mark) => {
    //<div>
    //  <button class="grid-cell">
    //      <img src="./img/nothing.png" alt="cross/circle symbol">
    //  </button>
    //</div>

    let div = document.createElement('div');
    let gridCellBtn = document.createElement('button');
    gridCellBtn.classList.toggle('grid-cell');
    let img = document.createElement('img');
    switch (mark) {
        case 'X':
            img.setAttribute('src', crossImgPath);
            img.setAttribute('alt', 'cross mark');
            gridCellBtn.classList.toggle('filled');
            break;
        case 'O':
            img.setAttribute('src', circleImgPath);
            img.setAttribute('alt', 'circle mark');
            gridCellBtn.classList.toggle('filled');
            break;
        case null:
            img.setAttribute('src', emptyImgPath);
            break;
        default:
            return 'unknown mark!';
    }
    gridCellBtn.append(img);
    div.append(gridCellBtn);
    return div;
}

// update all changes to board
let renderBoard = (grid) => {
    for (let i = 0; i < GRID_SIZE; i++)
        for (let j = 0; j < GRID_SIZE; j++)
            if (grid[i][j] !== lastRenderedGrid[i][j]) {
                let cellNumber = (i * GRID_SIZE) + j + 1;
                let oldCell = containers.board.querySelector(`div:nth-child(${cellNumber})`);
                let newCell = createGridCell(grid[i][j]);

                containers.board.insertBefore(newCell, oldCell);
                oldCell.remove();
            }

    // assign a deep copy of grid
    for (let i = 0; i < lastRenderedGrid.length; i++) {
        lastRenderedGrid[i] = grid[i].slice();
    }

    if (CONSOLE_OUTPUT) {
        console.log(`----------`);
        for (let row of grid) {
            let printableRow = row.map(cell => {
                if (cell === null) return `[ ]`;
                return `[${cell}]`;
            }).join(" ");
            console.log(printableRow);
        }
    }
}

let renderScores = (playersInfo, round, numOfRounds) => {
    // <p>Scores</p>
    // <p>Round [round] of [maxRounds]</p>
    // <div class="score">
    //     <img src="./img/cross.png" alt="cross symbol" width="50px">
    //     <p>[name]</p>
    //     <p>[score]</p>
    // </div>

    containers.scores.innerHTML = "";

    let headingPara = document.createElement('p');
    headingPara.textContent = 'Scores';
    let roundPara = document.createElement('p');
    roundPara.textContent = `Round ${round} of ${numOfRounds}`;
    containers.scores.append(headingPara, roundPara);

    for (let player in playersInfo) {
        let playerScoreDiv = document.createElement('div');
        playerScoreDiv.classList.toggle('score');
        let markImg = document.createElement('img');
        markImg.setAttribute('src', (playersInfo[player].mark === 'X') ? crossImgPath : circleImgPath);
        markImg.setAttribute('alt', `player ${player} mark: ${(playersInfo[player].mark === 'X') ? 'cross' : 'circle'}`);
        markImg.setAttribute('width', '20px');
        let namePara = document.createElement('p');
        namePara.textContent = playersInfo[player].name;
        let scorePara = document.createElement('p');
        scorePara.textContent = playersInfo[player].score;
        playerScoreDiv.append(markImg, namePara, scorePara);

        containers.scores.append(playerScoreDiv);
    }
}

let renderNaming = () => {
    let players = {
        A: { name: prompt(`Write player A's name:`, 'Player A') },
        B: { name: prompt(`Write player B's name:`, 'Player B') },
    }
    let rounds = prompt(`How many rounds?`, 2);
    gameController.startMatch(players, rounds);
}

let renderResults = (gameState) => {
    let winMessagePara = document.createElement('p');
    let nextRoundBtn = document.createElement('button');

    if (gameState.state === `ROUND_END`) {
        if (gameState.roundWinner !== null) {
            winMessagePara.textContent = `Round ${gameState.round} has been won by ${gameState.roundWinner.name} (${gameState.roundWinner.mark}) !`;
        } else {
            winMessagePara.textContent = `Round ${gameState.round} has been drawn.`;
        }
        nextRoundBtn.textContent = 'Next';
        nextRoundBtn.addEventListener('click', () => {
            gameController.nextRound();
            containers.results.removeChild(winMessagePara);
            containers.results.removeChild(nextRoundBtn);
        })
    } else if (gameState.state === `MATCH_END`) {
        if (gameState.matchWinner !== null) {
            winMessagePara.textContent = `Match has been won by ${gameState.matchWinner.name}!`;
        } else {
            winMessagePara.textContent = `Match has been drawn.`;
        }
        nextRoundBtn.textContent = 'Restart';
        nextRoundBtn.addEventListener('click', () => {
            renderNaming();
            containers.results.removeChild(winMessagePara);
            containers.results.removeChild(nextRoundBtn);
        })
    }
    containers.results.append(winMessagePara, nextRoundBtn);
}

export default { initialize, renderBoard, renderScores, renderResults, renderNaming };