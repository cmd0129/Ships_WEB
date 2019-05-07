var rootRef = firebase.database().ref();
/*rootRef.push({
	name: "DoYouWork?"
});*/ //daje śmieci do bazy danych


// autentykacja: https://firebase.google.com/docs/auth/web/anonymous-auth
firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  //var errorCode = error.code;
  //var errorMessage = error.message;
  var elem = document.getElementById('container');
  elem.innerHTML = "<p>Błąd autoryzacji z firebase.</p><p>" + error.code + "</p><p>" + error.message + "</p>";
  // ...
});

//jeżeli signInAnonymously się udało to:
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    // ...
	window.alert('Zalogowałeś się.');
  } else {
    // User is signed out.
    // ... //////////////// Usuwamy jego rekordy w bazie danych.
	/* tak się nie da
	firebase.auth().currentUser.delete().then(function() {
	    // User deleted.
	  }).catch(function(error) {
	    // An error happened
	  });*/
    }
  // ...
});

/*
firebase.database().ref('boards/').set({
name: 'I do work!'
});*/

/*
var user = firebase.auth().currentUser;

user.delete().then(function() {
  // User deleted.
}).catch(function(error) {
  // An error happened.
});

*/ //android