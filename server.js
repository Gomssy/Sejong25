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
    GameServer.serverNumber = Math.floor(Math.random() * 1000 + 1);
    console.log('[SERVER] server number is ' + GameServer.serverNumber);

});

// 클라이언트 요청에 대한 콜백 정의
io.on('connection', function(socket) 
{
    socket.emit('syncServer', GameServer.serverNumber);
    socket.on('idRequest', function() {
        socket.playerData = 
        {
            id: GameServer.getPlayerNumber(),
            nickname: '게스트',
            currentRoom: null,
            playingData: null,
            isReceivable: false
        };
        GameServer.currentPlayer.push(socket);
        console.log('['+socket.playerData.id+'] client request');
        socket.emit('setId', 
        {
            str: 'your number is ' + socket.playerData.id,
            num: socket.playerData.id
        });
        GameServer.connectCount++;
    });

    socket.on('enterRoom', function(msg) // string new_nickname
    {
        if(msg.length < 1) socket.emit('alert' ,'errNicknameEmpty');
        else
        {
            let isAlreadyHave = false;
            GameServer.currentPlayer.forEach(function(element)
            {
                if (element.playerData.nickname === msg) isAlreadyHave = true;
            });
            if (isAlreadyHave) socket.emit('alert' ,'errNicknameOverlaped');
            else
            {
                socket.playerData.nickname = msg;
                console.log('['+socket.playerData.id+'] nickname set to ' + msg);
                GameServer.enterEmptyRoom(socket);
            }
        }
    });

    socket.on('setPlayerTyping', function(msg) // number playerTyping
    {
        try
        {
            socket.playerData.playingData.playerTyping = msg.playerTyping;
            if (socket.playerData.currentRoom.maxTypingPlayer.playerTyping < msg.playerTyping)
            {
                socket.playerData.currentRoom.maxTypingPlayer = socket.playerData.playingData;
            }
            if (socket.playerData.currentRoom.minTypingPlayer.playerTyping > msg.playerTyping)
            {
                socket.playerData.currentRoom.minTypingPlayer = socket.playerData.playingData;
            }
            let playerTypingRate = (msg.playerTyping - (socket.playerData.currentRoom.minTypingPlayer.playerTyping - socket.playerData.currentRoom.rateArrangePoint)) /
            (socket.playerData.currentRoom.maxTypingPlayer.playerTyping - socket.playerData.currentRoom.minTypingPlayer.playerTyping + socket.playerData.currentRoom.rateArrangePoint * 2);
            socket.emit('setPlayerTypingRate', playerTypingRate);

            if (msg.isWord)
            {
                socket.playerData.currentRoom.announceToRoom('writeWord', socket.playerData.id);
            }
            if (msg.isAttackMode)
            {
                socket.playerData.currentRoom.announceToRoom('attackMode', socket.playerData.id);
            }
        }
        catch (e) {
            console.error('[ERR] error catched on setPlayerTyping');
            socket.disconnect();
        }
    });

    socket.on('endCount', function()
    {
        socket.playerData.currentRoom.aliveCount--;
        //console.log('counted, ' + socket.playerData.currentRoom.aliveCount);
        socket.playerData.playingData.isAlive = true;
        if (socket.playerData.currentRoom.aliveCount === 0 && socket.playerData.currentRoom.currentPlayer.length >= socket.playerData.currentRoom.startCount)
        {
            socket.playerData.currentRoom.startRoom();
            clearTimeout(socket.playerData.currentRoom.startTimer);
        }
        if (socket.playerData.currentRoom.startTimer === undefined)
        {
            const room = socket.playerData.currentRoom;
            room.startTimer = setTimeout(function()
            {
                let deads = room.currentPlayer.filter(element => !element.isAlive);
                if (room.aliveCount != 0)
                {
                    console.error('[ROOM#'+room.roomId+'] FORCE START!!!');
                    if (room.currentPlayer.length - deads.length >= room.startCount)
                    {
                        room.startRoom();
                        deads.forEach(function(element)
                        {
                            element.defeat();
                        });
                    }
                    clearTimeout(room.startTimer);
                }
                else
                {
                    deads.forEach(function(element)
                    {
                        room.currentSocket[element.index].disconnect();
                        room.exitRoom(element.id);
                    });
                    room.refreshRoom();
                }
            }, 2000);
        }
    });

    socket.on('attack', function(msg)
    {
        socket.playerData.currentRoom.announceToTarget(msg.victimId, 'attacked', msg);
        socket.playerData.currentRoom.announceToRoom('someoneAttacked', {attackerId: msg.attackerId, victimId: msg.victimId, multiple: msg.multiple});
        //console.log('attack ' + msg.victimId + ' by ' + msg.attackerId + ' with ' + msg.text);
        setTimeout(function()
        {
            let target = GameServer.findPlayerSocket(msg.victimId);
            if (target != null)
            {
                let dataToPush = 
                {
                    attackerId: msg.attackerId,
                    wrongCount: 0,
                    word: msg.text,
                    wordGrade: msg.grade,
                    time: Date.now()
                }

                target.playerData.playingData.lastAttacks.push(dataToPush);
                while (target.playerData.playingData.lastAttacks[0].time + 20000 < Date.now())
                {
                    target.playerData.playingData.lastAttacks.splice(0, 1);
                }
            }
        }, 4000);
    });

    socket.on('defeated', function()
    {
        socket.playerData.playingData.defeat();
    });

    socket.on('defenseFailed', function(msg)
    {
        socket.playerData.currentRoom.announceToTarget(msg.attackerId, 'attackSucceed', msg);
        let wrongCountIndex = socket.playerData.playingData.lastAttacks.findIndex(function(element)
        {
            return (element.word === msg.word) && (element.attackerId === msg.victimId);
        });
        if (wrongCountIndex !== -1) socket.playerData.playingData.lastAttacks[wrongCountIndex].wrongCount++;
    });

    socket.on('disconnect', function(reason)
    {
        GameServer.disconnectCount++;
        let data = socket.playerData;
        if (data === undefined)
        {
            console.error('[ERROR] data is undefined');
            console.table(GameServer.currentPlayer);
            GameServer.disconnectCount--;
        }
        else // data.id is not undefined
        {
            disconnectUser(data, reason);
        }
        const connectDiff = GameServer.connectCount - GameServer.disconnectCount;
        const playerCount = GameServer.currentPlayer.length;
        if (connectDiff != playerCount) 
        {
            console.log({ connectDiff, playerCount });
            console.table(GameServer.currentPlayer);
        }
        socket.disconnect();
    });
});

var disconnectUser = function(data, reason)
{
    console.log('['+ data.id +'] client disconnected, reason: ' + reason);
    let idxToDel = GameServer.currentPlayer.findIndex(function(element)
    {
        return element.playerData.id === data.id;
    });
    if (idxToDel != -1) 
    {
        // 룸에서도 제거
        if (data.currentRoom != null)
        {
            if (data.currentRoom.currentPhase === GameServer.Phase.READY || data.currentRoom.currentPhase === GameServer.Phase.COUNT)
            {
                data.currentRoom.exitRoom(data.id);
            }
            else if (data.playingData.isAlive)
            {
                data.playingData.defeat();
                data.currentRoom.announceToRoom('userDisconnect', data.playingData);
            }
        }
        GameServer.currentPlayer.splice(idxToDel, 1);
    }
    console.log('['+ data.id +'] disconnect complete');
}