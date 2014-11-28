/* jshint laxcomma: true */
var express = require('express');
var app = express();
var log = require('npmlog');
var multer  = require('multer');

log.enableColor();
log.level = "verbose";

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

app.listen(port);
app.use('/public', express.static(__dirname + '/public'));
app.use(multer({ dest: './uploads/'}))

app.get('/', function(req,res) {
  res.sendFile('public/index.html', { root : __dirname });
});

app.post('/api/', function(req, res){

  // TODO: validate, return errors
  console.log(req.body, req.files);
  res.send('ok');

});
