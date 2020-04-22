const { db } = require('../util/admin');

exports.getAllMessages = (req, res) => {
  db.collection('messages')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let messages = [];
      data.forEach((doc) => {
        messages.push({
          messageId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(messages);
    })
    .catch((err) => {
      res.status(500).json({ error: err.code });
      console.error(err);
    });
};

// Send Message
exports.sendMessage = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Please add content to your post' });
  }

  const newMessage = {
    body: req.body.body,
    userHandle: req.user.handle,
    recipient: req.params.handle,
    createdAt: new Date().toISOString(),
  };

  db.collection('messages')
    .add(newMessage)
    .then((doc) => {
      const resMessage = newMessage;
      resMessage.messageId = doc.id;
      res.json(resMessage);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Something Went Wrong!' });
      console.error(err);
    });
};
