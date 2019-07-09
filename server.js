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
        socket.playerData = 
        {
            id: GameServer.getPlayerNumber(),
            nickname: '게스트',
            socketId: socket,
            currentRoom: null,
            playingData: null,
            
            playerTyping: 0
        };
        GameServer.currentPlayer.push(socket.playerData);
        console.log('['+socket.playerData.id+'] client request');
        socket.emit('setId', 
        {
            str: 'your number is ' + socket.playerData.id,
            num: socket.playerData.id
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
        socket.playerData.playingData.playerTyping = msg;
        if (socket.playerData.currentRoom.maxTypingPlayer.playerTyping < msg)
        {
            socket.playerData.currentRoom.maxTypingPlayer = socket.playerData.playingData;
        }
        if (socket.playerData.currentRoom.minTypingPlayer.playerTyping > msg)
        {
            socket.playerData.currentRoom.minTypingPlayer = socket.playerData.playingData;
        }
        let playerTypingRate = (msg - (socket.playerData.currentRoom.minTypingPlayer.playerTyping - socket.playerData.currentRoom.rateArrangePoint)) /
        (socket.playerData.currentRoom.maxTypingPlayer.playerTyping - socket.playerData.currentRoom.minTypingPlayer.playerTyping + socket.playerData.currentRoom.rateArrangePoint * 2);
        socket.emit('setPlayerTypingRate', playerTypingRate);
    });

    socket.on('attack', function(msg)
    {
        GameServer.announceToTarget(GameServer.findRoomIndex(msg.roomNum), msg.target, 'attacked', msg);
    });

    socket.on('defeated', function()
    {
        socket.playerData.playingData.isAlive = false;
        socket.playerData.playingData.rank = socket.playerData.currentRoom.nextRank--;
        // 패배단어 체크
        GameServer.announceToRoom(socket.playerData.currentRoom.roomNum, 'defeat', socket.playerData.playingData);
        console.log('['+socket.playerData.id+']'+ ' defeated');
    });

    socket.on('defenseFailed', function(msg)
    {
        GameServer.announceToTarget(GameServer.findRoomIndex(msg.roomNum), msg.target, 'attackSucceed', msg);
    });

    socket.on('disconnect', function(reason)
    {
        let idxToDel = GameServer.currentPlayer.findIndex(function(element)
        {
            return element.id === socket.playerData.id;
        });
        if (idxToDel != -1) 
        {
            console.log('['+ socket.playerData.id +'] client disconnected, reason: ' + reason);
            GameServer.currentPlayer.splice(idxToDel, 1);
            // 룸에서도 제거
            if (socket.playerData.currentRoom != null)
            {
                socket.playerData.playingData.isAlive = false;
                if (socket.playerData.playingData.rank === -1) socket.playerData.playingData.rank = socket.playerData.currentRoom.nextRank--;
                socket.playerData.currentRoom.currentSocket.splice(socket.playerData.playingData.index, 1);
                GameServer.announceToRoom(GameServer.findRoomIndex(socket.playerData.currentRoom.roomNum), 'userDisconnect', socket.playerData.playingData);
            }
        }
    });
});