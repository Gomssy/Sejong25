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
        maxPlayer: 3,
        currentPlayer: [],
        currnetPhase: GameServer.Phase.READY,

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
    this.playingRoom[roomIdx].currentPlayer.push(playerData);
    playerData.currentRoom = this.playingRoom[roomIdx];
    console.log('[' + playerData.id + '] entered to room #' + this.playingRoom[roomIdx].roomNum);
    if (this.playingRoom[roomIdx].currentPlayer.length >= this.startCount && this.playingRoom[roomIdx].Phase != GameServer.Phase.START) GameServer.startRoom(roomIdx);
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
GameServer.startRoom = function(roomIdx)
{
    let room = this.playingRoom[roomIdx];
    this.playingRoom[roomIdx].Phase = this.Phase.START;
    this.playingRoom[roomIdx].maxTypingPlayer = room.currentPlayer[0];
    this.playingRoom[roomIdx].mimTypingPlayer = room.currentPlayer[0];
    
    console.log('[ROOM#'+room.roomNum+'] Game Start');
    this.announceToRoom(roomIdx, 'phaseChange', this.Phase.START);
    this.announceToRoom(roomIdx, 'startGame');
    // 데이터 동기화도
}
GameServer.announceToRoom = function(roomIdx, message, data = null)
{
    this.playingRoom[roomIdx].currentPlayer.forEach(element => 
    {
        element.socketId.emit(message, data);
    });
}
// 데이터 동기화 함수 만들기
// 동기화할것: 유저리스트(id - nickname 쌍)

module.exports = GameServer;