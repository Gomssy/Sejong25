var socket = io.connect();

socket.emit('idRequest');
socket.on('idSet', function(msg) // {str, num playerNum}
{
    console.log(msg.str);
    playerNum = msg.num;
});
socket.on('setPlayerTypingRate', function(msg) // number playerTypingRate
{
    WordSpace.PlayerTypingRate = msg;
});
socket.on('phaseChange', function(msg) // number Phase
{
    console.log('phase changed from ' + WordSpace.CurrentPhase + ' to ' + msg);
    WordSpace.CurrentPhase = msg;
});
socket.on('startGame', function()
{ 
    game.scene.start('gameScene');
});
socket.on('userDisconnect', function(msg) // {num id, str nickname}
{
    console.log(msg.id + ' / ' + msg.nickname + ' disconnected');
});