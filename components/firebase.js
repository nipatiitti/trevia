import * as firebase from 'firebase';


const config = {
    apiKey: "AIzaSyAt_iFQhHRtLLXm0GmgXtwwbsvVC1aKArY",
    authDomain: "treviaapp.firebaseapp.com",
    databaseURL: "https://treviaapp.firebaseio.com",
    projectId: "treviaapp",
    storageBucket: "treviaapp.appspot.com",
    messagingSenderId: "516011845190"
};
const firebaseApp = firebase.initializeApp(config);

export default firebaseApp;