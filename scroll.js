var scrollListenerRef;

(function(window) {

  // screen dimensions for calculations
  var width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  // number of values to moving average for reducing noise, and associated vars
  var numToAverage = 12;
  var valuesQueue = [];
  var xPrediction = 0;
  var yPrediction = 0;

  // some other static calculations
  var scrollMarginPercent = 0.17;
  var scrollPercent = 0.30;
  var scrollDuration = 1000;
  var xScrollOffset = function() {
    return width * scrollPercent;
  };
  var yScrollOffset = function() {
    return height * scrollPercent;
  };

  /**
   * The gaze listener, checks if you are looking in a border and scrolls for
   * you. Also, takes a moving average of the data, storing measurements in
   * a queue and keeping the average. The queue stores just the contributions
   * i.e. the weight of each measurement in the contribution
   */
  var scrollGazeListener = function(data, elapsedTime) {
    if (data == null) {
      return;
    }
    // values queue doesn't have enough values yet
    else if (valuesQueue.length < numToAverage) {
      var curXContrib = data.x / numToAverage;
      var curYContrib = data.y / numToAverage;

      xPrediction += curXContrib;
      yPrediction += curYContrib;
      valuesQueue.push([curXContrib, curYContrib]);
      return;
    }

    /** Update the moving average */
    // remove the oldest measurement
    var oldest = valuesQueue.shift();
    xPrediction -= oldest[0];
    yPrediction -= oldest[1];

    // add in the new, current measurement
    var curXContrib = data.x / numToAverage;
    var curYContrib = data.y / numToAverage;
    xPrediction += curXContrib;
    yPrediction += curYContrib;
    valuesQueue.push([curXContrib, curYContrib]);

    /** do the computations for the current average */
    // x and y relative coordinates (scaled 0.0 to 1.0), being top left
    var xRel = 1 - (width - xPrediction) / width;
    var yRel = 1 - (height - yPrediction) / height;

    var xScroll = 0;
    var yScroll = 0;

    // looking near the left border
    if (xRel <= scrollMarginPercent) {
      xScroll = -xScrollOffset();
    }
    // looking near the right border
    else if (xRel >= 1 - scrollMarginPercent) {
      xScroll = xScrollOffset();
    }

    // looking near the top border
    if (yRel <= scrollMarginPercent) {
      yScroll = -yScrollOffset();
    }
    // looking near the bottom border
    else if (yRel >= 1 - scrollMarginPercent) {
      yScroll = yScrollOffset();
    }

    // do the actual window scroll
    if (xScroll || yScroll) {
      scrollBySmooth(xScroll, yScroll, scrollDuration);
    }
  };

  scrollListenerRef = scrollGazeListener;
  /**
   * Easing function for smoothing the scrolling
   */
  var easeOutCubic = function (t) { return (--t)*t*t+1 };
  var easeOutQuint = function (t) { return 1+(--t)*t*t*t*t };
  var isCurrentlyScrolling = false;

  var scrollBySmooth = function(dx, dy, duration, easeingFunc) {
    // only allow one scrollBySmooth to run at a time
    if (isCurrentlyScrolling) return;

    easeingFunc = easeingFunc || easeOutQuint;
    isCurrentlyScrolling = true;
    var start = null;
    var xStart = window.scrollX;
    var yStart = window.scrollY;

    var animate = function(time) {
      if (!start) start = time;
      var tPerc = (time - start) / duration;

      // calculate next position
      var easePerc = easeingFunc(tPerc);
      var xNext = easePerc * dx + xStart;
      var yNext = easePerc * dy + yStart;

      // scroll to next
      // console.log("TRYING TO SCROLL!!!!!!!!!!!!!!!!!!!!")
      // console.log(xNext, yNext);
      if (yNext < 0) { scrollChat("up"); }
      else if (yNext > 0) { scrollChat("down") };
      // no scrolling if yNext === 0

      if (tPerc < 1) {
        window.requestAnimationFrame(animate);
      }
      else {
        isCurrentlyScrolling = false;
      }
    };

    window.requestAnimationFrame(animate);
  };

  // start tracking and calibrating immediately
  // start tracking and calibrating immediately
  webgazer
    .setRegression('ridge')
    .setTracker('clmtrackr')
    .begin();
}(window));
