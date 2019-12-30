var dgram = require('dgram');
var client = dgram.createSocket('udp6');
var msg = Buffer.from('hello world');
var port = 33333;
var host = 'ff2e::1';

client.bind(function() {
  client.setBroadcast(true);
  client.send(Buffer.allocUnsafe(600), port, host, function(err) {
    if (err) {
      throw err;
    }
    console.log('msg has been sent');
    client.close();
  });
});
