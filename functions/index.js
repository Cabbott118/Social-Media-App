const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/FBAuth');

const { getAllPosts, postOnePost } = require('./handlers/posts');
const { signUp, login } = require('./handlers/users');

// const firebase = require('firebase/app');
// require('./node_modules/firebase/firebase-app.js');
// require('./node_modules/firebase/firebase-auth');

// firebase.initializeApp(firebaseConfig);

// Posts Routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postOnePost);

// User Routes
app.post('/signup', signUp);
app.post('/login', login);

// Taking in routes from express and sending through 'api' function
exports.api = functions.https.onRequest(app);
