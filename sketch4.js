//Establishing Variables
let table;
let slider; 
let userValue;
let riders;
let interactiveWidth;
let trueWidth;
let maxLinewidth = 30; //setting the maximum linewidth

//Loading in Orange Line CSV
function preload(){
  table = loadTable('assets/orange_line_test.csv'
 , 'csv', 'header')
 console.log(table)
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
} 

let trueWidth = 0;
for(let r = 0; r < table.getRowCount(); r++){
  let x = r + 1; //assigns variable "x" for the next row
  if (x < table.getRowCount()){ //checks edge value
   const timePeriod = table.getNum(r, "slider_ref");
   if (timePeriod === userValue){
    const mbtaLine = table.getString(r, "route_id");
    const stopX = table.getNum(r, "X");
    const stopY = table.getNum(r, "Y");
    const nextStopX = table.getNum(x, "X");
    let ridersOn = table.getNum(r, "on");
    let ridersOff = table.getNum(r, "off");

    let netRiders = ridersOn - ridersOff;

    trueWidth += netRiders; //add netRiders to trueWidth

    let linewidth = map(trueWidth, 0, 1000000, 0, 30);
    linewidth = Math.min(linewidth, maxLinewidth);

     //OrangeLine
      beginShape()
      stroke(237, 139, 0, 255);
      noFill()
      strokeWeight(linewidth)
    //Vertices
      vertex(stopX, stopY);
      vertex(nextStopX, stopY);
      endShape(OPEN);
      console.log("This is TW", trueWidth)
   }
  }
}
}