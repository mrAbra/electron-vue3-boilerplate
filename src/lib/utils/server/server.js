import dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  //console.log(`Received message from ${rinfo.address}:${rinfo.port}: ${msg}`);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

server.on('error', (err) => {
  console.error(`UDP Server error:\n${err.stack}`);
});

const port = 1700; // Порт, на котором будет запущен сервер

export default server;
