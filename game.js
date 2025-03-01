document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("gameBoard");
    const message = document.getElementById("gameMessage");
    const player1Name = localStorage.getItem("player1Name") || "Player 1";
    const player2Name = localStorage.getItem("player2Name") || "Player 2";
    document.getElementById("player1Name").textContent = player1Name;
    document.getElementById("player2Name").textContent = player2Name;

    let currentPlayer = "ko_place"; // Start with Ko placement
    let klaPositions = [0, 3, 12, 15];
    let koCount = 0;
    let gameState = Array(16).fill(null);
    let selectedKla = null;
    let selectedKo = null;
    let gamePhase = 1; // 1: Ko placement, Kla move; 2: Ko and Kla movement

    function createBoard() {
        board.innerHTML = "";
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            if (klaPositions.includes(i)) {
                cell.classList.add("kla");
                cell.innerHTML = '<img src="picture/kla.png" alt="kla">';
                gameState[i] = "kla";
            }
            cell.addEventListener("click", handleMove);
            board.appendChild(cell);
        }
        updateTurnMessage();
    }

    function handleMove(event) {
        let index = parseInt(event.target.dataset.index);

        if (gamePhase === 1) { // Ko placement, Kla move only
            if (currentPlayer === "ko_place" && koCount < 12 && !gameState[index]) {
                event.target.classList.add("ko");
                event.target.innerHTML = '<img src="picture/ko.png" alt="ko">';
                gameState[index] = "ko";
                koCount++;

                if (koCount === 12) {
                    gamePhase = 2; // Switch to movement phase
                    currentPlayer = "kla";
                    updateTurnMessage();
                    return;
                }

                currentPlayer = "kla";
            } else if (currentPlayer === "kla" && gameState[index] === "kla") {
                selectKla(index);
            } else if (selectedKla !== null) {
                moveKla(selectedKla, index);
                selectedKla = null;
                currentPlayer = "ko_place";
            }
        } else if (gamePhase === 2) { // Ko and Kla movement
            if (currentPlayer === "kla" && gameState[index] === "kla") {
                selectKla(index);
            } else if (selectedKla !== null) {
                moveKla(selectedKla, index);
                selectedKla = null;
                currentPlayer = "ko_move";
            } else if (currentPlayer === "ko_move" && gameState[index] === "ko") {
                selectKo(index);
            } else if (selectedKo !== null) {
                moveKo(selectedKo, index);
                selectedKo = null;
                currentPlayer = "kla";
            }
        }
        updateTurnMessage();
        checkWinConditions();
    }

    // ... (selectKla, selectKo, getValidMoves, moveKla, moveKo remain the same)

    function getValidMoves(index) {
        let validMoves = [index - 1, index + 1, index - 4, index + 4].filter(pos =>
            pos >= 0 && pos < 16 && !gameState[pos]
        );
        let jumpMoves = [
            { from: index, over: index - 1, to: index - 2 },
            { from: index, over: index + 1, to: index + 2 },
            { from: index, over: index - 4, to: index - 8 },
            { from: index, over: index + 4, to: index + 8 }
        ].filter(move =>
            gameState[move.over] === "ko" && !gameState[move.to] &&
            move.to >= 0 && move.to < 16 && move.over >= 0 && move.over < 16 &&
            (Math.abs(move.from - move.over) === 1 || Math.abs(move.from - move.over) === 4)
        );
        jumpMoves.forEach(move => validMoves.push(move.to));
        return validMoves;
    }

    function updateTurnMessage() {
        if (gamePhase === 1) {
            if (currentPlayer === "ko_place") {
                message.textContent = player2Name + " place Ko piece.";
            } else {
                message.textContent = player1Name + "'s turn (Tigers move only).";
            }
        } else {
            message.textContent = (currentPlayer === "kla" ? player1Name : player2Name) + "'s turn.";
        }
    }

    function checkWinConditions() {
        let koCountOnBoard = gameState.filter(piece => piece === "ko").length;
        if (koCountOnBoard === 0) {
            message.textContent = player1Name + " (Tigers) win!";
            return;
        }

        let klaMovable = klaPositions.some(klaPos => {
            return getValidMoves(klaPos).length > 0;
        });

        if (!klaMovable) {
            message.textContent = player2Name + " (Cows) win!";
        }

    }

    createBoard();
});