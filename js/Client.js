var socket = io.connect();
var serverNumber = -1;

// init account
socket.on('syncServer', function(msg)
{
    if (serverNumber < 0 || serverNumber === msg) 
    {
        socket.emit('idRequest');
        serverNumber = msg;
    }
    else location.reload();
});

socket.on('alert', function(msg) // string errorcode
{
    //let toAlert = 'null alert';
    if (msg === 'errNicknameOverlaped') alert('이미 사용중인 닉네임입니다.');
    else if (msg === 'errNicknameEmpty') alert('설정된 닉네임이 없습니다.');
    else if (msg === 'gameWin') 
    {
        //toAlert = '승리!';
        ScenesData.gameScene.add.text(game.config.width / 2, game.config.height / 2, '승리!!!!', {fontSize: '30pt'})
        .setPadding(5,5,5,5).setOrigin(0.5, 0.5).setDepth(9.9)
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
    fbClient.updateUserData('recentHopae', PlayerData.currentHopae);
    Audio.killSound(ScenesData.menuScene, 'login');
    ScenesData.changeScene('roomScene');
    if (ScenesData.endCountTimer != undefined) 
    {
        clearTimeout(ScenesData.endCountTimer);
        ScenesData.endCountTimer = undefined;
    }
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
                sprite: ScenesData.roomScene.add.sprite(randX, randY, 'playerStand').setOrigin(0.5, 0.5).setScale(0.2, 0.2).setDepth(5),
                nickname: ScenesData.roomScene.add.text(randX-10, randY-60, msg[i].nickname).setOrigin(0.5,0.5).setColor('#000000').setPadding(0.5,0.5,0.5,0.5).setDepth(5.1),
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
        ScenesData.roomScene.endTime = Date.now() + msg.endTime;
        ScenesData.roomScene.peopleCount = msg.playerCount;

        if (msg.isEnter) // generate character
        {
            let randX = Math.random() * 1120 + 80;
            let randY = Math.random() * 380 + 100;
            var playerSet = 
            {
                sprite: ScenesData.roomScene.add.sprite(randX, randY, 'playerStand').setOrigin(0.5, 0.5).setScale(0.2, 0.2).setDepth(5),
                nickname: ScenesData.roomScene.add.text(randX-10, randY-60, msg.player.nickname).setOrigin(0.5,0.5).setColor('#000000').setPadding(0.5,0.5,0.5,0.5).setDepth(5.1),
                id: msg.player.id
            }
            ScenesData.roomScene.players.push(playerSet);
        }
        else if (msg.id != -1) // remove character
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
    WordSpace.changePhase(msg);
});
socket.on('setPlayerTypingRate', function(msg) // number playerTypingRate
{
    WordSpace.playerTypingRate = msg;
    WordSpace.adjustVarByPhase();
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
    Audio.playSound(ScenesData.gameScene, 'Bagazi');

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
socket.on('someoneItemStart', function(msg)
{
    let itemPlayer = RoomData.findPlayer(msg.id);
    let size = msg.id == RoomData.myself.id ? 1 : 0.7;
    let xOffset = msg.id != RoomData.myself.id && itemPlayer.position.x < game.config.width / 2 ? -1 : 1;
    switch(msg.itemType)
    {
        case Enums.item.invincible:
            itemPlayer.invincibleMark = ScenesData.gameScene.add.sprite(itemPlayer.position.x + 20 * size * xOffset, itemPlayer.position.y - 50 * size, 'attackPaper')
                .setDepth(5.3).setOrigin(0.5, 0.5).setScale(size);
            break;
        default:
            console.log('Improper item type.');
            break;
    }
});
socket.on('someoneItemEnd', function(msg)
{
    let itemPlayer = RoomData.findPlayer(msg.id);
    switch(msg.itemType)
    {
        case Enums.item.invincible:
            itemPlayer.invincibleMark.destroy();
            break;
        default:
            console.log('Improper item type.');
            break;
    }
});

socket.on('defeat', function(msg) // object player
{
    let playerImage = RoomData.findPlayer(msg.id).playerImage;
    let position = RoomData.findPlayer(msg.id).position;
    let nicknameText = RoomData.findPlayer(msg.id).nicknameText;
    let earnedStrongHopae = RoomData.findPlayer(msg.id).earnedStrongHopae;
    let killCount = RoomData.findPlayer(msg.id).killCount;

    
    RoomData.players[msg.index] = msg;
    RoomData.players[msg.index].playerImage = playerImage;
    RoomData.players[msg.index].position = position;
    RoomData.players[msg.index].nicknameText = nicknameText;
    RoomData.players[msg.index].earnedStrongHopae = earnedStrongHopae;
    RoomData.players[msg.index].killCount = killCount;

    let victim = RoomData.findPlayer(msg.id);
    RoomData.aliveCount--;
    victim.playerImage.play(WordSpace.characterAnims[victim.skin][Enums.characterAnim.gameOver]);

    
    if (msg.lastAttack != null) 
    {
        let lastAttacker = RoomData.findPlayer(msg.lastAttack.attackerId);
        let attackWord = msg.lastAttack.word;

        Audio.playSound(ScenesData.gameScene, 'killLog');

        console.log(victim.nickname + ' defeated by ' + lastAttacker.nickname + ', with ' + msg.lastAttack.word);
        if(WordSpace.lastAttackGroup.length != 0)
        {
            WordSpace.lastAttackGroup.forEach(function(element){
                element.destroy();
            })
        }

        let attackerLabel = UIObject.createLabel(ScenesData.gameScene, game.config.width / 2 - 400, 0, 10.2, 'nameBgr' + lastAttacker.nickname.length, 2, 
            'center', lastAttacker.nickname, 50, '#ffffff', 0.45, 0.5);
        let wordLabel = UIObject.createLabel(ScenesData.gameScene, game.config.width / 2, 0, 10.2, 'wordBgr' + msg.lastAttack.wordGrade + '_' + attackWord.length, 2, 
            'center', attackWord, 50, '#000000', 0.45, 0.5);
        let victimLabel = UIObject.createLabel(ScenesData.gameScene, game.config.width / 2 + 400, 0, 10.2, 'nameBgr' + victim.nickname.length, 2, 
            'center', victim.nickname, 50, '#ffffff', 0.45, 0.5);
        let explosionEffect = ScenesData.gameScene.add.sprite(game.config.width / 2, 0, 'wordBreak').setScale(1).setDepth(10.2);
        explosionEffect.play('wordBreakAnim');
        explosionEffect.anims.setRepeat(-1);
        

        WordSpace.lastAttackGroup.push(attackerLabel);
        WordSpace.lastAttackGroup.push(wordLabel);
        WordSpace.lastAttackGroup.push(victimLabel);
        WordSpace.lastAttackGroup.push(explosionEffect);

        ScenesData.gameScene.tweens.add({
            targets: [attackerLabel, wordLabel, victimLabel, explosionEffect],
            y: 100,
            ese: 'Linear',
            duration: 500,
            repeat: 0,
            onComplete: function () {
                setTimeout(function() {
                    ScenesData.gameScene.tweens.add({
                        targets: [attackerLabel, wordLabel, victimLabel, explosionEffect],
                        y: -100,
                        ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 500,
                        repeat: 0, // -1: infinity
                        yoyo: false });
                }, 5000);
            },
        })

        let itemBag = ScenesData.gameScene.add.sprite(lastAttacker.position.x, lastAttacker.position.y, 
            'itemBag').setScale(0).setDepth(5.3);
            ScenesData.gameScene.tweens.add({
                targets: itemBag,
                scaleX: 1,
                scaleY: 1,
                ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 500,
                repeat: 0, // -1: infinity
                yoyo: false,
                onComplete: function () {
                    setTimeout(function() {
                        ScenesData.gameScene.tweens.add({
                            targets: itemBag,
                            scaleX: 0,
                            scaleY: 0,
                            ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                            duration: 500,
                            repeat: 0,
                            onComplete: function()
                            {
                                attackerLabel.destroy();
                                wordLabel.destroy();
                                victimLabel.destroy();
                                explosionEffect.destroy();
                            }
                        });
                    }, 1000);
                }
            });
            setTimeout(function() {
                itemBag.destroy();
            }, 3000);
        if(msg.lastAttack.attackerId == RoomData.myself.id)
        {
            var keys = Object.keys(Enums.item);
            WordSpace.generateWord.Item(ScenesData.gameScene, Enums.item[keys[keys.length * Math.random() << 0]]);
            Audio.playSound(ScenesData.gameScene, 'getItem');
            RoomData.myself.killCount++;
        }
    }
    else 
    {
        console.log(victim.nickname + ' defeated');
        if(WordSpace.lastAttackGroup.length != 0)
        {
            WordSpace.lastAttackGroup.forEach(function(element){
                element.destroy();
            })
        }
        
        let victimLabel = UIObject.createLabel(ScenesData.gameScene, game.config.width / 2, 0, 10.2, 'nameBgr' + victim.nickname.length, 2, 'center', victim.nickname, 50, '#ffffff', 0.45, 0.5);
        let explosionEffect = ScenesData.gameScene.add.sprite(game.config.width / 2, 0, 'wordBreak').setScale(1).setDepth(10.2);
        explosionEffect.play('wordBreakAnim');
        explosionEffect.anims.setRepeat(-1);

        explosionEffect.anims.setRepeat(-1);
        WordSpace.lastAttackGroup.push(victimLabel);
        WordSpace.lastAttackGroup.push(explosionEffect);
        ScenesData.gameScene.tweens.add({
            targets: [victimLabel, explosionEffect],
            y: 100,
            ese: 'Linear',
            duration: 500,
            repeat: 0,
            onComplete: function () {
                setTimeout(function() {
                    ScenesData.gameScene.tweens.add({
                        targets: [victimLabel, explosionEffect],
                        y: -100,
                        ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 500,
                        repeat: 0,
                        onComplete: function()
                        {
                            victimLabel.destroy();
                            explosionEffect.destroy();
                        }
                    });
                }, 1000);
            }
        })
    }
    if(msg.id == RoomData.myself.id)
    {
        Audio.loopSound(ScenesData.gameScene, 'defeat');
        RoomData.myself = RoomData.players[msg.index];
        setTimeout(() => {
            gameEndMenu(false);
        }, 2000);
    }
});
socket.on('gameEnd', function(msg) // number winnerId
{
    const winner = RoomData.findPlayer(msg);

    if(WordSpace.CurrentPhase == 1)
        Audio.killSound(ScenesData.gameScene, 'Phase1');
    if(WordSpace.CurrentPhase == 2)
        Audio.killSound(ScenesData.gameScene, 'Phase2');
    if(WordSpace.CurrentPhase == 3)
        Audio.killSound(ScenesData.gameScene, 'Phase3');

    console.log(winner.nickname + ' Win!!!!!!');
    if(msg == RoomData.myself.id)
    {
        Audio.loopSound(ScenesData.gameScene, 'victory');
        RoomData.myself.rank = 1;
        setTimeout(() => {
            gameEndMenu(true);
        }, 2000);
    }
});

socket.on('attackSucceed', function(msg)
{
    //console.log('client');
    let tempWord = WordSpace.generateWord.Name(ScenesData.gameScene, true, RoomData.findPlayer(msg.victimId));
    let victimPos = RoomData.findPlayer(msg.victimId).position;
    tempWord.physicsObj.setPosition(victimPos.x, victimPos.y);
    tempWord.wordObj.setPosition(tempWord.physicsObj.x, tempWord.physicsObj.y);
    tempWord.destroy();
    RoomData.myself.attackSucceed += 1;
});

// out game
socket.on('userDisconnect', function(msg) // {num index , num id, str nickname}
{
    //console.log(msg.index + ' / ' + msg.id + ' / ' + msg.nickname + ' disconnected');
    RoomData.players[msg.index] = msg;
    RoomData.aliveCount--;
});

var gameEndMenu = function(isWin)
{
    WordSpace.isGameOver = true;
    ScenesData.gameScene.warningImage.destroy();
    ScenesData.gameScene.warningTween.remove();
    let earnedMoney = 0;
    if(isWin) earnedMoney += 20;
    earnedMoney += RoomData.myself.killCount * 3;
    earnedMoney += parseInt(WordSpace.playerTyping / 40);
    earnedMoney += Math.max(20, Math.pow(RoomData.myself.attackSucceed, 2));
    earnedMoney += parseInt(20 * (1 - (RoomData.myself.rank - 1) / (RoomData.players.length - 1)));

    Input.inputField.text.destroy();

    var endGame = function(){

        socket.emit('exitFromRoom', RoomData.myself.id);
        fbClient.updateUserData('killCount', RoomData.myself.killCount);
        fbClient.updateUserData('money', earnedMoney);
        ScenesData.changeScene('menuScene');
    }

    ScenesData.gameScene.backToMenuDialog = ScenesData.gameScene.rexUI.add.dialog({
        x: game.config.width / 2,
        y: game.config.height / 2,

        background: ScenesData.gameScene.add.sprite(game.config.width / 2, game.config.height / 2, 'resultDialog').setOrigin(0.5, 0.5),

        content: ScenesData.gameScene.rexUI.add.dialog({
            x: game.config.width / 2,
            y: game.config.height / 2,
            choices: [
                ScenesData.gameScene.add.sprite(game.config.width / 2 - 200, game.config.height / 2 - 100, Enums.characterSkin[PlayerData.userData.skin] + 'Stand')
                    .setOrigin(0.5, 0.5).setDepth(10.2).setScale(0.7),
                ScenesData.gameScene.add.text(game.config.width / 2 + 400, game.config.height / 2 - 220, RoomData.myself.rank + '등')
                    .setOrigin(1, 0.5).setColor('#000000').setDepth(10.2).setPadding(5,5,5,5).setFont('50pt sejongFont'),
                ScenesData.gameScene.add.text(game.config.width / 2 + 400, game.config.height / 2 - 80, RoomData.myself.killCount + '회')
                    .setOrigin(1, 0.5).setColor('#000000').setDepth(10.2).setPadding(5,5,5,5).setFont('50pt sejongFont'),
                ScenesData.gameScene.add.text(game.config.width / 2 + 400, game.config.height / 2 + 80, RoomData.myself.earnedStrongHopae + '개')
                    .setOrigin(1, 0.5).setColor('#000000').setDepth(10.2).setPadding(5,5,5,5).setFont('50pt sejongFont'),
                ScenesData.gameScene.add.text(game.config.width / 2 + 400, game.config.height / 2 + 220, '+' + earnedMoney + '냥')
                    .setOrigin(1, 0.5).setColor('#000000').setDepth(10.2).setPadding(5,5,5,5).setFont('50pt sejongFont'),
                UIObject.createLabel(ScenesData.gameScene, game.config.width / 2 - 250, game.config.height / 2 + 220, 10.2, 'nameBgr' + RoomData.myself.nickname.length, 2, 
                    'center', RoomData.myself.nickname, 50, '#ffffff', 0.45, 0.5)
            ],
    
            align: {
                choices: 'center' // 'center'|'left'|'right'
            }
        }),
        actions: [
            UIObject.createLabel(ScenesData.gameScene, game.config.width / 2 - 200, game.config.height / 2 + 350, 10.2, 'exitBtn', 1, 'center', '                      ').layout(),
            UIObject.createLabel(ScenesData.gameScene, game.config.width / 2 + 200, game.config.height / 2 + 350, 10.2, 'spectateBtn', 1, 'center', '                      ').layout()
        ],

        space: {
            action: 10,

            left: 50, right: 50, top: 50, bottom: 50,
        },

        align: {
            actions: 'center' // 'center'|'left'|'right'
        }
    }).setDepth(10.2);
    
    if(isWin) ScenesData.gameScene.winMark = 
        ScenesData.gameScene.add.sprite(game.config.width / 2 + 500, game.config.height / 2 + 400, 'resultStamp').setOrigin(0.5, 0.5).setDepth(10.2);

    ScenesData.gameScene.backToMenuDialog
        .on('button.click', function (button, groupName, index) {
            if(index == 0) endGame();
            else
            {
                if(isWin) ScenesData.gameScene.winMark.destroy();
                ScenesData.gameScene.backToMenuDialog.setVisible(false);
                ScenesData.gameScene.backToMenuBtn = UIObject.createButton(ScenesData.gameScene, 
                    UIObject.createLabel(ScenesData.gameScene, 200, 900, 10.2, 'spectateBtn', 1, 'center'), -1, -1, -1, endGame);
            }
        }, ScenesData.gameScene)
        .on('button.over', function (button, groupName, index) {
            //console.log('button over');
        })
        .on('button.out', function (button, groupName, index) {
            //console.log('button out');
    });
}