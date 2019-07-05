var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var GameServer = require('./GameServer');

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// http 기본 포트(80)에 서버 열기
server.listen(80, function() {
    console.log('[SERVER] Listening on port ' + server.address().port);
});

// 클라이언트 요청에 대한 콜백 정의
io.on('connection', function(socket) 
{
    socket.on('idRequest', function() {
        var playerSocket = 
        {
            id: GameServer.getPlayerNumber(),
            nickname: '게스트',
            socketId: socket,
            currnetRoom: null,
            
            playerTyping: 0
        }
        socket.playerData = playerSocket;
        GameServer.currentPlayer.push(playerSocket);
        console.log('['+playerSocket.id+'] client request');
        socket.emit('idSet', 
        {
            str: 'your number is ' + playerSocket.id,
            num: playerSocket.id
        });
    });

    socket.on('setNickname', function(msg) // string new_nickname
    {
        socket.playerData.nickname = msg;
        console.log('['+socket.playerData.id+'] nickname set to ' + msg);
        GameServer.enterEmptyRoom(socket.playerData);
    });

    socket.on('setPlayerTyping', function(msg) // number playerTyping
    {
        socket.playerData.playerTyping = msg;
        //let playerTypingRate = (msg - (socket.currnetRoom.minPlayerTyping - socket.currnetRoom.rateArrangePoint)) / (socket.currnetRoom.maxPlayerTyping - socket.currnetRoom.minPlayerTyping + socket.currnetRoom.rateArrangePoint * 2);
        //socket.emit('setPlayerTypingRate', playerTypingRate);
    });

    socket.on('disconnect', function(reason)
    {
        var idxToDel = GameServer.currentPlayer.findIndex(function(element)
            {
                return element.id === socket.playerData.id;
            }
        );
        if (idxToDel != -1) 
        {
            console.log('['+ socket.playerData.id +'] client disconnected, reason: ' + reason);
            GameServer.currentPlayer.splice(idxToDel, 1);
            // 룸에서도 제거
            // 모두에게 삭제했다고 보내기
        }
    });
});