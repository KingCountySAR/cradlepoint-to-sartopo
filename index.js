var net = require('net');
var rl = require('readline');
var axios = require('axios');
var fs = require('fs');


var config = JSON.parse(fs.readFileSync('config.json'));
var phoneToId = config.phoneToId

function nmeaToDegrees(nmea) {
  var c = nmea.indexOf('.')
  return parseInt(nmea.substring(0, c-2)) + parseFloat(nmea.substring(c-2))/60;
}

var server = net.createServer(function(sock) {
  var i = rl.createInterface(sock, sock);
  i.on('line', function(line) {
    var parts = line.split(',');
    var modem = config.modems[parts[0]];
    if (!modem) {
      console.log('Unrecognized data: ', line);
      return;
    }
    console.log('Update from ', modem.id, parseFloat(parts[2])/100, parseFloat(parts[4])/100, line)
    axios.post(`${config.server}/api/v1/position/report/${modem.group}`, {
	    id: modem.id,
	    lat: nmeaToDegrees(parts[2]),
	    lng: -nmeaToDegrees(parts[4]),
	    time: new Date().getTime(),
	    metadata: {
	      modem: parts.slice(8)
	    }
    }).catch(function(err) {
      // do nothing
    });
  });
}).listen(9999, "0.0.0.0");


