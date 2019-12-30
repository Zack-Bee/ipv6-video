var dgram = require('dgram');
var server = dgram.createSocket('udp6');
var port = 33333;
// server.setMulticastLoopback(false);

server.on('message', function(message, rinfo) {
  console.log(
    'server got message from: ' + rinfo.address + ':' + rinfo.port,
    message.byteLength,
  );
});

server.bind(port, () => {
  server.addMembership('ff2e:0000:0000:0000:0000:0000:0000:0001');
  console.log(server.address());
});
