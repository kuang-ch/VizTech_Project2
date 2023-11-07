//Establishing Variables
let redTable;
let data = []; //Declaring an array
let slider; 
let userValue;
let riders;
let interactiveWidth;
let trueWidth;
let maxLinewidth = 30; //setting the maximum linewidth

//Loading in Orange Line CSV
function preload(){
  redTable = loadTable('assets/red_line.csv'
 , 'csv', 'header', () => {
  for(let row of redTable.rows){
    let rowData = {
      stop_name : row.get('stop_name'),
      order: int(row.get('order')),
      x: float(row.get('X')),
      y: float(row.get('Y')),
      ridersOn: int(row.get('on')),
      ridersOff: int(row.get('off')),
      sliderRef: row.get('slider_ref'),
      subLine: row.get('Alt')
    }
    data.push(rowData);
   }
   console.log(data);
 })
}

function redLine() {
  let trueWidth = 0;
  let trueWidthAtSplit;
  let orangeSplitX;
  let orangeSplitY;

for(let r = 0; r < redTable.getRowCount() - 1; r++){
  const timePeriod = redTable.getNum(r, "slider_ref");
  let order = redTable.getNum(r, "Order");
  const subLine = redTable.getString(r, "Alt");
  const stopX = redTable.getNum(r, "X");
  const stopY = redTable.getNum(r, "Y");
  let ridersOn = redTable.getNum(r, "on");
  let ridersOff = redTable.getNum(r, "off");

  let netRiders = ridersOn - ridersOff;
  trueWidth += netRiders; //add netRiders to trueWidth

  if(order < 33){ //Before the Line Split
    if(timePeriod === userValue){
      const nextStopX = redTable.getNum(r + 1, "X");
      const nextStopY = redTable.getNum(r + 1, "Y");

      let linewidth = map(trueWidth, 0, 1000000, 0, 30);
      linewidth = Math.min(linewidth, maxLinewidth);

      //Redline presplit
       beginShape()
       stroke(218, 41, 0, 28);
       noFill()
       strokeWeight(linewidth)
     //Vertices
       vertex(stopX, stopY);
       vertex(nextStopX, nextStopY);
       endShape(OPEN);
    }
   }
   if (order === 33) { //Set Values At the Line Split
    trueWidthAtSplit = trueWidth; // Save trueWidth at the split of the line
    orangeSplitX = stopX;
    orangeSplitY = stopY;
   }
   if (order > 33 && order < 37){
    if(timePeriod === userValue){
      const nextStopX = redTable.getNum(r + 1, "X");
      const nextStopY = redTable.getNum(r + 1, "Y");

      let linewidth = map(trueWidth, 0, 1000000, 0, 30);
      linewidth = Math.min(linewidth, maxLinewidth);

      //Redline presplit
       beginShape()
       stroke(218, 41, 0, 28);
       noFill()
       strokeWeight(linewidth)
     //Vertices
       vertex(stopX, stopY);
       vertex(nextStopX, nextStopY);
       endShape(OPEN);
    }
   }
   if (order > 37 && order < 42){
    if(timePeriod === userValue){
      const nextStopX = redTable.getNum(r + 1, "X");
      const nextStopY = redTable.getNum(r + 1, "Y");
      
      let linewidth = map(trueWidth, 0, 1000000, 0, 30);
      linewidth = Math.min(linewidth, maxLinewidth);

      //Redline presplit
       beginShape()
       stroke(218, 41, 0, 28);
       noFill()
       strokeWeight(linewidth)
     //Vertices
       vertex(stopX, stopY);
       vertex(nextStopX, nextStopY);
       endShape(OPEN);
    }
   }
  }

}

function setup() {
  createCanvas(1000, 750);

  //Creating Slider
  slider = createSlider(1, 9, 1, 1);
  slider.position(10, 10);
  slider.style('width', '160px');
}

//MBTA Map Redrawn
function draw() {
 //Background color
 background(255, 255, 255);

//Assigning Slider value
  userValue = slider.value()

//Grid
for (var x = 0; x < width; x += width / 40){
  for (var y = 0; y < height; y += height / 30){
    stroke(0, 0, 0, 10);
    strokeWeight(.25);
    line(x, 0, x, height);
    line(0, y, width, y);
  }

redLine()
} 
}