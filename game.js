document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("gameBoard");
    const message = document.getElementById("gameMessage");
    const player1Name = localStorage.getItem("player1Name") || "Player 1";
    const player2Name = localStorage.getItem("player2Name") || "Player 2";
    document.getElementById("player1Name").textContent = player1Name;
    document.getElementById("player2Name").textContent = player2Name;

    let currentPlayer = "ko_place"; // Start with Ko placement
    let klaPositions = [0, 3, 12, 15]; // 4 tigers at corners
    let koPositions = [];
    let koCount = 0;
    let gameState = Array(16).fill(null);
    let selectedKla = null;
    let selectedKo = null;
    let gamePhase = 1; // 1: Ko placement, Kla move; 2: Both move

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
            } else if (koPositions.includes(i)) {
                cell.classList.add("ko");
                cell.innerHTML = '<img src="picture/ko.png" alt="ko">';
                gameState[i] = "ko";
            }
            cell.addEventListener("click", handleMove);
            board.appendChild(cell);
        }
        updateTurnMessage();
    }

    function updateTurnMessage() {
        if (gamePhase === 1) {
            if (currentPlayer === "ko_place") {
                message.textContent = `${player1Name} (Ko): Place a Ko. (${12 - koCount} remaining)`;
            } else {
                message.textContent = `${player2Name} (Kla): Move a Kla.`;
            }
        } else {
            if (currentPlayer === "ko") {
                message.textContent = `${player1Name} (Ko): Move a Ko.`;
            } else {
                message.textContent = `${player2Name} (Kla): Move a Kla.`;
            }
        }
    }

    function handleMove(event) {
        const cell = event.target.closest(".cell");
        const index = parseInt(cell.dataset.index);

        if (gamePhase === 1) {
            if (currentPlayer === "ko_place") {
                // Phase 1: Ko placement
                if (gameState[index] === null && koCount < 12) {
                    koPositions.push(index);
                    koCount++;
                    gameState[index] = "ko";
                    currentPlayer = "kla_move";
                    createBoard();
                }
            } else { // Kla move during placement phase
                if (cell.classList.contains("kla")) {
                    selectedKla = (selectedKla === index) ? null : index;
                } else if (selectedKla !== null && gameState[index] === null) {
                    if (isValidKlaMove(selectedKla, index, false)) {
                        // Move Kla
                        gameState[selectedKla] = null;
                        gameState[index] = "kla";
                        klaPositions[klaPositions.indexOf(selectedKla)] = index;
                        selectedKla = null;
                        currentPlayer = "ko_place";
                        if (koCount === 12) {
                            gamePhase = 2;
                            currentPlayer = "ko";
                        }
                        createBoard();
                    }
                }
            }
        } else { // Phase 2: Movement
            if (currentPlayer === "ko") {
                // Ko movement
                if (cell.classList.contains("ko")) {
                    selectedKo = (selectedKo === index) ? null : index;
                } else if (selectedKo !== null && gameState[index] === null) {
                    if (isValidKoMove(selectedKo, index)) {
                        gameState[selectedKo] = null;
                        gameState[index] = "ko";
                        koPositions[koPositions.indexOf(selectedKo)] = index;
                        selectedKo = null;
                        currentPlayer = "kla";
                        createBoard();
                        checkWinConditions();
                    }
                }
            } else { // Kla movement
                if (cell.classList.contains("kla")) {
                    selectedKla = (selectedKla === index) ? null : index;
                } else if (selectedKla !== null && gameState[index] === null) {
                    if (isValidKlaMove(selectedKla, index, true)) {
                        const fromRow = Math.floor(selectedKla / 4);
                        const fromCol = selectedKla % 4;
                        const toRow = Math.floor(index / 4);
                        const toCol = index % 4;
                        const rowDiff = Math.abs(fromRow - toRow);
                        const colDiff = Math.abs(fromCol - toCol);

                        // Check for capture
                        if (rowDiff === 2 || colDiff === 2) {
                            const midRow = (fromRow + toRow) / 2;
                            const midCol = (fromCol + toCol) / 2;
                            const midIndex = midRow * 4 + midCol;
                            if (gameState[midIndex] === "ko") {
                                gameState[midIndex] = null;
                                koPositions = koPositions.filter(pos => pos !== midIndex);
                                koCount--;
                            }
                        }

                        // Move Kla
                        gameState[selectedKla] = null;
                        gameState[index] = "kla";
                        klaPositions[klaPositions.indexOf(selectedKla)] = index;
                        selectedKla = null;
                        currentPlayer = "ko";
                        createBoard();
                        checkWinConditions();
                    }
                }
            }
        }
    }

    function isValidKoMove(from, to) {
        const fromRow = Math.floor(from / 4);
        const fromCol = from % 4;
        const toRow = Math.floor(to / 4);
        const toCol = to % 4;
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) && gameState[to] === null;
    }

    function isValidKlaMove(from, to, isPhase2) {
        const fromRow = Math.floor(from / 4);
        const fromCol = from % 4;
        const toRow = Math.floor(to / 4);
        const toCol = to % 4;
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);

        // Slide move (any direction)
        if (rowDiff <= 1 && colDiff <= 1) {
            return gameState[to] === null;
        }

        // Jump capture (Phase 2 only)
        if (isPhase2) {
            if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2) || (rowDiff === 2 && colDiff === 2)) {
                const midRow = (fromRow + toRow) / 2;
                const midCol = (fromCol + toCol) / 2;
                const midIndex = midRow * 4 + midCol;
                return gameState[midIndex] === "ko" && gameState[to] === null;
            }
        }

        return false;
    }

    function checkWinConditions() {
        // Check if all Klas are blocked
        const allKlasBlocked = klaPositions.every(klaPos => {
            for (let i = 0; i < 16; i++) {
                if (isValidKlaMove(klaPos, i, gamePhase === 2)) return false;
            }
            return true;
        });

        if (koCount === 0) {
            message.textContent = `${player2Name} (Kla) wins! All Ko captured.`;
        } else if (allKlasBlocked) {
            message.textContent = `${player1Name} (Ko) wins! Kla are blocked.`;
        } else {
            updateTurnMessage();
        }
    }

    createBoard();
});