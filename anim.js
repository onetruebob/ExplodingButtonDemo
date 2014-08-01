(function(){
  var RADIUS = 2.25;
  var NUMCIRCLES = 2500;
  var TEMPLATE_RECT_WIDTH = 300;
  var TEMPLATE_RECT_HEIGHT = 100;
  var CIRCLE_COLOR = 'white' // Black
  var EXPLODE_POWER = 10;

  var circles = [];

  var canvas;
  var canvasContext;
  var canvasWidth = 0;
  var canvasHeight = 0;

  init();

  function init() {
    canvas = document.getElementById('explodecanvas');
    canvasContext = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    initCircles(NUMCIRCLES);
    placeOnRect((canvasWidth/2)/2, (canvasHeight/2)/2, TEMPLATE_RECT_WIDTH, TEMPLATE_RECT_HEIGHT, NUMCIRCLES);

    window.requestAnimationFrame(draw)
    // return setInterval(draw, 125); // rerender every 30 miliseconds
    // draw()
  }

  function initCircles(numCircles, radius) {
    for (var i = 0; i < numCircles; i++) {
      circles[i] = new Circle(canvasWidth/2, canvasHeight/2, RADIUS);
    }
  }

  function placeOnRect(topX, topY, rectWidth, rectHeight, numCircles) {
    var bottomX = topX + rectWidth;
    var bottomY = topY + rectHeight;
    var rectArea = rectWidth * rectHeight;
    var circleArea = Math.PI * (RADIUS * RADIUS);  // 2 pi r^2
    // var circleSpacing = Math.floor((rectArea / numCircles) / RADIUS);
    // var circleSpacing = Math.sqrt(rectArea/circleArea);
    var circleSpacing = Math.ceil(Math.sqrt(rectArea/numCircles));
    var circleIndex = 0;
    for (var x = topX; x < bottomX; x += circleSpacing) {
      for (var y = topY; y < bottomY; y += circleSpacing) {
        if (circles[circleIndex]) { // Sometimes the number of circles available will not divide evenly into the area
          circles[circleIndex].destX = x;
          circles[circleIndex].destY = y;
        }
        circleIndex++;
      }
    }
    for (var i = circleIndex; i < circles.length; i++) {
      // Hide circles that were not evenly divided onto the rectangle area.
      circles[i].show = false;
    }
  }

  function Circle(x,y,r) {
    this.x = x; // x position
    this.y = y; // y position
    this.r = r; // radius
    this.destX = -1;
    this.destY = -1;
    this.alpha = .9999;
    this.velocityX = 0;
    this.velocityY = 0;
    this.show = true;
  }

  function draw() {
    // Clear the canvas
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    for (var i = 0; i < NUMCIRCLES; i++) {

      var circle = circles[i];

      if (circle.show === false) {
        // Don't need to process circles that will not be rendered
        break;
      }

      // ** Move the circles according to our world physics **
      if (circle.destX !== -1) { // The circle has a destination
        circle.x += (circle.destX - circle.x)/6;
        circle.y += (circle.destY - circle.y)/6;
      } else { // No desitnation, apply general physics
        circle.x += circle.velocityX;
        circle.y += circle.velocityY;
        // Apply gravity
        circle.velocityY += 1.0;
      }


      // Keep the circle in bounds and bounce them.
      if (circle.x < 0) {
        circle.x =-circle.x;
        circle.velocityX = -circle.velocityX;
      }
      if (circle.y < 0) {
        circle.y =- circle.y;
        circle.velocityY = -circle.velocityY;
      };
      if (circle.x > canvasWidth) { 
        circle.x = canvasWidth - (circle.x - canvasWidth);
        circle.velocityX = -circle.velocityX;
      }
      if (circle.y > canvasHeight) {
        circle.y = canvasHeight - (circle.y - canvasHeight);
        // circle.velocityY =- circle.velocityY * 0.15; // bounces back 45% of the velcity
        circle.velocityY = -circle.velocityY * (Math.random() * .8) * 0.45; // bounces back 45% of the velcity

        // Clamp low velocities so circles stop bouncing
        if (Math.abs(circle.velocityY) < 1) {
          circle.velocityY = 0;
          circle.y = canvasHeight;
        }
      }

      if (circle.y >= canvasHeight) {
        // Dampen the x velocity since the circle is rolling along the bottom
        circle.velocityX = circle.velocityX * 0.80;
      }

      // **  Code that actually draws this circle.  **
      // The circles are arcs in a circle shape with a path rather than canvas circles.
        canvasContext.globalAlpha=circle.alpha;
        canvasContext.beginPath();
        canvasContext.fillStyle = CIRCLE_COLOR;
        canvasContext.arc(circle.x, circle.y, circle.r, 0, Math.PI*2, true);
        canvasContext.closePath();
        canvasContext.fill();
      }

    // Call again to keep repainting the animation
    window.requestAnimationFrame(draw)
  }

  // Expose a function to explode and drop the circles
  window.dropCircles = function () {
    for (var i = 0; i < NUMCIRCLES; i++) {
      // Apply velocity at a random andle
      var angle = Math.random()*360;
      circles[i].velocityX = Math.sin(angle) * EXPLODE_POWER; // Add power in the angles direction
      circles[i].velocityY = Math.cos(angle) * EXPLODE_POWER;

      // Removes destination so that regular physics applies.
      circles[i].destX = -1;
      circles[i].destY = -1;
    };
  }

  window.restoreCircles = function () {
    placeOnRect((canvasWidth/2)/2, (canvasHeight/2)/2, TEMPLATE_RECT_WIDTH, TEMPLATE_RECT_HEIGHT, NUMCIRCLES);
  }

})()

var exploded = false;
document.getElementById('explode').addEventListener('click', function(e){
  if (!exploded){
    e.srcElement.style.opacity='0.0';
    window.dropCircles();
    exploded = true;
  } else {
    window.restoreCircles();
    setTimeout(function (){
      e.srcElement.style.opacity = '1'
      exploded = false;
    }, 500);
  }
});
