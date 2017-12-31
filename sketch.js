var step = 0;
var w = window.innerWidth;
var h = window.innerHeight;
var sounds = {};
var rowSounds, rows, cols = 24, board;
var framesInStep = 5;
var debug = false;

function preload() {
  sounds.dong = loadSound('sounds/dong.mp3');

  sounds['nedavej'] = loadSound('sounds/nedavej.mp3');
  sounds['uu'] = loadSound('sounds/uu.mp3');
  sounds['uuh'] = loadSound('sounds/uuh.mp3');
  sounds['uklik-tink'] = loadSound('sounds/uklik-tink.mp3');
  sounds['klink'] = loadSound('sounds/klink.mp3');
  sounds['unankancvink'] = loadSound('sounds/unankancvink.mp3');
  sounds['vzumvz'] = loadSound('sounds/vzumvz.mp3');
  sounds['klink2'] = loadSound('sounds/klink2.mp3');
  sounds['stastny-novy-rok'] = loadSound('sounds/stastny-novy-rok.mp3');
  sounds['stastny-novy-rok-h'] = loadSound('sounds/stastny-novy-rok-h.mp3');
  sounds['echu'] = loadSound('sounds/echu.mp3');
  sounds['hhhhhhkrukp'] = loadSound('sounds/hhhhhhkrukp.mp3');
  sounds['hmmmmm'] = loadSound('sounds/hmmmmm.mp3');
  sounds['echu2'] = loadSound('sounds/echu2.mp3');
  sounds['hodne-stesti'] = loadSound('sounds/hodne-stesti.mp3');
  sounds['hodne-zdravi'] = loadSound('sounds/hodne-zdravi.mp3');
  sounds['a-takove-ty-veci'] = loadSound('sounds/a-takove-ty-veci.mp3');
  sounds['pfko'] = loadSound('sounds/pfko.mp3');
  sounds['do-noveho-roku'] = loadSound('sounds/do-noveho-roku.mp3');
  sounds['do-noveho-roku-h'] = loadSound('sounds/do-noveho-roku-h.mp3');
  sounds['2008'] = loadSound('sounds/2008.mp3');
  sounds['2018'] = loadSound('sounds/2018.mp3');
  sounds['kshhhshhhshhh'] = loadSound('sounds/kshhhshhhshhh.mp3');
  sounds['chaiiii'] = loadSound('sounds/chaiiii.mp3');

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
  history.replaceState('saved', '', state ? '?s=' + state : '/');
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
    }, []).join(',');
    if (active) {
      return index + ':' + active;
    }
  }).filter(function(val) { return val; }).join(';');
}

function deserializeBoard(data) {
  board = generateBoard();
  var boardKeys = Object.keys(board);
  if (data) {
    data.split(';').forEach(function(key) {
      if (!key.match(/:$/)) {
        var soundKey = key.split(':')[0]; 
        key.split(':')[1].split(',').forEach(function(col) {
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
