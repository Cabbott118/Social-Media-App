const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/FBAuth');

const {
  getAllPosts,
  postOnePost,
  getPost,
  commentOnPost,
} = require('./handlers/posts');
const {
  signUp,
  login,
  getAuthenticatedUser,
  uploadImage,
  addUserDetails,
} = require('./handlers/users');

// Posts Routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postOnePost);
app.post('/post/:postId/comment', FBAuth, commentOnPost);
app.get('/post/:postId', getPost);

// User Routes
app.post('/signup', signUp);
app.post('/login', login);
app.get('/user', FBAuth, getAuthenticatedUser);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);

// Taking in routes from express and sending through 'api' function
exports.api = functions.https.onRequest(app);
