//Establishing Variables
let table;
let slider; 
let userValue;
let riders;

//Loading in Orange Line CSV
function preload(){
  table = loadTable('assets/orange_line_data.csv'
 , 'csv', 'header')
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

  //Getting Riders
  let v = userValue;
    const mbtaLine = table.getString(v, "route_id");
    const timePeriod = table.getString(v, "time_period_id");
    const timeName = table.getString(v, "time_period_name");
    const direction = table.getString(v, "direction_id"); //getting the direction
    riders = table.getNum(v, "avg_riders");

    console.log(riders)
  //Assigning width for each line
  let orangeWidth = map(riders, 0, 25000, 0, 20);
  let orangeLine = orangeWidth;
  let redLine = 5;

  //Grid
  for (var x = 0; x < width; x += width / 40){
    for (var y = 0; y < height; y += height / 30){
      stroke(0, 0, 0, 10);
      strokeWeight(.25);
      line(x, 0, x, height);
      line(0, y, width, y);
    }
  }

 //BlueLine
 beginShape()
 stroke(0, 61, 165, 190);
 noFill()
 strokeWeight(redLine)
 //Vertices
 vertex(550, 125);
 vertex(375, 300);
 vertex(325, 250);
endShape(OPEN);

  //Redline
  beginShape()
    stroke(218, 41, 28, 190);
    noFill()
    strokeWeight(redLine)
    //Vertices
    vertex(150, 125);
    vertex(375, 375);
    vertex (375, 625);
  endShape(OPEN);
  
  //OrangeLine
  beginShape()
    stroke(237, 139, 0, 190);
    noFill()
    strokeWeight(orangeLine)
    //Vertices
    vertex(375, 25);
    vertex(375, 325);
    vertex (125, 575);
  endShape(OPEN);

  //GreenLine
  beginShape()
    stroke(0, 132, 61, 190);
    noFill()
    strokeWeight(redLine)
    //Vertices
    vertex(250, 100);
    vertex(350, 200);
    vertex(350, 250);
    vertex(300, 300);
    vertex(25, 300);
  endShape(OPEN);
}