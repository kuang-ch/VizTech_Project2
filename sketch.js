let table;
let slider;
let userValue;

function preload(){
   table = loadTable('assets/orange_line_data.csv'
  , 'csv', 'header')
}

function setup() {
  createCanvas(600, 600);
  background(220);

  fill(0, 0, 255);
  rect(550, 550, 50, 50)

  //Creating Slider
  slider = createSlider(1, 9, 1, 1);
  slider.position(10, 10);
  slider.style('width', '160px');
  
  let inStack = []; //direction_id = 1 is Inbound
  let outStack = []; //direction_id = 2 is Outbound

    for (let r = 0; r < table.getRowCount(); r++){
      const mbtaLine = table.getString(r, "route_id");
      const timePeriod = table.getString(r, "time_period_id");
      const timeName = table.getString(r, "time_period_name");
      const direction = table.getString(r, "direction_id"); //getting the direction
      const riders = table.getNum(r, "avg_riders");
      console.log(riders);

      const width = map(riders, 0, 30000, 0, 50)
      
      //X-coordinate calculated to center rectangle
      const x = 300 - (width/2)

      //Y-coordinate for each rectangle
      const y = 75 + (50 * r)

       //Draw rectangles
    fill(237,139,0);
    if (direction === "1"){ //towards Forest Hills
      rect(100 - (width/2), y - 450, width, 50);
      inStack.push(riders);
    } else { //towards Oak Grove
      fill(255, 0, 0);
      rect(500 - (width/2), y, width, 50);
      outStack.push(riders);
    }
    
    }
  //count the columns
    //print(table.getRowCount() + ' total rows in table');
    //print(table.getColumnCount() + ' total columns in table');
    //print(table)
}

function draw() {
  userValue = slider.value();
  console.log(userValue);
}