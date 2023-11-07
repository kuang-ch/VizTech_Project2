//Establishing Table Variables
let redTable;
let data = []; //Declaring an array
let slider; 
let userValue;
let maxLinewidth = 30; //setting the maximum linewidth

//Variables for controlling mapping
let minPremapped = 0;
let maxPremapped = 800000;
let minPostmapped = 0;
let maxPostmapped = 10;

//Loading in CSV
function preload(){
  redTable = loadTable('assets/red_line_alternating.csv'
 , 'csv', 'header', () => {
  for(let row of redTable.rows){
    let rowData = {
      stop_name : row.get('stop_name'),
      order: int(row.get('Order')),
      x: float(row.get('X')),
      y: float(row.get('Y')),
      ridersOn: int(row.get('on')),
      ridersOff: int(row.get('off')),
      sliderRef: int(row.get('slider_ref')),
      subLine: row.get('Alt')
    }
    data.push(rowData);
   }
 })
}

function setup() {
  createCanvas(1000, 750);

  //Creating Slider
  slider = createSlider(1, 9, 1, 1);
  slider.position(10, 10);
  slider.style('width', '160px');
}

function redLineInbound(){
  let junctionElement = null;
  let junctionOrder = -Infinity;
  let minOrderA = Infinity;
  let minOrderAElement = null;
  let minOrderB = Infinity;
  let minOrderBElement = null;
  let netOn = 0;
  let netOff = 0;
  let linewidth = netOn - netOff;

  //Assigning Slider value
  userValue = slider.value()

  //Filter data to only include arrays where sliderRef = userValue
  const filteredData = data.filter(data => data.sliderRef === userValue);

for(let i = 0; i < filteredData.length; i++){
  const currentData = filteredData[i];

  //Calculate netOn and netOff
  netOn = filteredData 
    .filter(item => item.order < currentData.order)
    .reduce((sum, item) => sum + item.ridersOn, 0);

  netOff = filteredData 
    .filter(item => item.order < currentData.order)
    .reduce((sum, item) => sum + item.ridersOff, 0);

  const linewidth = netOn - netOff;

  //Mapping linewidth to actualWidth
  let actualWidth = map(linewidth, minPremapped, maxPremapped, minPostmapped, maxPostmapped);
  actualWidth = Math.min(actualWidth, maxLinewidth);
  console.log(linewidth, currentData.order)


  //Check if the subLine is "X"
  if (currentData.subLine === 'X'){
      const nextData = data.find((item)=> item.order > currentData.order && item.subLine ==="X");
      if(nextData){
         //Draw a line segment between currentData and nextData
         stroke(255, 0, 0);
         strokeWeight(actualWidth);
         line(currentData.x, currentData.y, nextData.x, nextData.y)
      }
    }
  //Finding the Split
  if (currentData.subLine === "X" && currentData.order > junctionOrder){
    junctionOrder = currentData.order;
    junctionElement = currentData;
  }
  if (currentData.subLine === "A" && currentData.order < minOrderA){ //First Stop on "A" Line
    minOrderA = currentData.order;
    minOrderAElement = currentData;

    stroke(255, 0, 0);
    strokeWeight(actualWidth);
    line(junctionElement.x, junctionElement.y, minOrderAElement.x, minOrderAElement.y)
  }
  if (currentData.subLine === "B" && currentData.order < minOrderB){//First Stop on "B" Line
    minOrderB = currentData.order;
    minOrderBElement = currentData;
    stroke(255, 0, 0);
    strokeWeight(actualWidth);
    line(junctionElement.x, junctionElement.y, minOrderBElement.x, minOrderBElement.y)
  }

  //Plotting "A" Line
  if (currentData.subLine === "A"){
    const nextData = data.find((item)=> item.order > currentData.order && item.subLine ==="A");
      if(nextData){
         //Draw a line segment between currentData and nextData
         stroke(255, 0, 0);
         strokeWeight(actualWidth);
         line(currentData.x, currentData.y, nextData.x, nextData.y)
      }
  }
  //Plotting "B" Line
  if (currentData.subLine === "B"){
    const nextData = data.find((item)=> item.order > currentData.order && item.subLine ==="B");
      if(nextData){
         //Draw a line segment between currentData and nextData
         stroke(255, 0, 0);
         strokeWeight(actualWidth);
         line(currentData.x, currentData.y, nextData.x, nextData.y)
      }
  }
  }
}

//MBTA Map Redrawn
function draw() {
 //Background color
 background(255, 255, 255);

//Grid
for (var x = 0; x < width; x += width / 40){
  for (var y = 0; y < height; y += height / 30){
    stroke(0, 0, 0, 10);
    strokeWeight(.25);
    line(x, 0, x, height);
    line(0, y, width, y);
  }
} 

//Loop through the data array
redLineInbound()
}