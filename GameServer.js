var GameServer = GameServer || {};

GameServer.Phase = {READY: 0, START: 1, MAIN: 2, MUSIC: 3};
GameServer.startCount = 1;

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
        maxPlayer: 5,
        nextRank: 5,
        currentPlayer: [],
        currentSocket: [],
        currentPhase: GameServer.Phase.READY,

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
    let player = new Player(room.currentPlayer.length, playerData);

    room.currentPlayer.push(player);
    room.currentSocket.push(playerData);
    playerData.playingData = player;
    playerData.currentRoom = room;

    console.log('[' + playerData.id + '] entered to room #' + room.roomNum);
    if (room.currentPlayer.length >= this.startCount) GameServer.startRoom(roomIdx);
    return room;
}
GameServer.enterEmptyRoom = function(playerData)
{
    var toEnter = -1;
    for (let i = 0; i < this.playingRoom.length; i++)
    {
        if (this.playingRoom[i].currentPlayer.length < this.playingRoom[i].maxPlayer && this.playingRoom[i].currentPhase == this.Phase.READY)
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

    // sync roomData
    let toSync =
    {
        roomNum: room.roomNum,
        players: room.currentPlayer
    };
    console.log(toSync);
    this.announceToRoom(roomIdx, 'syncRoomData', toSync);

    console.log('[ROOM#'+room.roomNum+'] Game Start');
    this.announceToRoom(roomIdx, 'changePhase', this.Phase.START);
    this.announceToRoom(roomIdx, 'startGame');
}
GameServer.announceToRoom = function(roomIdx, _message, _data = null)
{
    this.playingRoom[roomIdx].currentSocket.forEach(function(element) 
    {
        element.socketId.emit(_message, _data);
    });
}
GameServer.announceToTarget = function(roomIdx, targetNum, _message, _data = null)
{
    let targetSocket = this.playingRoom[roomIdx].currentSocket.find(function(element)
    {
        return element.id === targetNum;
    }).socketId;
    targetSocket.emit(_message, _data);
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
    }
}

module.exports = GameServer;