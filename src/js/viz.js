var map, scroller, main, scrolly, figure, article, step, geoDataArray, viewportWidth, viewportHeight, isMobile;
var currentIndex = 1;
// var layerTypes = {
//   'fill': ['fill-opacity'],
//   'line': ['line-opacity'],
//   'circle': ['circle-opacity', 'circle-stroke-opacity'],
//   'symbol': ['icon-opacity', 'text-opacity'],
//   'raster': ['raster-opacity'],
//   'fill-extrusion': ['fill-extrusion-opacity']
// }


$( document ).ready(function() {
  const DATA_URL = 'data/';
  var dataUrls = ['route1.geojson', 'route2.geojson', 'route3.geojson'];
  geoDataArray = new Array(dataUrls.length);
  mapboxgl.accessToken = 'pk.eyJ1IjoiaHVtZGF0YSIsImEiOiJja2FvMW1wbDIwMzE2MnFwMW9teHQxOXhpIn0.Uri8IURftz3Jv5It51ISAA';
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  isMobile = (viewportWidth<767) ? true : false;
  
  function getData() {
    dataUrls.forEach(function (url, index) {
      loadData(url, function (responseText) {
        parseData(JSON.parse(responseText), index);
      })
    })

    //preload slideshow images
    preload([
      'assets/slideshow/aden-water.jpg',
      'assets/slideshow/aden-woman.jpg',
      'assets/slideshow/aden-idpsite.jpg',
      'assets/slideshow/aden-craiter.jpg',
      'assets/slideshow/aden-girl.jpg'
    ]);
  }

  function loadData(dataPath, done) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { return done(this.responseText) }
    xhr.open('GET', DATA_URL+dataPath, true);
    xhr.send();
  }

  var countArray = new Array(dataUrls.length);
  function parseData(geoData, index) {
    //create map routes
    countArray[index] = 0;
    geoDataArray[index] = geoData;
    var layer = 'layer'+index;
    var geo = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [geoData.features[0].geometry.coordinates[0]]
        }
      }]
    };

    map.addLayer({
      'id': layer,
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': geo
      },
      'layout': {
        'line-join': 'miter',
        'line-cap': 'butt'
      },
      'paint': {
        'line-color': '#FFF',
        'line-width': 3
      }
    }, 'locationPoints')
  }


  var animation; 
  var animationIndex = 0;
  var animationDone = true;
  function animateLine() {
    var geoData = geoDataArray[animationIndex];
    var layer = 'layer'+animationIndex;
    var count = countArray[animationIndex]++;
    if (geoData!=undefined && count<geoData.features[0].geometry.coordinates.length) {
      var newGeo = map.getSource(layer)._data;
      newGeo.features[0].geometry.coordinates.push(geoData.features[0].geometry.coordinates[count]);
      map.getSource(layer).setData(newGeo);

      animation = requestAnimationFrame(function() {
        animateLine();
      });
    }
    else {
      animationDone = true;
      animationIndex++;
      if (currentIndex>=animationIndex) animateLine();
    }
  }


  function initMap() {
    console.log('Loading map...');

    var zoomLevel = 4.7;
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/humdata/ckfx2jgjd10qx1bnzkla9px41/',
      center: [47, 20],
      minZoom: 1,
      zoom: zoomLevel,
      attributionControl: false
    });

    //map.addControl(new mapboxgl.NavigationControl())
    //map.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
    map.scrollZoom.disable();

    //add icon images
    var iconArray = ['icon_marker'];
    iconArray.forEach(function(imageName) {
      map.loadImage('assets/icons/'+imageName+'.png', function(error, image) {
        map.addImage(imageName, image);
      });
    });

    map.on('load', function() {
      console.log('Map loaded')
      $('.loader').remove();
      $('body').css('backgroundColor', '#FFF');
      $('main').css('opacity', 1);
      locationData();
      getData();
      initIntro();
      initJourney();
      initPins();
      initSlideshow();
    });
  }

  function locationData() {
    map.addSource('locationSource', {
      type: 'geojson',
      data: DATA_URL+'geodata_locations.geojson'
    });

    map.addLayer({
      'id': 'locationPoints',
      'type': 'symbol',
      'source': 'locationSource',
      'layout': {
        'icon-image': '{icon}',
        'icon-size': { 'type': 'identity', 'property': 'iconSize' },
        'text-field': '{name}',
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 18,
        'text-max-width': { 'type': 'identity', 'property': 'textMaxWidth' },
        'text-justify': 'left',
        'text-offset': { 'type': 'identity', 'property': 'textOffset' },
        'text-anchor': { 'type': 'identity', 'property': 'textAnchor' },
        'icon-allow-overlap': false,
        'text-allow-overlap': false,
        'visibility': 'none'
      },
      paint: {
        'text-color': '#FFF',
        'text-halo-color': '#000',
        'text-halo-width': 1
      }
    });
  }


  function initIntro() {
    //intro animation
    var controller = new ScrollMagic.Controller();
    var pinScene = new ScrollMagic.Scene({
      triggerElement: "#introInner",
      triggerHook: 0.2
    })
    .addTo(controller)
    .on('enter', function(e) {
      var location = {
        center: [48.21908, 15.53492],
        zoom: 6.13,
        pitch: 0,
        bearing: 0
      };
      map.flyTo(location);
      $('.arrow-down').hide();
    })
    .on('leave', function(e) {
      var location = {
        center: [47, 20],
        zoom: 4.7,
        pitch: 0,
        bearing: 0
      };
      map.flyTo(location);
      $('.arrow-down').show();
    });

    //auto play/pause video
    // var vid = document.getElementById('icrcVideo');
    // var videoScene = new ScrollMagic.Scene({
    //   triggerElement: "#icrcVideo",
    //   triggerHook: 'onEnter', 
    //   duration: '100%'
    // })
    // .addTo(controller)
    // .on('enter', function(e) {
    //   vid.play();
    // })
    // .on('leave', function(e) {
    //   vid.pause();
    // });


    var total = 50;
    var numAffected = Math.round(total * (2/3));
    var timelineTween = new TimelineMax();

    for (var i=0; i<total; i++) {
      var person = (i%2==0) ? 'humanitarianicons-Person-2' : 'humanitarianicons-Person-1';
      $('.icon-animation').append('<i class="'+person+'" id="icon'+ i +'"></i>');
      if (i<=numAffected) {
        var icon = '#icon'+i;
        timelineTween.to(icon, 0.2, {color: '#E67800', opacity: 1, onStartParams: [icon], onStart: function(icon) {
          //$(icon).attr('class', 'humanitarianicons-Affected-population');
        }}, '-=.1');
      }
    }

    var inNeedScene = new ScrollMagic.Scene({
      triggerElement: '#pinIcons',
      triggerHook: 'onEnter'
    })
    //.addIndicators()
    .setTween(timelineTween)
    .addTo(controller)
    .on('start', function() {
      timelineTween.invalidate().restart();
      $('.icon-animation i').css('color', '#888');
      $('.icon-animation i').css('opacity', 0.5);
    });
  }


  function initJourney() {
    scroller = scrollama();
    main = d3.select('main');
    scrolly = main.select('#scrolly');
    figure = scrolly.select('figure');
    article = scrolly.select('article');
    step = article.selectAll('.step');

    setupStickyfill();
    handleResize();

    scroller
      .setup({
        step: '.step',
        offset: 0.7,
        debug: false
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);

    // setup resize event
    window.addEventListener('resize', handleResize);
  }

  function initPins() {
    $('.pin-container').each(function() {
      var item = $(this).find('.pin-item')[0];
      var pos = Math.round(viewportHeight/2 - $(item).height()/2);
      $(item).css('top', pos);
    });
  }

  function handleStepEnter(response) {
    currentIndex = response.index;
    var chapter = config.chapters[currentIndex];
    var location = chapter.location;

    $('.ticker').addClass('active');
    map.setLayoutProperty('locationPoints', 'visibility', 'visible');

    // set active step
    step.classed('is-active', function(d, i) {
      return i === response.index;
    });

    // if (chapter.onChapterEnter!=undefined && chapter.onChapterEnter.length > 0) {
    //   chapter.onChapterEnter.forEach(setLayerOpacity);
    // }

    if (geoDataArray[response.index]!==undefined) {
      var padding = 0;
      setMapBounds(geoDataArray[response.index], chapter.paddingBottom, chapter.location.bearing, chapter.location.pitch);

      if (animationDone) {
        animateLine();
        animationDone = false;
      }
    }
    else {
      //zoom into adan
      map.flyTo(location);
    }

    if (response.index<config.chapters.length)
      updateTicker(chapter.distance, chapter.duration);
  }

  function handleStepExit(response) {
    if (response.index==0 || response.index==config.chapters.length-1) {
      $('.ticker').removeClass('active');

      if (response.index==0) {
        var location = {
          center: [48.21908, 15.53492],
          zoom: 6.13,
          pitch: 0,
          bearing: 0
        };
        map.flyTo(location);
      }
    }
  }

  function updateTicker(distance, duration) {
    $('.ticker p').animate({
      opacity: 0,
      marginTop: '50px',
    }, 400, function() {
      $(this).text(distance + ' km. ' + duration + '.');
      $(this).css('marginTop', '-50px').animate({
        opacity: 1,
        marginTop: '0'
      }, 400);
    });
  }

  function initTracking() {
    //initialize mixpanel
    let MIXPANEL_TOKEN = window.location.hostname==='data.humdata.org'? '5cbf12bc9984628fb2c55a49daf32e74' : '99035923ee0a67880e6c05ab92b6cbc0';
    mixpanel.init(MIXPANEL_TOKEN);
    mixpanel.track('page view', {
      'page title': document.title,
      'page type': 'datavis'
    });
  }

  initMap();
  initTracking();
});