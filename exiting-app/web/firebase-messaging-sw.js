importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

firebase.initializeApp({
	apiKey: "AIzaSyCPl1-sBA7vZo4VDsY8lHG-SLhjYKAaMak",
	authDomain: "md-exam-app.firebaseapp.com",
   	projectId: "md-exam-app",
	storageBucket: "md-exam-app.appspot.com",
	messagingSenderId: "112666543658",
	appId: "1:112666543658:web:05c619bf141528c9e26553"
});
// Necessary to receive background messages:
const messaging = firebase.messaging();

// Optional:
messaging.onBackgroundMessage((m) => {
  console.log("onBackgroundMessage", m);
});