const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('New user');
  socket.on('drawing', (data) => {
    io.emit('drawing', data);
  });
  socket.on('resetCanvas', () => {
    io.emit('resetCanvas');
  })
  socket.on('disconnect', () => {
    console.log('Disconnected user');
  });
})

http.listen(process.env.PORT || 80);