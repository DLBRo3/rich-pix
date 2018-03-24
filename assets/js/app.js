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
    //load firebase data and save it into an object, edit data from the object, that way we do not edit the raw
    //data on firebase.
    //initialize localDatabase for pulling all firebase info
    //initialize currentLocation for storing lat and lng
    var localDatabase = [],
        currentLocation = {},
        provider = new firebase.auth.GoogleAuthProvider();

    database.ref("/connections").on("child_added", function (childSnapshot) {
        //create "pretty print" versions of latitude and longitude for displaying on pins, when you click them
        localDatabase.push(childSnapshot.val());
        var childLat = Number.parseFloat(childSnapshot.val().lat).toPrecision(4),
            childLng = Number.parseFloat(childSnapshot.val().lng).toPrecision(4),
            childCaption = childSnapshot.val().caption;
        //display pins
        L.marker([childSnapshot.val().lat, childSnapshot.val().lng]).bindPopup(`Lat: ${childLat}<br>Lng: ${childLng}<br>Caption: ${childCaption}`).addTo(map);
    });

    //Drop leaflet custom method (L.easybutton) to create login button
    //When you push the (identified by a soon-to-be-useful icon) login square, a modal will display
    //asking if you would like to login. If you would not, simply clicking no thank you closes the modal.
    //If you push login, then your username and info will be logged to firebase. 
    L.easyButton(
        "fa-sign-in", function () {
            $("#loginModal").modal("show");
        },
        'Login to enable saving and filtering pins by username'
    ).addTo(map);

    //multiple form submissions in one browser session increases the number of data points submitted by one for each
    //form submission
    function onLocationFound(e) {
        //Draws a circle on the marker
        L.circleMarker(e.latlng).addTo(map);
        //Drop a marker, now on the push of a button!
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        //Activate the modal to save a caption with your pin
        //Pushing no thank you will close the modal
        currentLocation = e.latlng;
        console.log(currentLocation);
        $("#captionModal").modal("show");
        //bind event listener every time it arrives to this line. 
        //every new time you click the button, it binds a new event listener
        //sol'n is to move click listener outside of onLocationFound
    };

    function onLocationError(e) {
        alert(e.message);
    };

    function locatePhone(e) {
        //Draws a radius of the error within the locator
        L.circleMarker(e.latlng, { color: 'red' }).addTo(map);
        //setView will be called, initially just creates a view of greater richmond area
        map.setView([e.latlng.lat, e.latlng.lng], 12);
        currentLocation = e.latlng;
        console.log(currentLocation);
    };

    //All the geolocating is now inside this button press, so it will not happen unless the user asks for it.
    $("#drop-pin").on("click", function () {
        event.preventDefault();
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.locate({ setView: true, maxZoom: 18 });
    });

    //this runs on first page load to find phone
    //save the data from this locate into global vars, then pass that into the modal.
    map.on('locationfound', locatePhone);
    map.locate({ setView: true, maxZoom: 18 });

    //create a global capture for active/current location, set it, show modal, and use that global var, then
    //pass that data to firebase. Using global capture allows for me to avoid generating multiple instances like when
    //I would nest the capture inside a function that calls everytime the user clicks a button.
    $("#captionAdd, #noCaption").click(function () {
        event.preventDefault();
        //$("#captionAdd").attr("disabled", true); //testing
        if (this.id === "captionAdd") {
            var captionValue = $("#caption-text").val();
            database.ref("/connections").push({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                caption: captionValue,
            });
        };
        if (this.id === "noCaption") {
            database.ref("/connections").push({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                caption: "No Caption Provided",
            });
        };
        $("#captionModal").modal("hide");
    });

    $("#loginAdd").on("click", function () {
        event.preventDefault();
        var loginEmail = $("#exampleInputEmail1").val().trim();
        var loginPassword = $("#exampleInputPassword1").val().trim();
        firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    });
    $("#signIn").on("click", function () {
        event.preventDefault();
        firebase.auth().signInWithRedirect(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    })
});