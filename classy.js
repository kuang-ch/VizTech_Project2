//Establishing Table Variables
let stopsTable;
let stopsData = []; //Declaring an array
let slider;
let mbtaLineWidth = 5;
let maxLinewidth = 30; //setting the maximum linewidth
let trainArtifacts = [];
let filteredData = [];
let numberServiceDays = 77;
let keyValue = 1;

//Variables for controlling mapping
let minPremapped = 0;
let maxPremapped = 1250000;
let minPostmapped = 0;
let maxPostmapped = 10;

//Colors of the Each Route
let redRouteColor = "#c1272d";
let orangeRouteColor = "#f15a24";
let greenRouteColor = "#009245";
let blueRouteColor = "#2e3192";

//Offsetting Plots
let inboundOffset = 0;
let outboundOffset = 525 + 120;
let yOffset = 30;
let arrowWeight = 2.5;

//Mouse Stop
let clickedStop = null;

//Intro page
let introDrawn = true;

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
          subLine: int(row.get('Alt')),
          displayTime: row.get('timeDisplay')
        }
        stopsData.push(rowData);
      }
    })
}

function setup() {
  let mbtaCanvas = createCanvas(1500, 800);
  let mbtaDiv = select('#mbtaMap');
  mbtaCanvas.parent(mbtaDiv);
  noCursor();

  //Getting rid of default cursor
  //noCursor();

  //Creating Slider
  slider = createSlider(1, 9, 1, 1);
  slider.id('mySlider');
  slider.position(25, 25);
  slider.style('width', '160px');

  // Change the color of the slider
  slider.style('background-color', '#777777'); // Set the background color
  slider.style('color', '#333333'); // Set the text color
  slider.style('border', '1px #333333'); // Set the border color

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
      arrayData.displayTime,
    );

    //Push Inbound object to global array
    trainArtifacts.push(trainObject);
  }
}

class train { //Using classes to create the "trainArtifacts" array
  constructor(direction, route, sliderRef, stopName, order, x, y, ridersOn, ridersOff, subLine, displayTime) {
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
    this.displayTime = displayTime;
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
  let junctionBreakGreen;

  junctionBreak = filteredData
    .filter(train => train.direction === trainDirection && train.subLine === 0)
    .sort((a, b) => b.order - a.order) //Sort in descending order
    .find(train => true);

  if (route === "Green") {
    junctionBreakGreen = filteredData
      .filter(train => train.direction === trainDirection)
      .find(train => train.order === 62);
  } else {
  }

  //Setting up variable linewidth
  let netOn = 0
  let netOff = 0

  //Junctions Array
  const junctions = {};
  //Finding other Junctions
  filteredData
    .filter(train => train.subLine !== 0)
    .forEach(train => {
      if (!junctions[train.subLine]) {
        junctions[train.subLine] = train;
      }
    })
  //Use Object.values to get an array of junctions
  const junctionArray = Object.values(junctions);

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

    let displayRiders = Math.round(linewidth / numberServiceDays);
    let displayStop = stopA.stopName;

    let actualWidth = mapAndSnap(linewidth, minPremapped, maxPremapped, minPostmapped, maxPostmapped);

    let stopBLoopExecuted = false;
    if (stopB) { //If there is a pair, draw a line between them
      stroke(color(colorRoute));
      strokeWeight(actualWidth);
      line(stopA.x + xOffset, stopA.y + yOffset, stopB.x + xOffset, stopB.y + yOffset)

      mouseIsNearLine(stopA.x + xOffset, stopA.y + yOffset, stopB.x + xOffset, stopB.y + yOffset, 2.5, colorRoute, displayStop, displayRiders);
    }

    if (!stopB) {//If there is not a pair, draw a line between each subline's LOWEST ORDER and the JUNCTION BREAK
      for (let r = 0; r < junctionArray.length; r++) {//This is actual code for drawing those lines
        let nextJunction = junctionArray[r];
        if (nextJunction.subLine != 4) {
          //Drawing lines between the Junctions
          stroke(color(colorRoute));
          strokeWeight(actualWidth);
          line(junctionBreak.x + xOffset, junctionBreak.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset);
          mouseIsNearLine(junctionBreak.x + xOffset, junctionBreak.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset, 2.5, colorRoute, junctionBreak.stopName, displayRiders);
        } else {
          stroke(color(colorRoute));
          strokeWeight(actualWidth);
          line(junctionBreakGreen.x + xOffset, junctionBreakGreen.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset);
          mouseIsNearLine(junctionBreakGreen.x + xOffset, junctionBreakGreen.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset, 2.5, colorRoute, junctionBreakGreen.stopName, displayRiders)
        }
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
  let junctionBreakGreen;

  junctionBreak = filteredData
    .filter(train => train.direction === trainDirection && train.subLine === 0)
    .sort((a, b) => b.order - a.order) //Sort in descending order
    .find(train => true);

  if (route === "Green") {
    junctionBreakGreen = filteredData
      .filter(train => train.direction === trainDirection)
      .find(train => train.order === 62);
  } else {
  }

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

    let displayRiders = Math.round(linewidth / numberServiceDays);
    let displayStop = stopA.stopName;

    //console.log("this is linewidth:", linewidth)
    let actualWidth = mapAndSnap(linewidth, minPremapped, maxPremapped, minPostmapped, maxPostmapped);
    //console.log(actualWidth); TROUBLESHOOTING

    if (stopB) { //If there is a pair, draw a line between them
      //console.log("This is pair:", stopA, stopB);
      //Drawing the Lines
      stroke(color(colorRoute));
      strokeWeight(actualWidth);
      line(stopB.x + xOffset, stopB.y + yOffset, stopA.x + xOffset, stopA.y + yOffset);
      mouseIsNearLine(stopA.x + xOffset, stopA.y + yOffset, stopB.x + xOffset, stopB.y + yOffset, 2.5, colorRoute, displayStop, displayRiders);
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
      for (let r = 0; r < junctionArray.length; r++) {//This is actual code for drawing those lines
        let nextJunction = junctionArray[r];

        if (nextJunction.subLine != 4) {
          //Drawing lines between the Junctions
          stroke(color(colorRoute));
          strokeWeight(actualWidth);
          line(junctionBreak.x + xOffset, junctionBreak.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset);
          mouseIsNearLine(junctionBreak.x + xOffset, junctionBreak.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset, 2.5, colorRoute, junctionBreak.stopName, displayRiders);
        } else {
          stroke(color(colorRoute));
          strokeWeight(actualWidth);
          line(junctionBreakGreen.x + xOffset, junctionBreakGreen.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset);
          mouseIsNearLine(junctionBreakGreen.x + xOffset, junctionBreakGreen.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset, 2.5, colorRoute, junctionBreakGreen.stopName, displayRiders);
        }
      }
    }
  };
}

function mapAndSnap(value, start1, stop1, start2, stop2) { //Snapping so it looks clean
  let mappedValue = map(value, start1, stop1, start2, stop2);
  let snappedValue = (round(mappedValue / 1) * 1) + 0.25; //round to nearest 0.5
  return snappedValue;
}

function absolutelyDotty(route, circleColor) { //Drawing the dots!!
  filteredData = trainArtifacts.filter(train => train.route === route); //subsetting by ROUTE
  for (let i = 0; i < filteredData.length; i++) {
    let currentStop = filteredData[i];

    //Drawing the dots
    stroke(circleColor);
    strokeWeight(0.5);
    circle(currentStop.x + inboundOffset, currentStop.y + yOffset, 3);
    circle(currentStop.x + outboundOffset, currentStop.y + yOffset, 3);
  }
}

function arrowheads() {
  //Blue
  stroke(blueRouteColor);
  strokeWeight(arrowWeight);
  beginShape();
  vertex(400 + inboundOffset, 310 + yOffset);
  vertex(400 + inboundOffset, 300 + yOffset);
  vertex(410 + inboundOffset, 300 + yOffset);
  endShape(OPEN);
  beginShape();
  vertex(630 + outboundOffset, 180 + yOffset);
  vertex(640 + outboundOffset, 180 + yOffset);
  vertex(640 + outboundOffset, 190 + yOffset);
  endShape(OPEN);

  //Green
  stroke(greenRouteColor);
  strokeWeight(arrowWeight);
  beginShape(); //BLine
  vertex(120 + inboundOffset, 400 + yOffset);
  vertex(120 + inboundOffset, 410 + yOffset);
  vertex(130 + inboundOffset, 410 + yOffset);
  endShape(OPEN); //CLine
  beginShape();
  vertex(130 + inboundOffset, 490 + yOffset);
  vertex(130 + inboundOffset, 500 + yOffset);
  vertex(140 + inboundOffset, 500 + yOffset);
  endShape(OPEN); //DLine
  beginShape();
  vertex(160 + inboundOffset, 520 + yOffset);
  vertex(160 + inboundOffset, 530 + yOffset);
  vertex(170 + inboundOffset, 530 + yOffset);
  endShape(OPEN);
  endShape(OPEN); //ELine
  beginShape();
  vertex(210 + inboundOffset, 520 + yOffset);
  vertex(210 + inboundOffset, 530 + yOffset);
  vertex(220 + inboundOffset, 530 + yOffset);
  endShape(OPEN);
  beginShape();
  vertex(380 + outboundOffset, 210 + yOffset);
  vertex(380 + outboundOffset, 200 + yOffset);
  vertex(390 + outboundOffset, 200 + yOffset);
  endShape(OPEN);

  //Orange
  stroke(orangeRouteColor);
  strokeWeight(arrowWeight);
  beginShape();
  vertex(140 + inboundOffset, 670 + yOffset);
  vertex(140 + inboundOffset, 680 + yOffset);
  vertex(150 + inboundOffset, 680 + yOffset);
  endShape(OPEN);
  beginShape();
  vertex(450 + outboundOffset, 30 + yOffset);
  vertex(460 + outboundOffset, 20 + yOffset);
  vertex(470 + outboundOffset, 30 + yOffset);
  endShape(OPEN);

  //Red
  stroke(redRouteColor);
  strokeWeight(arrowWeight);
  beginShape();
  vertex(430 + inboundOffset, 640 + yOffset);
  vertex(440 + inboundOffset, 650 + yOffset);
  vertex(450 + inboundOffset, 640 + yOffset);
  endShape(OPEN);
  beginShape();
  vertex(550 + inboundOffset, 630 + yOffset);
  vertex(560 + inboundOffset, 640 + yOffset);
  vertex(570 + inboundOffset, 630 + yOffset);
  endShape(OPEN);
  beginShape();
  vertex(190 + outboundOffset, 140 + yOffset);
  vertex(190 + outboundOffset, 130 + yOffset);
  vertex(200 + outboundOffset, 130 + yOffset);
  endShape(OPEN);
}

function showTime() {
  userValue = slider.value();

  filteredData = trainArtifacts.filter(train => train.sliderRef === userValue);
  let displayStop = filteredData[0];

  let centerX = width / 2;
  let centerY = height / 2;

  push()
  fill("#333333");
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text(displayStop.displayTime, 27.5, 50);
  pop();
}

function mouse() {
  push();
  noFill();
  stroke("#333333");
  strokeWeight(3);
  ellipse(mouseX, mouseY, 10, 10);
  pop();
}

function mouseIsNearLine(x1, y1, x2, y2, threshold, colorRoute, displayStop, displayRiders) {
  // Calculate the distance from the mouse to the line
  let distance = distToLine(mouseX, mouseY, x1, y1 - 5, x2, y2 + 5);
  let textWidthStop = textWidth(displayStop);
  let whiteBoxHeight = 50;
  let whiteBoxWidth = textWidthStop + 50;

  if (distance < threshold) {
    push();
    noStroke();
    fill("#FFFFFF");
    rect(25, 70, whiteBoxWidth, whiteBoxHeight);
    fill(colorRoute);
    textSize(20);
    textAlign(LEFT, TOP);
    let displayStopText = text(displayStop, 27.5, 71);
    let displayRidersText = text(displayRiders + " riders", 27.5, 92.5);
    pop();

    if (mouseIsPressed) {
      clickedStop = displayStop;
    }
  };
}

function keyPressed() {
  if (keyCode === LEFT_ARROW && keyValue > 1) {
    keyValue--;
  } else if (keyCode === RIGHT_ARROW && keyValue < 9) {
    keyValue++;
  }
  console.log(keyValue);
  slider.value(keyValue);
  return false;
}

function distToLine(px, py, x1, y1, x2, y2) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = dot / len_sq;

  let xx, yy;

  if (param < 0 || (x1 == x2 && y1 == y2)) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = px - xx;
  let dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

function removeDuplicatesFromArray(inputArray) {
  const uniqueSet = new Set();

  return inputArray.filter(element => {
    if (!uniqueSet.has(element)) {
      uniqueSet.add(element);
      return true;
    }
    return false;
  });
}

function mousePressed() {
  // Check if the rectangle is already drawn
  if (introDrawn) {
    // If drawn, erase it by setting the flag to false
    introDrawn = false;
  } else {
    // If not drawn, draw the rectangle by setting the flag to true
    introDrawn = true;
  }
}

function introPage() {
  push();
  fill("#FFFFFF");
  rect(0, 0, 1500, 800);
  fill("#333333");
  noStroke();
  textSize(40);
  textAlign(LEFT, TOP);
  text("This is a visualization of the MBTA (Boston's subway system).", 27.5, 50);
  text("It shows how busy each line is throughout different times during the day.", 27.5, 100);
  text("Use the arrow (L/R) keys to toggle through the day.", 27.5, 200);
  text("Hover to see stop specific rider data.", 27.5, 250);
  text("Click to continue...", 27.5, 700.5);
  textSize(20);
  textStyle(ITALIC);
  text("Data acquired from the MBTA, isolated to fall 2019.", 27.5, 740.5);
  pop();
}

//MBTA Map Redrawn
function draw() {
  //Background color
  background(255, 255, 255);

  //Arrowheads
  arrowheads();

  //Inbound Trains
  drawInboundTrain(trainArtifacts, "Blue", 0, blueRouteColor, inboundOffset);
  drawInboundTrain(trainArtifacts, "Green", 0, greenRouteColor, inboundOffset);
  drawInboundTrain(trainArtifacts, "Orange", 0, orangeRouteColor, inboundOffset);
  drawInboundTrain(trainArtifacts, "Red", 0, redRouteColor, inboundOffset);

  //Outbound Trains
  drawOutboundTrain(trainArtifacts, "Blue", 1, blueRouteColor, outboundOffset);
  drawOutboundTrain(trainArtifacts, "Green", 1, greenRouteColor, outboundOffset);
  drawOutboundTrain(trainArtifacts, "Orange", 1, orangeRouteColor, outboundOffset);
  drawOutboundTrain(trainArtifacts, "Red", 1, redRouteColor, outboundOffset);

  //Little dots
  absolutelyDotty("Blue", blueRouteColor);
  absolutelyDotty("Green", greenRouteColor);
  absolutelyDotty("Orange", orangeRouteColor);
  absolutelyDotty("Red", redRouteColor);

  //Display Time
  showTime();

  //Intro
  if (introDrawn) {
    introPage();
  }

  //Mouse
  mouse();
}