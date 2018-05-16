const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const gridfsFunc = require('mongoose-gridfs');
const multer = require('multer');

let gridfs = null;

// initialize multer
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

mongoose.connect('mongodb://localhost:27017/marks');
const db = mongoose.connection;
db.on('error', () => {
  console.error('Error connecting to mongodb://localhost:27017/marks!');
});
db.once('open', () => {
  console.log('I\'m impressed huh. Connected to mongodb');

  gridfs = require('mongoose-gridfs')({
    collection: 'attachments',
    model: 'Attachment',
    mongooseConnection: db,
  });
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')));

app.post('/api/images', upload.array('marks', 10086), (req, res) => {
  // TODO: get files and save them to gridfs
  if (!gridfs) {
    res.json({ error: 'File system not working' });
    return;
  }

  console.log(req.files);

  res.json({ status: 'Under Construction huh' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port} huh`);
});