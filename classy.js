//Establishing Table Variables
let stopsTable;
let stopsData = []; //Declaring an array
let slider;
let userValue;
let mbtaLineWidth = 5;
let maxLinewidth = 30; //setting the maximum linewidth
let trainArtifacts = [];
let filteredData = [];

//Variables for controlling mapping
let minPremapped = 0;
let maxPremapped = 800000;
let minPostmapped = 0;
let maxPostmapped = 10;

//Colors of the Each Route
let redRouteColor = "#c1272d";
let orangeRouteColor = "#f15a24";
let greenRouteColor = "#009245";
let blueRouteColor = "#2e3192";

//Offsetting Plots
let inboundOffset = -100;
let outboundOffset = +400;

//Loading in CSV
function preload() {
  //Loading Red Table
  stopsTable = loadTable('assets/all_stops_positioned.csv'
    , 'csv', 'header', () => {
      for (let row of stopsTable.rows) {
        let rowData = {
          direction: int(row.get('direction_id')),
          route: row.get('route_id'),
          stopName: row.get('stop_name'),
          order: int(row.get('Order')),
          x: float(row.get('X')),
          y: float(row.get('Y')),
          ridersOn: int(row.get('on')),
          ridersOff: int(row.get('off')),
          sliderRef: int(row.get('slider_ref')),
          subLine: int(row.get('Alt'))
        }
        stopsData.push(rowData);
      }
    })
}

function setup() {
  createCanvas(1600, 800);

  //Creating Slider
  slider = createSlider(1, 9, 1, 1);
  slider.position(10, 10);
  slider.style('width', '160px');

  //Accessing redData
  for (let i = 0; i < stopsData.length; i++) {
    let arrayData = stopsData[i];

    //Creating Inbound objects
    let trainObject = new train(
      arrayData.direction,
      arrayData.route,
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

class train { //Using classes to create the "trainArtifacts" array
  constructor(direction, route, sliderRef, stopName, order, x, y, ridersOn, ridersOff, subLine) {
    this.direction = direction;
    this.route = route;
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

function drawInboundTrain(trainInstances, route, trainDirection, colorRoute, xOffset) {
  //Narrowing down to only the specified time period
  userValue = slider.value();
  filteredData = trainInstances.filter(train => train.sliderRef === userValue && train.route === route && train.direction == trainDirection); //subsetting by TIME PERIOD  and ROUTE
  filteredData.sort((a, b) => a.order - b.order); //Sorting by ORDER
  //console.log(filteredData) TROUBLESHOOTING

  //Declaring the stops
  let stopA;
  let stopB;
  let linewidth;
  let junctionBreak;

  junctionBreak = filteredData
    .filter(train => train.direction === trainDirection && train.subLine === 0)
    .sort((a, b) => b.order - a.order) //Sort in descending order
    .find(train => true);

  //Setting up variable linewidth
  let netOn = 0
  let netOff = 0

  //Iterating through filteredData to create pairs of stopA and stopB
  for (let j = 0; j < filteredData.length - 1; j++) {
    stopA = filteredData[j];

    //Find the next stopB based on same DIRECTION, SUBLINE, >ORDER;
    stopB = filteredData.find(train =>
      train.direction === 0 &&
      train.subLine === stopA.subLine &&
      train.order > stopA.order //Makes sure that order stopB order > stopA
    );

    //Update netOn and netOff for each iteration
    netOn += stopA.ridersOn;
    netOff += stopA.ridersOff;
    linewidth = abs(netOn - netOff);

    //console.log("this is linewidth:", linewidth)
    let actualWidth = map(linewidth, minPremapped, maxPremapped, minPostmapped, maxPostmapped);
    actualWidth = Math.min(actualWidth, maxLinewidth);


    if (stopB) { //If there is a pair, draw a line between them
      //console.log("This is pair:", stopA, stopB);
      //Drawing the Lines
      stroke(color(colorRoute));
      strokeWeight(actualWidth);
      line(stopA.x + xOffset, stopA.y, stopB.x + xOffset, stopB.y)
    }

    if (!stopB) {//If there is not a pair, draw a line between each subline's LOWEST ORDER and the JUNCTION BREAK
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

      for (let r = 0; r < junctionArray.length; r++) {//This is actual code for drawing those lines
        let nextJunction = junctionArray[r];

        //Drawing lines between the Junctions
        stroke(color(colorRoute));
        strokeWeight(actualWidth);
        line(junctionBreak.x + xOffset, junctionBreak.y, nextJunction.x + xOffset, nextJunction.y);
      }
    }
  };
}

function drawOutboundTrain(trainInstances, route, trainDirection, colorRoute, xOffset) {
  //Narrowing down to only the specified time period
  userValue = slider.value();
  filteredData = trainInstances.filter(train => train.sliderRef === userValue && train.route === route && train.direction == trainDirection); //subsetting by TIME PERIOD  and ROUTE
  filteredData.sort((a, b) => b.order - a.order); //Sorting by ORDER
  //console.log(filteredData)

  //Declaring the stops
  let stopA;
  let stopB;
  let linewidth;
  let junctionBreak;

  junctionBreak = filteredData
    .filter(train => train.direction === trainDirection && train.subLine === 0)
    .sort((a, b) => b.order - a.order) //Sort in descending order
    .find(train => true);

  //Setting up variable linewidth
  let netOn = 0
  let netOff = 0

  //Iterating through filteredData to create pairs of stopA and stopB
  for (let j = 0; j < filteredData.length - 1; j++) {
    stopA = filteredData[j];

    //Find the next stopB based on same DIRECTION, SUBLINE, >ORDER;
    stopB = filteredData.find(train =>
      train.direction === 1 &&
      train.subLine === stopA.subLine &&
      train.order < stopA.order //Makes sure that order stopB order < stopA
    );

    //Update netOn and netOff for each iteration
    netOn += stopA.ridersOn;
    netOff += stopA.ridersOff;
    linewidth = abs(netOn - netOff);

    //console.log("this is linewidth:", linewidth)
    let actualWidth = map(linewidth, minPremapped, maxPremapped, minPostmapped, maxPostmapped);
    actualWidth = Math.min(actualWidth, maxLinewidth);


    if (stopB) { //If there is a pair, draw a line between them
      //console.log("This is pair:", stopA, stopB);
      //Drawing the Lines
      stroke(color(colorRoute));
      strokeWeight(actualWidth);
      line(stopB.x + xOffset, stopB.y, stopA.x + xOffset, stopA.y)
    }

    if (!stopB) {//If there is not a pair, draw a line between each subline's LOWEST ORDER and the JUNCTION BREAK
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

      for (let r = 0; r < junctionArray.length; r++) {//This is actual code for drawing those lines
        let nextJunction = junctionArray[r];

        //Drawing lines between the Junctions
        stroke(color(colorRoute));
        strokeWeight(actualWidth);
        line(junctionBreak.x + xOffset, junctionBreak.y, nextJunction.x + xOffset, nextJunction.y);
      }
    }
  };
}

//MBTA Map Redrawn
function draw() {
  //Background color
  background(255, 255, 255);

  //Inbound Trains
  drawInboundTrain(trainArtifacts, "Red", 0, redRouteColor, inboundOffset);
  drawInboundTrain(trainArtifacts, "Orange", 0, orangeRouteColor, inboundOffset);
  drawInboundTrain(trainArtifacts, "Green", 0, greenRouteColor, inboundOffset);
  drawInboundTrain(trainArtifacts, "Blue", 0, blueRouteColor, inboundOffset);

  //Outbound Trains
  drawOutboundTrain(trainArtifacts, "Red", 1, redRouteColor, outboundOffset);
  drawOutboundTrain(trainArtifacts, "Orange", 1, orangeRouteColor, outboundOffset);
  drawOutboundTrain(trainArtifacts, "Green", 1, greenRouteColor, outboundOffset);
  drawOutboundTrain(trainArtifacts, "Blue", 1, blueRouteColor, outboundOffset);
}