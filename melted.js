//var server = require('node-router').getServer();

require('tty').setRawMode(true);
var sys = require('sys'),
    http = require('http'),
    url = require('url'),
    path = require("path"),
    fs = require("fs"),
    stdin = process.openStdin();
stdin.resume();
keyBuffer = '';


stdin.on('keypress', function (chunk, key) {
   process.stdout.write(chunk);
  
if (key && key.ctrl && key.name == 'c') process.exit();
    if (key && key.name.toString().trim() == 'enter') {
        console.log(keyBuffer);
        sendMessage();
        keyBuffer = '';
    } else {
        keyBuffer += chunk;
    }
});


var  net = require("net");
var client = net.createConnection(5250);
client.setEncoding("utf8");
client.addListener("connect", function () {
 sys.puts("Connected to Melted" );
});

client.addListener("data", function (chunk) {
console.log(chunk)
});


function sendMessage () {
     if (keyBuffer == 'bye') {
      process.exit();
     }
   //  if (keyBuffer == "bye") client.end();
     client.write(keyBuffer+"\n");
}


function sendMvcp () {
	client.write('play u0\n');
}

http.createServer(function(request, response) {
response.writeHead(200, {'Content-Type': 'text/html'});

  response.write('Connected to Melted\n\n');
  response.write('<a href=\"play\">Play</a>\n');
  response.write('<a href=\"pause\">Pause</a>\n');
  response.write('<a href=\"push\">Push</a>\n');
var filename = path.join(process.cwd(), 'green.xml');
response.write(filename);
		fs.readFile(filename, "binary", function(err, file){
			response.write(file);
console.log(file);
response.end();
		});


	var uri = url.parse(request.url).pathname;
       	if (uri != '/favicon.ico') console.log(uri);
	  switch (uri) {
	    case '/play':
		console.log(uri);
		client.write('play u0\n');
	break;
	case '/stop':
		console.log(uri);
		client.write('stop u0\n');
	break;
	case '/pause':
		console.log(uri);
		client.write('pause u0\n');
	break;
	case '/push':
		console.log(uri);
                command = 'push u0';
		client.write('apnd u0 ' + filename + '\n');
	break;


}
	response.end();
}).listen(8000);

sys.puts("Server running at http://localhost:8000/");
