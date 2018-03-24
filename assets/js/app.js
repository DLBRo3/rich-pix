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

    // Get a reference to the storage service, which is used to create references in your storage bucket
    var storage = firebase.storage();

    // Create a storage reference from our storage service
    var storageRef = storage.ref();

    var map = L.map('map').fitWorld();


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




    //  Display Basemap on initial map load


    var map = L.map('map', {
        layers: [mapBox]

    });


    



    // declare variables for todays date, last week, last month, and last year
    var currentDate = moment().format("L");
    var currentWeek = moment().subtract(7, "days").format("L");
    var currentMonth = moment().subtract(1, "month").format("L");
    var currentYear = moment().subtract(12, "month").format("L");
   

    // declare variables for filter by date layer groups
    var markers = L.layerGroup([]);
    var todayMarkers = L.layerGroup([]);
    var weekMarkers = L.layerGroup([])
    var monthMarkers = L.layerGroup([]);
    var yearMarkers = L.layerGroup([]);

    // declare variable for categories

    var categoriesArray = ["Scenic Views", "Food", "Outdoors", "Booze"];

    // declare variables for filter by category layer groups
    var scenicMarkers = L.layerGroup([]);
    var foodMarkers = L.layerGroup([]);
    var outdoorMarkers = L.layerGroup([]);
    var boozeMarkers = L.layerGroup([]);



    // declare variables for all basemap tiles
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

    var dateLayers = {
        "All": markers,
        "Today": todayMarkers,
        "Last Week": weekMarkers,
        "Last Month": monthMarkers,
        "Last Year": yearMarkers
    };

    var categoryLayers = {
        "All": markers, 
        "Scenic Views": scenicMarkers,
        "Food": foodMarkers,
        "Outdoors": outdoorMarkers,
        "Booze": boozeMarkers,
    }

    // add layer control to toggle between different basemaps
    L.control.layers(baseLayers).addTo(map);


    // Variable for the pin that's being selected to delete
    var selectedPin;

    L.control.layers(dateLayers).addTo(map);

    L.control.layers(categoryLayers).addTo(map);


    // Functions 
    // ======================================================================================================================


    //load child pins that are saved into firebase
    function getPins() {
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
                    childCategory = childSnapshot.val().category;
                    
                // create markers with popup from firebase 
                marker = L.marker([childSnapshot.val().lat, childSnapshot.val().lng]);
                marker.date = childSnapshot.val().date;
                marker.bindPopup(
                    `<img src="${childImage}"><br>Lat: ${childLat}<br>Lng: ${childLng}<br>Date: ${childDate}<br>Category: ${childCategory}`
                )
                // add each marker to global markers layer group
                // each marker is now stored in the markers layer group and can be manipulated locally instead of on firebase
                markers.addLayer(marker);
               
                // add markers layer group to map
                map.addLayer(markers);

                // call other date filter functions to populate their layer groups and make available as layers on map
                filterbyToday();
                filterbyWeek();
                filterbyMonth();
                filterbyYear();
                filterbyScenicView();
                filterbyBooze();
                filterbyOutdoors();
                filterbyFood();
            });

    }

    // functions to filter by Date
    
    function filterbyToday() {
        markers.eachLayer(function (e) {
            if (Date.parse(e.date) === Date.parse(currentDate)) {
                todayMarkers.addLayer(e);
                // console.log(todayMarkers);

            }

            // map.addLayer(todayMarkers);

        })


    }

    // currently working on finishing remainder of these functions, adding control group
    function filterbyWeek() {
        markers.eachLayer(function (e) {
            if (Date.parse(e.date) >= Date.parse(currentWeek)) {
                weekMarkers.addLayer(e);
                // console.log(weekMarkers);

            }

            // map.addLayer(weekMarkers);

        })


    }

    function filterbyMonth() {
        markers.eachLayer(function (e) {
            if (Date.parse(e.date) >= Date.parse(currentMonth)) {
                monthMarkers.addLayer(e);
                // console.log(monthMarkers);

            }

            // map.addLayer(monthMarkers);

        })


    }

    function filterbyYear() {
        markers.eachLayer(function (e) {
            if (Date.parse(e.date) >= Date.parse(currentYear)) {
                yearMarkers.addLayer(e);
                // console.log(yearMarkers);
                // console.log("cool bro" + e.date);

            } 
            // map.addLayer(yearMarkers);

        }) 


    }

    // else {console.log("nope: " + e.date)}


// functions to filter by Category

    function filterbyScenicView() {
        markers.eachLayer(function (e) {
            if ((e.category) === "Scenic Views") {
                scenicMarkers.addLayer(e);
                // console.log(scenicMarkers);

            }

            // map.addLayer(todayMarkers);

        })


    }
    function filterbyFood() {
        markers.eachLayer(function (e) {
            if ((e.category) === "Food") {
                foodMarkers.addLayer(e);
                // console.log(foodMarkers);

            }

            // map.addLayer(todayMarkers);

        })


    }

    function filterbyBooze() {
        markers.eachLayer(function (e) {
            if ((e.category) === "Booze") {
                boozeMarkers.addLayer(e);
                // console.log(boozeMarkers);

            }

            // map.addLayer(todayMarkers);

        })


    }

    function filterbyOutdoors() {
        markers.eachLayer(function (e) {
            if ((e.category) === "Outdoors") {
                outdoorMarkers.addLayer(e);
                // console.log(boozeMarkers);

            }

            // map.addLayer(todayMarkers);

        })


    }




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

  
   





    // Functions to filter by  distance

    function filterByDistance(e) {

        

        L.circle(e.latlng, {
            color: "gray",
            fillColor: "#d3d3d3",
            fillOpacity: 0.5,
            radius: 1609.344,
        }).addTo(map);
        map.setView([e.latlng.lat, e.latlng.lng],14)
        //filter by Distance will only show "pins" within 1 mile of users location



    };









    // #Main Process
    // ======================================================================================================================

    //this runs on first page load to find phone

    map.on("locationfound", locatePhone);

    

    map.locate({
        setView: true,
        maxZoom: 18
    });


    getPins();


   

   



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

        // IMAGE STORAGE +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // File or Blob named mountains.jpg
        var file = $("#pov-pic").get(0).files[0];
        var fileName = (+new Date()) + '-' + file.name;

        // Create the file metadata
        var metadata = {
            contentType: 'image/jpeg'
        };

        // Upload file and metadata to the object 'images/mountains.jpg'
        var uploadTask = storageRef.child('images/' + fileName).put(file, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function (snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            },
            function (error) {

                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;

                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            function () {
                // Upload completed successfully, now we can get the download URL
                var downloadURL = uploadTask.snapshot.downloadURL;
                var captionValue = $("#caption-text").val();
                database.ref("/connections").push({
                    lat: currentLocation.lat,
                    lng: currentLocation.lng,
                    caption: captionValue,
                    image: downloadURL,
                });
            }
        );
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
        // END IMAGE STORAGE +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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




    $("#distance-filter").on("click", function () {
        event.preventDefault();
        map.locate();
        map.on('locationfound', filterByDistance);
        map.on('locationerror', onLocationError);
        
      
       
       
        });


    







});