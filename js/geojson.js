/* Map of GeoJSON data from map.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map with center of 44, -115 and zoom of 3
    var map = L.map('map', {
        center: [44, -115],
        zoom: 3
    });

    //add tilelater.  openestreet map is used
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        //adds the basemap to the map
    }).addTo(map);

    //call getData function to get the data within the geojson
    getData(map);
};

function getData(map){
    //load the data
    $.ajax("data/Mega.geojson", {
        dataType: "json",
        success: function(response){
            //examine the data in the console to figure out how to construct the loop
            console.log(response)

            //create an L.markerClusterGroup layer
            var markers = L.markerClusterGroup();

            //loop through features to create markers and add to MarkerClusterGroup
            for (var i = 0; i < response.features.length; i++) {
                var a = response.features[i];
                //add properties html string to each marker
                var properties = "";
                for (var property in a.properties){
                    properties += "<p>" + property + ": " + a.properties[property] + "</p>";
                };
                var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), { properties: properties });
                //add a popup for each marker
                marker.bindPopup(properties);
                //add marker to MarkerClusterGroup
                markers.addLayer(marker);
            }

            //add MarkerClusterGroup to map
            map.addLayer(markers);
        }
    });
};
$(document).ready(createMap);
