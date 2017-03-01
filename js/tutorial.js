//Javescript load
//
function initialize(){
//assign mymap variable to center (51.505,-.09 with a zoom of 13)
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

//add tile layer.
//I used openstreetmap so so id or token is needed
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap);
//assign a marker to point at a location of 51.5,-.09
var marker = L.marker([51.5, -0.09]).addTo(mymap);
//create a circular marker at the location 51.508,-.11 with a color red, fill of #f03, and transparency of 50%
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
//add circular marker to map
}).addTo(mymap);
//create a polygon to the map
var polygon = L.polygon([
    //the polygon has the 3 following nodes
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
//polygon to the map
]).addTo(mymap);
//when the mouse is over the marker, "hello world, I an a popup" appears
marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();
//when the mouse is over the circle 'I am a circle' appears
circle.bindPopup("I am a circle.");
//when the mouse hoovers over the polygon, 'i am a polygom' appears
polygon.bindPopup("I am a polygon.");
//when the mouse hoovers over 51.5, -.09, a popup with 'I am a standalone popup' appears
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);
//assigns popup to leaflet function popup
var popup = L.popup();
//when a location is clicked, a popup with the latitude and longitude appears
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}
//function onMapClick is executed each time the map is clicked
mymap.on('click', onMapClick);
}
//when the page loads, all the functions run
window.onload = initialize();
