// Model
class Player {
    #name;
    #score;
    #mark;
    isTheirTurn;

    constructor(givenName, givenMark, givenTurn) {
        this.#name = givenName;
        this.#score = 0;
        this.#mark = (givenMark === 'X') ? 'X' : (givenMark === 'O') ? 'O' : null;
        this.isTheirTurn = givenTurn;
    }

    get state() {
        return {
            name: this.#name,
            score: this.#score,
            mark: this.#mark,
            isTheirTurn: this.isTheirTurn,
        };
    }

    incrementScore = () => { this.#score++; }
    setMarkToCross = () => { this.#mark = 'X'; }
    setMarkToCircle = () => { this.#mark = 'O'; }

    // legacy factory interface commented out so you can refactor methods carefully
    // return {getState, incrementScore, setMarkToCross, setMarkToCircle, setTurn};  
}

export default Player;