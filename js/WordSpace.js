var WordSpace = WordSpace || {};

// for test
WordSpace.gameSceneForTest = null;
WordSpace.weightTextObjForTest = null;
WordSpace.nameWordTextForTest = null;

WordSpace.isImageLoaded = false;

WordSpace.nextWordCode = 0;
WordSpace.totalWeight = 0; //현재 단어 무게 총합
WordSpace.totalWordNum = 0;
WordSpace.brainCapacity = 200; //수용 가능한 단어 무게 최대치
WordSpace.gameTimer = null; //현재 게임 플레이 시간 타이머
WordSpace.isTimerOn = false;

WordSpace.wordGroup = [];
WordSpace.nameGroup = [];
WordSpace.wordForcedGroup = [];
WordSpace.wordPhysicsGroup = null;

WordSpace.GradeProb = [0.35, 0.6, 0.8];
WordSpace.Phase = {READY: 0, START: 1, MAIN: 2, MUSIC: 3};
WordSpace.CurrentPhase = WordSpace.Phase.READY;
WordSpace.playerTyping = 0;
WordSpace.playerTypingRate = 0;

WordSpace.delay = 
{
    WordSpawn: 3000,
    NameSpawn: 3000,
    GameOver: 5000,
}

WordSpace.NameSpawnReduce = 1000;

WordSpace.gravityPoint = {x: 640, y: 300};

class Cycle //앞으로 cycle은 이 클래스를 사용해서 구현할 것
{
    constructor(_callback)
    {
        this.delay = 0;
        this.currentCycle = null;
        this.callbackFunction = _callback;
    }
    resetCycle(scene, _delay, _startAt, _loop)
    {
        this.delay = _delay;
        var option = 
        {
            startAt: _startAt,
            delay: _delay,
            callback: this.callbackFunction,
            callbackScope: scene,
            loop: _loop
        };
        if (this.currentCycle != null) this.currentCycle = this.currentCycle.reset(option);
        else this.currentCycle = scene.time.addEvent(option);
    }
}

//단어 생성 사이클
WordSpace.wordCycle = new Cycle(function()
{
    WordSpace.genWordByProb(this);
});
//게임 오버 사이클
WordSpace.gameOverCycle = new Cycle(gameOver);
//호패 생성 사이클
WordSpace.nameCycle = new Cycle(function()
{
    WordSpace.generateWord.Name(WordSpace.gameSceneForTest, false);
});
//이건 뭐지
WordSpace.varAdjustCycle = new Cycle(function()
{
    //나중에는 메세지 분석해서 Phase랑 playerTypingRate 받겠지만 일단 이렇게 해둠
    //WordSpace.GetPhase();
    //WordSpace.GetPlayerTypingRate();
    WordSpace.AdjustVarByPhase(WordSpace.playerTypingRate, WordSpace.CurrentPhase);
});

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
    if(phase == WordSpace.Phase.READY)
    {
        WordSpace.delay.WordSpawn = 10000;
        WordSpace.delay.NameSpawn = 10000;
        WordSpace.NameSpawnReduce = 0;
        WordSpace.GradeProb[0] = 1;
        WordSpace.GradeProb[1] = 1;
        WordSpace.GradeProb[2] = 1;
    }
    else if(phase == WordSpace.Phase.START)
    {
        WordSpace.delay.WordSpawn = 3000;
        WordSpace.delay.NameSpawn = 6000;
        WordSpace.NameSpawnReduce = 1000;
        WordSpace.GradeProb[0] = 0.35;
        WordSpace.GradeProb[1] = 1 - 0.4 * typingRate;
        WordSpace.GradeProb[2] = 1;
    }
    else if(phase == WordSpace.Phase.MAIN)
    {
        WordSpace.delay.WordSpawn = 3000 - typingRate * 1000;
        WordSpace.delay.NameSpawn = 6000;
        WordSpace.NameSpawnReduce = 1000;
        WordSpace.GradeProb[0] = 0.4 - 0.4 * typingRate;
        WordSpace.GradeProb[1] = 0.8 - 0.4 * typingRate;
        WordSpace.GradeProb[2] = 1 - 0.2 * typingRate;
    }
    else if(phase == WordSpace.Phase.MUSIC)
    {
        WordSpace.delay.WordSpawn = 1500;
        WordSpace.delay.NameSpawn = 4000;
        WordSpace.NameSpawnReduce = 500;
        WordSpace.GradeProb[0] = 0.2 - 0.2 * typingRate;
        WordSpace.GradeProb[1] = 0.8 - 0.5 * typingRate;
        WordSpace.GradeProb[2] = 0.9 - 0.2 * typingRate;
    }
    WordSpace.wordCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.delay.WordSpawn, WordSpace.wordCycle.currentCycle.getElapsed(), true);
    WordSpace.nameCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.delay.NameSpawn, WordSpace.nameCycle.currentCycle.getElapsed(), true);
}

WordSpace.attackGauge = 
{
    value: 0,
    gradeColor: ['#111124','#EBB435','#A42FFF','#1D22EB','#83947F'],
    setRect: function()
    {
        this.rectUI.setSize(20 * this.value, 11);
        this.rectUI.setPosition(640 - 10 * this.value, 597);
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
    if (!this.isImageLoaded)
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
    }
    WordSpace.gameSceneForTest = scene; // for test
    WordSpace.weightTextObjForTest = scene.add.text(100, 75, '뇌의 무게: (현재) 0 / 100 (전체)').setDepth(10).setColor('#000000');
}

WordSpace.generateWord = 
{
    Normal: function(scene, grade, lenRate)
    {
        word = new NormalWord(SelectWord.selectWord(grade));
        WordSpace.pushWord(scene, word, lenRate);
    },
    Attack: function(scene, wordText, grade, attacker, isStrong, lenRate)
    {
        word = new AttackWord(wordText, grade, attacker, isStrong);
        WordSpace.pushWord(scene, word, lenRate);
    },
    Name: function(scene, isStrong, lenRate)
    {
        //To do
        word = new NameWord(playerName, isStrong);
        WordSpace.pushWord(scene, word, lenRate);
    }
}

WordSpace.pushWord = function(scene, word, lenRate)
{
    word.instantiate(scene, lenRate);
    WordSpace.wordGroup.push(word);
    WordSpace.wordForcedGroup.push(word);
    word.physicsObj.topObj = word;
    scene.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup, function(object1) 
    {
        //object1.topObj.wordSpeed = 0.1;
        object1.topObj.attract();
    });
    WordSpace.wordPhysicsGroup.add(word.physicsObj);
}

function gameOver()
{
    WordSpace.wordCycle.currentCycle.remove();
    WordSpace.nameCycle.currentCycle.remove();
    //To Do
    console.log('defeat');
}

//게임 오버 판정을 위한 타이머
WordSpace.setGameOverTimer = function()
{
    //만약 현재 단어 무게 총합이 뇌 용량보다 크다면 타이머를 시작함
    if(this.brainCapacity < this.totalWeight && !this.isTimerOn)
    {
        this.isTimerOn = true;
        WordSpace.gameOverCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.delay.gameOver, 0, false);
        console.log('Game over timer On');
    }
}

WordSpace.resetGameOverTimer = function()
{
    if(this.brainCapacity >= this.totalWeight && this.isTimerOn)
    {
        this.isTimerOn = false;
        WordSpace.gameOverCycle.currentCycle.paused = true;
        console.log('Game over timer Off');
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
        WordSpace.nameCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.delay.NameSpawn, WordSpace.nameCycle.currentCycle.getElapsed() + WordSpace.NameSpawnReduce, true);
        
        while(WordSpace.totalWordNum < 5)
        {
            WordSpace.genWordByProb(WordSpace.gameSceneForTest);
            WordSpace.wordCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.delay.WordSpawn, 0);
        }
        WordSpace.setPlayerTyping.add(wordText);
    }
    else if (wordText === '공격' && WordSpace.attackGauge.value >= 3) // 공격모드 진입.
    {
        console.log('attack mode');
        Input.attackOption = this.attackGauge.getAttackOption();
        Input.maxInput = Input.attackOption.wordCount;
        Input.attackMode = true;
        WordSpace.attackGauge.pauseCycle(true);
        WordSpace.setPlayerTyping.add(wordText);
    }
    else
    {
        // 오타 체크
    }
}

WordSpace.setPlayerTyping = 
{
    totalTyping: 0,
    add: function(wordText)
    {
        this.totalTyping += wordText != null ? WordReader.getWordTyping(wordText) : 0;
        WordSpace.playerTyping = this.totalTyping / WordSpace.gameTimer.now * 1000;
        socket.emit('setPlayerTyping', this.playerTyping);
        this.text.setText('현재 타수 : ' + WordSpace.playerTyping.toFixed(1));
    },
    initiate: function(scene)
    {
        WordSpace.gameTimer = new Phaser.Time.Clock(scene);
        WordSpace.gameTimer.start();
        this.text = scene.add.text(100,200,'현재 타수 : ' + WordSpace.playerTyping.toFixed(1)).setDepth(10).setColor('#000000');
    }
}

WordSpace.attack = function(wordText, grade)
{
    wordText = Input.removeConVow(wordText);
    if (wordText != '')
    {
        console.log('attack ' + wordText + ', grade: ' + grade);
        //호패에 따른 isStrong 구분 필요함
        WordSpace.nameGroup.forEach(function(element) 
        {
            WordSpace.generateWord.Attack(WordSpace.gameSceneForTest, wordText, grade, playerName, element.isStrong);
        });
        WordSpace.nameGroup = [];

        //WordSpace.generateWord(WordSpace.gameSceneForTest, wordText, grade, undefined, true); // for test
        // 이부분에서 게이지에 따라 급수 결정
        // 이걸 서버로 공격을 보내야 함
        // 이부분은 서버 잘써야함
        WordSpace.attackGauge.resetValue();
        WordSpace.setPlayerTyping.add(wordText);
    }
    else
    {
        WordSpace.attackGauge.cutValue(0.3);
    }
    Input.maxInput = 5;
    Input.attackMode = false;
    WordSpace.attackGauge.pauseCycle(false);
}