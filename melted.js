var restify = require('restify');
var net = require('net');
var server = restify.createServer();

server.use(restify.bodyParser());
//var Lazy = require('lazy');
//connect to melted server
port = 5250;
host = "0.0.0.0";


function postMessage(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    switch (req.params.command) {
    case 'push':
        var fileurl = JSON.parse(req.body);
        console.log(fileurl.file);
        break;
    }

}

server.post('/:unit/:command', postMessage);
server.get('/:unit/:command', function(req, res) {
    //server.use(restify.queryParser());
    //console.log(req.query.test);
    var mvcp = new net.createConnection(5250);
    mvcp.setEncoding('ascii');
    mvcp.addListener("connect", function() {
        //console.log("Connected to Melted" );
    });

    var allchunk = "";
    mvcp.on("data", function(chunk) {
        //console.log(chunk)
        allchunk += chunk;
    });
    mvcp.on('error', function(err) {
        console.log("could not connect to melted! is it running??")
    });
    mvcp.addListener("end", function() {
        str = allchunk.toString();
        //console.log(allchunk);
        //jso = JSON.stringify(allchunk);

        str = str.replace(/100 VTR Ready\r\n20. OK\r\n/g, "");

        //100 VTR Ready\r\n202 OK\r\n0 playing \"colour:green\" 5395 1000 25.00 0 14999 15000 \"colour:green\" 5395 0 14999 15000 1 1 0\r\n"
        //allchunk = allchunk.replace(/\"\\n/g, "");
        //allchunk = allchunk.replace(/\n/g, '<br />');





        //res.send(200, splits[1]);
        switch (req.params.command) {
            // in case it's one of these commands, return 200 and exit connection
        case 'play':
        case 'pause':
        case 'stop':
        case 'clear':
        case 'wipe':
        case 'push':
            //console.log("Commando received: " + req.params.command);
            res.send(200, str);


            break;
        case 'usta':
            //0 playing "colour:green" 13632 1000 25.00 0 14999 15000 "colour:green" 13632 0 14999 15000 1 2 0	   
            split = str.split("\"");
            var JSONresponse = {};
            JSONresponse.status = split[0];
            JSONresponse.filename = split[1];
            splits = split[2].split("\ ");
            JSONresponse.position = splits[1];
            JSONresponse.speed = splits[2];
            JSONresponse.fps = splits[3];
            JSONresponse.inpoint = splits[4];
            JSONresponse.outpoint = splits[5];
            JSONresponse.length = splits[6];
            JSONresponse.b_filename = split[3];

            splits = split[4].split("\ ");
            JSONresponse.b_position = splits[1];
            JSONresponse.b_inpoint = splits[2];
            JSONresponse.b_outpoint = splits[3];
            JSONresponse.b_length = splits[4];
            JSONresponse.seekable = splits[5];
            JSONresponse.playlist_number = splits[6];
            JSONresponse.clip_index = splits[7].replace(/\r\n/g, "");
            str = JSON.stringify(JSONresponse);
            res.send(200, str);
            break;
        case 'list':

            /*      var values = "";
            for (var i = 0, len = (splits.length - 2); value = splits[i], i < len; i++) {
                console.log(value);
                values += value + "\n";
            }
            //send a list of items in the playlist
            res.send(200, values);*/
            //"2\r\n0 \"colour:green\" 0 14999 15000 15000 25.00\r\n1 \"colour:red\" 0 14999 15000 15000 25.00\r\n\r\n"
            split = str.split("\r\n");
            var JSONresponse = {};
            var JSONresponse = {};
            //JSONresponse.clips = split[0];
            for (var i = 1, len = (split.length - 2); value = split[i], i < len; i++) {
                //var i.JSONresponse = {};	
                //console.log(value);
                //JSONresponse.clips.i = i;
                //JSONresponse.clip.id = i;
                JSONresponse.clips = {
                    "name": split[i]
                };
                console.log(split[i]);
                //console.log(i)
            }

            str = JSON.stringify(JSONresponse);
            res.send(200, str);
            break;
        } //end switch
    }); //end mvcp.addListener


    //fetch xml content with a http request
    // we make this blocking IO because there is no queue yet


    //
    switch (req.params.command) {
    case 'play':
        mvcp.write("play " + req.params.unit + "\n");
        break;

    case 'pause':
        mvcp.write("pause " + req.params.unit + "\n");
        break;

    case 'stop':
        mvcp.write("stop " + req.params.unit + "\n");
        break;

    case 'usta':
        mvcp.write("usta " + req.params.unit + "\n");
        break;

    case 'list':
        mvcp.write("list " + req.params.unit + "\n");
        break;

    case 'clear':
        mvcp.write("clear " + req.params.unit + "\n");
        break;

    case 'wipe':
        mvcp.write("wipe " + req.params.unit + "\n");
        break;

    case 'push':



        var sys = require('util'),
            http = require('http');

        var connection = http.createClient(80, 'localhost'),
            request = connection.request('/red.mlt');

        connection.addListener('error', function(connectionException) {
            sys.log(connectionException);
            console.log("ERROR")
        });

        request.addListener('response', function(response) {
            var data = '';

            response.addListener('data', function(chunk) {
                data += chunk;
            });
            response.addListener('end', function() {
                // Do something with data.
                //console.log(data);
                //get the bytes of the XML as needed by Push Command
                var byteAmount = unescape(encodeURIComponent(data)).length;

                console.log(byteAmount)
                //mvcp.write('PLAY U0\n')
                console.log(data);
                mvcp.write("PUSH " + req.params.unit + "\n" + byteAmount + "\n" + data + "\n");

            });

        });
        request.end();





        //console.log(result);

        //	var file = fs.readFileSync("/tmp/xml.mlt", "utf8");


        break; //end push
        // commands missing:
        // remove, insert, apnd, 

    default:
        res.send(404, "Not Found");
    } // endswitch
    mvcp.end();
});

server.listen(8081);


/** HTTP Server to serve melted_control.html **/
/** Images are not served, so the play buttons are not showing up **/

var connect = require('connect');
connect.createServer(
    connect.static(__dirname + '/examples')
).listen(8080);
