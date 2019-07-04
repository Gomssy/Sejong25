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

GameServer.currentPlayer = [];
GameServer.playingRoom = [];

GameServer.getPlayerNumber = function()
{
    do
    {
        var num = Math.floor(Math.random() * 1000 + 1);
        if (!this.currentPlayer.includes(num)) return num;
    } while (true)
}
GameServer.findPlayer = function(playerId)
{
    var idx = this.currentPlayer.findIndex(function(element)
    {
        return element.id === socket;
    });
    if (idx != -1) return this.currentPlayer[idx];
    else
    {
        console.log('[ERR] wrong playerId to find');
        return null;
    }
}
GameServer.nextRoomNumber = 0;
GameServer.makeRoom = function()
{
    var roomOption = 
    {
        roomNum: GameServer.nextRoomNumber++,
        maxPlayer: 25,
        currentPlayer: []
    }
    this.playingRoom.push(roomOption);
    console.log('new room made, roomCount: ' + this.playingRoom.length);
    return this.playingRoom.length - 1;
}
GameServer.enterRoom = function(roomIdx, playerData)
{
    this.playingRoom[roomIdx].currentPlayer.push(playerData);
    console.log(playerData.id + ' entered to room# ' + this.playingRoom[roomIdx].roomNum);
    return this.playingRoom[roomIdx];
}
GameServer.enterEmptyRoom = function(playerData)
{
    var toEnter = -1;
    for (let i = 0; i < this.playingRoom.length; i++)
    {
        if (this.playingRoom[i].currentPlayer.length < this.playingRoom[i].maxPlayer)
        {
            toEnter = i;
            break;
        }
    }
    if (toEnter === -1)
    {
        toEnter = this.makeRoom();
    }
    return this.enterRoom(toEnter, playerData);
}

// 클라이언트 요청에 대한 콜백 정의
io.on('connection', function(socket) 
{
    socket.on('idRequest', function() {
        var playerSocket = 
        {
            id: GameServer.getPlayerNumber(),
            nickname: '게스트',
            socketId: socket
        }
        GameServer.currentPlayer.push(playerSocket);
        console.log('client request, id: ' + playerSocket.id);
        socket.emit('idSet', 
        {
            str: 'your number is ' + playerSocket.id + ', your nickname is ' + playerSocket.nickname,
            num: playerSocket.id
        });
        GameServer.enterEmptyRoom(playerSocket);
    });

    socket.on('disconnect', function(reason)
    {
        var idxToDel = GameServer.currentPlayer.findIndex(function(element)
            {
                return element.socketId === socket;
            }
        );
        if (idxToDel != -1) 
        {
            console.log('client disconnected, id: ' + GameServer.currentPlayer[idxToDel].id + ', reason: ' + reason);
            GameServer.currentPlayer.splice(idxToDel, 1);
        }
    });
});