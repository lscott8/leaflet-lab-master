/* Map of GeoJSON data from map.geojson */
var currentAttribute;
//function to instantiate the Leaflet map
function createMap(){

    //create the map with center of 44, -115 and zoom of 3, max zoom of 6 and minzoom of 2
    var map = L.map('map', {
        center: [44, -115],
        zoom: 3,
        maxZoom: 6,
        minZoom:2,
        maxBounds:[
          [75,-170],
			     [0,-30]
        ],
    });

    //add tilelater.  openestreet map is used
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibHNjb3R0OCIsImEiOiJjaXl2c3U0aDcwMDYyMzNxYWU2bmE4eHhyIn0.hOuzMYbt8qCG2Cgf50rVfA', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        //adds the basemap to the map
    }).addTo(map);

    //call getData function to get the data within the geojson
    getData(map);
};


//create sequence controls in the panel
function createSequenceControls(map, attributes){
  var SequenceControl = L.Control.extend({
          options: {
              position: 'bottomleft'
          },
          onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // ... initialize other DOM elements, add listeners, etc.
            $(container).append('<input class="range-slider" type="range">');


            $(container).append('<button class="skip" id="reverse" title="Reverse"><img src="img/rewind.png"></button>');
            $(container).append('<button class="skip" id="forward" title="Forward"><img src="img/forward.png"></button>');

            $(container).on('mousedown dblclick', function(e){
              L.DomEvent.stopPropagation(e);
                });
          return container;
        }
      });

      map.addControl(new SequenceControl());




    //create range input element (slider)
    //slider should have 12 steps, one for each year


    $('.range-slider').attr({
        max: 12,
        min: 0,
        value: 0,
        step: 1
    });

    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();


        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 12 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 12 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        //function call to updataPropSymbols
        updatePropSymbols(map, attributes[index]);
    });
    $('.range-slider').on('input', function(){
      //Step 6: get the new index value
      var index = $(this).val();
    updatePropSymbols(map, attributes[index]);
  });

};


//function to update the proportional symbols for each year
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
      if (layer.feature && layer.feature.properties[attribute]){
      //access feature properties
        var props = layer.feature.properties;

        //update each feature's radius based on new attribute values
        var radius = calcPropRadius(props[attribute]);
        layer.setRadius(radius);

        //add state to popup content string
        var popupContent = "<p><b>State:</b> " + props.State + "</p>";

        //add formatted attribute to panel content string
        var year = attribute;
        currentAttribute = year;
        popupContent += "<p><b>Obesity Rate in " + year + ":</b> " + props[attribute] + "%</p>";

        //replace the layer popup
        layer.bindPopup(popupContent, {
          offset: new L.Point(0,-radius)
        });
      };
      updateLegend(map, attribute)
    });
updateLegend(map, attribute);

};




function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("2") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    return attributes;
};

//function to create proportional symbols
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    var all = L.geoJson(data, {
      //call to pointToLayer function
        pointToLayer: function(feature, latlng){
          return pointToLayer(feature, latlng, attributes);
    }
    }).addTo(map)
$("input[type=radio]").on('click',function(){
  var range = $(this).val();
  var rangearray = range.split("-");
  minvalue = Number(rangearray[0]),
  maxvalue = Number(rangearray[1])
  console.log(minvalue, maxvalue)
  updatePropSymbols(map, currentAttribute);
  map.eachLayer(function(layer){
    if (layer.feature && layer.feature.properties[currentAttribute]){
      var prop = layer.feature.properties[currentAttribute];

      if (prop < minvalue || prop > maxvalue){
        layer.setRadius(0)
      }
    }
  })
})

};





//function to set the scale factor to the portional symbols
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 30;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};


function pointToLayer(feature, latlng, attributes){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var geojsonMarkerOptions = {
            radius: 6,
            fillColor: "#ff0000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.2
        };
        var attribute = attributes[0];
        currentAttribute = attribute;
        var attValue=Number(feature.properties[attribute]);

        geojsonMarkerOptions.radius = calcPropRadius(attValue);

        return L.circleMarker(latlng, geojsonMarkerOptions);



};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="180px">';


                    //array of circle names to base loop on
                    var circles = {
                      max: 20,
                      mean: 40,
                      min: 60
};

//loop to add each circle and text to svg string
                      for (var circle in circles){
    //circle string
                          svg += '<circle class="legend-circle" id="' + circle + '" fill="#ff0000" fill-opacity="0.2" stroke="#000000" cx="30"/>';

    //text string
                          svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
};

        //close svg string
        svg += "</svg>";

        //add attribute legend svg to container
        $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
};

function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Example 3.7 line 1...Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute;
    currentAttribute = year;
    var content = "Obesity Rate in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object

    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });

        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + "%");
    };
  }
//Import GeoJSON data
function getData(map){

    //load the data
    $.ajax("data/Obesity.geojson", {
        dataType: "json",
        success: function(response){
          var attributes = processData(response);
          createPropSymbols(response, map, attributes);
          createSequenceControls(map, attributes);
          createLegend(map, attributes);


        }
    });
};



//function to retrieve the data and place it on the map

//when the map is ready, it's created and added to the webpage
$(document).ready(createMap);
