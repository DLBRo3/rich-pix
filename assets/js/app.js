$(document).ready(function () {

    
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB4cTN64B5PSWyyzwTzXkoLFmioF-ry-o4",
        authDomain: "rich-pix-3d31b.firebaseapp.com",
        databaseURL: "https://rich-pix-3d31b.firebaseio.com",
        projectId: "rich-pix-3d31b",
        storageBucket: "rich-pix-3d31b.appspot.com",
        messagingSenderId: "278100621922"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    var map = L.map('map').fitWorld();

    
    

    

    //L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/997/256/{z}/{x}/{y}.png?access_token={accessToken}', {
    //    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    //    maxZoom: 18,
    //    id: 'mapbox.streets',
    //    accessToken: 'pk.eyJ1IjoiY2d6b2doYnkiLCJhIjoiY2pldmhkdTlhMGozcTJ3bzQ2dGVhMWxwaiJ9.XStJRTOeI3Kg1NRsnzmvNg'
    //}).addTo(map);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(map);

    //load child pins that are saved into firebase
    database.ref("/connections").on("child_added", function (childSnapshot) {
        //create "pretty print" versions of latitude and longitude for displaying on pins, when you click them
        var childLat = Number.parseFloat(childSnapshot.val().lat).toPrecision(4),
            childLng = Number.parseFloat(childSnapshot.val().lng).toPrecision(4),
            childDate = (childSnapshot.val().date);
        //display pins
        L.marker([childSnapshot.val().lat, childSnapshot.val().lng]).bindPopup(`Lat: ${childLat}<br>Lng: ${childLng}<br>Date: ${childDate}`).addTo(map);
    });

    function makeMapMarker(clickPoint) {
        //clickpoint is an object with loads of data attached to it, we are concerned with lat and long from where
        //the click is. In a future case we would like to pull this from a photo's geographic coordinates
        var lat = clickPoint.latlng.lat;
        var lng = clickPoint.latlng.lng;
        //console.log(clickPoint.latlng);
        //adds the marker to the map
        var marker = L.marker([lat, lng]).addTo(map);
    };
    
  
   
    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        // Draws a radius of the error within the locator
        L.circle(e.latlng, radius).addTo(map);
        // Drop a marker, now on the push of a button!
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        // Capture current date in format 03/20/2018
        var currentDate = moment().format("L");
        // Save the coordinates and date to firebase
        database.ref("/connections").push({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            date: currentDate,
        });
    };

    function onLocationError(e) {
        alert(e.message);
    };

    function locatePhone(e) {
        //Draws a radius of the error within the locator
        L.circleMarker(e.latlng, { color: 'red' }).addTo(map);
        //setView will be called, initially just creates a view of greater richmond area
        map.setView([e.latlng.lat, e.latlng.lng], 12);
    };

    //All the geolocating is now inside this button press, so it will not happen unless the user asks for it.
    

    $("#drop-pin").on("click", function () {
        event.preventDefault();
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.locate({ setView: true, maxZoom: 16 });
        
    });

    //this runs on first page load to find phone
    map.on('locationfound', locatePhone);
    map.locate({ setView: true, maxZoom: 18 });


    // functions to filter by time and distance
    
    function filterByDistance() {
        //filter by Distance will only show "pins" within 1 mile of users location
        
        var lat = clickPoint.latlng.lat;
        var lng = clickPoint.latlng.lng;
        
        var marker = L.marker([lat, lng]).addTo(map);
    };
});