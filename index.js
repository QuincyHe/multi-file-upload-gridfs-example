const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const gridfsFunc = require('mongoose-gridfs');
const multer = require('multer');

const { Readable } = require('stream');

let gridfs = null;
//obtain a model
let Attachment = null;

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
  Attachment = gridfs.model;
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/images', (req, res) => {
  Attachment.find({}, (err, files) => {
    res.json(files);
  });
});

app.post('/api/images', upload.array('marks', 10086), (req, res) => {
  // TODO: get files and save them to gridfs
  if (!gridfs) {
    res.json({ error: 'File system not working' });
    return;
  }

  // console.log(req.files);
  // [ { fieldname: 'marks',
  //   originalname: 'pomeranian.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   buffer: <Buffer ff d8 ff e1 09 50 68 74 74 70 3a 2f 2f 6e 73 2e 61 64 6f 62 65 2e 63 6f 6d 2f 78 61 70 2f 31 2e 30 2f 00 3c 3f 78 70 61 63 6b 65 74 20 62 65 67 69 6e ... >,
  //   size: 25121 },
  // { fieldname: 'marks',
  //   originalname: 'pomeranian.json',
  //   encoding: '7bit',
  //   mimetype: 'application/json',
  //   buffer: <Buffer 7b 0a 20 20 22 6e 61 6d 65 22 3a 20 22 70 61 63 2d 6d 61 6e 22 0a 7d 0a>,
  //   size: 24 } ]

  // Create stream
  // REMOVE: There is actually no need to avoid duplicates
  // const readable = new Readable();
  // readable._read = () => {};
  // readable.push(req.files[0].buffer);
  // readable.push(null);
  // Attachment.find({ filename: req.files[0].originalname }, (err, file) => {
  //   if (file.length > 0) {
  //     res.json({ error: 'Already exists!'});
  //     return;
  //   }

  //   Attachment.write({
  //     filename: req.files[0].originalname,
  //     contentType: req.files[0].mimetype,
  //   }, readable, (error, createdFile) => {
  //     if (error) {
  //       console.error('Error huh: ', error);
  //     } else {
  //       console.log(createdFile);
  //     }
  //   });
  
  
  //   res.json({ status: 'Under Construction huh' });
  // });
  const files = req.files;
  const dummyReadFunc = () => {};

  const readable = new Readable();
  readable._read = dummyReadFunc;

  const writeGridfs = (readable, index, fileArray) => {
    if (index < fileArray.length) {
      readable.push(fileArray[index].buffer);
      readable.push(null);
    } else {
      res.json({ status: 'Successfully done huh' });
      return;
    }
    Attachment.write({
      filename: fileArray[index].originalname,
      contentType: fileArray[index].mimetype,
    }, readable, (error, createdFile) => {
      if (error) {
        console.error('Error huh: ', error);
        readable = null;// readable.close();// NO freakin 'close() or destroy()'
        res.json({ error: `Error while saving ${fileArray[index].originalname}` });
        return;
      } else {
        readable = null;// readable.close();// NO freakin 'close() or destroy()'
        const readableIn = new Readable();
        readableIn._read = dummyReadFunc;
        writeGridfs(readableIn, index + 1, fileArray);
      }
    });
  };

  writeGridfs(readable, 0, files);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port} huh`);
});