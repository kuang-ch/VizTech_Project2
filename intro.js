function setup() {
  let introCanvas = createCanvas(1500, 800);
  let introDiv = select('#intro')
  introCanvas.parent(introDiv);

  //Getting rid of default cursor
  noCursor();
}

function mouse() {
  stroke("#333333");
  strokeWeight(3);
  ellipse(mouseX, mouseY, 10, 10)
}

function mousePressed() {
  let introDiv = select('#intro');

  // Check if the div is currently visible
  if (introDiv.style('display') === 'none') {
    // If it's hidden, show it
    introDiv.style('display', 'block');
  } else {
    // If it's visible, hide it
    introDiv.style('display', 'none');
  }
}

//MBTA Map Redrawn
function draw() {

  clear();
  //Background color
  fill(255, 0, 0);
  rect(0, 0, 100, 100);

  mouse();
}