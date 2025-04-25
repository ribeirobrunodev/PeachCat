const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const audio = new Audio("./src/assets/audio.mp3");

const size = 30;
const initialPosition = { x: 270, y: 240 };

let snake = [initialPosition];
let direction, loopId;

// ✅ BACKGROUND
const background = new Image();
background.src = "./src/assets/tela.jpeg";

// ✅ GATINHO COMO COBRA
const catImg = new Image();
catImg.src = "./src/assets/gat2.gif";

const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

const randomPosition = () => {
  const number = randomNumber(0, canvas.width - size);
  return Math.round(number / size) * size;
};

const randomColor = () => {
  const red = randomNumber(0, 255);
  const green = randomNumber(0, 255);
  const blue = randomNumber(0, 255);
  return `rgb(${red}, ${green}, ${blue})`;
};

const food = {
  x: randomPosition(),
  y: randomPosition(),
  color: randomColor(),
};

const drawBackground = () => {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
};

const drawFood = () => {
  ctx.drawImage(catImg, food.x, food.y, size, size);
};

const drawSnake = () => {
  snake.forEach((position, index) => {
    ctx.drawImage(catImg, position.x, position.y, size, size);
  });
};

const moveSnake = () => {
  if (!direction) return;
  const head = snake[snake.length - 1];

  if (direction === "right") snake.push({ x: head.x + size, y: head.y });
  if (direction === "left") snake.push({ x: head.x - size, y: head.y });
  if (direction === "down") snake.push({ x: head.x, y: head.y + size });
  if (direction === "up") snake.push({ x: head.x, y: head.y - size });

  snake.shift();
};

const drawGrid = () => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#191919";
  for (let i = 30; i < canvas.width; i += 30) {
    ctx.beginPath();
    ctx.lineTo(i, 0);
    ctx.lineTo(i, 600);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(0, i);
    ctx.lineTo(600, i);
    ctx.stroke();
  }
};

const incrementScore = () => {
  score.innerText = +score.innerText + 10;
};

const checkEat = () => {
  const head = snake[snake.length - 1];
  if (head.x === food.x && head.y === food.y) {
    incrementScore();
    snake.push(head);
    audio.play();

    let x = randomPosition();
    let y = randomPosition();
    while (snake.find((pos) => pos.x === x && pos.y === y)) {
      x = randomPosition();
      y = randomPosition();
    }

    food.x = x;
    food.y = y;
    food.color = randomColor();
  }
};

const checkCollision = () => {
  const head = snake[snake.length - 1];
  const canvasLimit = canvas.width - size;
  const neckIndex = snake.length - 2;

  const wallCollision =
    head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;

  const selfCollision = snake.find((position, index) => {
    return index < neckIndex && position.x === head.x && position.y === head.y;
  });

  if (wallCollision || selfCollision) {
    gameOver();
  }
};

const gameOver = () => {
  direction = undefined;
  menu.style.display = "flex";
  finalScore.innerText = score.innerText;
  canvas.style.filter = "blur(2px)";
};

const gameLoop = () => {
  clearInterval(loopId);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  // drawGrid()
  drawFood();
  moveSnake();
  drawSnake();
  checkEat();
  checkCollision();

  loopId = setTimeout(() => {
    gameLoop();
  }, 200);
};

gameLoop();

let touchStartX = null;
let touchStartY = null;

canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

function handleTouchStart(event) {
  event.preventDefault();
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event) {
  if (!touchStartX || !touchStartY) return;
  event.preventDefault();
  const touch = event.touches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const sensitivity = 20;

  if (Math.abs(deltaX) > sensitivity || Math.abs(deltaY) > sensitivity) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && direction !== "left") direction = "right";
      else if (deltaX < 0 && direction !== "right") direction = "left";
    } else {
      if (deltaY > 0 && direction !== "up") direction = "down";
      else if (deltaY < 0 && direction !== "down") direction = "up";
    }
    touchStartX = null;
    touchStartY = null;
  }
}

function handleTouchEnd(event) {
  touchStartX = null;
  touchStartY = null;
}

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowRight" && direction !== "left") direction = "right";
  if (key === "ArrowLeft" && direction !== "right") direction = "left";
  if (key === "ArrowDown" && direction !== "up") direction = "down";
  if (key === "ArrowUp" && direction !== "down") direction = "up";
});

function move(dir) {
  if (dir === "up" && direction !== "down") direction = "up";
  if (dir === "down" && direction !== "up") direction = "down";
  if (dir === "left" && direction !== "right") direction = "left";
  if (dir === "right" && direction !== "left") direction = "right";
}

buttonPlay.addEventListener("click", () => {
  score.innerText = "00";
  menu.style.display = "none";
  canvas.style.filter = "none";
  snake = [initialPosition];
  direction = undefined;
  gameLoop();
});

function checkMobile() {
  if (window.innerWidth <= 768) {
    if (mobileControls) mobileControls.style.display = "flex";
  } else {
    if (mobileControls) mobileControls.style.display = "none";
  }
}

checkMobile();
window.addEventListener("resize", checkMobile);
