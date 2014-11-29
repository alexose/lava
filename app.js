/* jshint laxcomma: true */
var express = require('express');
var app = express();
var log = require('npmlog');
var multer  = require('multer');
var validator = 'node-validator';
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/lava';

log.enableColor();
log.level = "verbose";

MongoClient.connect(url, function(err, db){
  log.info('MonogDB connected.');
  setup(db);
});

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

function setup(db){

  var collection = db.collection('posts');

  app.listen(port);
  app.use('/public', express.static(__dirname + '/public'));
  app.use(multer({ dest: './uploads/'}))

  app.get('/', function(req,res){
    res.sendFile('public/index.html', { root : __dirname });
  });

  app.get('/api', function(req,res){
    collection.find({}).toArray(function(err, arr){
      res.send(JSON.stringify(arr));
    });
  });

  app.post('/api/', function(req, res){

    var errors = {};

    if (!req.body.title)  { errors.title = 'Please provide a title.'; }
    if (!req.body.bounds) { errors.bounds = 'Please set your bounds.'; }
    if (!req.body.author) { errors.author= 'Please provide your name.'; }
    if (!req.body.source) { errors.source = 'Please provide the source.'; }
    if (!req.body.date)   { errors.date = 'Please provide a date.'; }
    if (!req.files || !req.files.file) { errors.file = 'Your file did not upload correctly.'; }

    if (Object.keys(errors).length){
      err(errors);
      return;
    }

    var obj = {
      title : req.body.title,
      date : (new Date(req.body.date)).getTime(),
      file : req.files.file,
      source : req.body.source,
      author : req.body.author,
      bounds : req.body.bounds
    }

    // Write to server
    collection.insert(obj, function(err, result){
      if (err){
        res.status(500);
        res.send('could not upload');
      } else {
        res.send('ok');
      }
    });

    function err(obj){
      res.status(400);
      res.send(JSON.stringify(obj));
    }
  })

}
