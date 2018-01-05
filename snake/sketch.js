var DIR_UP = 0,
  DIR_RIGHT = 1,
  DIR_DOWN = 2,
  DIR_LEFT = 3,

  step = 0,
  framesInStep = 2,
  canvas,
  w = 40,
  h = 30,
  tileSize = window.location.href.match(/\?tile=(\d+)/) ? 
    parseInt(window.location.href.match(/\?tile=(\d+)/)[1]) : 10,

  snake,
  special,
  fruit,

  gameOver,
  gameOverAnnounced,
  specialGoneSteps,

  steeringMode,

  greenLcd = [75, 81, 75],
  skyBlue = [211, 52, 99],
  clouds,
  cloudsGfx,

  special2018 = [
    ' #####    ###      #    ##### ',
    '#     #  #   #    ##   #     #',
    '      # #     #  # #   #     #',
    ' #####  #     #    #    ##### ',
    '#       #     #    #   #     #',
    '#        #   #     #   #     #',
    '#######   ###    #####  ##### '].join("\n");

  specialGameOver = [
    ' ####    ##   #    # ######',
    '#    #  #  #  ##  ## #     ',
    '#      #    # # ## # ##### ',
    '#  ### ###### #    # #     ',
    '#    # #    # #    # #     ',
    ' ####  #    # #    # ######',
    '',
    ' ####  #    # ###### ##### ',
    '#    # #    # #      #    #',
    '#    # #    # #####  #    #',
    '#    # #    # #      ##### ',
    '#    #  #  #  #      #   # ',
    ' ####    ##   ###### #    #'].join("\n");

document.onkeydown = input;


//         #######
//  #####  #
//  #    # #
//  #    # ######
//  #####        #
//  #      #     #
//  #       #####

function preload() {
  clouds = loadImage('./clouds.jpg');
}

function setup() {
  canvas = createCanvas((w + 1) * tileSize, (h + 1) * tileSize);
  canvas.parent('game');

  cloudsGfx = createGraphics((w + 1) * tileSize, (h + 1) * tileSize);

  frameRate(10);
  colorMode(HSB, 360, 100, 100, 255);

  noStroke();
  resetGame();
}

function draw() {
  if (gameOver) {
    if (!gameOverAnnounced) {
      drawGameOver();
      gameOverAnnounced = true;
    }
  } else {
    if (step % framesInStep === 0) move();

    drawBackground();
    drawBorder();
    drawSnake();
    drawSpecial();
    drawFruit();

    step++;
  }
}


//  ####    ##   #    # ######
// #    #  #  #  ##  ## #
// #      #    # # ## # #####
// #  ### ###### #    # #
// #    # #    # #    # #
//  ####  #    # #    # ######

function resetGame() {
  loadSpecial(special2018, 5, 10);
  gameOver = false;
  gameOverAnnounced = false;
  steeringMode = false;
  specialGoneSteps = 0;
  snake = {
    dir: DIR_DOWN,
    chain: [ { x: 20, y: Math.floor(h / 2) } ],
  };
  moveFruit();
}

function move(dir) {
  var newPos;
  var lastPos = snake.chain[snake.chain.length - 1];

  switch (snake.dir) {
    case DIR_UP:
      newPos = { x: lastPos.x, y: lastPos.y - 1 };
      break;
    case DIR_DOWN:
      newPos = { x: lastPos.x, y: lastPos.y + 1 };
      break;
    case DIR_LEFT:
      newPos = { x: lastPos.x - 1, y: lastPos.y };
      break;
    case DIR_RIGHT:
      newPos = { x: lastPos.x + 1, y: lastPos.y };
      break;
  }

  if (checkBorder(newPos) || checkSnake(newPos)) {
    gameOver = true;
  } else if (checkFruit(newPos)) {
    snake.chain.push(newPos);
    moveFruit();
  } else if (checkSpecial(newPos)) {
    snake.chain.push(newPos);
    removeSpecial(newPos);
  } else {
    snake.chain.push(newPos);
    snake.chain.shift();
  }
}

function checkSnake(pos) {
  return snake.chain.reduce(function(acc, partPos) {
    acc = acc || generalCheck(pos, partPos);
    return acc;
  }.bind(pos), false);
}

function checkBorder(pos) {
  if (special.length === 0) return false;
  return (pos.x === 0 || pos.x === w || pos.y === 0 || pos.y === h);
}

function checkFruit(pos) {
  return generalCheck(pos, fruit);
}

function checkSpecial(pos) {
  return special.reduce(function(acc, fruitPos) {
    acc = acc || generalCheck(pos, fruitPos);
    return acc;
  }.bind(pos), false);
}

function generalCheck(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function moveFruit() {
  do {
    var newPos = getRandomPos();
    var noProblem = checkSnake(newPos) || checkSpecial(newPos);
  } while (noProblem);

  fruit = newPos;
}

function loadSpecial(text, xOff, yOff) {
  special = [];
  specialCount = 0;
  text.split("\n").forEach(function(line, y) {
    line.split('').map(function(char, x) {
      if (char !== ' ') {
        specialCount++;
        special.push({ x: x + xOff, y: y + yOff });
      }
    });
  });
}

function removeSpecial(pos) {
  special = special.filter(function(specialPos) {
    return !generalCheck(pos, specialPos);
  }.bind(pos));
}

function rotateLeft() {
  snake.dir = (-1 + snake.dir + 4) % 4;
  return false;
}

function rotateRight() {
  snake.dir = (1 + snake.dir + 4) % 4;
  return false;
}

function getRandomPos() {
  return { x: getRandomInt(1, w - 1), y: getRandomInt(1, h - 1) };
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//  # #    # #####  #    # #####
//  # ##   # #    # #    #   #
//  # # #  # #    # #    #   #
//  # #  # # #####  #    #   #
//  # #   ## #      #    #   #
//  # #    # #       ####    #

function input(e) {
    e = e || window.event;

    if ([8, 13, 32, 88].indexOf(e.keyCode) != -1) {
      resetGame();
    } else if (e.keyCode === 83) {
      steeringMode = !steeringMode;
    } else if (steeringMode) {
      if (e.keyCode == '37') rotateLeft();
      else if (e.keyCode == '39') rotateRight();
    } else {
      if (e.keyCode == '38') snake.dir = DIR_UP;
      else if (e.keyCode == '40') snake.dir = DIR_DOWN;
      else if (e.keyCode == '37') snake.dir = DIR_LEFT;
      else if (e.keyCode == '39') snake.dir = DIR_RIGHT;
    }

    e.preventDefault();
}


//  #####  #####    ##   #    # # #    #  ####
//  #    # #    #  #  #  #    # # ##   # #    #
//  #    # #    # #    # #    # # # #  # #
//  #    # #####  ###### # ## # # #  # # #  ###
//  #    # #   #  #    # ##  ## # #   ## #    #
//  #####  #    # #    # #    # # #    #  ####

function drawBackground() {
  background(
    map(special.length, 0, specialCount, skyBlue[0], greenLcd[0]),
    map(special.length, 0, specialCount, skyBlue[1], greenLcd[1]),
    map(special.length, 0, specialCount, skyBlue[2], greenLcd[2])
  );

  if (special.length < specialCount / 2) {
    var imgProportion = clouds.height / height;

    push();
    cloudsGfx.image(clouds,
      0, 0, width, height,
      300 + step % (clouds.width / 2), 0, width * imgProportion, clouds.height
    );
    cloudsGfx.background(0, map(special.length, specialCount / 2, 0, 255, 0));
    blendMode(SCREEN);
    image(cloudsGfx, 0, 0);
    pop();
  }
}

function drawFruit() {
  if (step % 8 < 6) {
    fill(0, 150);
    drawTile(fruit.x, fruit.y);
  }
}

function drawSpecial() {
  special.forEach(function(part) {
    fill(0, 150);
    drawTile(part.x, part.y);
  });
}

function drawSnake() {
  snake.chain.forEach(function(part, index) {
    if (index == snake.chain.length - 1) {
      fill(0, 50);
      rect(part.x * tileSize - 1, part.y * tileSize - 1, tileSize + 1, tileSize + 1);
    }

    if (special.length === 0 || index < specialCount - special.length) rainbowFill(index);
    else fill(0, 150);
    drawTile(part.x, part.y);
  });
}

function drawBorder() {
  if (special.length == 0) {
    specialGoneSteps++;
  }

  if (specialGoneSteps < 40) {
    var p = (40 - specialGoneSteps) / 40;
    fill(0, 150);

    for (var x = w; x >= 0; x--) {
      probTile(p, x, 0);
      probTile(p, x, h);
    }

    for (var y = h - 1; y >= 1; y--) {
      probTile(p, 0, y);
      probTile(p, w, y);
    }
  }
}

function probTile(probability, x, y) {
   if (Math.random() < probability) drawTile(x, y);
}

function drawTile(x, y) {
  var sub = (tileSize / 2) - 1;

  for (var xOff = 1; xOff >= 0; xOff--) {
    for (var yOff = 1; yOff >= 0; yOff--) {
      subX = x * tileSize + xOff * tileSize / 2;
      subY = y * tileSize + yOff * tileSize / 2;
      rect(subX, subY, sub, sub);

      // shadow
      push();
      fill(0, 40);
      rect(subX + sub, subY + 1, 1, sub);
      rect(subX + 1, subY + sub, sub - 1, 1);
      pop();
    }
  }
}

function rainbowFill(seed) {
  fill((step * 30 + seed * 10) % 360, 100, 80);
}

function drawGameOver() {
  background(0, 100);
  loadSpecial(specialGameOver, 6, 8);
  fill(255, 200);
  special.forEach(function(part) {
    drawTile(part.x, part.y);
  });
}
