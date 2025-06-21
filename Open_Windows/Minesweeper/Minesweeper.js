let board = [];
let minesLocation = [];
let tilesClicked = 0;
let gameOver = false;
let timer = 0;
let timerInterval = null;
let timerStarted = false;

let rows = 8;
let columns = 8;
let minesCount = 10;

let selectedLevel = null;

function SetLvl(text) {
  selectedLevel = text;
  localStorage.setItem("SelectedLevel", selectedLevel);

  if (text === "Beginner") {
    rows = 8;
    columns = 8;
    minesCount = 10;
  } else if (text === "Intermediate") {
    rows = 16;
    columns = 16;
    minesCount = 40;
  } else if (text === "Expert") {
    rows = 16;
    columns = 30;
    minesCount = 99;
  }

  const board = document.getElementById("board");
  if (board) {
    requestAnimationFrame(() => {
      board.style.gridTemplate = `repeat(${rows}, 22px) / repeat(${columns}, 22px)`;
    });
  }

  const showMinesCount = document.getElementById("mines-count");
  if (showMinesCount) {
    showMinesCount.innerHTML = "";

    const mines = Math.min(999, minesCount);
    const hundreds = Math.floor(mines / 100);
    const tens = Math.floor((mines % 100) / 10);
    const units = mines % 10;

    [hundreds, tens, units].forEach((digit) => {
      const img = document.createElement("img");
      img.src = `/Assets/minesweeper/digit${digit}.png`;
      img.alt = digit;
      showMinesCount.appendChild(img);
    });
  }
  setTimeout(() => {
    restart();
    updateCheckmarkInTooltip();
  }, 10);
}

document.addEventListener("keydown", function (event) {
  const minesweeperWindow = document.getElementById("window-Minesweeper");
  if (
    minesweeperWindow &&
    minesweeperWindow.style.display !== "none" &&
    minesweeperWindow.classList.contains("window") &&
    !minesweeperWindow.classList.contains("window-inactive") &&
    (event.key === "F2" || event.keyCode === 113)
  ) {
    restart();
  }
});

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    updateTimerDisplay(timer);
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay(value) {
  value = Math.min(999, value);

  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const units = value % 10;

  const digitHundreds = document.getElementById("digit-hundreds");
  const digitTens = document.getElementById("digit-tens");
  const digitUnits = document.getElementById("digit-units");

  if (!digitHundreds || !digitTens || !digitUnits) {
    return;
  }

  digitHundreds.src = `/Assets/minesweeper/digit${hundreds}.png`;
  digitTens.src = `/Assets/minesweeper/digit${tens}.png`;
  digitUnits.src = `/Assets/minesweeper/digit${units}.png`;
}

function resetTimer() {
  clearInterval(timerInterval);
  timer = 0;
  timerStarted = false;
  updateTimerDisplay(0);
}

function setMines() {
  let minesLeft = minesCount;
  while (minesLeft > 0) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * columns);
    let id = r.toString() + "-" + c.toString();

    if (!minesLocation.includes(id)) {
      minesLocation.push(id);
      minesLeft -= 1;
    }
  }
}

function startGame() {
  setMines();
  setFace("smile");

  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < columns; c++) {
      let tile = document.createElement("div");
      tile.classList = "Mine_ceil";
      tile.id = r.toString() + "-" + c.toString();

      tile.addEventListener("click", clickTile);

      tile.addEventListener("mousedown", () => setFace("surprised"));
      tile.addEventListener("mouseup", () => setFace("smile"));

      let tilestyle = document.createElement("div");
      tilestyle.classList = "Tile_style";
      tile.appendChild(tilestyle);

      document.getElementById("board").append(tile);
      row.push(tile);
    }
    board.push(row);
  }
}

function restart() {
  minesLocation = [];
  board = [];
  tilesClicked = 0;
  gameOver = false;
  document.body.classList.remove("game-over");

  resetTimer();

  const boardElement = document.querySelector("#board");
  if (!boardElement) {
    console.error("L'élément #board est introuvable !");
    return;
  }
  boardElement.innerHTML = "";
  startGame();
}

function clickTile() {
  let tile = this;

  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }

  if (gameOver || this.classList.contains("tile-clicked")) {
    return;
  }
  if (minesLocation.includes(tile.id)) {
    gameOver = true;
    revealMines();
    setFace("dead");
    document.body.classList.add("game-over");

    clearInterval(timerInterval);

    return;
  }
  let coords = tile.id.split("-");
  let r = parseInt(coords[0]);
  let c = parseInt(coords[1]);
  checkMine(r, c);
}

function revealMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = board[r][c];
      if (minesLocation.includes(tile.id)) {
        tile.innerHTML =
          "<img src='/Assets/minesweeper/mine-ceil.png' alt='mine'>";
        tile.style.backgroundColor = "red";
        tile.style.borderLeft = "2px solid rgb(128, 128, 128)";
        tile.style.borderTop = "2px solid rgb(128, 128, 128)";
        tile.style.boxSizing = "border-box";
      }
    }
  }
}

function checkMine(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= columns) {
    return;
  }
  if (board[r][c].classList.contains("tile-clicked")) {
    return;
  }

  board[r][c].classList.add("tile-clicked");
  tilesClicked += 1;

  let minesFound = 0;

  minesFound += checkTile(r - 1, c - 1);
  minesFound += checkTile(r - 1, c);
  minesFound += checkTile(r - 1, c + 1);

  minesFound += checkTile(r, c - 1);
  minesFound += checkTile(r, c + 1);

  minesFound += checkTile(r + 1, c - 1);
  minesFound += checkTile(r + 1, c);
  minesFound += checkTile(r + 1, c + 1);

  if (minesFound > 0) {
    board[r][
      c
    ].innerHTML = `<img src='/Assets/minesweeper/open${minesFound}.png' alt='Number of mines found around'>`;

    board[r][c].classList.add("x" + minesFound.toString());
  } else {
    board[r][c].innerText = "";

    checkMine(r - 1, c - 1);
    checkMine(r - 1, c);
    checkMine(r - 1, c + 1);

    checkMine(r, c - 1);
    checkMine(r, c + 1);

    checkMine(r + 1, c - 1);
    checkMine(r + 1, c);
    checkMine(r + 1, c + 1);
  }

  if (tilesClicked == rows * columns - minesCount) {
    gameOver = true;
    stopTimer();
    setFace("win");

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        let tile = board[r][c];
        if (!tile.classList.contains("tile-clicked")) {
          const tileStyle = tile.querySelector(".Tile_style");

          if (tileStyle && tileStyle.querySelector("img") === null) {
            const img = document.createElement("img");
            img.src = "/Assets/minesweeper/flag.png";
            img.alt = "Unrevealed tile";
            tileStyle.appendChild(img);
          }
        }
      }
    }
  }
}

function checkTile(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= columns) {
    return 0;
  }
  if (minesLocation.includes(r.toString() + "-" + c.toString())) {
    return 1;
  }
  return 0;
}

function setFace(expression) {
  const faceImg = document.querySelector(".mine_face_outer img");
  if (!faceImg) return;

  const faces = {
    smile: { src: "/Assets/minesweeper/smile.png", alt: "Smiley emoji" },
    surprised: { src: "/Assets/minesweeper/ohh.png", alt: "Surprised emoji" },
    dead: { src: "/Assets/minesweeper/dead.png", alt: "Dead emoji" },
    win: { src: "/Assets/minesweeper/win.png", alt: "Badass emoji" },
  };

  const face = faces[expression];
  if (!face) return;

  if ((expression === "smile" || expression === "surprised") && gameOver)
    return;
  if ((expression === "dead" || expression === "win") && !gameOver) return;

  faceImg.src = face.src;
  faceImg.alt = face.alt;
}
