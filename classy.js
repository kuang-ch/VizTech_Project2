//Establishing Table Variables
let redTable;
let redData = []; //Declaring an array
let slider;
let userValue;
let maxLinewidth = 30; //setting the maximum linewidth
let trainArtifacts = [];
let filteredData = [];

//Variables for controlling mapping
let minPremapped = 0;
let maxPremapped = 800000;
let minPostmapped = 0;
let maxPostmapped = 10;

//Loading in CSV
function preload() {
  //Loading Red Table
  redTable = loadTable('assets/red_line_forclasses.csv'
    , 'csv', 'header', () => {
      for (let row of redTable.rows) {
        let rowData = {
          direction: int(row.get('direction_id')),
          stopName: row.get('stop_name'),
          order: int(row.get('Order')),
          x: float(row.get('X')),
          y: float(row.get('Y')),
          ridersOn: int(row.get('on')),
          ridersOff: int(row.get('off')),
          sliderRef: int(row.get('slider_ref')),
          subLine: int(row.get('Alt'))
        }
        redData.push(rowData);
      }
    })
}

function setup() {
  createCanvas(1000, 750);

  //Creating Slider
  slider = createSlider(1, 9, 1, 1);
  slider.position(10, 10);
  slider.style('width', '160px');

  //Accessing redData
  for (let i = 0; i < redData.length; i++) {
    let arrayData = redData[i];

    //Creating Inbound objects
    let trainObject = new train(
      arrayData.direction,
      arrayData.sliderRef,
      arrayData.stopName,
      arrayData.order,
      arrayData.x,
      arrayData.y,
      arrayData.ridersOn,
      arrayData.ridersOff,
      arrayData.subLine,
    );

    //Push Inbound object to global array
    trainArtifacts.push(trainObject);
  }
}

class train {
  constructor(direction, sliderRef, stopName, order, x, y, ridersOn, ridersOff, subLine) {
    this.direction = direction;
    this.sliderRef = sliderRef;
    this.stopName = stopName;
    this.order = order;
    this.x = x;
    this.y = y;
    this.ridersOn = ridersOn;
    this.ridersOff = ridersOff;
    this.subLine = subLine;
  }
}

function inboundTrain(trainInstances) {
  //Code to draw line between lowest order point and next highest order point
  for (let i = 0; i < trainInstances.length; i++) { //Loop through all of the instances or whatever...
    let currentTrain = trainInstances[i];
    userValue = slider.value();
    //Filter trainArtifacts to only include objects where sliderRef = userValue
    const filteredData = trainInstances.filter(train => train.sliderRef === userValue);

    filteredData.sort((a, b) => { //Sort first by sublines, then by Order
      if (a.subLine !== b.subLine) {
        return a.subLine - b.subLine;
      } else {
        return a.order - b.order;
      }
    });

    //declaring the stops
    let stopA;
    let stopB;
    let linewidth;
    let junctionBreak;

    junctionBreak = filteredData
      .filter(train => train.direction === 0 && train.subLine === 0)
      .sort((a, b) => b.order - a.order) //Sort in descending order
      .find(train => true);

    //Setting up variable linewidth
    let netOn = 0
    let netOff = 0

    //Iterating through filteredData to create pairs of stopA and stopB
    for (let j = 0; j < filteredData.length - 1; j++) {
      stopA = filteredData[j];

      //Find the next stopB based on certain conditions;
      stopB = filteredData.find(train =>
        train.direction === 0 &&
        train.subLine === stopA.subLine &&
        train.order > stopA.order
      );

      //Update netOn and netOff for each iteration
      netOn += stopA.ridersOn;
      netOff += stopA.ridersOff;

      linewidth = netOn - netOff;
      console.log("this is linewidth:", linewidth)
      let actualWidth = map(linewidth, minPremapped, maxPremapped, minPostmapped, maxPostmapped);
      actualWidth = Math.min(actualWidth, maxLinewidth);


      if (stopB) {
        //console.log("This is pair:", stopA, stopB);
        //Drawing the Lines
        stroke(255, 0, 0);
        strokeWeight(actualWidth);
        line(stopA.x, stopA.y, stopB.x, stopB.y)
      }

      if (!stopB) {
        const junctions = {};

        //Finding other Junctions
        filteredData
          .filter(train => train.subLine !== 0)
          .forEach(train => {
            if (!junctions[train.subLine] || train.order < junctions[train.subLine].order) {
              junctions[train.subLine] = train;
            }
          })

        //Use Object.values to get an array of junctions
        const junctionArray = Object.values(junctions);
        //console.log(junctionArray) TROUBLESHOOT FOR WHAT ARE THE JUNCTIONS

        for (let r = 0; r < junctionArray.length; r++) {
          let nextJunction = junctionArray[r];

          //Drawing lines between the Junctions
          stroke(255, 0, 0);
          strokeWeight(actualWidth);
          line(junctionBreak.x, junctionBreak.y, nextJunction.x, nextJunction.y);
        }
      }
    };
  }
}

//MBTA Map Redrawn
function draw() {
  //Background color
  background(255, 255, 255);

  //Grid
  for (var x = 0; x < width; x += width / 40) {
    for (var y = 0; y < height; y += height / 30) {
      stroke(0, 0, 0, 10);
      strokeWeight(.25);
      line(x, 0, x, height);
      line(0, y, width, y);
    }
  }
  inboundTrain(trainArtifacts);
}