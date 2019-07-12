var socket = io.connect();

// init account
socket.emit('idRequest');
socket.on('setId', function(msg) // {str, num playerNum}
{
    console.log(msg.str);
    PlayerData.idNum = msg.num;
});
socket.on('errNicknameOverlaped', function()
{
    alert('이미 사용중인 닉네임입니다.');
});
socket.on('enterRoom', function()
{
    game.scene.remove('menuScene');
});

// init game
socket.on('syncRoomData', function(msg) // {num roomNum, [] players}
{
    console.log(msg);
    RoomData.roomNum = msg.roomNum;
    RoomData.players = msg.players;
    RoomData.aliveCount = msg.players.length;
});
socket.on('startGame', function()
{ 
    game.scene.start('gameScene');
});

// in game
socket.on('changePhase', function(msg) // number Phase
{
    console.log('phase changed from ' + WordSpace.CurrentPhase + ' to ' + msg);
    WordSpace.CurrentPhase = msg;
});
socket.on('setPlayerTypingRate', function(msg) // number playerTypingRate
{
    WordSpace.PlayerTypingRate = msg;
    //console.log('rate: ' + msg);
});
socket.on('attacked', function(msg) // object attackData
{
    WordSpace.generateWord.Attack(WordSpace.gameSceneForTest, msg.text, msg.grade, msg.attacker, msg.isStrong);
});
socket.on('defeat', function(msg) // object player
{
    RoomData.players[msg.index] = msg;
    RoomData.aliveCount--;
    console.log(RoomData.players[msg.index].nickname + ' defeated');
});

socket.on('attackSucceed', function(msg)
{
    let tempWord = new NameWord(msg.victim, true);
    tempWord.instantiate(WordSpace.gameSceneForTest);
    tempWord.destroy();
});

// out game
socket.on('userDisconnect', function(msg) // {num index , num id, str nickname}
{
    console.log(msg.index + ' / ' + msg.id + ' / ' + msg.nickname + ' disconnected');
    RoomData.players[msg.index] = msg;
    RoomData.aliveCount--;
});