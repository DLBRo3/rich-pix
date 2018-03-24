$(document).ready(function () {

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

    $("#registerNewUser").on("click", function () {
        event.preventDefault();
        var email = $("#newUserEmail").val().trim();
        var password = $("#newUserPassword").val().trim();
        var passwordCheck = $("#newUserPasswordCheck").val().trim();
        try {
            if (password !== passwordCheck && passwordCheck !== "") throw "make sure your password is spelled identically on both lines.";
            if (email === "") throw "enter a valid email address.";
            if (password === "") throw "enter a password.";
            if (passwordCheck === "" && password !== "") throw "repeat your password.";
            firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
            });
        }
        catch (err) {
            alert("Please " + err)
        }
    });

});
