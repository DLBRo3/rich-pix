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
        currentLocation = {};

    database.ref("/connections").on("child_added", function (childSnapshot) {
        //create "pretty print" versions of latitude and longitude for displaying on pins, when you click them
        localDatabase.push(childSnapshot.val());
        var childLat = Number.parseFloat(childSnapshot.val().lat).toPrecision(4),
            childLng = Number.parseFloat(childSnapshot.val().lng).toPrecision(4),
            childCaption = childSnapshot.val().caption;
        childImage = childSnapshot.val().image;
        //display pins
        L.marker([childSnapshot.val().lat, childSnapshot.val().lng]).bindPopup(`<img src="${childImage}"> Lat: ${childLat}<br>Lng: ${childLng}<br>Caption: ${childCaption}`).addTo(map);
    });

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
        //$("#captionModal").modal("show");
        //bind event listener every time it arrives to this line. 
        //every new time you click the button, it binds a new event listener
        //sol'n is to move click listener outside of onLocationFound
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

    //All the geolocating is now inside this button press, so it will not happen unless the user asks for it.
    $("#drop-pin").on("click", function () {
        event.preventDefault();
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        map.locate({
            setView: true,
            maxZoom: 18
        });

        // temp for testing -----------------------
        $("#captionModal").modal("show");
    });

    //this runs on first page load to find phone
    //save the data from this locate into global vars, then pass that into the modal.
    map.on('locationfound', locatePhone);
    map.locate({
        setView: true,
        maxZoom: 18
    });

    //create a global capture for active/current location, set it, show modal, and use that global var, then
    //pass that data to firebase
    $("#captionAdd, #noCaption").click(function () {
        event.preventDefault();
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
            });
        // END IMAGE STORAGE +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // if (this.id === "captionAdd") {
        //     var captionValue = $("#caption-text").val();
        //     database.ref("/connections").push({
        //         lat: currentLocation.lat,
        //         lng: currentLocation.lng,
        //         caption: captionValue,
        //         image: downloadURL,
        //     });
        // };
        // if (this.id === "noCaption") {
        //     database.ref("/connections").push({
        //         lat: currentLocation.lat,
        //         lng: currentLocation.lng,
        //         caption: "No Caption Provided",
        //         image: downloadURL,
        //     });
        // };

        $("#captionModal").modal("hide");
    });
});