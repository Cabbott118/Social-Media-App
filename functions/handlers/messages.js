const { db } = require('../util/admin');

exports.sendMessage = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ message: 'Cannot send empty message' });

  const newMessage = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    userId: req.params.userId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };
  console.log(newMessage);

  db.doc(`/messages/${req.params.userId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      return doc.ref.update({ messageCount: doc.data().messageCount + 1 });
    })
    .then(() => {
      return db.collection('messages').add(newMessage);
    })
    .then(() => {
      res.json(newMessage);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};
