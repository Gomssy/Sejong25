var socket = io.connect();

// init account
socket.emit('idRequest');

socket.on('alert', function(msg) // string errorcode
{
    let toAlert = 'null alert';
    if (msg === 'errNicknameOverlaped') toAlert = '이미 사용중인 닉네임입니다.';
    if (msg === 'gameWin') toAlert = '승리!';
    alert(toAlert);
});

socket.on('setId', function(msg) // {str, num playerNum}
{
    console.log(msg.str);
    PlayerData.id = msg.num;
});
socket.on('enterRoom', function()
{
    Audio.killSound(ScenesData.menuScene, 'login');
    game.scene.remove('menuScene');
    game.scene.start('roomScene');
    
});
socket.on('syncRoomScene', function(msg)
{
    setTimeout(function()
    {
        for (let i = 0; i < msg.length; i++)
        {
            let randX = Math.random() * 1120 + 80;
            let randY = Math.random() * 380 + 100;
            var playerSet = 
            {
                sprite: ScenesData.roomScene.add.sprite(randX, randY, 'playerStand').setOrigin(0.5, 0.5).setScale(0.2, 0.2),
                nickname: msg[i].nickname
            }
            ScenesData.roomScene.players.push(playerSet);
        }
    }, 100);
});
socket.on('setRoomCount', function(msg)
{
    setTimeout(function()
    {
        ScenesData.roomScene.isCounting = msg.isEnable;
        ScenesData.roomScene.endTime = msg.endTime;
        ScenesData.roomScene.peopleCount = msg.playerCount;

        if (msg.isEnter) // generate charactor
        {
            let randX = Math.random() * 1120 + 80;
            let randY = Math.random() * 380 + 100;
            var playerSet = 
            {
                sprite: ScenesData.roomScene.add.sprite(randX, randY, 'playerStand').setOrigin(0.5, 0.5).setScale(0.2, 0.2),
                nickname: msg.player.nickname
            }
            ScenesData.roomScene.players.push(playerSet);
        }
        else // remove charactor
        {

        }
    }, 200);
});

// init game
socket.on('syncRoomData', function(msg) // {num roomNum, [] players}
{
    //console.log(msg);
    RoomData.roomId = msg.roomId;
    RoomData.players = msg.players;
    RoomData.aliveCount = msg.players.length;
    RoomData.players.forEach(function(element)
    {
        if(element.id === PlayerData.id)
        {
            RoomData.myself = element;
            return;
        }
    });
});
socket.on('startGame', function()
{
    game.scene.remove('roomScene');
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
    //console.log('attacked by ' + msg.attacker.nickname);
    setTimeout(function()
    {
        WordSpace.generateWord.Attack(ScenesData.gameScene, msg.text, msg.grade, msg.attacker, msg.isStrong);
    }, 4000);
});
socket.on('defeat', function(msg) // object player
{
    RoomData.players[msg.index] = msg;
    RoomData.aliveCount--;
    if (msg.lastAttack != null) 
    {
        console.log(RoomData.players[msg.index].nickname + ' defeated by ' + msg.lastAttack.attacker + ', with ' + msg.lastAttack.word);
        WordSpace.killLogForTest += ('\n' + msg.lastAttack.attacker + ' --' + msg.lastAttack.word + '-> ' + RoomData.players[msg.index].nickname);
    }
    else 
    {
        console.log(RoomData.players[msg.index].nickname + ' defeated');
        WordSpace.killLogForTest += ('\n--Suicide->' + RoomData.players[msg.index].nickname);
    }
});
socket.on('gameEnd', function(msg) // object player
{
    console.log(msg.nickname + ' Win!!!!!!');
});

socket.on('attackSucceed', function(msg)
{
    console.log('client');
    let tempWord = WordSpace.generateWord.Name(ScenesData.gameScene, true, msg.victim);
    tempWord.destroy();
});

// out game
socket.on('userDisconnect', function(msg) // {num index , num id, str nickname}
{
    console.log(msg.index + ' / ' + msg.id + ' / ' + msg.nickname + ' disconnected');
    RoomData.players[msg.index] = msg;
    RoomData.aliveCount--;
});