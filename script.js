let playerCar, gameArea, scoreText;
let playerX, playerY, speed, score;
let enemies = [], lines = [];
let jumpCount = 10;
let isJumping = false;
let gameRunning = false;
let isPaused = false;
let enemyInterval;

const gameOverDiv = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");

pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const flyBtn = document.getElementById("flyBtn");

let leftInterval = null;
let rightInterval = null;

leftBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (leftInterval) return;
  movePlayer("left");
  leftInterval = setInterval(() => movePlayer("left"), 100);
});
leftBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  clearInterval(leftInterval);
  leftInterval = null;
});
leftBtn.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  clearInterval(leftInterval);
  leftInterval = null;
});

rightBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (rightInterval) return;
  movePlayer("right");
  rightInterval = setInterval(() => movePlayer("right"), 100);
});
rightBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  clearInterval(rightInterval);
  rightInterval = null;
});
rightBtn.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  clearInterval(rightInterval);
  rightInterval = null;
});

// Saut via bouton FLY
flyBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  jumpOver();
});

function startGame() {
  clearInterval(enemyInterval);
  gameRunning = true;
  isPaused = false;
  jumpCount = 10;
  score = 0;
  speed = 3;
  isJumping = false;
  pauseBtn.textContent = "⏸️ Pause";

  document.getElementById("menu").classList.add("hidden");
  gameOverDiv.classList.add("hidden");

  gameArea = document.getElementById("gameArea");
  gameArea.classList.remove("hidden");
  scoreText = document.getElementById("score");
  scoreText.classList.remove("hidden");

  enemies.forEach(e => e.remove());
  lines.forEach(l => l.remove());
  enemies = [];
  lines = [];

  playerCar = document.getElementById("playerCar");
  playerX = window.innerWidth / 2 - 25;
  playerY = window.innerHeight - playerCar.offsetHeight - 20;
  updatePlayerPosition();

  for (let i = 0; i < 6; i++) {
    const line = document.createElement("div");
    line.classList.add("roadLine");
    line.style.top = `${i * 150}px`;
    line.style.left = `calc(50% - 3px)`;
    gameArea.appendChild(line);
    lines.push(line);
  }

  enemyInterval = setInterval(() => {
    if (!gameRunning || isPaused) return;
    const enemy = document.createElement("div");
    enemy.classList.add("enemyCar");

    // Taille ennemie aléatoire
    const sizes = [
      { width: 35, height: 70 },
      { width: 50, height: 100 },
      { width: 70, height: 140 }
    ];
    const size = sizes[Math.floor(Math.random() * sizes.length)];

    enemy.style.width = size.width + "px";
    enemy.style.height = size.height + "px";

    const maxLeft = window.innerWidth - size.width;
    enemy.style.left = Math.floor(Math.random() * maxLeft) + "px";
    enemy.style.top = `-${size.height}px`;

    gameArea.appendChild(enemy);
    enemies.push(enemy);
  }, 1000);

  requestAnimationFrame(updateGame);
}

function resetGame() {
  gameRunning = false;
  isPaused = false;
  clearInterval(enemyInterval);
  enemies.forEach(e => e.remove());
  lines.forEach(l => l.remove());
  enemies = [];
  lines = [];
  document.getElementById("gameArea").classList.remove("hidden");
  document.getElementById("score").classList.remove("hidden");
  document.getElementById("gameOver").classList.add("hidden");
}

function updatePlayerPosition() {
  playerCar.style.left = `${playerX}px`;
  playerCar.style.top = `${playerY}px`;
}

function movePlayer(dir) {
  if (!gameRunning || isPaused) return;
  const step = 20;
  if (dir === "left" && playerX > 0) playerX -= step;
  if (dir === "right" && playerX < window.innerWidth - 50) playerX += step;
  if (dir === "up" && playerY > 0) playerY -= step;
  if (dir === "down" && playerY < window.innerHeight - 120) playerY += step;
  updatePlayerPosition();
}

function jumpOver() {
  if (jumpCount > 0 && !isJumping && !isPaused && gameRunning) {
    isJumping = true;
    jumpCount--;

    playerY = parseFloat(playerCar.style.top || (window.innerHeight - 120));

    let jumpHeight = 100;
    let jumpDuration = 500;
    let start = null;

    function animateJump(timestamp) {
      if (!start) start = timestamp;
      let elapsed = timestamp - start;

      if (elapsed < jumpDuration / 2) {
        playerCar.style.top = playerY - (jumpHeight * (elapsed / (jumpDuration / 2))) + "px";
      } else if (elapsed < jumpDuration) {
        playerCar.style.top = playerY - (jumpHeight * (1 - (elapsed - jumpDuration / 2) / (jumpDuration / 2))) + "px";
      } else {
        playerCar.style.top = playerY + "px";
        isJumping = false;
        return;
      }
      requestAnimationFrame(animateJump);
    }

    playerCar.style.opacity = "0.3";
    animateJump();

    setTimeout(() => {
      playerCar.style.opacity = "1";
    }, jumpDuration);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") e.preventDefault();

  if (!gameRunning || isPaused) return;

  if (e.key === "ArrowLeft") movePlayer("left");
  if (e.key === "ArrowRight") movePlayer("right");
  if (e.key === "ArrowUp") movePlayer("up");
  if (e.key === "ArrowDown") movePlayer("down");
  if (e.code === "Space") jumpOver();
});

function updateGame() {
  if (!gameRunning || isPaused) return;

  scoreText.innerText = `Score: ${score} | Sauts restants: ${jumpCount}`;

  lines.forEach(line => {
    let top = parseFloat(line.style.top || "0");
    top += speed;
    if (top > window.innerHeight) top = -100;
    line.style.top = `${top}px`;
  });

  enemies.forEach((enemy, index) => {
    let top = parseFloat(enemy.style.top || "-120");
    top += speed;
    enemy.style.top = `${top}px`;

    // Vérification collision avec exception pour le saut sur petites et moyennes voitures
    if (!isJumping || !canFlyOver(enemy)) {
      if (checkCollision(playerCar, enemy)) {
        gameRunning = false;
        clearInterval(enemyInterval);
        showGameOver();
      }
    }

    if (top > window.innerHeight) {
      gameArea.removeChild(enemy);
      enemies.splice(index, 1);
      score++;
      if (score % 5 === 0) speed += 0.5;
    }
  });

  requestAnimationFrame(updateGame);
}

function canFlyOver(enemy) {
  // Si la hauteur est <= 100, la voiture est petite ou moyenne => peut être survolée en saut
  const height = enemy.offsetHeight;
  return height <= 100;
}

function checkCollision(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return (
    r1.left < r2.right &&
    r1.right > r2.left &&
    r1.top < r2.bottom &&
    r1.bottom > r2.top
  );
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶️ Reprendre" : "⏸️ Pause";

  if (!isPaused && gameRunning) {
    requestAnimationFrame(updateGame);
  }
}

function showGameOver() {
  gameArea.classList.add("hidden");
  scoreText.classList.add("hidden");
  finalScoreText.innerText = `Game Over ! Ton score : ${score}`;
  gameOverDiv.classList.remove("hidden");
}
