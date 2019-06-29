var WordSpace = WordSpace || {};

WordSpace.gameSceneForTest = null; // for test

WordSpace.isImageLoaded = false;

WordSpace.nextWordCode = 0;
WordSpace.totalWeight = 0; //현재 단어 무게 총합
WordSpace.brainCapacity = 20; //수용 가능한 단어 무게 최대치
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
}

WordSpace.wordCycle =
{
    currentCycle: null,
    resetCycle: function(scene, _delay)
    {
        var option = 
        {
            delay: _delay,
            callback: function()
            {
                let wordIdx = Math.floor(Math.random() * WordSpace.wordCycle.wordList.length);
                WordSpace.generateWord(this, WordSpace.wordCycle.wordList[wordIdx]);
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
    wordList: // 미개한 버전, 심심해서 만들어봄
    [
        '솽젠커', '통관', '맥주땡겨', '자료구조', '팡광우럮다'
    ]
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
}

WordSpace.generateWord = function(scene, wordText)
{
    word = new WordObject(wordText);
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
    }
    else if (wordText === '공격' && WordSpace.attackGauge.value > 3) // 공격모드 진입.
    {
        console.log('attack mode');
        // 이부분에서 최대 단어수 결정
        Input.attackMode = true;
        WordSpace.attackGauge.pauseCycle(true);
    }
    else
    {
        // 오타 체크
    }
}

WordSpace.attack = function(wordText)
{
    if (wordText != '')
    {
        console.log('attack ' + wordText);
        WordSpace.generateWord(WordSpace.gameSceneForTest, wordText); // for test
        // 이부분에서 게이지에 따라 급수 결정
        // 이부분은 서버 잘써야함
        WordSpace.attackGauge.resetValue();
    }
    else
    {
        WordSpace.attackGauge.cutValue(0.3);
    }
    Input.attackMode = false;
    WordSpace.attackGauge.pauseCycle(false);
}