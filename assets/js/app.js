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

    // Add Map Tiles


    var mapBox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        minZoom: 3,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    })




    //load child pins that are saved into firebase
    //load firebase data and save it into an object, edit data from the object, that way we do not edit the raw
    //data on firebase.
    //initialize localDatabase for pulling all firebase info
    //initialize currentLocation for storing lat and lng
    var localDatabase = [],
        currentLocation = {},
        provider = new firebase.auth.GoogleAuthProvider();

    // Satellite

    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        minZoom: 5,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.satellite'

    })


    // Dark


    var night = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 5,
        attribution: 'Map tiles by Carto, under CC BY 3.0. Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',


    })



    var map = L.map('map', {
        layers: [mapBox]

    });

    var marker;

    var baseLayers = {
        "Street Map": mapBox,
        "Satellite": satellite,
        "Night": night
    }
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

    L.control.layers(baseLayers).addTo(map);

    // Variable for the pin that's being selected to delete
    var selectedPin;

    // Functions 
    // ======================================================================================================================

    // Functions 
    // ======================================================================================================================


    //load child pins that are saved into firebase
    // function getPins() {
    database
        .ref("/connections")
        .on("child_added", function (childSnapshot) {
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
                `Lat: ${childLat}<br>Lng: ${childLng}<br>Date: ${childDate}<br>`
            )
            // selected pin from map using lat lng
            marker.on("click", function (pin) {
                selectedPin = pin.latlng; // here we can add selectedPin = key to give unique keys for for each pin
            });
            // .addTo(map);
            map.addLayer(marker);
            // map.removeLayer(marker); this works here 
        });
    // select pin, click delete and will show the pin you selected to delete in console, refresh page then key is gone
    $("#delete-pin").on("click", function () {
        console.log(selectedPin);
        // => replace of a function orders pins by lat and removes on delete button
        database.ref("/connections").orderByChild("/lat").equalTo(selectedPin.lat).once('value', snapshot => snapshot.forEach(child => child.ref.remove()));

    });
    // }

    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        // Draws a radius of the error within the locator
        L.circle(e.latlng, radius).addTo(map);
        // Drop a marker, now on the push of a button!
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        // Capture current date in format 03/20/2018
        currentLocation = e.latlng;
        $("#captionModal").modal("show");
        // Save the coordinates and date to firebase

    };

    function onLocationError(e) {
        alert(e.message);
    };

    function locatePhone(e) {
        //Draws a radius of the error within the locator
        L.circleMarker(e.latlng, {
            color: 'red'
        }).addTo(map);
        //setView will be called, initially just creates a view of greater richmond area
        map.setView([e.latlng.lat, e.latlng.lng], 12);
        currentLocation = e.latlng;
        console.log(currentLocation);
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
        dateTodayRef.orderByChild("date").equalTo(currentDate).on("child_added", function (childSnapshot) {
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
    map.locate({
        setView: true,
        maxZoom: 18
    });
    // getPins();


    //The geocoding is inside this click event, so it will not happen unless the user clicks the "Share Your POV" button.


    $("#drop-pin").on("click", function () {
        event.preventDefault();
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        map.locate({
            setView: true,
            maxZoom: 16
        });
    });

    //this runs on first page load to find phone
    //save the data from this locate into global vars, then pass that into the modal.
    map.on('locationfound', locatePhone);


    //create a global capture for active/current location, set it, show modal, and use that global var, then
    //pass that data to firebase. Using global capture allows for me to avoid generating multiple instances like when
    //I would nest the capture inside a function that calls everytime the user clicks a button.
    $("#captionAdd, #noCaption").click(function () {
        event.preventDefault();
        var currentDate = moment().format("L");
        //$("#captionAdd").attr("disabled", true); //testing
        if (this.id === "captionAdd") {
            var captionValue = $("#caption-text").val();
            database.ref("/connections").push({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                date: currentDate,
                caption: captionValue,
            });
        };
        if (this.id === "noCaption") {
            database.ref("/connections").push({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                date: currentDate,
                caption: "No Caption Provided",
            });
        };
        $("#captionModal").modal("hide");
    });

    $("#loginAdd").on("click", function () {
        event.preventDefault();
        var loginEmail = $("#loginEmail").val().trim();
        var loginPassword = $("#loginPassword").val().trim();
        firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    });

    function onSignIn(googleUser) {
        console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged(function (firebaseUser) {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!isUserEqual(googleUser, firebaseUser)) {
                // Build Firebase credential with the Google ID token.
                var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.getAuthResponse().id_token);
                // Sign in with credential from the Google user.
                firebase.auth().signInWithCredential(credential).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                    // ...
                });
            } else {
                console.log('User already signed-in Firebase.');
            }
        });
    };

    function isUserEqual(googleUser, firebaseUser) {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()) {
                    // We don't need to reauth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    };

    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });

    map.locate({
        setView: true,
        maxZoom: 18
    });

    // BEGIN CAMERA TESTING ===============================================================================
    $("#open-camera").on("click", function () {
        event.preventDefault();

        $("#video-card").css("display", "block");

        function hasGetUserMedia() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        }

        if (hasGetUserMedia()) {
            // Good to go!
        } else {
            alert('getUserMedia() is not supported by your browser');
        }

        const constraints = {
            video: true
        };

        const video = document.querySelector('video');

        function handleSuccess(stream) {
            video.srcObject = stream;
        }

        function handleError(error) {
            console.error('Reeeejected!', error);
        }

        const button = document.querySelector('#screenshot-button');
        const img = document.querySelector('#screenshot-img');
        const canvas = document.createElement('canvas');

        button.onclick = video.onclick = function () {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            // Other browsers will fall back to image/png
            img.src = canvas.toDataURL('image/webp');
        };

        function handleSuccess(stream) {
            video.srcObject = stream;
        }

        navigator.mediaDevices.getUserMedia(constraints).
            then(handleSuccess).catch(handleError);



    });

    // END CAMERA TESTING =================================================================================

    $("#time-filter").on("click", function () {

        // map.removeLayer(marker);  this does not work here - scope issue?

        filterByDate();


    });
});
