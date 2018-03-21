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

    var marker;

    

    
    



    // Add Map Tiles

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(map);


   
// Functions 
// ======================================================================================================================


    //load child pins that are saved into firebase
    // function getPins() {
      database
        .ref("/connections")
        .on("child_added", function(childSnapshot) {
          //create "pretty print" versions of latitude and longitude for displaying on pins, when you click them
          var childLat = Number.parseFloat(
              childSnapshot.val().lat
            ).toPrecision(4),
            childLng = Number.parseFloat(
              childSnapshot.val().lng
            ).toPrecision(4),
            childDate = childSnapshot.val().date;
          //display pins
            marker = L.marker([childSnapshot.val().lat, childSnapshot.val().lng]);
            marker.bindPopup(
              `Lat: ${childLat}<br>Lng: ${childLng}<br>Date: ${childDate}`
            )
            // .addTo(map);
            map.addLayer(marker);
            // map.removeLayer(marker); this works here 
            
        });
    // }
    

   
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

    
    // Functions to filter by time and distance
    
    function filterByDistance() {
        //filter by Distance will only show "pins" within 1 mile of users location
        
        
    };
    
    function filterByDate() {
        
        //filter by Date will only show "pins" within a user selected time- right now that is just today's date
        // need to remove existing markers before adding filtered ones. 
        
        
        
        // eventually need to add index on database to make query faster 
        var currentDate = moment().format("L");
        console.log(currentDate);
        var dateTodayRef = database.ref("/connections");
        dateTodayRef.orderByChild("date").equalTo(currentDate).on("child_added", function(childSnapshot) {
            console.log("Equal to date: " + childSnapshot.val().date);
            var childLat = Number.parseFloat(
                childSnapshot.val().lat
              ).toPrecision(4),
              childLng = Number.parseFloat(
                childSnapshot.val().lng
              ).toPrecision(4),
              childDate = childSnapshot.val().date;
            //display pins
            L.marker([childSnapshot.val().lat, childSnapshot.val().lng])
              .bindPopup(
                `Lat: ${childLat}<br>Lng: ${childLng}<br>Date: ${childDate}`
              )
              .addTo(map);
        
        
         });

        
        
        
        
    };
    



 
// #Main Process
// ======================================================================================================================
    
  //this runs on first page load to find phone
    
    map.on("locationfound", locatePhone);
    map.locate({ setView: true, maxZoom: 18 });
    // getPins();


  //The geocoding is inside this click event, so it will not happen unless the user clicks the "Share Your POV" button.
    

    $("#drop-pin").on("click", function () {
        event.preventDefault();
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.locate({ setView: true, maxZoom: 16 });
        
    });


    $("#time-filter").on("click", function () {

        // map.removeLayer(marker);  this does not work here - scope issue?
        
        filterByDate();
        
        
    });


});