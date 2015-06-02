var http = require('http');
var fs = require('fs');

var server = http.createServer(function(request, response){
  response.writeHead(200, {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'POST'
  });
  request.pipe(fs.createWriteStream('coverage.json'));
  response.end();
});

var port = 7358;
server.listen(port);
console.log('Listening on', port);
