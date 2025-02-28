
        const board = document.getElementById("gameBoard");
        const message = document.getElementById("gameMessage");
        const player1Name = localStorage.getItem("player1Name") || "Player 1";
        const player2Name = localStorage.getItem("player2Name") || "Player 2";
        document.getElementById("player1Name").textContent = player1Name;
        document.getElementById("player2Name").textContent = player2Name;
        
        let currentPlayer = "ko"; // Start with cow placement
        let klaPositions = [0, 3, 12, 15]; // Tigers in corners
        let koCount = 0; // Cows placed
        let gameState = Array(16).fill(null);
        let selectedKla = null;
    
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
    
            if (currentPlayer === "ko" && koCount < 12 && !gameState[index]) {
                // Cow Placement
                event.target.classList.add("ko");
                event.target.innerHTML = '<img src="picture/ko.png" alt="ko">';
                gameState[index] = "ko";
                koCount++;
                if (koCount === 12) {
                    currentPlayer = "kla"; // Switch to tigers after all cows placed
                } else {
                    currentPlayer = "kla"; // Switch to tigers after placing one cow.
                }
    
            } else if (currentPlayer === "kla" && gameState[index] === "kla" && koCount >= 1) { //Added koCount >= 1
                // Select a tiger
                selectKla(index);
            } else if (selectedKla !== null) {
                // Move a tiger
                moveKla(selectedKla, index);
                selectedKla = null;
            }
            updateTurnMessage();
        }
    
        function selectKla(index) {
            selectedKla = index;
            document.querySelectorAll(".cell").forEach(cell => {
                cell.classList.remove("valid-move");
            });
            let validMoves = getValidMoves(index);
            validMoves.forEach(move => {
                document.querySelector(`[data-index='${move}']`).classList.add("valid-move");
            });
        }
    
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
                move.to >=0 && move.to <16 && move.over >= 0 && move.over <16 &&
                (Math.abs(move.from - move.over) === 1 || Math.abs(move.from - move.over) === 4)
            );
            jumpMoves.forEach(move => validMoves.push(move.to));
            return validMoves;
        }
    
        function moveKla(from, to) {
            let validMoves = getValidMoves(from);
            if (!validMoves.includes(to)) return;
            gameState[from] = null;
            document.querySelector(`[data-index='${from}']`).innerHTML = "";
            document.querySelector(`[data-index='${from}']`).classList.remove("kla");
            gameState[to] = "kla";
            document.querySelector(`[data-index='${to}']`).innerHTML = '<img src="picture/kla.png" alt="kla">';
            document.querySelector(`[data-index='${to}']`).classList.add("kla");
            let jump = [
                { from: from, over: from - 1, to: to },
                { from: from, over: from + 1, to: to },
                { from: from, over: from - 4, to: to },
                { from: from, over: from + 4, to: to }
            ].find(move => gameState[move.over] === "ko" && move.to === to);
            if (jump) {
                gameState[jump.over] = null;
                document.querySelector(`[data-index='${jump.over}']`).innerHTML = "";
                document.querySelector(`[data-index='${jump.over}']`).classList.remove("ko");
            }
            currentPlayer = "ko"; // Switch back to cows
            createBoard(); // Refresh to remove valid moves
        }
    
        function updateTurnMessage() {
            message.textContent = (currentPlayer === "kla" ? player1Name : player2Name) + "'s turn";
        }
    
        createBoard();
