let offset = 0;
let tiles = []; // Array to store tiles
let counter = 0;
let save = false;

//on temp there is a version that did worked perfect
function setup() {
  createCanvas(windowWidth, windowWidth / 2);
  let tileSize = windowWidth / 8;
  noFill();
  let cols = Math.floor(width / tileSize);
  let rows = Math.floor(height / tileSize);
  strokeWeight(tileSize / 28);

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      tiles.push(new ArcTile(i, j, tileSize)); // Add the tile to the array
    }
  }

  strokeCap(ROUND);
  strokeJoin(ROUND);
}

function draw() {
  background(255*0.9, 255*0.1, 0);
  offset = map(mouseX, 0, width, -95, 2500);
  
  for (let tile of tiles) {
    tile.display(offset);
  }
 
}

function keyPressed() {
  if (keyCode === 32) {  // 32 is the key code for the spacebar
    saveCanvas('frame' + nf(counter, 4) + '.png'); // Save with a numbered filename
    counter++; 
  }
}

