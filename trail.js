//Initialize auth or send user to journal page	
firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
	 	window.location.href = "index.html"
	} else {
		greetUser(user);
	}
});

//greet user
function greetUser(user) {
	var greeting = document.querySelector('.greeting');
	greeting.innerHTML = "Hi, " + user.displayName + "!";
}

//Displaying the trail information cards when data exists
//check for one object, the first one, then apply the function once so that it doesn't keep firing
//not listening for value changes after the initial check
firebase.database().ref('trails-database/trails').limitToFirst(1).once("value", function(snapshot) {
	checkDatabaseQuery(snapshot);
});

//check if database has data, if empty show add trail card
function checkDatabaseQuery(snapshot) {
	if  (snapshot.val()) {
    	document.querySelector('.new-trail-card').style.display = "none";
	} else {
		document.querySelector('.new-trail-card').style.display = "block";
		console.log('showing')
	}
} 

// Asynchronous call so that when we add trail cards the print to the page
firebase.database().ref('trails-database/trails').on("child_added", function(snapshot) {
	console.log(snapshot.val());
	console.log(snapshot.key);
	printTrailSummary(snapshot.val().name, snapshot.val().place, snapshot.val().notes, snapshot.val().image, snapshot.key);
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});
firebase.database().ref('trails-database/trails').on("child_changed", function(snapshot) {
	console.log(snapshot.val());
	printTrailSummary(snapshot.val().name, snapshot.val().place, snapshot.val().notes, snapshot.val().image, snapshot.key);
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});

function printTrailSummary(name, location, notes, image, key) {
	var contentDiv = document.querySelector('.content')
	var storageRef = firebase.storage().ref();
	storageRef.child('images/' + image).getDownloadURL().then(function(URL) {
		contentDiv.insertAdjacentHTML('afterbegin', '<div class="trail-summary ' + key + '"><div class="trail-image"><img src="' + URL + '"></div><h3>' + name + ', ' + location + '</h3><h4>' + notes + '</h4><p class="delete">Delete entry</p><p class="edit">Edit entry</p></div>');
		editJournalEntry(name, location, notes, image, key);
		deleteJournalEntry(key);
	});
}


//trail card inputs
var trailName = document.querySelector('.name');
var trailLocation = document.querySelector('.location');
var trailNotes = document.querySelector('.notes');
var trailImage = document.querySelector('.image');

//form buttons
var saveButton = document.querySelector('.save-btn');
var updateButton = document.querySelector('.update-btn');

//submit form
saveButton.addEventListener('click', function() {
	var fileName = '' + Date.now();
	if (trailName.value != '' && trailLocation.value != '' && trailNotes.value != '' && trailImage.files[0] != undefined) {
		saveButton.disabled = true;
		//upload file to firebase storage
		uploadImage(trailImage.files[0], fileName, undefined);
	}
});

//save data from form
function writeTrailSummary(name, location, notes, image) {
	firebase.database().ref('trails-database').child('trails').push().set({
		name: name,
		place: location,
		notes: notes,
		image: image
	});
}


//new trail card close icon click event
var close = document.querySelector('.close');
close.addEventListener('click', function() {
	closeCard();
	clearCard();
})

var closed;

//close card icon functionality
var trailCard = document.querySelector('.new-trail-card');
function closeCard() {
	trailCard.style.display = "none";
	closed = true;
	clearCard();
}

//fab button
openTrailCard();
function openTrailCard() {
	var fab = document.getElementById('fab');
	fab.addEventListener('click', function() {
		trailCard.style.display = "block";
		updateButton.style.display = "none";
		saveButton.style.display = "inline-block";
		// document.body.style.background = "black";
		closed = false;
	});
}

//clear form on close
function clearCard() {
	if (closed = true) {
		document.querySelector('.name').value = '';
		document.querySelector('.location').value = '';
		document.querySelector('.notes').value = '';
	}
}


function uploadImage(file, fileName, key) {
	// Create a root reference
	var storageRef = firebase.storage().ref();

	// Upload file and metadata to the object 'images/mountains.jpg'
	storageRef.child('images/' + fileName).put(file).then(function(snapshot) {
		var trailNameVal = trailName.value;
		var trailLocationVal = trailLocation.value;
		var trailNotesVal = trailNotes.value;
		//write values to database
		console.log(key);
		if (key == undefined) {
			writeTrailSummary(trailNameVal, trailLocationVal, trailNotesVal, fileName);
		} else {
			updateTrailSummary(trailNameVal, trailLocationVal, trailNotesVal, fileName, key);
		}
		//stop showing card
		closeCard();
		//ability to reopen card
		openTrailCard();
		saveButton.disabled = false;
	});
}


//Edit a journal entry
function editJournalEntry(name, location, notes, key) {
	document.querySelector('.edit').addEventListener('click', function(){
		trailCard.style.display = "block";
		updateButton.style.display = "inline-block";
		saveButton.style.display = "none";
		
		trailName.value = name;
		trailLocation.value = location;
		trailNotes.value = notes;

		//update form
		updateButton.addEventListener('click', function() {
			if (trailImage.files[0] == undefined) {
				updateTrailSummary(trailName.value, trailLocation.value, trailNotes.value, undefined, key);
			} else {
				var fileName = '' + Date.now();
				uploadImage(trailImage.files[0], fileName, key);
			}
		});
	});
}

function updateTrailSummary(name, location, notes, fileName, key) {
	if (fileName == undefined) {
		firebase.database().ref('trails-database/trails/' + key).update({
			name: name,
			place: location,
			notes: notes
		}).then(function(){
			closeCard();
			document.querySelector('.' + key).remove();
		});
	} else {
		firebase.database().ref('trails-database/trails/' + key).update({
			name: name,
			place: location,
			notes: notes,
			image: fileName
		}).then(function(){
			closeCard();
			document.querySelector('.' + key).remove();
		});
	}
}


function deleteJournalEntry(key) {
	document.querySelector('.delete').addEventListener('click', function(){
		firebase.database().ref('trails-database/trails/' + key).remove();
		document.querySelector('.' + key).remove();
		console.log('removed');
	});
}







