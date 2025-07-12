// script.js
let playerCar, gameArea, scoreText;
let playerX, playerY, speed, score;
let enemies = [], lines = [];
let jumpCount = 10;
let isJumping = false;
let gameRunning = false;
let isPaused = false;
let enemyInterval;
let currentMusic = "default";

const gameOverDiv = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");
const restartSameMusicBtn = document.getElementById("restartSameMusicBtn");
const restartDefaultMusicBtn = document.getElementById("restartDefaultMusicBtn");
const restartNewMusicBtn = document.getElementById("restartNewMusicBtn");
const pauseBtn = document.getElementById("pauseBtn");
const muteBtn = document.getElementById("muteBtn");
const useDefaultMusicBtn = document.getElementById("useDefaultMusicBtn");
const importMusicBtn = document.getElementById("importMusicBtn");
const customMusicInput = document.getElementById("customMusicInput");

const bgMusic = document.getElementById("bgMusic");
const explosionSound = document.getElementById("explosionSound");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const flyBtn = document.getElementById("flyBtn");

// Musique
useDefaultMusicBtn.addEventListener("click", () => {
  currentMusic = "default";
  bgMusic.src = "engine_loop.mp3";
  startGame();
});

importMusicBtn.addEventListener("click", () => {
  customMusicInput.click();
});

customMusicInput.addEventListener("change", () => {
  const file = customMusicInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    bgMusic.src = url;
    currentMusic = url;
    startGame();
  }
});

muteBtn.addEventListener("click", () => {
  bgMusic.muted = !bgMusic.muted;
  explosionSound.muted = bgMusic.muted;
  muteBtn.textContent = bgMusic.muted ? "🔇" : "🔊";
});

pauseBtn.addEventListener("click", togglePause);

restartSameMusicBtn.addEventListener("click", () => {
  resetGame();
  startGame(currentMusic);
});

restartDefaultMusicBtn.addEventListener("click", () => {
  currentMusic = "default";
  bgMusic.src = "engine_loop.mp3";
  resetGame();
  startGame();
});

restartNewMusicBtn.addEventListener("click", () => {
  customMusicInput.click();
});

// Touches mobiles
let leftInterval, rightInterval;

leftBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  movePlayer("left");
  leftInterval = setInterval(() => movePlayer("left"), 100);
});
leftBtn.addEventListener("touchend", () => clearInterval(leftInterval));
rightBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  movePlayer("right");
  rightInterval = setInterval(() => movePlayer("right"), 100);
});
rightBtn.addEventListener("touchend", () => clearInterval(rightInterval));
flyBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  jumpOver();
});

document.addEventListener("keydown", (e) => {
  if (!gameRunning || isPaused) return;
  if (e.key === "ArrowLeft") movePlayer("left");
  if (e.key === "ArrowRight") movePlayer("right");
  if (e.code === "Space") {
    e.preventDefault();
    jumpOver();
  }
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
    gameArea.appendChild(line);
    lines.push(line);
  }

  bgMusic.currentTime = 0;
  bgMusic.play();

  enemyInterval = setInterval(() => {
    if (!gameRunning || isPaused) return;
    const enemy = document.createElement("div");
    enemy.classList.add("enemyCar");

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
  gameArea.classList.remove("hidden");
  scoreText.classList.remove("hidden");
  gameOverDiv.classList.add("hidden");
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
  updatePlayerPosition();
}

function jumpOver() {
  if (jumpCount > 0 && !isJumping && !isPaused && gameRunning) {
    isJumping = true;
    jumpCount--;

    const originalTop = parseFloat(playerCar.style.top || (window.innerHeight - 120));
    const jumpHeight = 120;
    const jumpDuration = 500;
    let start = null;

    playerCar.style.opacity = "0.3";

    function animateJump(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed < jumpDuration / 2) {
        const newTop = originalTop - jumpHeight * (elapsed / (jumpDuration / 2));
        playerCar.style.top = `${newTop}px`;
      } else if (elapsed < jumpDuration) {
        const newTop = originalTop - jumpHeight * (1 - (elapsed - jumpDuration / 2) / (jumpDuration / 2));
        playerCar.style.top = `${newTop}px`;
      } else {
        playerCar.style.top = `${originalTop}px`;
        playerCar.style.opacity = "1";
        isJumping = false;
        return;
      }

      requestAnimationFrame(animateJump);
    }

    requestAnimationFrame(animateJump);
  }
}

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

    const enemyHeight = enemy.offsetHeight;
    const canCollide = !isJumping || enemyHeight >= 120;

    if (canCollide && checkCollision(playerCar, enemy)) {
      explosionSound.currentTime = 0;
      explosionSound.play();
      bgMusic.pause();
      gameRunning = false;
      clearInterval(enemyInterval);
      showGameOver();
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
