const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();

const firebaseConfig = {
  apiKey: 'AIzaSyBam5Xw71HzPcwqbUjFGYJF63we2wDQCWM',
  authDomain: 'social-media-cha.firebaseapp.com',
  databaseURL: 'https://social-media-cha.firebaseio.com',
  projectId: 'social-media-cha',
  storageBucket: 'social-media-cha.appspot.com',
  messagingSenderId: '789984777785',
  appId: '1:789984777785:web:fdba84a7060e31d0b1dfe8',
  measurementId: 'G-2SDQQ7MS2R',
};

const firebase = require('firebase/app');
require('./node_modules/firebase/firebase-app.js');
require('./node_modules/firebase/firebase-auth');

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/posts', (req, res) => {
  db.collection('posts')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(posts);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Something Went Wrong!' });
      console.error(err);
    });
});

app.post('/post', (req, res) => {
  const newPost = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection('posts')
    .add(newPost)
    .then((doc) => {
      res.json({ message: `Document ${doc.id} Created Successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: 'Something Went Wrong!' });
      console.error(err);
    });
});

const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
};

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

// Signup Route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = 'Please enter your email';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Please input a valid email address';
  }

  if (isEmpty(newUser.password)) errors.password = 'Please enter your password';
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = 'Passwords must match';
  if (isEmpty(newUser.handle)) errors.handle = 'Please enter your username';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: 'This Username is already taken.' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use.' });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = 'Please enter your email';
  }
  if (isEmpty(user.password)) {
    errors.password = 'Please enter your password';
  }

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res
          .status(403)
          .json({ general: 'Please enter a valid username and password.' });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

// Taking in routes from express and sending through 'api' function
exports.api = functions.https.onRequest(app);
