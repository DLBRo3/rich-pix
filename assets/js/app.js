$(document).ready(function () {

    var mymap = L.map('mapid').setView([37.5407, -77.4360], 13);

    L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}`, {
        attribution: `Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>`,
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiY2d6b2doYnkiLCJhIjoiY2pldmhkdTlhMGozcTJ3bzQ2dGVhMWxwaiJ9.XStJRTOeI3Kg1NRsnzmvNg'
    }).addTo(mymap);

        //clickpoint is an object with loads of data attached to it, we are concerned with lat and long from where
        //the click is. In a future case we would like to pull this from a photo's geographic coordinates
        var lat = clickPoint.latlng.lat;
        var lng = clickPoint.latlng.lng;
        //console.log(clickPoint.latlng);
        //adds the marker to the map
        var marker = L.marker([lat, lng]).addTo(mymap);
    };

    //DOM listener for mouse clicks
    mymap.on('click', makeMapMarker);
});
    function makeMapMarker(clickPoint) {