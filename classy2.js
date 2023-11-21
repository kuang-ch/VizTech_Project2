//Establishing Table Variables
let stopsTable;
let stopsData = []; //Declaring an array
let pairsArray = [];
let slider;
let userValue;
let mbtaLineWidth = 5;
let maxLinewidth = 30; //setting the maximum linewidth
let trainArtifacts = [];
let filteredData = [];
let numberServiceDays = 77;

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
let xOffset;
let yOffset = 30;
let arrowWeight = 2.5;

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
  mbtaCanvas.parent('mbtaMap');
  smooth();

  //Getting rid of default cursor
  //noCursor();

  //Creating Slider
  slider = createSlider(1, 9, 1, 1);
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
  let addedPairsSet = new Set();
  console.log(addedPairsSet);

  //Narrowing down to only the specified time period
  userValue = slider.value();
  filteredData = trainInstances.filter(train => train.sliderRef === userValue && train.route === route && train.direction == trainDirection); //subsetting by TIME PERIOD  and ROUTE
  filteredData.sort((a, b) => a.order - b.order); //Sorting by ORDER

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

  if (route === "Green") { //Junction Break Green
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
    //console.log('Loop iteration:', j);
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

    if (stopB) { //If there is a pair, draw a line between them
      let pairKey = `${stopA.stopName}-${stopB.stopName}`;

      if (!addedPairsSet.has(pairKey)) {
        //console.log("This is pair:", stopA, stopB);
        //Drawing the Lines
        stroke(color(colorRoute));
        strokeWeight(actualWidth);
        line(stopA.x + xOffset, stopA.y + yOffset, stopB.x + xOffset, stopB.y + yOffset)

        pairsArray.push({ stopA, stopB, displayRiders })
        addedPairsSet.add(pairKey);
      }
    }

    if (!stopB) {//If there is not a pair, draw a line between each subline's LOWEST ORDER and the JUNCTION BREAK
      const junctions = {};
      let nextJunction;

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
          let pairKey = `${junctionBreak.stopName}-${nextJunction.stopName}`;
          if (!addedPairsSet.has(pairKey)) {
            //Drawing lines between the Junctions
            stroke(color(colorRoute));
            strokeWeight(actualWidth);
            line(junctionBreak.x + xOffset, junctionBreak.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset);

            pairsArray.push({ junctionBreak, nextJunction, displayRiders });
            addedPairsSet.add(pairKey);
          }
        } else {
          let pairKey = `${junctionBreakGreen.stopName}-${nextJunction.stopName}`;
          if (!addedPairsSet.has(pairKey)) {
            stroke(color(colorRoute));
            strokeWeight(actualWidth);
            line(junctionBreakGreen.x + xOffset, junctionBreakGreen.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset);

            pairsArray.push({ junctionBreakGreen, nextJunction, displayRiders });
            addedPairsSet.add(pairKey);
          }
        }
      }
    }
    pairsArrayPopulated = true;
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

    //console.log("this is linewidth:", linewidth)
    let actualWidth = mapAndSnap(linewidth, minPremapped, maxPremapped, minPostmapped, maxPostmapped);
    //console.log(actualWidth); TROUBLESHOOTING

    if (stopB) { //If there is a pair, draw a line between them
      //console.log("This is pair:", stopA, stopB);
      //Drawing the Lines
      stroke(color(colorRoute));
      strokeWeight(actualWidth);
      line(stopB.x + xOffset, stopB.y + yOffset, stopA.x + xOffset, stopA.y + yOffset)
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
        } else {
          stroke(color(colorRoute));
          strokeWeight(actualWidth);
          line(junctionBreakGreen.x + xOffset, junctionBreakGreen.y + yOffset, nextJunction.x + xOffset, nextJunction.y + yOffset);
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

  textSize(36);
  textAlign(LEFT, CENTER);
  text(displayStop.displayTime, mouseX, mouseY + 35);
}

function mouse() {
  stroke("#333333");
  strokeWeight(3);
  ellipse(mouseX, mouseY, 10, 10)
}

function mouseIsNearLine(x1, y1, x2, y2, threshold, colorRoute, displayStop, displayRiders) {
  // Calculate the distance from the mouse to the line
  let distance = distToLine(mouseX, mouseY, x1, y1 - 5, x2, y2 + 5);
  // Check if the distance is within the threshold
  if (distance < threshold) {
    push();
    noStroke();
    fill(colorRoute);
    textSize(10.5);
    textAlign(LEFT, CENTER);
    text(displayStop, mouseX, mouseY + 25);
    text(displayRiders + " riders", mouseX, mouseY + 37.5);
    pop();
  };
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

//MBTA Map Redrawn
function draw() {
  //Background color
  background(255, 255, 255);

  //Arrowheads
  arrowheads();

  //Inbound Trains
  //drawInboundTrain(trainArtifacts, "Blue", 0, blueRouteColor, inboundOffset);
  //drawInboundTrain(trainArtifacts, "Green", 0, greenRouteColor, inboundOffset);
  //drawInboundTrain(trainArtifacts, "Orange", 0, orangeRouteColor, inboundOffset);
  drawInboundTrain(trainArtifacts, "Red", 0, redRouteColor, inboundOffset);

  //Outbound Trains
  //drawOutboundTrain(trainArtifacts, "Blue", 1, blueRouteColor, outboundOffset);
  //drawOutboundTrain(trainArtifacts, "Green", 1, greenRouteColor, outboundOffset);
  //drawOutboundTrain(trainArtifacts, "Orange", 1, orangeRouteColor, outboundOffset);
  //drawOutboundTrain(trainArtifacts, "Red", 1, redRouteColor, outboundOffset);

  //Little dots
  absolutelyDotty("Blue", blueRouteColor);
  absolutelyDotty("Green", greenRouteColor);
  absolutelyDotty("Orange", orangeRouteColor);
  absolutelyDotty("Red", redRouteColor);

  //Display Time
  //showTime();

  //Mouse
  mouse();

  //Testing
  console.log(pairsArray);
  for (let i = 0; i < pairsArray.length; i++) {
    let pair = pairsArray[i];

    if ('stopA' in pair && 'stopB' in pair && 'displayRiders' in pair) {
      let stopA = pair.stopA;
      let stopB = pair.stopB;
      let riders = pair.displayRiders;
      mouseIsNearLine(stopA.x, stopA.y + yOffset, stopB.x, stopB.y + yOffset, 2.5, "red", stopA.stopName, riders)
    }

    if ('junctionBreak' in pair && 'nextJunction' in pair && 'displayRiders' in pair) {
      let stopA = pair.junctionBreak;
      let stopB = pair.nextJunction;
      let riders = pair.displayRiders;
      mouseIsNearLine(stopA.x, stopA.y + yOffset, stopB.x, stopB.y + yOffset, 2.5, "red", stopA.stopName, riders)
    }
  }
}