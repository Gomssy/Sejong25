var GameServer = GameServer || {};

GameServer.Phase = {READY: 0, COUNT: -1, START: 1, MAIN: 2, MUSIC: 3};
GameServer.startCount = 2;

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
        return element.id === playerId;
    });
    if (idx != -1) return this.currentPlayer[idx];
    else
    {
        console.log('[ERR] wrong playerId('+ playerId +') to find');
        return null;
    }
}
GameServer.nextRoomNumber = 0;
GameServer.makeRoom = function()
{
    // 나중에 room 삭제시 생긴 null에 채워넣는식으로 만들것, 룸의 인덱스를 고정
    var roomOption = 
    {
        roomNum: GameServer.nextRoomNumber++,
        maxPlayer: 100,
        nextRank: 100,
        currentPlayer: [],
        aliveCount: 0,
        currentSocket: [],
        currentPhase: GameServer.Phase.READY,
        endTime: 0,

        rateArrangePoint: 300,
        maxTypingPlayer: null,
        minTypingPlayer: null
    }
    this.playingRoom.push(roomOption);
    console.log('[SERVER] new room #'+roomOption.roomNum+' made, roomCount: ' + this.playingRoom.length);
    return this.playingRoom.length - 1;
}
GameServer.findRoomIndex = function(roomNum)
{
    return GameServer.playingRoom.findIndex(function(element)
    {
        return element.roomNum === roomNum;
    });
}
GameServer.enterRoom = function(roomIdx, playerData)
{
    let room = this.playingRoom[roomIdx];
    let nextIdx = -1;
    for (let i = 0; i < room.currentPlayer.length; i++)
    {
        if (room.currentPlayer[i] === null)
        {
            nextIdx = i;
            break
        }
    }
    let player = new Player((nextIdx != -1 ? nextIdx : room.currentPlayer.length), playerData);

    if (nextIdx != -1)
    {
        room.currentPlayer[nextIdx] = player;
        room.currentSocket[nextIdx] = playerData;
    }
    else
    {
        room.currentPlayer.push(player);
        room.currentSocket.push(playerData);
    }
    playerData.playingData = player;
    playerData.currentRoom = room;
    room.aliveCount++;

    console.log('[' + playerData.id + '] entered to room #' + room.roomNum);
    playerData.socketId.emit('enterRoom');
    if (room.currentPlayer.length >= this.startCount)
    {
        if (room.currentPhase === this.Phase.READY) // start count
        {
            room.endTime = Date.now() + 1000; // 테스트로 15초로 남겨둠
            this.announceToRoom(room.roomNum, 'setCount', {isEnable: true, endTime: room.endTime});
            room.currentPhase = this.Phase.COUNT;
        }
        else if (room.currentPhase === this.Phase.COUNT) // countinue count
        {
            playerData.socketId.emit('setCount', {isEnable: true, endTime: room.endTime});
        }
    }
    else // stop count
    {
        this.announceToRoom(room.roomNum, 'setCount', {isEnable: false, endTime: 0});
        room.currentPhase = this.Phase.READY;
    }
    return room;
}
GameServer.enterEmptyRoom = function(playerData)
{
    var toEnter = -1;
    for (let i = 0; i < this.playingRoom.length; i++)
    {
        if (this.playingRoom[i].currentPlayer.length < this.playingRoom[i].maxPlayer && (this.playingRoom[i].currentPhase == this.Phase.READY || this.playingRoom[i].currentPhase == this.Phase.COUNT))
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
GameServer.startRoom = function(roomIdx)
{
    let room = this.playingRoom[roomIdx];
    room.currentPhase = this.Phase.START;
    room.maxTypingPlayer = room.currentPlayer[0];
    room.minTypingPlayer = room.currentPlayer[0];
    room.currentSocket.forEach(function(element)
    {
        if (element != null) element.isReceivable = true;
    });
    let syncPlayers = [];
    room.currentPlayer.forEach(function(element)
    {
        if (element != null) syncPlayers.push(element);
    });
    room.nextRank = syncPlayers.length;
    room.aliveCount = syncPlayers.length;

    // sync roomData
    let toSync =
    {
        roomNum: room.roomNum,
        players: syncPlayers
    };
    //console.log(toSync);
    this.announceToRoom(roomIdx, 'syncRoomData', toSync);

    console.log('[ROOM#'+room.roomNum+'] Game Start with ' + syncPlayers.length + ' players');
    this.announceToRoom(roomIdx, 'changePhase', this.Phase.START);
    this.announceToRoom(roomIdx, 'startGame');
}
GameServer.playerDefeat = function(playerData)
{
    playerData.playingData.isAlive = false;
    playerData.playingData.rank = playerData.currentRoom.nextRank--;
    playerData.isReceivable = false;
    playerData.currentRoom.aliveCount--;
    if (playerData.playingData.lastAttacks.length > 0)
    {
        playerData.playingData.lastAttack = playerData.playingData.lastAttacks[playerData.playingData.lastAttacks.length - 1];
        if (Date.now() - playerData.playingData.lastAttack.time > 40000) playerData.playingData.lastAttack = null;
        else
        {
            playerData.playingData.lastAttacks.forEach(function(element)
            {
                if (Date.now() - element.time < 40000 && element.wordGrade > playerData.playingData.lastAttack.wordGrade) playerData.playingData.lastAttack = element;
            }); 
        }
    }

    GameServer.announceToRoom(this.findRoomIndex(playerData.currentRoom.roomNum), 'defeat', playerData.playingData);
    console.log('['+playerData.id+']'+ ' defeated, rank: ' + playerData.playingData.rank);

    if (playerData.currentRoom.aliveCount === 1)
    {
        let winner = playerData.currentRoom.currentPlayer.find(function(element)
        {
            return element != null && element.isAlive;
        });
        GameServer.announceToRoom(this.findRoomIndex(playerData.currentRoom.roomNum), 'gameEnd', winner);
        GameServer.announceToTarget(this.findRoomIndex(playerData.currentRoom.roomNum), winner.id, 'alert', 'gameWin');
        console.log('['+winner.id+']' + ' winner! ' + winner.nickname);
    }
}
GameServer.announceToRoom = function(roomIdx, _message, _data = null)
{
    this.playingRoom[roomIdx].currentSocket.forEach(function(element) 
    {
        if (element != null) element.socketId.emit(_message, _data);
    });
}
GameServer.announceToTarget = function(roomIdx, targetNum, _message, _data = null)
{
    let targetSocket = this.playingRoom[roomIdx].currentSocket.find(function(element)
    {
        return (element != null && element.id === targetNum);
    });
    if (targetSocket != undefined && targetSocket.isReceivable) targetSocket.socketId.emit(_message, _data);
}
// 데이터 동기화 함수 만들기
// 동기화할것: 유저리스트(id - nickname 쌍)

class Player
{
    constructor(index, playerData)
    {
        this.index = index;
        this.id = playerData.id;
        this.nickname = playerData.nickname;
        this.isAlive = true;
        this.rank = -1;

        this.playerTyping = 0;
        this.lastAttacks = []; // { attackerId, word, wordGrade, time }
        this.lastAttack = null;
    }
}

module.exports = GameServer;