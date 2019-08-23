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
    console.log(new Date().toLocaleTimeString('ko-KR') + ' [SERVER] Listening on port ' + server.address().port);
    GameServer.serverNumber = Math.floor(Math.random() * 1000 + 1);
    console.log(new Date().toLocaleTimeString('ko-KR') + ' [SERVER] server number is ' + GameServer.serverNumber);

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
            skin: 0,
            currentRoom: null,
            playingData: null,
            isReceivable: false
        };
        GameServer.currentPlayer.push(socket);
        console.log(new Date().toLocaleTimeString('ko-KR') + ' ['+socket.playerData.id+'] client request');
        socket.emit('setId', 
        {
            str: 'your number is ' + socket.playerData.id,
            num: socket.playerData.id
        });
        GameServer.connectCount++;
    });

    socket.on('enterRoom', function(msg) // string new_nickname
    {
        if(msg.nickname.length < 1) socket.emit('alert' ,'errNicknameEmpty');
        else
        {
            try
            {
                socket.playerData.nickname = msg.nickname;
                socket.playerData.skin = msg.skin;
                console.log(new Date().toLocaleTimeString('ko-KR') + ' ['+socket.playerData.id+'] nickname set to ' + msg.nickname);
                GameServer.enterEmptyRoom(socket);
            }
            catch
            {
                socket.disconnect();
            }
        }
    });
    
    socket.on('exitFromRoom', function(msg){
        GameServer.findPlayerSocket(msg).playerData.playingData.isInThisRoom = false;
    });

    socket.on('setPlayerTyping', function(msg) // number playerTyping
    {
        try
        {
            let player = socket.playerData.playingData;
            let room = socket.playerData.currentRoom;

            player.playerTyping = msg.playerTyping;
            if (room.maxTypingPlayer.playerTyping < msg.playerTyping)
            {
                room.maxTypingPlayer = player;
            }
            if (room.minTypingPlayer.playerTyping > msg.playerTyping)
            {
                room.minTypingPlayer = player;
            }
            let playerTypingRate = (msg.playerTyping - (room.minTypingPlayer.playerTyping - room.rateArrangePoint)) /
            (room.maxTypingPlayer.playerTyping - room.minTypingPlayer.playerTyping + room.rateArrangePoint * 2);
            socket.emit('setPlayerTypingRate', playerTypingRate);

            if (msg.isWord)
            {
                room.announceToRoom('writeWord', player.id);
            }
            if (msg.isAttackMode)
            {
                room.announceToRoom('attackMode', player.id);
            }
            if (player.tabCheckTime != undefined)
            {
                clearTimeout(player.tabCheckTime);
                player.tabCheckTime = setTimeout(function()
                {
                    if (room.currentPhase != GameServer.Phase.GAMEEND) player.defeat();
                }, 1000);
            }
            else player.tabCheckTime = setTimeout(function()
            {
                if (room.currentPhase != GameServer.Phase.GAMEEND) player.defeat();
            }, 1000);
        }
        catch (e) {
            console.error(new Date().toLocaleTimeString('ko-KR') + ' [ERR] error catched on setPlayerTyping (' + e + ')');
            socket.disconnect();
        }
    });

    socket.on('endCount', function()
    {
        socket.playerData.currentRoom.aliveCount--;
        //console.log('counted, ' + socket.playerData.currentRoom.aliveCount);
        socket.playerData.playingData.isAlive = true;
        if (socket.playerData.currentRoom.currentPhase != GameServer.Phase.COUNT) socket.disconnect();
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
                deads.forEach(function(element)
                    {
                        room.currentSocket[element.index].disconnect();
                        room.exitRoom(element.id);
                    });
                if (room.aliveCount != 0 && room.currentPlayer.length >= room.startCount)
                {
                    console.error(new Date().toLocaleTimeString('ko-KR') + ' [ROOM#'+room.roomId+'] FORCE START!!!');
                    room.startRoom();
                }
                else if (deads.length > 0)
                {
                    room.refreshRoom();
                }
                clearTimeout(room.startTimer);
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

    socket.on('itemStart', function(msg) //playerID, item
    {
        socket.playerData.currentRoom.announceToRoom('someoneItemStart', msg);
    });
    socket.on('itemEnd', function(msg) //playerID, item
    {
        socket.playerData.currentRoom.announceToRoom('someoneItemEnd', msg);
    });

    socket.on('disconnect', function(reason)
    {
        GameServer.disconnectCount++;
        let data = socket.playerData;
        if (data === undefined)
        {
            console.error(new Date().toLocaleTimeString('ko-KR') + ' [ERROR] data is undefined');
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
    console.log(new Date().toLocaleTimeString('ko-KR') + ' ['+ data.id +'] client disconnected, reason: ' + reason);
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
    //console.log('['+ data.id +'] disconnect complete');
}