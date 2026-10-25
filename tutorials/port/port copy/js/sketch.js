let canvas;

function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0,0);
    canvas.style("z-index", -2);
    // background (200);
}


function windowResized(){
    resizeCanvas(windowWidth,windowHeight);
}

function draw (){
    
  
}

function mouseMoved(){
      strokeWeight(0);
       let c = random(colors);
    // fill(random(100, 250), random(900, 250), random(200, 250), random(200, 250));
      fill(c[0], c[1], c[2], 180);
    ellipse(mouseX, mouseY, 30, 30);
}
let colors = [
        [255, 240, 245], // very light pink
        [248, 240, 255], // very light lavender
        [240, 248, 255], // very light blue
        [240, 255, 245], // very light mint
        [255, 253, 235], // creamy yellow
        [255, 242, 230], // pale peach
        [245, 245, 255], // pale periwinkle
        [255, 255, 255]  // white
    ];

function drawThing(){

}

function updateCanvasSize() {
    resizeCanvas(
        windowWidth,
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    );
}

function windowResized() {
    updateCanvasSize();
}

window.addEventListener("load", updateCanvasSize);