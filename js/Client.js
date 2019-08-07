var socket = io.connect();

// init account
socket.emit('idRequest');

socket.on('alert', function(msg) // string errorcode
{
    //let toAlert = 'null alert';
    if (msg === 'errNicknameOverlaped') alert('이미 사용중인 닉네임입니다.');
    else if (msg === 'errNicknameEmpty') alert('설정된 닉네임이 없습니다.');
    else if (msg === 'gameWin') 
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
    fbClient.updateUserData('recentHopae', PlayerData.nickname);
    Audio.killSound(ScenesData.menuScene, 'login');
    ScenesData.changeScene('roomScene');
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
    Audio.killSound(ScenesData.roomScene, 'inRoom');
    ScenesData.changeScene('gameScene');
});

// in game
socket.on('changePhase', function(msg) // number Phase
{
    console.log('phase changed from ' + WordSpace.CurrentPhase + ' to ' + msg);
    WordSpace.CurrentPhase = msg;

    WordSpace.pauseCycle(true);
    // 여기서 종이 드르륵 열면됨
    let phaseChangeBgr = ScenesData.gameScene.add.sprite(game.config.width / 2, game.config.height / 2, 'phaseChangeBgr').setOrigin(0.5, 0.5).setDepth(10);
    ScenesData.gameScene.scene.pause('gameScene');
    setTimeout(function()
    {
        ScenesData.gameScene.scene.resume('gameScene');
        // 여기서 종이 닫으면됨
        phaseChangeBgr.destroy();
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
socket.on('someoneAttacked', function(msg) // {Id attackerId, Id victimId}
{
    // 이때 위의 attack Mode인 사람(msg.attackerId)을 해제해주자.
    console.log(msg.attackerId + ' attacked ' + msg.victimId);
    let attackerPos = RoomData.findPlayer(msg.attackerId).position;
    let victimPos = RoomData.findPlayer(msg.victimId).position;
    WordSpace.makeAttackPaper(ScenesData.gameScene, attackerPos, victimPos, msg.multiple);
});
socket.on('attacked', function(msg) // object attackData
{
    //console.log('attacked by ' + msg.attacker.nickname);
    let attackedEvent = new Cycle(function()
    {
        if(!WordSpace.isInvincible)
            for (let i = 0; i < msg.multiple; i++) WordSpace.generateWord.Attack(ScenesData.gameScene, msg.text, msg.grade, RoomData.findPlayer(msg.attackerId), msg.attackOption);
        attackedEvent.currentCycle.destroy();
        WordSpace.attackedEvents.splice(WordSpace.attackedEvents.findIndex(function(element) {
            return element.cert === (msg.text + msg.attackerId);
        }), 1);
    });
    attackedEvent.cert = msg.text + msg.attackerId;
    attackedEvent.resetCycle(ScenesData.gameScene, 4000, 0, false);

    WordSpace.attackedEvents.push(attackedEvent);
    //console.log(timeout);
});
socket.on('defeat', function(msg) // object player
{
    let playerImage = RoomData.findPlayer(msg.id).playerImage;
    let position = RoomData.findPlayer(msg.id).position;
    let nicknameText = RoomData.findPlayer(msg.id).nicknameText;
    RoomData.players[msg.index] = msg;
    RoomData.players[msg.index].playerImage = playerImage;
    RoomData.players[msg.index].position = position;
    RoomData.players[msg.index].nicknameText = nicknameText;

    RoomData.aliveCount--;
    console.log(msg.id);
    console.log(RoomData.findPlayer(msg.id));
    RoomData.findPlayer(msg.id).playerImage.play(WordSpace.pyeongminAnims[Enums.characterAnim.gameOver]);
    if (msg.lastAttack != null) 
    {
        let lastAttacker = RoomData.findPlayer(msg.lastAttack.attackerId).nickname;
        console.log(RoomData.findPlayer(msg.id).nickname + ' defeated by ' + lastAttacker + ', with ' + msg.lastAttack.word);
        WordSpace.killLogForTest += ('\n' + lastAttacker + ' --' + msg.lastAttack.word + '-> ' + RoomData.findPlayer(msg.id).nickname);
        if(msg.lastAttack.attackerId == RoomData.myself.id)
        {
            var keys = Object.keys(Enums.item);
            WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item[keys[keys.length * Math.random() << 0]]);
        }
    }
    else 
    {
        console.log(RoomData.findPlayer(msg.id).nickname + ' defeated');
        WordSpace.killLogForTest += ('\n--Suicide->' + RoomData.findPlayer(msg.id).nickname);
    }
});
socket.on('gameEnd', function(msg) // object player
{
    console.log(msg.nickname + ' Win!!!!!!');
});
socket.on('attackSucceed', function(msg)
{
    //console.log('client');
    let tempWord = WordSpace.generateWord.Name(ScenesData.gameScene, true, RoomData.findPlayer(msg.victimId));
    let victimPos = RoomData.findPlayer(msg.victimId).position;
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