import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
import {BrowserRouter} from "react-router-dom";

const config = {
    apiKey: "AIzaSyCdmTEy9vmZItRtWQDgimYMZAkeo2zqgzE",
    authDomain: "test1-fda03.firebaseapp.com",
    databaseURL: "https://test1-fda03.firebaseio.com",
    projectId: "test1-fda03",
    storageBucket: "test1-fda03.appspot.com",
    messagingSenderId: "73822061507"
};
firebase.initializeApp(config);
ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    , document.getElementById('root'));
registerServiceWorker();