//Establishing Variables
let table;
let slider; 
let userValue;
let riders;
let interactiveWidth;

//Loading in Orange Line CSV
function preload(){
  table = loadTable('assets/all_line_data.csv'
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
  console.log(userValue);

//Grid
for (var x = 0; x < width; x += width / 40){
  for (var y = 0; y < height; y += height / 30){
    stroke(0, 0, 0, 10);
    strokeWeight(.25);
    line(x, 0, x, height);
    line(0, y, width, y);
  }
} 

  //Setting Variables from .csv
  for (let r = 0; r < table.getRowCount(); r++){
    const mbtaLine = table.getString(r, "route_id");
    const timePeriod = table.getNum(r, "slider_ref");
    const timeName = table.getString(r, "time_period_name");
    //const direction = table.getString(r, "direction_id"); //getting the direction
    riders = table.getNum(r, "avg_riders");

    if (timePeriod === userValue){
        //Assigning width for each line
        interactiveWidth = map(riders, 0, 20000, 0, 10);
        let orangeLine = interactiveWidth;
        let redLine = interactiveWidth;
        let blueLine = interactiveWidth;
        let greenLine = interactiveWidth;

      if(mbtaLine === "Orange"){ //Orange Line Interactive
          //OrangeLine
            beginShape()
              stroke(237, 139, 0, 255);
              noFill()
              strokeWeight(orangeLine)
          //Vertices
              vertex(375, 25);
              vertex(375, 325);
              vertex (125, 575);
            endShape(OPEN);
      } else if(mbtaLine === "Red"){//Red Line Interactive
         //Redline
        beginShape()
          stroke(218, 41, 28, 255);
          noFill()
          strokeWeight(redLine)
        //Vertices
          vertex(150, 125);
          vertex(375, 375);
          vertex (375, 625);
        endShape(OPEN);
      } else if(mbtaLine === "Blue"){//Blue Line
        //BlueLine
        beginShape()
          stroke(0, 61, 165, 190);
          noFill()
          strokeWeight(blueLine)
        //Vertices
          vertex(550, 125);
          vertex(375, 300);
          vertex(325, 250);
        endShape(OPEN);
      } else if(mbtaLine === "Green"){  //Green Line
        //GreenLine
        beginShape()
          stroke(0, 132, 61, 190);
          noFill()
          strokeWeight(greenLine)
       //Vertices
         vertex(250, 100);
         vertex(350, 200);
         vertex(350, 250);
         vertex(300, 300);
         vertex(25, 300);
        endShape(OPEN);
      }
    }
  }
}