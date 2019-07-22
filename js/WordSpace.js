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
WordSpace.pyeongminAnims = [];

WordSpace.wordGroup = [];
WordSpace.nameGroup = [];
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

WordSpace.gravityPoint = {x: 640, y: 280};

WordSpace.getSpawnPoint = function(_lenRate)
{
    let lenRate = 1;
    if(typeof _lenRate == 'number') lenRate  = _lenRate;
    let xLen = 550 * lenRate;
    let yLen = 350 * lenRate;
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
        this.rectUI.setSize(20 * this.value, 11);
        this.rectUI.setPosition(640 - 10 * this.value, 547);
        let tmp = this.getAttackOption();
        this.rectUI.setFillStyle(Phaser.Display.Color.HexStringToColor(this.gradeColor[tmp.wordGrade + 1]).color);
    },
    generate: function(scene)
    {
        //console.log("created");
        this.rectUI = scene.add.rectangle(640,600,0,11).setDepth(11);
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
    for (let i = 2; i < 7; i++)
    {
        scene.load.image('nameBgr' + i, 'assets/placeholder/name' + i + '.png');
        scene.load.image('strongBgr' + i, 'assets/placeholder/strong' + i + '.png');
    }
    scene.load.spritesheet('wordBreak', 'assets/image/word/wordbreak.png', { frameWidth: 180, frameHeight: 180 });
    scene.load.spritesheet('pyeongminWrite', 'assets/image/character/pyeongmin/write/pyeong_write.png', { frameWidth: 490, frameHeight: 423 });
    scene.load.spritesheet('pyeongminThrow', 'assets/image/character/pyeongmin/throw/pyeong_throw.png', { frameWidth: 490, frameHeight: 423 });

    WordSpace.weightTextObjForTest = scene.add.text(100, 75, '뇌의 무게: (현재) 0 / ' + this.brainCapacity + ' (전체)').setDepth(10).setColor('#000000');
    WordSpace.killLogTextForTest = scene.add.text(1000, 50, WordSpace.killLogForTest).setDepth(10).setColor('#000000').setAlign('right');
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
    WordSpace.pyeongminAnims[Enums.characterAnim.write] = scene.anims.create({
        key: 'pyeongminWriteAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminWrite'),
        frameRate: 10,
        repeat: 0,
        hideOnComplete: false
    });
    WordSpace.pyeongminAnims[Enums.characterAnim.attackWrite] = scene.anims.create({
        key: 'pyeongminattackWriteAnim',
        frames: scene.anims.generateFrameNumbers('pyeongminWrite'),
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
}

WordSpace.generateWord = 
{
    Normal: function(scene, grade, lenRate)
    {
        word = new NormalWord(SelectWord.selectWord(grade));
        WordSpace.pushWord(scene, word, lenRate);
        return word;
    },
    Attack: function(scene, wordText, grade, attacker, isStrong, isCountable, lenRate)
    {
        word = new AttackWord(wordText, grade, attacker, isStrong, isCountable);
        WordSpace.pushWord(scene, word, lenRate);
        return word;
    },
    Name: function(scene, isStrong, newPlayerData, lenRate)
    {
        if(newPlayerData == null) word = new NameWord(WordSpace.nameQueue.pop(), isStrong);
        else word = new NameWord(newPlayerData, isStrong);
        //word = new NameWord(RoomData.myself, false);
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
    ScenesData.gameScene.add.text(640, 360, '패배', {fontSize: '30pt'})
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
        Input.attackOption = this.attackGauge.getAttackOption();
        Input.maxInput = Input.attackOption.wordCount;
        Input.attackMode = true;
        WordSpace.attackGauge.pauseCycle(true);
        WordSpace.setPlayerTyping.add(wordText);
        BackGround.myCharacter.play(WordSpace.pyeongminAnims[Enums.characterAnim.attackWrite]);
        BackGround.myCharacter.anims.msPerFrame /= (4 - WordSpace.attackGauge.getAttackOption().wordGrade);
    }
    else // 오타 체크
    {
        let minDist = WordReader.getWordTyping(wordText) / 2 + 1, tempDist = 0;
        let attackWords = [];
        WordSpace.wordGroup.forEach(function(element)
        {
            if(element instanceof AttackWord)
            {
                tempDist = WordSpace.getEditDistance(wordText, element.wordText);
                attackWords.push(element);
                if(tempDist <= minDist) minDist = tempDist;
            }
        });
        attackWords.some(function(element)
        {
            if(WordSpace.getEditDistance(wordText, element.wordText) == minDist)
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
        let toSend = [];
        WordSpace.nameGroup.forEach(function(element)
        {
            let targetId = element.ownerId;
            let sendIdx = toSend.findIndex(function(element)
            {
                return element.target === targetId;
            });
            if (sendIdx !== -1)
            {
                toSend[sendIdx].multiple++;
            }
            else
            {
                let attackData = 
                {
                    roomNum: RoomData.roomId,
                    attacker: RoomData.myself, 
                    target: element.ownerId,
                    text: wordText, 
                    grade: grade, 
                    isStrong: element.isStrong,
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
        BackGround.myCharacter.play(WordSpace.pyeongminAnims[Enums.characterAnim.throw]);
    }
    else WordSpace.attackGauge.cutValue(0.3);
    Input.maxInput = 6;
    Input.attackMode = false;
    WordSpace.attackGauge.pauseCycle(false);
}

WordSpace.nameQueue = 
{
    queue: [],
    shuffle: function()
    {
        let tempIdx, tempElement, tempLength, tempQueue = [];
        RoomData.players.forEach(function(element){
            tempQueue.push(element.index)
        })
        for(tempLength = tempQueue.length; tempLength; tempLength -= 1)
        {
            tempIdx = Math.floor(Math.random() * tempLength);
            tempElement = tempQueue[tempLength - 1];
            tempQueue[tempLength - 1] = tempQueue[tempIdx];
            tempQueue[tempIdx] = tempElement;
        }
        tempQueue.forEach(function(element)
        {
            if(RoomData.players[element].id != PlayerData.id && RoomData.players[element].isAlive)
                WordSpace.nameQueue.queue.push(element);
        });
    },
    pop: function()
    {
        let tempElement = WordSpace.nameQueue.queue.shift();
        if(WordSpace.nameQueue.queue.length <= RoomData.aliveCount) this.shuffle();
        if(!RoomData.players[tempElement].isAlive) return WordSpace.nameQueue.pop();
        else return RoomData.players[tempElement];
    },
    initiate: function()
    {
        this.shuffle();
        this.shuffle();
    }
}

WordSpace.getEditDistance = function(input, check) {
    var inputWords = [], checkWords = []
    for(let i = 0; i < input.length; i++)
    {
        inputWords.push(parseInt(((input[i].charCodeAt(0) - parseInt('0xac00',16)) /28) / 21) + parseInt('0x1100',16));
        inputWords.push(parseInt(((input[i].charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21) + parseInt('0x1161',16));
        inputWords.push(parseInt((input[i].charCodeAt(0) - parseInt('0xac00',16)) % 28) + parseInt('0x11A8') -1);
    }
    for(let i = 0; i < check.length; i++)
    {
        checkWords.push(parseInt(((check[i].charCodeAt(0) - parseInt('0xac00',16)) /28) / 21) + parseInt('0x1100',16));
        checkWords.push(parseInt(((check[i].charCodeAt(0)- parseInt('0xac00',16)) / 28) % 21) + parseInt('0x1161',16));
        checkWords.push(parseInt((check[i].charCodeAt(0) - parseInt('0xac00',16)) % 28) + parseInt('0x11A8') -1);
    }  
    var matrix = [];
    var i, j;
    for(i = 0; i <= checkWords.length; i++) // increment along the first column of each row
        matrix[i] = [i];
    for(j = 0; j <= inputWords.length; j++) // increment each column in the first row
        matrix[0][j] = j;
    for(i = 1; i <= checkWords.length; i++) // Fill in the rest of the matrix
        for(j = 1; j <= inputWords.length; j++){
            if(checkWords[i-1] == inputWords[j-1]) matrix[i][j] = matrix[i-1][j-1];
            else matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                    Math.min(matrix[i][j-1] + 1, // insertion
                                            matrix[i-1][j] + 1)); // deletion
        }
    return matrix[checkWords.length][inputWords.length];
}