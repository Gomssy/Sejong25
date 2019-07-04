var WordSpace = WordSpace || {};

// for test
WordSpace.gameSceneForTest = null;
WordSpace.weightTextObjForTest = null;

WordSpace.isImageLoaded = false;

WordSpace.nextWordCode = 0;
WordSpace.totalWeight = 0; //현재 단어 무게 총합
WordSpace.brainCapacity = 100; //수용 가능한 단어 무게 최대치
WordSpace.defeatTime = 5000;
WordSpace.gameOverTimer = null; //게임 오버 판정 타이머
WordSpace.isTimerOn = false;

WordSpace.wordGroup = [];
WordSpace.wordForcedGroup = [];
WordSpace.wordPhysicsGroup = null;

WordSpace.gravityPoint = {x: 640, y: 300};
WordSpace.getSpawnPoint = function()
{
    let xLen = 600;
    let yLen = 300;
    const angle = Math.random() * Math.PI * 2;
    let _x = xLen * Math.cos(angle) + this.gravityPoint.x;
    let _y = yLen * Math.sin(angle) + this.gravityPoint.y;
    return {x:_x, y:_y};
}

WordSpace.attackGauge = 
{
    value: 0,
    add: function(plus)
    {
        if (this.value + plus > 11) this.value = 11;
        else this.value += plus;
        this.text.setText('게이지: ' + this.value.toFixed(1));
    },
    sub: function(minus)
    {
        if (this.value - minus < 0) this.value = 0;
        else this.value -= minus;
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

WordSpace.wordCycle =
{
    delay: 0,
    currentCycle: null,
    resetCycle: function(scene, _delay)
    {
        this.delay = _delay;
        var option = 
        {
            delay: _delay,
            callback: function()
            {
                let wordIdx = Math.floor(Math.random() * 4);
                WordSpace.generateWord(this, SelectWord.selectWord(wordIdx));
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

WordSpace.generateWord = function(scene, wordText, grade)
{
    word = new WordObject(wordText);
    if (typeof grade != 'undefined')
    {
        word.wordGrade = grade;
        word.wordWeight = WordReader.getWordWeight(grade);
    }
    word.instantiate(scene);
    WordSpace.wordGroup.push(word);
    WordSpace.wordForcedGroup.push(word);
    word.physicsObj.topObj = word;
    scene.physics.add.collider(word.physicsObj, WordSpace.wordPhysicsGroup, function(object1) 
    {
        object1.topObj.wordSpeed = 0.1;
        object1.topObj.attract();
    });
    WordSpace.wordPhysicsGroup.add(word.physicsObj);

    WordSpace.weightTextObjForTest.setText('뇌의 무게: (현재) '+WordSpace.totalWeight+' / 100 (전체)');
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
        WordSpace.playerTyping.add(wordText);
    }
    else if (wordText === '공격' && WordSpace.attackGauge.value > 3) // 공격모드 진입.
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