/*jshint laxcomma: true */
var http = require('http')
  , url  = require('url')
  , fs   = require('fs')
  , log  = require('npmlog')
  , options = require('./config.js');


  , html = require('wiredep')({ src: 'index.html' })
console.log(html);

log.enableColor();
log.level = "verbose";

var port = process.argv && process.argv.length > 2 ? process.argv[2] : 3000;

(function init(){
  http
    .createServer(main)
    .listen(port, function(){
      log.info('Server running on port ' + port);
    });
})();

function main(request, response){
  var arr = request.url.split('/');

  if (arr.length < 2 || arr[1] === ''){
    explain(request, response);
  } else {
    arr.shift();
    process(arr, response);
  }

  function explain(){

    try {
      fs.readFile(options.index, 'utf8', function(err, html){
        respond(html, null, 'text/html');
      });

    } catch(e){
      respond('Couldn\'t find ' + options.index, 404);
    }
  }

  function process(arr, response){
    console.log('data');
  }

  function respond(string, code, type){

    code = code || 200;
    type = type || 'text/plain';

    log.verbose(code + ': ' + string);

    response.writeHead(code, {
      'Content-Type': type,
      'Content-Length': string.length
    });
    response.write(string + '\n');
    response.end();
  }
}

