var WordSpace = WordSpace || {};

// for test
WordSpace.weightTextObjForTest = null;
WordSpace.nameWordTextForTest = null;
WordSpace.killLogTextForTest = null;
WordSpace.killLogForTest = '';

WordSpace.nextWordCode = 0;
WordSpace.totalWeight = 0; //현재 단어 무게 총합
WordSpace.totalWordNum = 0;
WordSpace.brainCapacity = 200; //수용 가능한 단어 무게 최대치
WordSpace.gameTimer = null; //현재 게임 플레이 시간 타이머
WordSpace.isTimerOn = false;
WordSpace.isInvincible = false;
WordSpace.pyeongminAnims = [];

WordSpace.wordGroup = [];
WordSpace.nameGroup = [];
WordSpace.attackPaperGroup = [];
WordSpace.wordForcedGroup = [];
WordSpace.wordPhysicsGroup = null;

WordSpace.GradeProb = [0.35, 0.6, 0.8];
WordSpace.Phase = {READY: 0, START: 1, MAIN: 2, MUSIC: 3};
WordSpace.CurrentPhase = WordSpace.Phase.START;
WordSpace.playerTyping = 0;
WordSpace.playerTypingRate = 0;

WordSpace.deltaTime = 10;

WordSpace.delay = 
{
    WordSpawn: 3000,
    NameSpawn: 3000,
    GameOver: 5000,
}

WordSpace.NameSpawnReduce = 1000;

WordSpace.gravityPoint = {x: 960, y: 420};

WordSpace.getSpawnPoint = function(_lenRate)
{
    let lenRate = 1;
    if(typeof _lenRate == 'number') lenRate  = _lenRate;
    let xLen = 650 * lenRate;
    let yLen = 500 * lenRate;
    const angle = Math.random() * Math.PI * 2;
    let _x = xLen * Math.cos(angle) + this.gravityPoint.x;
    let _y = yLen * Math.sin(angle) + this.gravityPoint.y;
    return {x:_x, y:_y};
}

WordSpace.spaceInitiate = function(scene)
{
    let arr = [2, 1, 3, 3, 2, 2, 3, 3, 2, 3]

    let lenRate = 1;
    arr.forEach(function(element)
    {
        WordSpace.generateWord.Normal(scene, element, lenRate);
        //WordSpace.generateWord(scene, SelectWord.selectWord(element),'',lenRate);
        lenRate += 0.2;
    });
}

WordSpace.AdjustVarByPhase = function(typingRate, phase)
{
    if(phase == WordSpace.Phase.START)
    {
        WordSpace.delay.WordSpawn = 3000;
        WordSpace.delay.NameSpawn = 15000;
        WordSpace.NameSpawnReduce = 1000;
        WordSpace.GradeProb[0] = 0.35;
        WordSpace.GradeProb[1] = 1 - 0.4 * typingRate;
        WordSpace.GradeProb[2] = 1;
    }
    else if(phase == WordSpace.Phase.MAIN)
    {
        WordSpace.delay.WordSpawn = 3000 - typingRate * 1000;
        WordSpace.delay.NameSpawn = 12000;
        WordSpace.NameSpawnReduce = 1000;
        WordSpace.GradeProb[0] = 0.5 - 0.5 * typingRate;
        WordSpace.GradeProb[1] = 1 - 0.5 * typingRate;
        WordSpace.GradeProb[2] = 1 - 0.15 * typingRate;
    }
    else if(phase == WordSpace.Phase.MUSIC)
    {
        WordSpace.delay.WordSpawn = 1500;
        WordSpace.delay.NameSpawn = 8000;
        WordSpace.NameSpawnReduce = 400;
        WordSpace.GradeProb[0] = 0.2 - 0.2 * typingRate;
        WordSpace.GradeProb[1] = 0.8 - 0.45 * typingRate;
        WordSpace.GradeProb[2] = 0.9 - 0.15 * typingRate;
    }
    WordSpace.wordCycle.resetCycle(ScenesData.gameScene, WordSpace.delay.WordSpawn, WordSpace.wordCycle.currentCycle.getElapsed(), true);
    WordSpace.nameCycle.resetCycle(ScenesData.gameScene, WordSpace.delay.NameSpawn, WordSpace.nameCycle.currentCycle.getElapsed(), true);
}

WordSpace.attackGauge = 
{
    value: 0,
    gradeColor: ['#111124','#EBB435','#A42FFF','#1D22EB','#83947F'],
    setRect: function()
    {
        this.rectUI.setSize(game.config.width / 64 * this.value, game.config.height * 11 / 720);
        this.rectUI.setPosition(game.config.width * (640 - 10 * this.value) / 1280, game.config.height * 547 / 720);
        let tmp = this.getAttackOption();
        this.rectUI.setFillStyle(Phaser.Display.Color.HexStringToColor(this.gradeColor[tmp.wordGrade + 1]).color);
    },
    generate: function(scene)
    {
        //console.log("created");
        this.rectUI = scene.add.rectangle(game.config.width / 2, game.config.height * 5 / 6, 0, game.config.height * 11 / 720).setDepth(11);
    },
    add: function(plus)
    {
        if (this.value + plus > 11) this.value = 11;
        else this.value += plus;
        this.setRect();
        this.text.setText('게이지: ' + this.value.toFixed(1));
    },
    sub: function(minus)
    {
        if (this.value - minus < 0) this.value = 0;
        else this.value -= minus;
        this.setRect();
        this.text.setText('게이지: ' + this.value.toFixed(1));
    },
    resetValue: function() {this.value = 0;},
    cutValue: function(cutOut) {this.value *= (1-cutOut);},
    resetCycle: function(scene)
    {
        var option = 
        {
            delay: 300,
            callback: function()
            {
                WordSpace.attackGauge.sub(0.1);
            },
            loop: true
        };
        this.currentCycle = scene.time.addEvent(option);

        this.text = scene.add.text(100,100,'게이지: ' + this.value.toFixed(1)).setDepth(10).setColor('#000000');
        //this.rectUI.setColor(this.gradeColor[0]);
    },
    pauseCycle: function(bool) {this.currentCycle.paused = bool;},
    // showValue: 아래쪽에 바의 길이로 게이지 표시, 색으로 게이지의 강도 표현
    getAttackOption: function()
    {
        if (this.value < 3) return {wordCount: 0, wordGrade: -1};
        else if (this.value < 5) return {wordCount: 2, wordGrade: 3};
        else if (this.value < 7) return {wordCount: 3, wordGrade: 2};
        else if (this.value < 10) return {wordCount: 4, wordGrade: 1};
        else return {wordCount: 5, wordGrade: 0};
    }
}

WordSpace.genWordByProb = function(scene)
{
    let wordRnd = Math.random();
    let wordIdx = wordRnd < WordSpace.GradeProb[0] ? 3 :
                  wordRnd < WordSpace.GradeProb[1] ? 2 :
                  wordRnd < WordSpace.GradeProb[2] ? 1 : 0;
    WordSpace.generateWord.Normal(scene, wordIdx);
    //WordSpace.generateWord(scene, SelectWord.selectWord(wordIdx));
}

WordSpace.loadImage = function(scene)
{
    for (let i = 0; i < 4; i++)
    {
        for (let j = 2; j < 7; j++)
        {
            scene.load.image(('wordBgr' + i + '_' + j), ('assets/placeholder/'+i + '_' + j + '.png'));
        }
    }
    for (let i = 0; i < 4; i++)
    {
        scene.load.image('attackAlert' + i, 'assets/placeholder/attackalert' + (i+1) + '.png');
    }
    for (let i = 0; i < 6; i++)
    {
        scene.load.image('item' + i, 'assets/placeholder/item' + i + '.png');
    }
    for (let i = 2; i < 7; i++)
    {
        scene.load.image('nameBgr' + i, 'assets/placeholder/name' + i + '.png');
        scene.load.image('strongBgr' + i, 'assets/placeholder/strong' + i + '.png');
    }
    
    scene.load.spritesheet('wordBreak', 'assets/image/word/wordbreak.png', { frameWidth: 180, frameHeight: 180 });
    scene.load.spritesheet('pyeongminSit', 'assets/image/character/pyeongmin/pyeong_sit.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminWrite', 'assets/image/character/pyeongmin/write/pyeong_write.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminThrow', 'assets/image/character/pyeongmin/throw/pyeong_throw.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminBurningSmall', 'assets/image/character/pyeongmin/burning/pyeong_burning_small.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminBurningBig', 'assets/image/character/pyeongmin/burning/pyeong_burning_big.png', { frameWidth: 521, frameHeight: 610 });
    scene.load.spritesheet('pyeongminGameOver', 'assets/image/character/pyeongmin/burning/pyeong_balladang.png', { frameWidth: 720, frameHeight: 700 });
    scene.load.image('phaseChangeBgr', 'assets/placeholder/phaseChange.png');

    WordSpace.weightTextObjForTest = scene.add.text(game.config.width * 5 / 64, game.config.height * 5 / 48, '뇌의 무게: (현재) 0 / ' + this.brainCapacity + ' (전체)').setDepth(10).setColor('#000000');
    WordSpace.killLogTextForTest = scene.add.text(game.config.width * 25 / 32, game.config.height * 5 / 72, WordSpace.killLogForTest).setDepth(10).setColor('#000000').setAlign('right');
}

WordSpace.loadAnimation = function(scene)
{
    scene.anims.create({
        key: 'wordBreakAnim',
        frames: scene.anims.generateFrameNumbers('wordBreak'),
        frameRate: 10,
        repeat: 0,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.sit] = scene.anims.create({
        key: 'pyeongminSitAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminSit'),
        frameRate: 10,
        repeat: 0,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.write] = scene.anims.create({
        key: 'pyeongminWriteAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminWrite'),
        frameRate: 10,
        repeat: 0,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.notBurning] = scene.anims.create({
        key: 'pyeongminnotBurningAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminWrite'),
        frameRate: 10,
        repeat: -1,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.smallBurning] = scene.anims.create({
        key: 'pyeongminsmallBurningAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminBurningSmall'),
        frameRate: 10,
        repeat: -1,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.bigBurning] = scene.anims.create({
        key: 'pyeongminbigBurningAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminBurningBig'),
        frameRate: 10,
        repeat: -1,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.throw] = scene.anims.create({
        key: 'pyeongminThrowAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminThrow'),
        frameRate: 10,
        repeat: 0,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.gameOver] = scene.anims.create({
        key: 'pyeongminGameOverAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminGameOver'),
        frameRate: 10,
        repeat: 0,
        hideOnComplete: false
    });
}

WordSpace.generateWord = 
{
    Normal: function(scene, grade, lenRate)
    {
        word = new NormalWord(SelectWord.selectWord(grade));
        WordSpace.pushWord(scene, word, lenRate);
        return word;
    },
    Attack: function(scene, wordText, grade, attacker, attackOption, lenRate)
    {
        word = new AttackWord(wordText, grade, attacker, attackOption);
        WordSpace.pushWord(scene, word, lenRate);
        return word;
    },
    Name: function(scene, isStrong, newPlayerData, lenRate)
    {
        if(newPlayerData == null)
        {
            if(WordSpace.nameQueue.queue.length == 1) return null;
            let temp = WordSpace.nameQueue.pop();
            word = new NameWord(temp, isStrong);
        }
        else word = new NameWord(newPlayerData, isStrong);
        WordSpace.pushWord(scene, word, lenRate);
        return word;
    },
    Item: function(scene, itemType, lenRate)
    {
        word = new ItemWord(itemType);
        WordSpace.pushWord(scene, word, lenRate);
        return word;
    }
}

WordSpace.pushWord = function(scene, word, lenRate)
{
    word.instantiate(scene, lenRate);
    WordSpace.wordGroup.push(word);
    WordSpace.wordForcedGroup.push(word);
    word.physicsObj.topObj = word;
    word.physicsObj.wordCollider = scene.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup, function(object1) 
    {
        //object1.topObj.wordSpeed = 0.1;
        object1.topObj.attract();
    });
    WordSpace.wordPhysicsGroup.add(word.physicsObj);
}

function gameOver()
{
    WordSpace.pauseCycle(true);
    
    socket.emit('defeated');
    console.log('defeat');
    ScenesData.gameScene.add.text(game.config.width / 2, game.config.height / 2, '패배', {fontSize: '30pt'})
    .setPadding(5,5,5,5).setOrigin(0.5, 0.5).setDepth(10)
    .setColor('#000000').setBackgroundColor('#ffffff');
    //alert('defeat');
}

//게임 오버 판정을 위한 타이머
WordSpace.setGameOverTimer = function()
{
    //만약 현재 단어 무게 총합이 뇌 용량보다 크다면 타이머를 시작함
    if(this.brainCapacity < this.totalWeight && !this.isTimerOn)
    {
        this.isTimerOn = true;
        WordSpace.gameOverCycle.resetCycle(ScenesData.gameScene, WordSpace.delay.GameOver, 0, false);
    }
}

WordSpace.resetGameOverTimer = function()
{
    if(this.brainCapacity >= this.totalWeight && this.isTimerOn)
    {
        this.isTimerOn = false;
        WordSpace.gameOverCycle.currentCycle.paused = true;
    }
}

WordSpace.findWord = function(wordText)
{
    var found = WordSpace.wordGroup.filter(function(element)
    {
        return Input.isEqual(wordText, element.wordText);
    });
    if (found.length != 0)
    {
        let weightest = found[0];
        found.forEach(function(element) 
        {
            if (weightest.wordWeight < element.wordWeight) weightest = element;
        });
        weightest.destroy();
        WordSpace.nameCycle.resetCycle(ScenesData.gameScene, WordSpace.delay.NameSpawn, WordSpace.nameCycle.currentCycle.getElapsed() + WordSpace.NameSpawnReduce, true);
        
        while(WordSpace.totalWordNum < 5)
        {
            WordSpace.genWordByProb(ScenesData.gameScene);
            WordSpace.wordCycle.resetCycle(ScenesData.gameScene, WordSpace.delay.WordSpawn, 0);
        }
        WordSpace.setPlayerTyping.add(wordText);
    }
    else if (wordText === '공격' && WordSpace.attackGauge.value >= 3 && WordSpace.nameGroup.length > 0) // 공격모드 진입.
    {
        console.log('attack mode');
        let tempAttackOption = this.attackGauge.getAttackOption();
        Input.attackOption.wordCount = tempAttackOption.wordCount;
        Input.attackOption.wordGrade = tempAttackOption.wordGrade;
        Input.maxInput = Input.attackOption.wordCount;
        Input.attackMode = true;
        WordSpace.attackGauge.pauseCycle(true);
        WordSpace.setPlayerTyping.add(wordText);
        switch(tempAttackOption.wordCount)
        {
            case 2:
                RoomData.myself.playerImage.play(WordSpace.pyeongminAnims[Enums.characterAnim.notBurning]);
                break;
            case 3:
                RoomData.myself.playerImage.play(WordSpace.pyeongminAnims[Enums.characterAnim.smallBurning]);
                break;
            case 4:
                RoomData.myself.playerImage.play(WordSpace.pyeongminAnims[Enums.characterAnim.smallBurning]);
                break;
            case 5:
                RoomData.myself.playerImage.play(WordSpace.pyeongminAnims[Enums.characterAnim.bigBurning]);
                break;
            default:
                console.log('Improper attack option.');
                break;
        }
        RoomData.myself.playerImage.anims.msPerFrame /= (4 - Input.attackOption.wordGrade);
    }
    else // 오타 체크
    {
        let minDist = WordReader.getWordTyping(wordText) / 2 + 1, tempDist = 0;
        let attackWords = [];
        WordSpace.wordGroup.forEach(function(element)
        {
            if(element instanceof AttackWord)
            {
                tempDist = WordReader.getEditDistance(wordText, element.wordText);
                attackWords.push(element);
                if(tempDist <= minDist) minDist = tempDist;
            }
        });
        attackWords.some(function(element)
        {
            if(WordReader.getEditDistance(wordText, element.wordText) == minDist)
            {
                console.log('Attack word : ' + element.wordText + ' of ' + element.attacker.nickname + ' 오타임');
                let victimData = 
                {
                    roomNum: RoomData.roomId,
                    victim: RoomData.myself, 
                    target: element.attacker.id,
                    word: element.wordText
                }
                socket.emit('defenseFailed', victimData);
                return true;
            }
        });
        this.attackGauge.sub(2);
    }
}

WordSpace.setPlayerTyping = 
{
    totalTyping: 0,
    writeWord: false,
    add: function(wordText)
    {
        this.totalTyping += wordText != null ? WordReader.getWordTyping(wordText) : 0;
        WordSpace.playerTyping = this.totalTyping / WordSpace.gameTimer.now * 60 * 1000;
        this.text.setText('현재 타수 : ' + WordSpace.playerTyping.toFixed(1));
        this.writeWord = wordText != '' ? true : false;
    },
    initiate: function(scene)
    {
        this.text = scene.add.text(100,200,'현재 타수 : ' + WordSpace.playerTyping.toFixed(1)).setDepth(10).setColor('#000000');
    }
}

WordSpace.attack = function(wordText, grade)
{
    wordText = Input.removeConVow(wordText);
    if (wordText != '')
    {
        console.log('attack ' + wordText + ', grade: ' + grade);
        Audio.playSound(ScenesData.gameScene, 'attack');
        let toSend = [];
        WordSpace.nameGroup.forEach(function(element)
        {
            let victimId = element.ownerId;
            let sendIdx = toSend.findIndex(function(element)
            {
                return element.victim.id === victimId;
            });
            if (sendIdx != -1) toSend[sendIdx].multiple++;
            else
            {
                let target = RoomData.players.find(function(_element) {
                    return _element.id == element.ownerId;
                });
                let attackData = 
                {
                    roomNum: RoomData.roomId,
                    attacker: RoomData.myself, 
                    victim: target,
                    text: wordText, 
                    grade: grade,
                    attackOption: {
                        isStrong: element.isStrong,
                        isCountable: true,
                        isHeavy: Input.attackOption.isHeavy,
                        isDark: Input.attackOption.isDark
                    },
                    multiple: 1
                }
                toSend.push(attackData);
            }
            element.physicsObj.destroy();
            element.wordObj.destroy();
        });
        toSend.forEach(function(element)
        {
            socket.emit('attack', element);
        });

        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.generateWord.Name(ScenesData.gameScene, false, null);
        WordSpace.nameGroup = [];

        WordSpace.attackGauge.resetValue();
        WordSpace.setPlayerTyping.add(wordText);
        RoomData.myself.playerImage.play(WordSpace.pyeongminAnims[Enums.characterAnim.throw]);
        RoomData.myself.playerImage.anims.chain(WordSpace.pyeongminAnims[Enums.characterAnim.sit]);
        Input.attackOption.isHeavy = false;
        Input.attackOption.isDark = false;
    }
    else WordSpace.attackGauge.cutValue(0.3);
    Input.maxInput = 6;
    Input.attackMode = false;
    WordSpace.attackGauge.pauseCycle(false);
}

WordSpace.makeAttackPaper = function(scene, attackFrom, attackTo, multiple)
{
    var attackPaper = scene.add.sprite(attackFrom.x, attackFrom.y, 'attackPaper').setScale(0.5 * multiple).setDepth(3);
    attackPaper.mask = new Phaser.Display.Masks.BitmapMask(scene, BackGround.gameBackground);
    attackPaper.throwTarget = attackTo;
    attackPaper.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    attackPaper.path = new Phaser.Curves.Spline([
        attackFrom.x, attackFrom.y,
        (attackFrom.x + attackPaper.throwTarget.x) / 2, Math.min(attackFrom.y, attackPaper.throwTarget.y) - 100,
        attackPaper.throwTarget.x, attackPaper.throwTarget.y - 10
    ]);
    scene.tweens.add({
        targets: attackPaper.follower,
        t: 1,
        ease: 'Linear',
        duration: 4000,
        repeat: 0,
        onComplete: function() { 
            attackPaper.destroy();
            WordSpace.attackPaperGroup = [];
        }
    });
    attackPaper.moveObject = function(obj)
    {
        obj.path.getPoint(obj.follower.t, obj.follower.vec);
        obj.setPosition(obj.follower.vec.x, obj.follower.vec.y);
        obj.angle = 720 * obj.follower.t;
    }
    WordSpace.attackPaperGroup.push(attackPaper);
}

WordSpace.nameQueue = 
{
    queue: [],
    shuffle: function()
    {
        let tempQueue = [];
        RoomData.players.forEach(function(element){
            tempQueue.push(element.index);
        })
        Phaser.Utils.Array.Shuffle(tempQueue);
        tempQueue.forEach(function(element)
        {
            if(RoomData.players[element].id != PlayerData.id && RoomData.players[element].isAlive && WordSpace.nameQueue.getCount(element) < 3)
                WordSpace.nameQueue.queue.push(element);
        });
    },
    pop: function()
    {
        let tempElement = WordSpace.nameQueue.queue.shift();
        if(WordSpace.nameQueue.queue.length <= RoomData.aliveCount) this.shuffle();
        if(!RoomData.players[tempElement].isAlive && WordSpace.nameQueue.getCount(tempElement) < 3) return WordSpace.nameQueue.pop();
        else return RoomData.players[tempElement];
    },
    getCount: function(player)
    {
        let i = 0;
        WordSpace.nameGroup.forEach(function(element){
            if(element.id == player.id) i++;
        })
        return i;
    },
    initiate: function()
    {
        this.shuffle();
        this.shuffle();
    }
}
