var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// http 기본 포트(80)에 서버 열기
server.listen(80, function() {
    console.log('Listening on port ' + server.address().port);
});

// 클라이언트 요청에 대한 콜백 정의
io.on('connection', function(socket) {
    socket.on('hello', function() {
        console.log('client request');
        socket.emit('hi', 'Hello, Client!');
    });
});