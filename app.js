//check if user is signed in, if not initialize auth, else send them to logged in page	
firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		//Google sign in to firebase
		let provider = new firebase.auth.GoogleAuthProvider();
		let googleSignIn = document.querySelector('.signin');
		googleSignIn.addEventListener('click', function() {
			firebase.auth().signInWithPopup(provider).then(function(result) {
				window.location.href = "journal.html"
			}).catch(function(error) {
				console.log(error);
			});
		});
	} else {
		window.location.href = "journal.html"
	}
});

//signout of web app
firebase.auth().signOut().then(function() {
		console.log('Signed Out');
	}, function(error) {
		console.error('Sign Out Error', error);
});