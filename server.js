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

var GameServer = GameServer || {};

GameServer.waitingRoom = [];

GameServer.getPlayerNumber = function()
{
    do
    {
        var num = Math.floor(Math.random() * 1000 + 1);
        if (!this.waitingRoom.includes(num)) return num;
    } while (true)
}
GameServer.findPlayer = function(playerId)
{
    var idx = this.waitingRoom.findIndex(function(element)
    {
        return element.id === socket;
    });
    if (idx != -1) return this.waitingRoom[idx];
    else
    {
        console.log('[ERR] wrong playerId to find');
        return null;
    }
}

// 클라이언트 요청에 대한 콜백 정의
io.on('connection', function(socket) 
{
    socket.on('idRequest', function() {
        var playerSocket = 
        {
            id: GameServer.getPlayerNumber(),
            socketId: socket
        }
        GameServer.waitingRoom.push(playerSocket);
        console.log('client request, id: ' + playerSocket.id);
        socket.emit('idSet', 
        {
            str: 'your number is ' + playerSocket.id,
            num: playerSocket.id
        });
    });

    socket.on('disconnect', function(reason)
    {
        var idxToDel = GameServer.waitingRoom.findIndex( function(element)
            {
                return element.socketId === socket;
            }
        );
        if (idxToDel != -1) 
        {
            console.log('client disconnected, id: ' + GameServer.waitingRoom[idxToDel].id + ', reason: ' + reason);
            GameServer.waitingRoom.splice(idxToDel, 1);
        }
    });
});