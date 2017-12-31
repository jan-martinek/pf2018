var step = 0;
var w = window.innerWidth;
var h = window.innerHeight;
var sounds, rowSounds, rows, cols = 24, board;
var framesInStep = 5;
var debug = false;
var soundNames = ['dong', 'nedavej', 'uu', 'uuh', 'uklik-tink', 'klink', 
  'unankancvink', 'vzumvz', 'klink2', 'stastny-novy-rok', 'stastny-novy-rok-h', 
  'echu', 'hhhhhhkrukp', 'hmmmmm', 'echu2', 'hodne-stesti', 'hodne-zdravi', 
  'a-takove-ty-veci', 'pfko', 'do-noveho-roku', 'do-noveho-roku-h', '2008', 
  '2018', 'kshhhshhhshhh', 'chaiiii'];

function preload() {
  sounds = soundNames.reduce(function(acc, name) {
    acc[name] = loadSound('sounds/' + name + '.mp3');
    return acc;
  }, {});
}

function setup() {
  createCanvas(w, h);
  frameRate(30);
  colorMode(HSB);

  rowSounds = Object.keys(sounds);
  rows = rowSounds.length;
  board = generateBoard();
  loadStateFromUrl();
}

function draw() {  
  drawBoard();
  drawLine();

  if (step % framesInStep === 0) {
    playSounds((step / framesInStep) % cols);  
  }

  step++;
}

function drawLine() {
  push();
  var x = (step % (cols * framesInStep)) / (cols * framesInStep) * w;

  strokeWeight(10);
  stroke(0, 0, 0, 0.1);
  line(x, 0, x, h)
  pop();
}

function mouseClicked() {
  var x = Math.floor(mouseX / (w / cols));
  var y = Math.floor(mouseY / (h / rows));
  board[Object.keys(board)[y]][x] = !board[Object.keys(board)[y]][x];

  saveState();
}

function loadStateFromUrl() {
  if (window.location.href.match(/s=.+/)) {
    var data = window.location.href.split('s=')[1];
    deserializeBoard(data);
  }
}

function saveState() {
  var state = serializeBoard();
  history.replaceState('saved', '', state ? '/pf2018/?s=' + state : '/');
}

function drawBoard() {
  var res = { w: w/cols, h: h/rows };
  noStroke();

  Object.keys(board).forEach(function(key, row) {
    board[key].forEach(function(val, col) {
      push();
      var x = col*res.w;
      var y = row*res.h;
      var mouseOn = mouseX > x && mouseX < x + res.w && mouseY > y && mouseY < y + res.h;
      fill(col / cols * 360, val ? 100 : 30, 100);

      rect(x, y, res.w, res.h);
      if (mouseOn) {
        fill(col / cols * 360, 60, 100);
        rect(x + 4, y + 4, res.w - 8, res.h - 8, 5);
      }
      if (debug) {
        fill('black');
        text(key + 'x', x, y + 10);  
      }
      pop();
    });
  });
}

function playSounds(cur) {
  Object.keys(sounds).forEach(function(key) {
    if (board[key][cur]) {
      sounds[key].setVolume(0.1);
      sounds[key].play();
    }
  });
}

function generateBoard() {
  return Object.keys(sounds).reduce(function(acc, key) {
    acc[key] = Array.apply(null, Array(cols)).map(function (_, i) {
      return false;
    });
    return acc;
  }, {});
}

function serializeBoard() {
  return Object.keys(board).map(function(key, index) {
    var active = board[key].reduce(function(acc, val, id) {
      if (val) acc.push(id);
      return acc;
    }, []).join('_');
    if (active) {
      return index + '__' + active;
    }
  }).filter(function(val) { return val; }).join('-');
}

function deserializeBoard(data) {
  board = generateBoard();
  var boardKeys = Object.keys(board);
  if (data) {
    data.split('-').forEach(function(key) {
      if (!key.match(/:$/)) {
        var soundKey = key.split('__')[0]; 
        key.split('__')[1].split('_').forEach(function(col) {
          board[boardKeys[soundKey]][col] = true;
        });  
      }
    });
  }
}

function keyTyped() {
  debug = key === 'x' ? true : false;

  if (key === 'd') {
    board = generateBoard();
    saveState(); 
  }
}
