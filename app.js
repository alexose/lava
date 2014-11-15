/*jshint laxcomma: true */
var http = require('http')
  , url  = require('url')
  , fs   = require('fs')
  , log  = require('npmlog')
  , options = require('./config.js')
  , ns = require('node-static');

var file = new ns.Server('./');

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

  request.addListener('end', function(){
    // Routing
    if (!arr[2]){
      explain();
    } else if (arr[1] === 'public'){
      serve(arr);
    } else {
      process()
    }
  }).resume();

  function explain(){

    try {
      fs.readFile(options.index, 'utf8', function(err, html){
        respond(html, null, 'text/html');
      });
    } catch(e){
      respond('Couldn\'t find ' + options.index, 404);
    }
  }

  function serve(arr){
    file.serve(request, response);
  }

  function process(arr){
    console.log(arr);
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

