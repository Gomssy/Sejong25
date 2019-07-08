var WordSpace = WordSpace || {};

// for test
WordSpace.gameSceneForTest = null;
WordSpace.weightTextObjForTest = null;

WordSpace.isImageLoaded = false;

WordSpace.nextWordCode = 0;
WordSpace.totalWeight = 0; //현재 단어 무게 총합
WordSpace.totalWordNum = 0;
WordSpace.brainCapacity = 100; //수용 가능한 단어 무게 최대치
WordSpace.defeatTime = 5000;
WordSpace.gameOverTimer = null; //게임 오버 판정 타이머
WordSpace.isTimerOn = false;

WordSpace.wordGroup = [];
WordSpace.wordForcedGroup = [];
WordSpace.wordPhysicsGroup = null;

WordSpace.GradeProb = [0.35, 0.6, 0.8];
WordSpace.Phase = {READY: 0, START: 1, MAIN: 2, MUSIC: 3};
WordSpace.CurrentPhase = WordSpace.Phase.READY;
WordSpace.PlayerTyping = 0;
WordSpace.PlayerTypingRate = 0;

WordSpace.WordSpawnDelay = 3000;
WordSpace.NameSpawnDelay = 3000;
WordSpace.NameSpawnReduce = 1000;

WordSpace.gravityPoint = {x: 640, y: 300};
WordSpace.getSpawnPoint = function(_lenRate)
{
    let lenRate = 1;
    if(typeof _lenRate == 'number') lenRate  = _lenRate;
    let xLen = 600 * lenRate;
    let yLen = 300 * lenRate;
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
        WordSpace.generateWord(scene, SelectWord.selectWord(element),'',lenRate);
        lenRate += 0.2;
    });
}

WordSpace.AdjustVarByPhase = function(typingRate, phase)
{
    if(phase == WordSpace.Phase.READY)
    {
        WordSpace.WordSpawnDelay = 10000;
        WordSpace.NameSpawnDelay = 10000;
        WordSpace.NameSpawnReduce = 0;
        WordSpace.GradeProb[0] = 1;
        WordSpace.GradeProb[1] = 1;
        WordSpace.GradeProb[2] = 1;
    }
    else if(phase == WordSpace.Phase.START)
    {
        WordSpace.WordSpawnDelay = 3000;
        WordSpace.NameSpawnDelay = 6000;
        WordSpace.NameSpawnReduce = 1000;
        WordSpace.GradeProb[0] = 0.35;
        WordSpace.GradeProb[1] = 1 - 0.4 * typingRate;
        WordSpace.GradeProb[2] = 1;
    }
    else if(phase == WordSpace.Phase.MAIN)
    {
        WordSpace.WordSpawnDelay = 3000 - typingRate * 1000;
        WordSpace.NameSpawnDelay = 6000;
        WordSpace.NameSpawnReduce = 1000;
        WordSpace.GradeProb[0] = 0.4 - 0.4 * typingRate;
        WordSpace.GradeProb[1] = 0.8 - 0.4 * typingRate;
        WordSpace.GradeProb[2] = 1 - 0.2 * typingRate;
    }
    else if(phase == WordSpace.Phase.MUSIC)
    {
        WordSpace.WordSpawnDelay = 1500;
        WordSpace.NameSpawnDelay = 4000;
        WordSpace.NameSpawnReduce = 500;
        WordSpace.GradeProb[0] = 0.2 - 0.2 * typingRate;
        WordSpace.GradeProb[1] = 0.8 - 0.5 * typingRate;
        WordSpace.GradeProb[2] = 0.9 - 0.2 * typingRate;
    }
    WordSpace.wordCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.WordSpawnDelay, WordSpace.wordCycle.currentCycle.getElapsed());
    WordSpace.nameCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.NameSpawnDelay, WordSpace.nameCycle.currentCycle.getElapsed());
}

WordSpace.GetPlayerTypingRate = function()
{
    //서버통신하셈~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //임시
    WordSpace.PlayerTypingRate = 0.5;
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

WordSpace.varAdjustCycle = 
{
    currentCycle: null,
    resetCycle : function(scene, _delay)
    {
        this.delay = _delay;
        var option = 
        {
            delay: _delay,
            callback: function()
            {
                //나중에는 메세지 분석해서 Phase랑 PlayerTypingRate 받겠지만 일단 이렇게 해둠
                //WordSpace.GetPhase();
                WordSpace.AdjustVarByPhase(WordSpace.PlayerTypingRate, WordSpace.CurrentPhase);
            },
            callbackScope: scene,
            loop: true
        };
        if (this.currentCycle != null)
        {
            this.currentCycle = this.currentCycle.reset(option);
        }
        else
        {
            this.currentCycle = scene.time.addEvent(option);
        }
    }
}

WordSpace.nameCycle = 
{
    currentCycle: null,
    resetCycle: function(scene, _delay, _startAt)
    {
        this.delay = _delay;
        var option = 
        {
            startAt: _startAt,
            delay: _delay,
            callback: function()
            {
                //console.log("호패 on");
            },
            callbackScope: scene,
            loop: true
        };
        if (this.currentCycle != null)
        {
            this.currentCycle = this.currentCycle.reset(option);
        }
        else
        {
            this.currentCycle = scene.time.addEvent(option);
        }
    }
}

WordSpace.genWordByProb = function(scene)
{
    let wordRnd = Math.random();
    let wordIdx = wordRnd < WordSpace.GradeProb[0] ? 3 :
                  wordRnd < WordSpace.GradeProb[1] ? 2 :
                  wordRnd < WordSpace.GradeProb[2] ? 1 : 0;
    WordSpace.generateWord(scene, SelectWord.selectWord(wordIdx));
}

WordSpace.wordCycle =
{
    delay: 0,
    currentCycle: null,
    resetCycle: function(scene, _delay, _startAt)
    {
        this.delay = _delay;
        var option = 
        {
            startAt: _startAt,
            delay: _delay,
            callback: function()
            {
                WordSpace.genWordByProb(scene);
            },
            callbackScope: scene,
            loop: true
        };
        if (this.currentCycle != null)
        {
            this.currentCycle = this.currentCycle.reset(option);
        }
        else
        {
            this.currentCycle = scene.time.addEvent(option);
        }
    },
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
    }
    WordSpace.gameSceneForTest = scene; // for test
    WordSpace.weightTextObjForTest = scene.add.text(100, 75, '뇌의 무게: (현재) 0 / 100 (전체)').setDepth(10).setColor('#000000');
}

WordSpace.generateWord = function(scene, wordText, grade, lenRate)
{
    word = new WordObject(wordText);
    if (typeof grade == 'number')
    {
        word.wordGrade = grade;
        word.wordWeight = WordReader.getWordWeight(grade);
    }
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

    WordSpace.weightTextObjForTest.setText('뇌의 무게: (현재) '+WordSpace.totalWeight+' / '+ this.brainCapacity+' (전체)');
}

function gameOver()
{
    WordSpace.wordCycle.currentCycle.remove();
    //To Do
    console.log('defeat');
}

//게임 오버 판정을 위한 타이머
WordSpace.setGameOverTimer = function()
{
    //만약 현재 단어 무게 총합이 뇌 용량보다 크다면 타이머를 시작함
    if(this.brainCapacity < this.totalWeight && !this.isTimerOn)
    {
        var timer = 
        {
            delay: this.defeatTime,
            callback: function()
            {
                gameOver();
            },
            callbackScope: WordSpace.gameSceneForTest,
            loop: false
        }
        this.isTimerOn = true;
        this.gameOverTimer = WordSpace.gameSceneForTest.time.addEvent(timer);
    }
}

WordSpace.resetGameOverTimer = function()
{
    if(this.brainCapacity >= this.totalWeight && this.isTimerOn)
        this.gameOverTimer.remove();
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
        switch(weightest.wordGrade) // 이부분 나중에 더 효율적으로 바꿀수있지 않을까
        {
            case 0: WordSpace.attackGauge.add(2.5); break;
            case 1: WordSpace.attackGauge.add(1.5); break;
            case 2: WordSpace.attackGauge.add(0.9); break;
            case 3: WordSpace.attackGauge.add(0.5); break;
            default: console.log('[ERR] wrong grade of word'); break;
        }
        weightest.destroy();
        //WordSpace.nameCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.NameSpawnDelay, WordSpace.nameCycle.currentCycle.getElapsed() + WordSpace.NameSpawnReduce);
        
        while(WordSpace.totalWordNum < 5)
        {
            WordSpace.genWordByProb(WordSpace.gameSceneForTest);
            WordSpace.wordCycle.resetCycle(WordSpace.gameSceneForTest, WordSpace.WordSpawnDelay, 0);
        }
        WordSpace.playerTyping.add(wordText);
    }
    else if (wordText === '공격' && WordSpace.attackGauge.value >= 3) // 공격모드 진입.
    {
        console.log('attack mode');
        Input.attackOption = this.attackGauge.getAttackOption();
        Input.maxInput = Input.attackOption.wordCount;
        Input.attackMode = true;
        WordSpace.attackGauge.pauseCycle(true);
        WordSpace.playerTyping.add(wordText);
    }
    else
    {
        // 오타 체크
    }
}

WordSpace.playerTyping = 
{
    totalTyping: 0,
    playerTyping: 0,
    add: function(wordText)
    {
        this.totalTyping += wordText != null ? WordReader.getWordTyping(wordText) : 0;
        this.playerTyping = this.totalTyping / this.gameTimer.now * 1000;
        socket.emit('setPlayerTyping', this.playerTyping);
        this.text.setText('현재 타수 : ' + this.playerTyping.toFixed(1));
    },
    initiate: function(scene)
    {
        this.gameTimer = new Phaser.Time.Clock(scene);
        this.gameTimer.start();
        this.text = scene.add.text(100,200,'현재 타수 : ' + this.playerTyping.toFixed(1)).setDepth(10).setColor('#000000');
    }
}

WordSpace.attack = function(wordText, grade)
{
    console.log("d");
    wordText = Input.removeConVow(wordText);
    if (wordText != '')
    {
        console.log('attack ' + wordText + ', grade: ' + grade);
        WordSpace.generateWord(WordSpace.gameSceneForTest, wordText, grade); // for test
        // 이부분에서 게이지에 따라 급수 결정
        // 이부분은 서버 잘써야함
        WordSpace.attackGauge.resetValue();
        WordSpace.playerTyping.add(wordText);
    }
    else
    {
        WordSpace.attackGauge.cutValue(0.3);
    }
    Input.maxInput = 5;
    Input.attackMode = false;
    WordSpace.attackGauge.pauseCycle(false);
}