// generic window resize listener event
function handleResize() {
  //update height of step elements
  var stepH = (isMobile) ? Math.floor(window.innerHeight)*2 : Math.floor(window.innerHeight);
  step.style("height", stepH + "px");

  //double height of last step
  if (!isMobile) $(".step[data-step='4']").css("height", stepH*1.5 + "px");

  var figureHeight = window.innerHeight;
  var figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  scroller.resize();
}

function setupStickyfill() {
  d3.selectAll(".sticky").each(function() {
    Stickyfill.add(this);
  });
}

function preload(arrayOfImages) {
  $(arrayOfImages).each(function(){
    (new Image()).src = this;
  });
}


function setMapBounds(points, paddingBottom, bearing, pitch) {
  let bbox = turf.extent(points);
  var padding = (viewportWidth<768) ? {top: 40, bottom: 40, left: 60, right: 60} : {top: 0, bottom: paddingBottom, left: 550, right: 150};
  map.fitBounds(bbox, {padding: padding, bearing: bearing, pitch: pitch});
}
