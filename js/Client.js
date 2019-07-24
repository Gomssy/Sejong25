var socket = io.connect();

// init account
socket.emit('idRequest');

socket.on('alert', function(msg) // string errorcode
{
    //let toAlert = 'null alert';
    if (msg === 'errNicknameOverlaped') alert('이미 사용중인 닉네임입니다.');
    if (msg === 'gameWin') 
    {
        //toAlert = '승리!';
        ScenesData.gameScene.add.text(game.config.width / 2, game.config.height / 2, '승리!!!!', {fontSize: '30pt'})
        .setPadding(5,5,5,5).setOrigin(0.5, 0.5).setDepth(11)
        .setColor('#000000').setBackgroundColor('#ffffff');

        gameOver();
    }
    //alert(toAlert);
});

socket.on('setId', function(msg) // {str, num playerNum}
{
    console.log(msg.str);
    PlayerData.id = msg.num;
});

// init game
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
                nickname: ScenesData.roomScene.add.text(randX-10, randY-60, msg[i].nickname).setOrigin(0.5,0.5).setColor('#000000').setPadding(0.5,0.5,0.5,0.5),
                id: msg[i].id
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

        if (msg.isEnter) // generate character
        {
            let randX = Math.random() * 1120 + 80;
            let randY = Math.random() * 380 + 100;
            var playerSet = 
            {
                sprite: ScenesData.roomScene.add.sprite(randX, randY, 'playerStand').setOrigin(0.5, 0.5).setScale(0.2, 0.2),
                nickname: ScenesData.roomScene.add.text(randX-10, randY-60, msg.player.nickname).setOrigin(0.5,0.5).setColor('#000000').setPadding(0.5,0.5,0.5,0.5),
                id: msg.player.id
            }
            ScenesData.roomScene.players.push(playerSet);
        }
        else // remove character
        {
            let idx = ScenesData.roomScene.players.findIndex(function(element)
            {
                return element.id === msg.player.id;
            });
            if (idx != -1)
            {
                ScenesData.roomScene.players[idx].sprite.destroy();
                ScenesData.roomScene.players[idx].nickname.destroy();
                ScenesData.roomScene.players.splice(idx, 1);
            }
        }
    }, 200);
});
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

    WordSpace.pauseCycle(true);
    // 여기서 종이 드르륵 열면됨
    ScenesData.gameScene.scene.pause('gameScene');
    setTimeout(function()
    {
        ScenesData.gameScene.scene.resume('gameScene');
        // 여기서 종이 닫으면됨
        WordSpace.pauseCycle(false);
        //console.log('start again');
    }, 5000);
});
socket.on('setPlayerTypingRate', function(msg) // number playerTypingRate
{
    WordSpace.PlayerTypingRate = msg;
    //console.log('rate: ' + msg);
});
socket.on('writeWord', function(msg) // number playerId
{
    console.log(msg + ' write word');
    // msg의 id를 가진 사람이 writeWord한다.
});
socket.on('attackMode', function(msg) // number playerId
{
    // if (msg's attackMode is false)
    console.log(msg + ' is on attack Mode');
    // msg의 id를 가진 사람이 attack Mode이다.
});
socket.on('someoneAttacked', function(msg) // {Player attacker, Player victim}
{
    // 이때 위의 attack Mode인 사람(msg.attackerId)을 해제해주자.
    console.log(msg.attacker.id + ' attacked ' + msg.victim.id);
    let attackerPos = RoomData.findPlayer(msg.attacker).position;
    let victimPos = RoomData.findPlayer(msg.victim).position;
    WordSpace.makeAttackPaper(ScenesData.gameScene, attackerPos, victimPos);
});
socket.on('attacked', function(msg) // object attackData
{
    //console.log('attacked by ' + msg.attacker.nickname);
    let attackedEvent = new Cycle(function()
    {
        if(!WordSpace.isInvincible)
            for (let i = 0; i < msg.multiple; i++) WordSpace.generateWord.Attack(ScenesData.gameScene, msg.text, msg.grade, msg.attacker, msg.isStrong, msg.isCountable);
        attackedEvent.currentCycle.destroy();
        WordSpace.attackedEvents.splice(WordSpace.attackedEvents.findIndex(function(element) {
            return element.cert === (msg.text + msg.attacker);
        }), 1);
    });
    attackedEvent.cert = msg.text + msg.attacker;
    attackedEvent.resetCycle(ScenesData.gameScene, 4000, 0, false);

    WordSpace.attackedEvents.push(attackedEvent);
    //console.log(timeout);
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
    //console.log('client');
    let tempWord = WordSpace.generateWord.Name(ScenesData.gameScene, true, msg.victim);
    let victimPos = RoomData.findPlayer(msg.victim).position;
    tempWord.physicsObj.setPosition(victimPos.x, victimPos.y);
    tempWord.wordObj.setPosition(tempWord.physicsObj.x, tempWord.physicsObj.y);
    tempWord.destroy();
});

// out game
socket.on('userDisconnect', function(msg) // {num index , num id, str nickname}
{
    //console.log(msg.index + ' / ' + msg.id + ' / ' + msg.nickname + ' disconnected');
    RoomData.players[msg.index] = msg;
    RoomData.aliveCount--;
});