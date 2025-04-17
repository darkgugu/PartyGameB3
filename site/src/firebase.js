// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAyy0IP7QhTWY8ut9LhW-Ski5HwvTMhuq4',
	authDomain: 'party-game-b3.firebaseapp.com',
	databaseURL:
		'https://party-game-b3-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'party-game-b3',
	storageBucket: 'party-game-b3.firebasestorage.app',
	messagingSenderId: '186677913212',
	appId: '1:186677913212:web:047332d4cb779946908bf9',
	measurementId: 'G-3E3RRXESJY',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app)
export const auth = getAuth(app)
