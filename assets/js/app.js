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

    //var mymap = L.map('mapid').setView([37.5407, -77.4360], 13);
    var map = L.map('map').fitWorld();

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/997/256/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiY2d6b2doYnkiLCJhIjoiY2pldmhkdTlhMGozcTJ3bzQ2dGVhMWxwaiJ9.XStJRTOeI3Kg1NRsnzmvNg'
    }).addTo(mymap);

    function makeMapMarker(clickPoint) {
        //clickpoint is an object with loads of data attached to it, we are concerned with lat and long from where
        //the click is. In a future case we would like to pull this from a photo's geographic coordinates
        var lat = clickPoint.latlng.lat;
        var lng = clickPoint.latlng.lng;
        //console.log(clickPoint.latlng);
        //adds the marker to the map
        var marker = L.marker([lat, lng]).addTo(mymap);
    };

    function onLocationFound(e) {
        var radius = e.accuracy / 2;

        L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();

        L.circle(e.latlng, radius).addTo(map);
    }

    function onLocationError(e) {
        alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    map.locate({ setView: true, maxZoom: 16 });

    //DOM listener for mouse clicks
    mymap.on('click', makeMapMarker);

});