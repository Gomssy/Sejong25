var socket = io.connect();

socket.emit('idRequest');
socket.on('setId', function(msg) // {str, num playerNum}
{
    console.log(msg.str);
    PlayerData.idNum = msg.num;
});
socket.on('setPlayerTypingRate', function(msg) // number playerTypingRate
{
    WordSpace.PlayerTypingRate = msg;
    console.log('rate: ' + msg);
});

socket.on('syncRoomData', function(msg) // {num roomNum, [] players}
{
    console.log(msg);
    RoomData.roomNum = msg.roomNum;
    RoomData.players = msg.players;
});

socket.on('startGame', function()
{ 
    game.scene.start('gameScene');
});
socket.on('changePhase', function(msg) // number Phase
{
    console.log('phase changed from ' + WordSpace.CurrentPhase + ' to ' + msg);
    WordSpace.CurrentPhase = msg;
});

socket.on('userDisconnect', function(msg) // {num id, str nickname}
{
    console.log(msg.id + ' / ' + msg.nickname + ' disconnected');
});